import { z } from "zod";
import { router, pharmacyProcedure } from "@/lib/trpc/server";
import { prisma } from "@pharmacy/database";
import { TRPCError } from "@trpc/server";

export const inventoryRouter = router({
  // Get all inventories
  getAll: pharmacyProcedure.query(async ({ ctx }) => {
    if (!ctx.session.user.tenantId) {
      throw new TRPCError({ code: "FORBIDDEN" });
    }

    const inventories = await prisma.inventory.findMany({
      where: {
        tenantId: ctx.session.user.tenantId,
        isActive: true,
      },
      include: {
        _count: { select: { items: true } },
      },
      orderBy: [{ isDefault: "desc" }, { name: "asc" }],
    });

    return inventories;
  }),

  // Get inventory by ID with items
  getById: pharmacyProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      if (!ctx.session.user.tenantId) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const inventory = await prisma.inventory.findFirst({
        where: {
          id: input.id,
          tenantId: ctx.session.user.tenantId,
        },
        include: {
          items: {
            include: {
              product: true,
            },
            orderBy: { product: { name: "asc" } },
          },
        },
      });

      if (!inventory) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return inventory;
    }),

  // Create inventory
  create: pharmacyProcedure
    .input(
      z.object({
        name: z.string().min(1),
        nameAr: z.string().optional(),
        location: z.string().optional(),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session.user.tenantId) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const inventory = await prisma.inventory.create({
        data: {
          ...input,
          tenantId: ctx.session.user.tenantId,
        },
      });

      return inventory;
    }),

  // Add stock
  addStock: pharmacyProcedure
    .input(
      z.object({
        productId: z.string(),
        inventoryId: z.string(),
        quantity: z.number().min(1),
        batchNumber: z.string().optional(),
        expiryDate: z.date().optional(),
        costPrice: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session.user.tenantId) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const result = await prisma.$transaction(async (tx) => {
        // Upsert inventory item
        const inventoryItem = await tx.inventoryItem.upsert({
          where: {
            productId_inventoryId_batchNumber: {
              productId: input.productId,
              inventoryId: input.inventoryId,
              batchNumber: input.batchNumber || "DEFAULT",
            },
          },
          update: {
            quantity: { increment: input.quantity },
            expiryDate: input.expiryDate,
          },
          create: {
            productId: input.productId,
            inventoryId: input.inventoryId,
            quantity: input.quantity,
            batchNumber: input.batchNumber || "DEFAULT",
            expiryDate: input.expiryDate,
          },
        });

        // Create stock movement
        await tx.stockMovement.create({
          data: {
            type: "IN",
            quantity: input.quantity,
            productId: input.productId,
            toInventoryId: input.inventoryId,
            userId: ctx.session.user.id,
            reason: "إضافة مخزون",
          },
        });

        // Update product cost price if provided
        if (input.costPrice) {
          await tx.product.update({
            where: { id: input.productId },
            data: { costPrice: input.costPrice },
          });
        }

        return inventoryItem;
      });

      return result;
    }),

  // Adjust stock
  adjustStock: pharmacyProcedure
    .input(
      z.object({
        productId: z.string(),
        inventoryId: z.string(),
        batchNumber: z.string().optional(),
        newQuantity: z.number().min(0),
        reason: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session.user.tenantId) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const result = await prisma.$transaction(async (tx) => {
        // Get current quantity
        const current = await tx.inventoryItem.findFirst({
          where: {
            productId: input.productId,
            inventoryId: input.inventoryId,
            batchNumber: input.batchNumber || "DEFAULT",
          },
        });

        const currentQty = current?.quantity || 0;
        const difference = input.newQuantity - currentQty;

        // Update inventory item
        const inventoryItem = await tx.inventoryItem.upsert({
          where: {
            productId_inventoryId_batchNumber: {
              productId: input.productId,
              inventoryId: input.inventoryId,
              batchNumber: input.batchNumber || "DEFAULT",
            },
          },
          update: { quantity: input.newQuantity },
          create: {
            productId: input.productId,
            inventoryId: input.inventoryId,
            quantity: input.newQuantity,
            batchNumber: input.batchNumber || "DEFAULT",
          },
        });

        // Create stock movement
        await tx.stockMovement.create({
          data: {
            type: "ADJUSTMENT",
            quantity: difference,
            productId: input.productId,
            toInventoryId: input.inventoryId,
            userId: ctx.session.user.id,
            reason: input.reason,
          },
        });

        return inventoryItem;
      });

      return result;
    }),

  // Transfer stock
  transferStock: pharmacyProcedure
    .input(
      z.object({
        productId: z.string(),
        fromInventoryId: z.string(),
        toInventoryId: z.string(),
        batchNumber: z.string().optional(),
        quantity: z.number().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session.user.tenantId) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const result = await prisma.$transaction(async (tx) => {
        // Check if source has enough stock
        const sourceItem = await tx.inventoryItem.findFirst({
          where: {
            productId: input.productId,
            inventoryId: input.fromInventoryId,
            batchNumber: input.batchNumber || "DEFAULT",
          },
        });

        if (!sourceItem || sourceItem.quantity < input.quantity) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "الكمية المطلوبة غير متوفرة",
          });
        }

        // Decrease from source
        await tx.inventoryItem.update({
          where: { id: sourceItem.id },
          data: { quantity: { decrement: input.quantity } },
        });

        // Increase in destination
        await tx.inventoryItem.upsert({
          where: {
            productId_inventoryId_batchNumber: {
              productId: input.productId,
              inventoryId: input.toInventoryId,
              batchNumber: input.batchNumber || "DEFAULT",
            },
          },
          update: { quantity: { increment: input.quantity } },
          create: {
            productId: input.productId,
            inventoryId: input.toInventoryId,
            quantity: input.quantity,
            batchNumber: input.batchNumber || "DEFAULT",
            expiryDate: sourceItem.expiryDate,
          },
        });

        // Create stock movement
        await tx.stockMovement.create({
          data: {
            type: "TRANSFER",
            quantity: input.quantity,
            productId: input.productId,
            fromInventoryId: input.fromInventoryId,
            toInventoryId: input.toInventoryId,
            userId: ctx.session.user.id,
            reason: "تحويل بين المخازن",
          },
        });

        return { success: true };
      });

      return result;
    }),

  // Get expiring products
  getExpiring: pharmacyProcedure
    .input(
      z.object({
        days: z.number().default(90),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      if (!ctx.session.user.tenantId) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const days = input?.days || 90;
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + days);

      const expiringItems = await prisma.inventoryItem.findMany({
        where: {
          inventory: { tenantId: ctx.session.user.tenantId },
          quantity: { gt: 0 },
          expiryDate: {
            lte: futureDate,
          },
        },
        include: {
          product: true,
          inventory: true,
        },
        orderBy: { expiryDate: "asc" },
      });

      return expiringItems;
    }),

  // Get stock movements
  getMovements: pharmacyProcedure
    .input(
      z.object({
        productId: z.string().optional(),
        inventoryId: z.string().optional(),
        type: z.enum(["IN", "OUT", "ADJUSTMENT", "TRANSFER", "RETURN", "EXPIRED"]).optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        page: z.number().default(1),
        limit: z.number().default(50),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      if (!ctx.session.user.tenantId) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const { productId, inventoryId, type, startDate, endDate, page = 1, limit = 50 } = input || {};

      const where = {
        product: { tenantId: ctx.session.user.tenantId },
        ...(productId && { productId }),
        ...(inventoryId && {
          OR: [{ fromInventoryId: inventoryId }, { toInventoryId: inventoryId }],
        }),
        ...(type && { type }),
        ...(startDate && { createdAt: { gte: startDate } }),
        ...(endDate && { createdAt: { lte: endDate } }),
      };

      const [movements, total] = await Promise.all([
        prisma.stockMovement.findMany({
          where,
          include: {
            product: true,
            fromInventory: true,
            toInventory: true,
            user: { select: { name: true } },
          },
          orderBy: { createdAt: "desc" },
          skip: (page - 1) * limit,
          take: limit,
        }),
        prisma.stockMovement.count({ where }),
      ]);

      return {
        movements,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    }),
});

