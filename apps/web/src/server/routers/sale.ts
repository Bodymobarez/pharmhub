import { z } from "zod";
import { router, pharmacyProcedure } from "@/lib/trpc/server";
import { prisma } from "@pharmacy/database";
import { TRPCError } from "@trpc/server";

const saleItemInput = z.object({
  productId: z.string(),
  quantity: z.number().min(1),
  unitPrice: z.number().min(0),
  discount: z.number().default(0),
  batchNumber: z.string().optional(),
  expiryDate: z.date().optional(),
});

export const saleRouter = router({
  // Create sale
  create: pharmacyProcedure
    .input(
      z.object({
        items: z.array(saleItemInput).min(1),
        customerId: z.string().optional(),
        paymentMethod: z.enum(["CASH", "CARD", "MOBILE_WALLET", "CREDIT"]).default("CASH"),
        discountAmount: z.number().default(0),
        paidAmount: z.number(),
        prescriptionNumber: z.string().optional(),
        doctorName: z.string().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session.user.tenantId) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const result = await prisma.$transaction(async (tx) => {
        // Get default inventory
        const defaultInventory = await tx.inventory.findFirst({
          where: {
            tenantId: ctx.session.user.tenantId!,
            isDefault: true,
          },
        });

        if (!defaultInventory) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "لا يوجد مخزن افتراضي",
          });
        }

        // Calculate totals
        let subtotal = 0;
        let taxAmount = 0;

        const processedItems = [];

        for (const item of input.items) {
          const product = await tx.product.findFirst({
            where: {
              id: item.productId,
              tenantId: ctx.session.user.tenantId!,
            },
          });

          if (!product) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: `المنتج غير موجود`,
            });
          }

          // Check stock
          const inventoryItem = await tx.inventoryItem.findFirst({
            where: {
              productId: item.productId,
              inventoryId: defaultInventory.id,
              quantity: { gte: item.quantity },
            },
            orderBy: { expiryDate: "asc" },
          });

          if (!inventoryItem) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: `الكمية غير متوفرة للمنتج: ${product.name}`,
            });
          }

          const itemTotal = item.unitPrice * item.quantity - item.discount;
          const itemTax = product.isVatExempt ? 0 : itemTotal * (product.taxRate / 100);

          subtotal += itemTotal;
          taxAmount += itemTax;

          processedItems.push({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            discount: item.discount,
            total: itemTotal,
            batchNumber: inventoryItem.batchNumber,
            expiryDate: inventoryItem.expiryDate,
            inventoryItemId: inventoryItem.id,
          });
        }

        const total = subtotal + taxAmount - input.discountAmount;
        const changeAmount = input.paidAmount - total;

        // Generate invoice number
        const lastSale = await tx.sale.findFirst({
          where: { tenantId: ctx.session.user.tenantId! },
          orderBy: { createdAt: "desc" },
        });

        const invoiceNumber = `INV-${Date.now().toString(36).toUpperCase()}`;

        // Create sale
        const sale = await tx.sale.create({
          data: {
            invoiceNumber,
            subtotal,
            taxAmount,
            discountAmount: input.discountAmount,
            total,
            paidAmount: input.paidAmount,
            changeAmount: changeAmount > 0 ? changeAmount : 0,
            status: "COMPLETED",
            paymentMethod: input.paymentMethod,
            prescriptionNumber: input.prescriptionNumber,
            doctorName: input.doctorName,
            notes: input.notes,
            customerId: input.customerId,
            userId: ctx.session.user.id,
            tenantId: ctx.session.user.tenantId!,
            items: {
              create: processedItems.map((item) => ({
                productId: item.productId,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                discount: item.discount,
                total: item.total,
                batchNumber: item.batchNumber,
                expiryDate: item.expiryDate,
              })),
            },
          },
          include: {
            items: { include: { product: true } },
            customer: true,
          },
        });

        // Decrease stock
        for (const item of processedItems) {
          await tx.inventoryItem.update({
            where: { id: item.inventoryItemId },
            data: { quantity: { decrement: item.quantity } },
          });

          // Create stock movement
          await tx.stockMovement.create({
            data: {
              type: "OUT",
              quantity: item.quantity,
              productId: item.productId,
              fromInventoryId: defaultInventory.id,
              userId: ctx.session.user.id,
              reason: "مبيعات",
              reference: sale.invoiceNumber,
            },
          });
        }

        // Update customer balance if credit sale
        if (input.paymentMethod === "CREDIT" && input.customerId) {
          await tx.customer.update({
            where: { id: input.customerId },
            data: { balance: { increment: total - input.paidAmount } },
          });
        }

        return sale;
      });

      return result;
    }),

  // Get all sales
  getAll: pharmacyProcedure
    .input(
      z.object({
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        status: z.enum(["PENDING", "COMPLETED", "REFUNDED", "CANCELLED"]).optional(),
        customerId: z.string().optional(),
        page: z.number().default(1),
        limit: z.number().default(50),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      if (!ctx.session.user.tenantId) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const { startDate, endDate, status, customerId, page = 1, limit = 50 } = input || {};

      const where = {
        tenantId: ctx.session.user.tenantId,
        ...(status && { status }),
        ...(customerId && { customerId }),
        ...(startDate && { createdAt: { gte: startDate } }),
        ...(endDate && { createdAt: { lte: endDate } }),
      };

      const [sales, total] = await Promise.all([
        prisma.sale.findMany({
          where,
          include: {
            customer: true,
            user: { select: { name: true } },
            _count: { select: { items: true } },
          },
          orderBy: { createdAt: "desc" },
          skip: (page - 1) * limit,
          take: limit,
        }),
        prisma.sale.count({ where }),
      ]);

      return {
        sales,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    }),

  // Get sale by ID
  getById: pharmacyProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      if (!ctx.session.user.tenantId) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const sale = await prisma.sale.findFirst({
        where: {
          id: input.id,
          tenantId: ctx.session.user.tenantId,
        },
        include: {
          items: { include: { product: true } },
          customer: true,
          user: { select: { name: true } },
        },
      });

      if (!sale) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return sale;
    }),

  // Refund sale
  refund: pharmacyProcedure
    .input(
      z.object({
        saleId: z.string(),
        reason: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session.user.tenantId) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const result = await prisma.$transaction(async (tx) => {
        const sale = await tx.sale.findFirst({
          where: {
            id: input.saleId,
            tenantId: ctx.session.user.tenantId!,
            status: "COMPLETED",
          },
          include: { items: true },
        });

        if (!sale) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }

        // Get default inventory
        const defaultInventory = await tx.inventory.findFirst({
          where: {
            tenantId: ctx.session.user.tenantId!,
            isDefault: true,
          },
        });

        if (!defaultInventory) {
          throw new TRPCError({ code: "BAD_REQUEST" });
        }

        // Return items to stock
        for (const item of sale.items) {
          await tx.inventoryItem.upsert({
            where: {
              productId_inventoryId_batchNumber: {
                productId: item.productId,
                inventoryId: defaultInventory.id,
                batchNumber: item.batchNumber || "DEFAULT",
              },
            },
            update: { quantity: { increment: item.quantity } },
            create: {
              productId: item.productId,
              inventoryId: defaultInventory.id,
              quantity: item.quantity,
              batchNumber: item.batchNumber || "DEFAULT",
              expiryDate: item.expiryDate,
            },
          });

          await tx.stockMovement.create({
            data: {
              type: "RETURN",
              quantity: item.quantity,
              productId: item.productId,
              toInventoryId: defaultInventory.id,
              userId: ctx.session.user.id,
              reason: input.reason,
              reference: sale.invoiceNumber,
            },
          });
        }

        // Update sale status
        const updatedSale = await tx.sale.update({
          where: { id: sale.id },
          data: {
            status: "REFUNDED",
            notes: `${sale.notes || ""}\nمرتجع: ${input.reason}`,
          },
        });

        return updatedSale;
      });

      return result;
    }),

  // Get today's summary
  getTodaySummary: pharmacyProcedure.query(async ({ ctx }) => {
    if (!ctx.session.user.tenantId) {
      throw new TRPCError({ code: "FORBIDDEN" });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const sales = await prisma.sale.findMany({
      where: {
        tenantId: ctx.session.user.tenantId,
        createdAt: { gte: today },
        status: "COMPLETED",
      },
    });

    return {
      count: sales.length,
      total: sales.reduce((sum, s) => sum + s.total, 0),
      cash: sales.filter((s) => s.paymentMethod === "CASH").reduce((sum, s) => sum + s.total, 0),
      card: sales.filter((s) => s.paymentMethod === "CARD").reduce((sum, s) => sum + s.total, 0),
      credit: sales.filter((s) => s.paymentMethod === "CREDIT").reduce((sum, s) => sum + s.total, 0),
    };
  }),
});

