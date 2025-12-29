import { z } from "zod";
import { router, adminProcedure } from "@/lib/trpc/server";
import { prisma } from "@pharmacy/database";
import { TRPCError } from "@trpc/server";

export const adminRouter = router({
  // Get all products from all tenants
  getAllProducts: adminProcedure
    .input(
      z.object({
        tenantId: z.string().optional(),
        search: z.string().optional(),
        page: z.number().default(1),
        limit: z.number().default(50),
      }).optional()
    )
    .query(async ({ input }) => {
      const { tenantId, search, page = 1, limit = 50 } = input || {};

      const where = {
        ...(tenantId && { tenantId }),
        ...(search && {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { nameAr: { contains: search, mode: "insensitive" as const } },
            { barcode: { contains: search } },
            { sku: { contains: search } },
          ],
        }),
      };

      const [products, total] = await Promise.all([
        prisma.product.findMany({
          where,
          include: {
            tenant: { select: { id: true, name: true, slug: true } },
            category: { select: { name: true, nameAr: true } },
            inventoryItems: {
              include: { inventory: { select: { name: true } } },
            },
          },
          orderBy: { createdAt: "desc" },
          skip: (page - 1) * limit,
          take: limit,
        }),
        prisma.product.count({ where }),
      ]);

      return {
        products,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    }),

  // Get all sales from all tenants
  getAllSales: adminProcedure
    .input(
      z.object({
        tenantId: z.string().optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        status: z.enum(["PENDING", "COMPLETED", "REFUNDED", "CANCELLED"]).optional(),
        page: z.number().default(1),
        limit: z.number().default(50),
      }).optional()
    )
    .query(async ({ input }) => {
      const { tenantId, startDate, endDate, status, page = 1, limit = 50 } = input || {};

      const where = {
        ...(tenantId && { tenantId }),
        ...(status && { status }),
        ...(startDate || endDate) && {
          createdAt: {
            ...(startDate && { gte: startDate }),
            ...(endDate && { lte: endDate }),
          },
        },
      };

      const [sales, total] = await Promise.all([
        prisma.sale.findMany({
          where,
          include: {
            tenant: { select: { id: true, name: true, slug: true } },
            user: { select: { id: true, name: true, username: true } },
            customer: { select: { id: true, name: true, phone: true } },
            items: {
              include: {
                product: { select: { name: true, nameAr: true, barcode: true } },
              },
            },
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

  // Get all inventory movements
  getAllStockMovements: adminProcedure
    .input(
      z.object({
        tenantId: z.string().optional(),
        type: z.enum(["IN", "OUT", "ADJUSTMENT", "TRANSFER", "RETURN", "EXPIRED"]).optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        page: z.number().default(1),
        limit: z.number().default(50),
      }).optional()
    )
    .query(async ({ input }) => {
      const { tenantId, type, startDate, endDate, page = 1, limit = 50 } = input || {};

      const where = {
        ...(tenantId && { product: { tenantId } }),
        ...(type && { type }),
        ...(startDate || endDate) && {
          createdAt: {
            ...(startDate && { gte: startDate }),
            ...(endDate && { lte: endDate }),
          },
        },
      };

      const [movements, total] = await Promise.all([
        prisma.stockMovement.findMany({
          where,
          include: {
            product: {
              select: {
                id: true,
                name: true,
                nameAr: true,
                tenant: { select: { id: true, name: true } },
              },
            },
            user: { select: { id: true, name: true, username: true } },
            fromInventory: { select: { name: true } },
            toInventory: { select: { name: true } },
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

  // Get all customers
  getAllCustomers: adminProcedure
    .input(
      z.object({
        tenantId: z.string().optional(),
        search: z.string().optional(),
        page: z.number().default(1),
        limit: z.number().default(50),
      }).optional()
    )
    .query(async ({ input }) => {
      const { tenantId, search, page = 1, limit = 50 } = input || {};

      const where = {
        ...(tenantId && { tenantId }),
        ...(search && {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { phone: { contains: search } },
            { email: { contains: search, mode: "insensitive" as const } },
          ],
        }),
      };

      const [customers, total] = await Promise.all([
        prisma.customer.findMany({
          where,
          include: {
            tenant: { select: { id: true, name: true, slug: true } },
            _count: { select: { sales: true } },
          },
          orderBy: { createdAt: "desc" },
          skip: (page - 1) * limit,
          take: limit,
        }),
        prisma.customer.count({ where }),
      ]);

      return {
        customers,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    }),

  // Get detailed tenant report
  getTenantReport: adminProcedure
    .input(
      z.object({
        tenantId: z.string(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      })
    )
    .query(async ({ input }) => {
      const { tenantId, startDate, endDate } = input;

      const dateFilter = {
        ...(startDate || endDate) && {
          createdAt: {
            ...(startDate && { gte: startDate }),
            ...(endDate && { lte: endDate }),
          },
        },
      };

      const [
        tenant,
        sales,
        products,
        customers,
        inventory,
        stockMovements,
        salesStats,
        topProducts,
      ] = await Promise.all([
        prisma.tenant.findUnique({
          where: { id: tenantId },
          include: {
            _count: {
              select: {
                users: true,
                products: true,
                sales: true,
                customers: true,
                inventories: true,
              },
            },
          },
        }),
        prisma.sale.findMany({
          where: { tenantId, ...dateFilter },
          include: {
            user: { select: { name: true } },
            customer: { select: { name: true } },
            items: {
              include: { product: { select: { name: true } } },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 100,
        }),
        prisma.product.findMany({
          where: { tenantId },
          include: {
            category: { select: { name: true } },
            inventoryItems: true,
          },
        }),
        prisma.customer.findMany({
          where: { tenantId },
          include: {
            _count: { select: { sales: true } },
          },
        }),
        prisma.inventory.findMany({
          where: { tenantId },
          include: {
            items: {
              include: { product: { select: { name: true } } },
            },
          },
        }),
        prisma.stockMovement.findMany({
          where: {
            product: { tenantId },
            ...dateFilter,
          },
          include: {
            product: { select: { name: true } },
            user: { select: { name: true } },
          },
          orderBy: { createdAt: "desc" },
          take: 100,
        }),
        prisma.sale.aggregate({
          where: {
            tenantId,
            status: "COMPLETED",
            ...dateFilter,
          },
          _sum: { total: true, taxAmount: true, discountAmount: true },
          _count: true,
          _avg: { total: true },
        }),
        prisma.saleItem.groupBy({
          by: ["productId"],
          where: {
            sale: {
              tenantId,
              status: "COMPLETED",
              ...dateFilter,
            },
          },
          _sum: { quantity: true, total: true },
          orderBy: { _sum: { total: "desc" } },
          take: 10,
        }),
      ]);

      // Get top products details
      const topProductIds = topProducts.map((p) => p.productId);
      const topProductsDetails = await prisma.product.findMany({
        where: { id: { in: topProductIds } },
        select: { id: true, name: true, nameAr: true, barcode: true },
      });

      const topProductsWithDetails = topProducts.map((item) => {
        const product = topProductsDetails.find((p) => p.id === item.productId);
        return {
          product,
          quantity: item._sum.quantity || 0,
          revenue: item._sum.total || 0,
        };
      });

      return {
        tenant,
        sales,
        products,
        customers,
        inventory,
        stockMovements,
        stats: {
          sales: {
            total: salesStats._sum.total || 0,
            tax: salesStats._sum.taxAmount || 0,
            discount: salesStats._sum.discountAmount || 0,
            count: salesStats._count,
            average: salesStats._avg.total || 0,
          },
          topProducts: topProductsWithDetails,
        },
      };
    }),

  // Get all activities from all tenants
  getAllActivities: adminProcedure
    .input(
      z.object({
        tenantId: z.string().optional(),
        limit: z.number().default(50),
      }).optional()
    )
    .query(async ({ input }) => {
      const { tenantId, limit = 50 } = input || {};

      const [sales, movements] = await Promise.all([
        prisma.sale.findMany({
          where: tenantId ? { tenantId } : undefined,
          take: limit,
          orderBy: { createdAt: "desc" },
          include: {
            tenant: { select: { id: true, name: true } },
            user: { select: { name: true } },
            _count: { select: { items: true } },
          },
        }),
        prisma.stockMovement.findMany({
          where: tenantId ? { product: { tenantId } } : undefined,
          take: limit,
          orderBy: { createdAt: "desc" },
          include: {
            product: {
              select: {
                name: true,
                tenant: { select: { id: true, name: true } },
              },
            },
            user: { select: { name: true } },
          },
        }),
      ]);

      const activities = [
        ...sales.map((s) => ({
          type: "sale" as const,
          id: s.id,
          tenant: s.tenant,
          description: `فاتورة ${s.invoiceNumber} - ${s.total} ج.م`,
          user: s.user.name,
          createdAt: s.createdAt,
        })),
        ...movements.map((m) => ({
          type: "stock" as const,
          id: m.id,
          tenant: m.product.tenant,
          description: `${m.type === "IN" ? "إضافة" : m.type === "OUT" ? "سحب" : m.type} ${m.quantity} من ${m.product.name}`,
          user: m.user.name,
          createdAt: m.createdAt,
        })),
      ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      return activities.slice(0, limit);
    }),

  // Impersonate tenant (enter as pharmacy)
  impersonateTenant: adminProcedure
    .input(z.object({ tenantId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const tenant = await prisma.tenant.findUnique({
        where: { id: input.tenantId },
      });

      if (!tenant) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "الصيدلية غير موجودة",
        });
      }

      // Return tenant info to be stored in session
      return {
        tenantId: tenant.id,
        tenantName: tenant.name,
      };
    }),

  // Stop impersonation
  stopImpersonation: adminProcedure.mutation(async ({ ctx }) => {
    return { success: true };
  }),
});

