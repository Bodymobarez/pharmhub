import { z } from "zod";
import { router, adminProcedure, pharmacyProcedure } from "@/lib/trpc/server";
import { prisma } from "@pharmacy/database";
import { TRPCError } from "@trpc/server";

export const reportsRouter = router({
  // Admin: Get comprehensive system report
  getSystemReport: adminProcedure
    .input(
      z.object({
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        tenantId: z.string().optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      const { startDate, endDate, tenantId } = input || {};

      const dateFilter = {
        ...(startDate || endDate) && {
          createdAt: {
            ...(startDate && { gte: startDate }),
            ...(endDate && { lte: endDate }),
          },
        },
      };

      const tenantWhere = tenantId ? { id: tenantId } : undefined;
      const saleWhere = tenantId ? { tenantId } : undefined;
      const productWhere = tenantId ? { tenantId } : undefined;
      const customerWhere = tenantId ? { tenantId } : undefined;
      const userWhere = tenantId ? { tenantId } : undefined;

      const [
        tenants,
        totalSales,
        totalRevenue,
        totalProducts,
        totalCustomers,
        totalUsers,
        salesByTenant,
        salesByDay,
        topProducts,
        topTenants,
        salesByPaymentMethod,
        salesByStatus,
      ] = await Promise.all([
        // Tenants stats
        prisma.tenant.findMany({
          where: tenantWhere,
          include: {
            _count: {
              select: {
                users: true,
                products: true,
                sales: true,
                customers: true,
              },
            },
          },
        }),
        // Total sales count
        prisma.sale.count({
          where: {
            ...saleWhere,
            ...dateFilter,
            status: "COMPLETED",
          },
        }),
        // Total revenue
        prisma.sale.aggregate({
          where: {
            ...saleWhere,
            ...dateFilter,
            status: "COMPLETED",
          },
          _sum: {
            total: true,
            taxAmount: true,
            discountAmount: true,
          },
        }),
        // Total products
        prisma.product.count({
          where: productWhere,
        }),
        // Total customers
        prisma.customer.count({
          where: customerWhere,
        }),
        // Total users
        prisma.user.count({
          where: userWhere,
        }),
        // Sales by tenant
        prisma.sale.groupBy({
          by: ["tenantId"],
          where: {
            ...dateFilter,
            status: "COMPLETED",
          },
          _sum: {
            total: true,
          },
          _count: true,
        }),
        // Sales by day
        prisma.sale.findMany({
          where: {
            ...saleWhere,
            ...dateFilter,
            status: "COMPLETED",
          },
          select: {
            total: true,
            createdAt: true,
          },
        }),
        // Top products
        prisma.saleItem.groupBy({
          by: ["productId"],
          where: {
            sale: {
              ...saleWhere,
              ...dateFilter,
              status: "COMPLETED",
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
          take: 10,
        }),
        // Top tenants by revenue
        prisma.sale.groupBy({
          by: ["tenantId"],
          where: {
            ...dateFilter,
            status: "COMPLETED",
          },
          _sum: {
            total: true,
          },
          orderBy: {
            _sum: {
              total: "desc",
            },
          },
          take: 10,
        }),
        // Sales by payment method
        prisma.sale.groupBy({
          by: ["paymentMethod"],
          where: {
            ...saleWhere,
            ...dateFilter,
            status: "COMPLETED",
          },
          _sum: {
            total: true,
          },
          _count: true,
        }),
        // Sales by status
        prisma.sale.groupBy({
          by: ["status"],
          where: {
            ...saleWhere,
            ...dateFilter,
          },
          _count: true,
          _sum: {
            total: true,
          },
        }),
      ]);

      // Get tenant names for sales by tenant
      const tenantIds = salesByTenant.map((s) => s.tenantId);
      const tenantNames = await prisma.tenant.findMany({
        where: { id: { in: tenantIds } },
        select: { id: true, name: true },
      });

      const salesByTenantWithNames = salesByTenant.map((s) => ({
        tenantId: s.tenantId,
        tenantName: tenantNames.find((t) => t.id === s.tenantId)?.name || "غير معروف",
        total: s._sum.total || 0,
        count: s._count,
      }));

      // Get product names for top products
      const productIds = topProducts.map((p) => p.productId);
      const productNames = await prisma.product.findMany({
        where: { id: { in: productIds } },
        select: { id: true, name: true, nameAr: true },
      });

      const topProductsWithNames = topProducts.map((item) => {
        const product = productNames.find((p) => p.id === item.productId);
        return {
          productId: item.productId,
          productName: product?.nameAr || product?.name || "غير معروف",
          quantity: item._sum.quantity || 0,
          revenue: item._sum.total || 0,
        };
      });

      // Get tenant names for top tenants
      const topTenantIds = topTenants.map((t) => t.tenantId);
      const topTenantNames = await prisma.tenant.findMany({
        where: { id: { in: topTenantIds } },
        select: { id: true, name: true },
      });

      const topTenantsWithNames = topTenants.map((item) => ({
        tenantId: item.tenantId,
        tenantName: topTenantNames.find((t) => t.id === item.tenantId)?.name || "غير معروف",
        revenue: item._sum.total || 0,
      }));

      // Group sales by day
      const salesByDayGrouped: Record<string, number> = {};
      salesByDay.forEach((sale) => {
        const date = sale.createdAt.toISOString().split("T")[0];
        salesByDayGrouped[date] = (salesByDayGrouped[date] || 0) + sale.total;
      });

      return {
        overview: {
          tenants: tenants.length,
          totalSales,
          totalRevenue: totalRevenue._sum.total || 0,
          totalTax: totalRevenue._sum.taxAmount || 0,
          totalDiscount: totalRevenue._sum.discountAmount || 0,
          totalProducts,
          totalCustomers,
          totalUsers,
        },
        salesByTenant: salesByTenantWithNames,
        salesByDay: Object.entries(salesByDayGrouped).map(([date, total]) => ({
          date,
          total,
        })),
        topProducts: topProductsWithNames,
        topTenants: topTenantsWithNames,
        salesByPaymentMethod: salesByPaymentMethod.map((item) => ({
          method: item.paymentMethod,
          total: item._sum.total || 0,
          count: item._count,
        })),
        salesByStatus: salesByStatus.map((item) => ({
          status: item.status,
          count: item._count,
          total: item._sum.total || 0,
        })),
        tenants,
      };
    }),

  // Admin: Get tenant comparison report
  getTenantComparison: adminProcedure
    .input(
      z.object({
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        tenantIds: z.array(z.string()).optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      const { startDate, endDate, tenantIds } = input || {};

      const dateFilter = {
        ...(startDate || endDate) && {
          createdAt: {
            ...(startDate && { gte: startDate }),
            ...(endDate && { lte: endDate }),
          },
        },
      };

      const tenantFilter = tenantIds && tenantIds.length > 0
        ? { id: { in: tenantIds } }
        : undefined;

      const tenants = await prisma.tenant.findMany({
        where: tenantIds && tenantIds.length > 0 ? { id: { in: tenantIds } } : undefined,
        include: {
          _count: {
            select: {
              users: true,
              products: true,
              sales: true,
              customers: true,
            },
          },
        },
      });

      const tenantStats = await Promise.all(
        tenants.map(async (tenant) => {
          const [sales, revenue, avgSale] = await Promise.all([
            prisma.sale.count({
              where: {
                tenantId: tenant.id,
                ...dateFilter,
                status: "COMPLETED",
              },
            }),
            prisma.sale.aggregate({
              where: {
                tenantId: tenant.id,
                ...dateFilter,
                status: "COMPLETED",
              },
              _sum: { total: true },
            }),
            prisma.sale.aggregate({
              where: {
                tenantId: tenant.id,
                ...dateFilter,
                status: "COMPLETED",
              },
              _avg: { total: true },
            }),
          ]);

          return {
            tenant: {
              id: tenant.id,
              name: tenant.name,
              status: tenant.status,
              plan: tenant.plan,
            },
            stats: {
              users: tenant._count.users,
              products: tenant._count.products,
              customers: tenant._count.customers,
              sales: sales,
              revenue: revenue._sum.total || 0,
              avgSale: avgSale._avg.total || 0,
            },
          };
        })
      );

      return tenantStats;
    }),

  // Pharmacy: Get pharmacy report
  getPharmacyReport: pharmacyProcedure
    .input(
      z.object({
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      if (!ctx.session.user.tenantId) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const { startDate, endDate } = input || {};
      const tenantId = ctx.session.user.tenantId;

      const dateFilter = {
        ...(startDate || endDate) && {
          createdAt: {
            ...(startDate && { gte: startDate }),
            ...(endDate && { lte: endDate }),
          },
        },
      };

      const [
        sales,
        revenue,
        products,
        customers,
        topProducts,
        salesByDay,
        salesByUser,
      ] = await Promise.all([
        prisma.sale.count({
          where: {
            tenantId,
            ...dateFilter,
            status: "COMPLETED",
          },
        }),
        prisma.sale.aggregate({
          where: {
            tenantId,
            ...dateFilter,
            status: "COMPLETED",
          },
          _sum: {
            total: true,
            taxAmount: true,
            discountAmount: true,
          },
        }),
        prisma.product.count({
          where: { tenantId },
        }),
        prisma.customer.count({
          where: { tenantId },
        }),
        prisma.saleItem.groupBy({
          by: ["productId"],
          where: {
            sale: {
              tenantId,
              ...dateFilter,
              status: "COMPLETED",
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
          take: 10,
        }),
        prisma.sale.findMany({
          where: {
            tenantId,
            ...dateFilter,
            status: "COMPLETED",
          },
          select: {
            total: true,
            createdAt: true,
          },
        }),
        prisma.sale.groupBy({
          by: ["userId"],
          where: {
            tenantId,
            ...dateFilter,
            status: "COMPLETED",
          },
          _sum: {
            total: true,
          },
          _count: true,
        }),
      ]);

      // Get product names
      const productIds = topProducts.map((p) => p.productId);
      const productNames = await prisma.product.findMany({
        where: { id: { in: productIds } },
        select: { id: true, name: true, nameAr: true },
      });

      const topProductsWithNames = topProducts.map((item) => {
        const product = productNames.find((p) => p.id === item.productId);
        return {
          productId: item.productId,
          productName: product?.nameAr || product?.name || "غير معروف",
          quantity: item._sum.quantity || 0,
          revenue: item._sum.total || 0,
        };
      });

      // Get user names
      const userIds = salesByUser.map((s) => s.userId);
      const userNames = await prisma.user.findMany({
        where: { id: { in: userIds } },
        select: { id: true, name: true },
      });

      const salesByUserWithNames = salesByUser.map((item) => ({
        userId: item.userId,
        userName: userNames.find((u) => u.id === item.userId)?.name || "غير معروف",
        revenue: item._sum.total || 0,
        count: item._count,
      }));

      // Group sales by day
      const salesByDayGrouped: Record<string, number> = {};
      salesByDay.forEach((sale) => {
        const date = sale.createdAt.toISOString().split("T")[0];
        salesByDayGrouped[date] = (salesByDayGrouped[date] || 0) + sale.total;
      });

      return {
        overview: {
          sales,
          revenue: revenue._sum.total || 0,
          tax: revenue._sum.taxAmount || 0,
          discount: revenue._sum.discountAmount || 0,
          products,
          customers,
        },
        topProducts: topProductsWithNames,
        salesByDay: Object.entries(salesByDayGrouped).map(([date, total]) => ({
          date,
          total,
        })),
        salesByUser: salesByUserWithNames,
      };
    }),
});

