import { z } from "zod";
import { router, pharmacyProcedure } from "@/lib/trpc/server";
import { prisma } from "@pharmacy/database";
import { TRPCError } from "@trpc/server";

export const supplierRouter = router({
  // Get all suppliers
  getAll: pharmacyProcedure
    .input(
      z.object({
        search: z.string().optional(),
        page: z.number().default(1),
        limit: z.number().default(50),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      if (!ctx.session.user.tenantId) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const { search, page = 1, limit = 50 } = input || {};

      const where = {
        tenantId: ctx.session.user.tenantId,
        isActive: true,
        ...(search && {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { phone: { contains: search } },
          ],
        }),
      };

      const [suppliers, total] = await Promise.all([
        prisma.supplier.findMany({
          where,
          include: {
            _count: { select: { purchaseOrders: true } },
          },
          orderBy: { name: "asc" },
          skip: (page - 1) * limit,
          take: limit,
        }),
        prisma.supplier.count({ where }),
      ]);

      return {
        suppliers,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    }),

  // Create supplier
  create: pharmacyProcedure
    .input(
      z.object({
        name: z.string().min(2),
        contactPerson: z.string().optional(),
        phone: z.string().optional(),
        email: z.string().email().optional(),
        address: z.string().optional(),
        taxNumber: z.string().optional(),
        paymentTerms: z.string().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session.user.tenantId) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const supplier = await prisma.supplier.create({
        data: {
          ...input,
          tenantId: ctx.session.user.tenantId,
        },
      });

      return supplier;
    }),

  // Update supplier
  update: pharmacyProcedure
    .input(
      z.object({
        id: z.string(),
        data: z.object({
          name: z.string().min(2).optional(),
          contactPerson: z.string().optional(),
          phone: z.string().optional(),
          email: z.string().email().optional(),
          address: z.string().optional(),
          taxNumber: z.string().optional(),
          paymentTerms: z.string().optional(),
          notes: z.string().optional(),
        }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session.user.tenantId) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const supplier = await prisma.supplier.update({
        where: {
          id: input.id,
          tenantId: ctx.session.user.tenantId,
        },
        data: input.data,
      });

      return supplier;
    }),

  // Delete supplier (soft delete)
  delete: pharmacyProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session.user.tenantId) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      await prisma.supplier.update({
        where: {
          id: input.id,
          tenantId: ctx.session.user.tenantId,
        },
        data: { isActive: false },
      });

      return { success: true };
    }),

  // Create purchase order
  createOrder: pharmacyProcedure
    .input(
      z.object({
        supplierId: z.string(),
        expectedDate: z.date().optional(),
        notes: z.string().optional(),
        items: z.array(
          z.object({
            productId: z.string(),
            quantity: z.number().min(1),
            unitPrice: z.number().min(0),
          })
        ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session.user.tenantId) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const subtotal = input.items.reduce(
        (sum, item) => sum + item.quantity * item.unitPrice,
        0
      );

      const orderNumber = `PO-${Date.now().toString(36).toUpperCase()}`;

      const order = await prisma.purchaseOrder.create({
        data: {
          orderNumber,
          subtotal,
          total: subtotal,
          status: "DRAFT",
          expectedDate: input.expectedDate,
          notes: input.notes,
          supplierId: input.supplierId,
          tenantId: ctx.session.user.tenantId,
          items: {
            create: input.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              total: item.quantity * item.unitPrice,
            })),
          },
        },
        include: {
          items: { include: { product: true } },
          supplier: true,
        },
      });

      return order;
    }),

  // Get purchase orders
  getOrders: pharmacyProcedure
    .input(
      z.object({
        supplierId: z.string().optional(),
        status: z.enum(["DRAFT", "PENDING", "APPROVED", "RECEIVED", "CANCELLED"]).optional(),
        page: z.number().default(1),
        limit: z.number().default(50),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      if (!ctx.session.user.tenantId) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const { supplierId, status, page = 1, limit = 50 } = input || {};

      const where = {
        tenantId: ctx.session.user.tenantId,
        ...(supplierId && { supplierId }),
        ...(status && { status }),
      };

      const [orders, total] = await Promise.all([
        prisma.purchaseOrder.findMany({
          where,
          include: {
            supplier: true,
            _count: { select: { items: true } },
          },
          orderBy: { createdAt: "desc" },
          skip: (page - 1) * limit,
          take: limit,
        }),
        prisma.purchaseOrder.count({ where }),
      ]);

      return {
        orders,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    }),

  // Receive order
  receiveOrder: pharmacyProcedure
    .input(
      z.object({
        orderId: z.string(),
        items: z.array(
          z.object({
            itemId: z.string(),
            receivedQuantity: z.number(),
            batchNumber: z.string().optional(),
            expiryDate: z.date().optional(),
          })
        ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session.user.tenantId) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const result = await prisma.$transaction(async (tx) => {
        const order = await tx.purchaseOrder.findFirst({
          where: {
            id: input.orderId,
            tenantId: ctx.session.user.tenantId!,
          },
          include: { items: true },
        });

        if (!order) {
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

        // Update order items and add to inventory
        for (const receivedItem of input.items) {
          const orderItem = order.items.find((i) => i.id === receivedItem.itemId);
          if (!orderItem) continue;

          // Update order item
          await tx.purchaseOrderItem.update({
            where: { id: receivedItem.itemId },
            data: {
              receivedQuantity: receivedItem.receivedQuantity,
              batchNumber: receivedItem.batchNumber,
              expiryDate: receivedItem.expiryDate,
            },
          });

          // Add to inventory
          if (receivedItem.receivedQuantity > 0) {
            await tx.inventoryItem.upsert({
              where: {
                productId_inventoryId_batchNumber: {
                  productId: orderItem.productId,
                  inventoryId: defaultInventory.id,
                  batchNumber: receivedItem.batchNumber || "DEFAULT",
                },
              },
              update: {
                quantity: { increment: receivedItem.receivedQuantity },
                expiryDate: receivedItem.expiryDate,
              },
              create: {
                productId: orderItem.productId,
                inventoryId: defaultInventory.id,
                quantity: receivedItem.receivedQuantity,
                batchNumber: receivedItem.batchNumber || "DEFAULT",
                expiryDate: receivedItem.expiryDate,
              },
            });

            // Create stock movement
            await tx.stockMovement.create({
              data: {
                type: "IN",
                quantity: receivedItem.receivedQuantity,
                productId: orderItem.productId,
                toInventoryId: defaultInventory.id,
                userId: ctx.session.user.id,
                reason: "استلام طلب شراء",
                reference: order.orderNumber,
              },
            });
          }
        }

        // Update order status
        const updatedOrder = await tx.purchaseOrder.update({
          where: { id: order.id },
          data: {
            status: "RECEIVED",
            receivedDate: new Date(),
          },
        });

        return updatedOrder;
      });

      return result;
    }),
});

