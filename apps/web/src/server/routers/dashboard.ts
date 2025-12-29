import { z } from "zod";
import { router, pharmacyProcedure, adminProcedure } from "@/lib/trpc/server";
import { prisma } from "@pharmacy/database";
import { TRPCError } from "@trpc/server";

export const dashboardRouter = router({
  // Pharmacy dashboard stats
  getPharmacyStats: pharmacyProcedure.query(async ({ ctx }) => {
    if (!ctx.session.user.tenantId) {
      throw new TRPCError({ code: "FORBIDDEN" });
    }

    const tenantId = ctx.session.user.tenantId;

    // Get date ranges
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);

    // Fetch all stats in parallel
    const [
      todaySales,
      monthSales,
      lastMonthSales,
      productsCount,
      lowStockProducts,
      expiringProducts,
      customersCount,
      pendingCredit,
    ] = await Promise.all([
      // Today's sales
      prisma.sale.aggregate({
        where: {
          tenantId,
          createdAt: { gte: today },
          status: "COMPLETED",
        },
        _sum: { total: true },
        _count: true,
      }),
      // This month's sales
      prisma.sale.aggregate({
        where: {
          tenantId,
          createdAt: { gte: thisMonth },
          status: "COMPLETED",
        },
        _sum: { total: true },
        _count: true,
      }),
      // Last month's sales (for comparison)
      prisma.sale.aggregate({
        where: {
          tenantId,
          createdAt: { gte: lastMonth, lte: lastMonthEnd },
          status: "COMPLETED",
        },
        _sum: { total: true },
      }),
      // Products count
      prisma.product.count({
        where: { tenantId, isActive: true },
      }),
      // Low stock products
      prisma.product.findMany({
        where: {
          tenantId,
          isActive: true,
          inventoryItems: {
            some: {},
          },
        },
        include: {
          inventoryItems: true,
        },
      }).then((products) =>
        products.filter((p) => {
          const totalStock = p.inventoryItems.reduce((sum, i) => sum + i.quantity, 0);
          return totalStock <= p.minStockLevel;
        }).length
      ),
      // Expiring products (next 90 days)
      prisma.inventoryItem.count({
        where: {
          inventory: { tenantId },
          quantity: { gt: 0 },
          expiryDate: {
            lte: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
          },
        },
      }),
      // Customers count
      prisma.customer.count({
        where: { tenantId, isActive: true },
      }),
      // Pending credit
      prisma.customer.aggregate({
        where: { tenantId, balance: { gt: 0 } },
        _sum: { balance: true },
      }),
    ]);

    // Calculate growth
    const lastMonthTotal = lastMonthSales._sum.total || 0;
    const thisMonthTotal = monthSales._sum.total || 0;
    const salesGrowth = lastMonthTotal > 0
      ? ((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100
      : 0;

    return {
      today: {
        sales: todaySales._sum.total || 0,
        transactions: todaySales._count,
      },
      month: {
        sales: thisMonthTotal,
        transactions: monthSales._count,
        growth: salesGrowth,
      },
      products: {
        total: productsCount,
        lowStock: lowStockProducts,
        expiring: expiringProducts,
      },
      customers: {
        total: customersCount,
        pendingCredit: pendingCredit._sum.balance || 0,
      },
    };
  }),

  // Get sales chart data
  getSalesChart: pharmacyProcedure
    .input(
      z.object({
        period: z.enum(["week", "month", "year"]).default("month"),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      if (!ctx.session.user.tenantId) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const period = input?.period || "month";
      const tenantId = ctx.session.user.tenantId;

      // Calculate date range based on period
      const now = new Date();
      let startDate: Date;
      let groupBy: "day" | "week" | "month";

      switch (period) {
        case "week":
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          groupBy = "day" as const;
          break;
        case "year":
          startDate = new Date(now.getFullYear(), 0, 1);
          groupBy = "month" as const;
          break;
        default:
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          groupBy = "day" as const;
      }

      const sales = await prisma.sale.findMany({
        where: {
          tenantId,
          createdAt: { gte: startDate },
          status: "COMPLETED",
        },
        select: {
          total: true,
          createdAt: true,
        },
        orderBy: { createdAt: "asc" },
      });

      // Group sales by date
      const groupedSales: Record<string, number> = {};

      sales.forEach((sale) => {
        let key: string;
        const date = new Date(sale.createdAt);

        if (groupBy === "day") {
          key = date.toISOString().split("T")[0];
        } else if (groupBy === "month") {
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        } else {
          key = date.toISOString().split("T")[0];
        }

        groupedSales[key] = (groupedSales[key] || 0) + sale.total;
      });

      return Object.entries(groupedSales).map(([date, total]) => ({
        date,
        total,
      }));
    }),

  // Get top selling products
  getTopProducts: pharmacyProcedure
    .input(
      z.object({
        limit: z.number().default(10),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      if (!ctx.session.user.tenantId) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const { limit = 10, startDate, endDate } = input || {};

      const topProducts = await prisma.saleItem.groupBy({
        by: ["productId"],
        where: {
          sale: {
            tenantId: ctx.session.user.tenantId,
            status: "COMPLETED",
            ...(startDate && { createdAt: { gte: startDate } }),
            ...(endDate && { createdAt: { lte: endDate } }),
          },
        },
        _sum: {
          quantity: true,
          total: true,
        },
        orderBy: {
          _sum: {
            total: "desc",
          },
        },
        take: limit,
      });

      // Get product details
      const productIds = topProducts.map((p) => p.productId);
      const products = await prisma.product.findMany({
        where: { id: { in: productIds } },
      });

      return topProducts.map((item) => {
        const product = products.find((p) => p.id === item.productId);
        return {
          product,
          quantity: item._sum.quantity || 0,
          revenue: item._sum.total || 0,
        };
      });
    }),

  // Admin dashboard stats
  getAdminStats: adminProcedure.query(async () => {
    const [
      totalTenants,
      activeTenants,
      pendingTenants,
      totalUsers,
      totalSales,
      recentTenants,
    ] = await Promise.all([
      prisma.tenant.count(),
      prisma.tenant.count({ where: { status: "ACTIVE" } }),
      prisma.tenant.count({ where: { status: "PENDING" } }),
      prisma.user.count(),
      prisma.sale.aggregate({
        where: { status: "COMPLETED" },
        _sum: { total: true },
        _count: true,
      }),
      prisma.tenant.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          _count: {
            select: { users: true, sales: true },
          },
        },
      }),
    ]);

    return {
      tenants: {
        total: totalTenants,
        active: activeTenants,
        pending: pendingTenants,
      },
      users: totalUsers,
      sales: {
        total: totalSales._sum.total || 0,
        count: totalSales._count,
      },
      recentTenants,
    };
  }),

  // Recent activities
  getRecentActivities: pharmacyProcedure
    .input(z.object({ limit: z.number().default(10) }).optional())
    .query(async ({ ctx, input }) => {
      if (!ctx.session.user.tenantId) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const limit = input?.limit || 10;

      const [recentSales, recentMovements] = await Promise.all([
        prisma.sale.findMany({
          where: { tenantId: ctx.session.user.tenantId },
          take: limit,
          orderBy: { createdAt: "desc" },
          include: {
            user: { select: { name: true } },
            _count: { select: { items: true } },
          },
        }),
        prisma.stockMovement.findMany({
          where: {
            product: { tenantId: ctx.session.user.tenantId },
          },
          take: limit,
          orderBy: { createdAt: "desc" },
          include: {
            product: { select: { name: true } },
            user: { select: { name: true } },
          },
        }),
      ]);

      // Combine and sort activities
      const activities = [
        ...recentSales.map((s) => ({
          type: "sale" as const,
          id: s.id,
          description: `فاتورة ${s.invoiceNumber} - ${s.total} ج.م`,
          user: s.user.name,
          createdAt: s.createdAt,
        })),
        ...recentMovements.map((m) => ({
          type: "stock" as const,
          id: m.id,
          description: `${m.type === "IN" ? "إضافة" : "سحب"} ${m.quantity} من ${m.product.name}`,
          user: m.user.name,
          createdAt: m.createdAt,
        })),
      ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      return activities.slice(0, limit);
    }),
});

