import { z } from "zod";
import { router, adminProcedure, pharmacyProcedure } from "@/lib/trpc/server";
import { prisma } from "@pharmacy/database";
import { TRPCError } from "@trpc/server";

export const tenantRouter = router({
  // Get all tenants (admin only)
  getAll: adminProcedure
    .input(
      z.object({
        status: z.enum(["PENDING", "ACTIVE", "SUSPENDED", "CANCELLED"]).optional(),
        search: z.string().optional(),
        page: z.number().default(1),
        limit: z.number().default(20),
      }).optional()
    )
    .query(async ({ input }) => {
      const { status, search, page = 1, limit = 20 } = input || {};

      const where = {
        ...(status && { status }),
        ...(search && {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { email: { contains: search, mode: "insensitive" as const } },
            { phone: { contains: search } },
          ],
        }),
      };

      const [tenants, total] = await Promise.all([
        prisma.tenant.findMany({
          where,
          include: {
            _count: {
              select: { users: true, products: true, sales: true },
            },
          },
          orderBy: { createdAt: "desc" },
          skip: (page - 1) * limit,
          take: limit,
        }),
        prisma.tenant.count({ where }),
      ]);

      return {
        tenants,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    }),

  // Get single tenant
  getById: adminProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const tenant = await prisma.tenant.findUnique({
        where: { id: input.id },
        include: {
          users: {
            select: {
              id: true,
              username: true,
              name: true,
              email: true,
              role: true,
              isActive: true,
              createdAt: true,
            },
          },
          _count: {
            select: {
              products: true,
              sales: true,
              customers: true,
              suppliers: true,
            },
          },
        },
      });

      if (!tenant) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Tenant not found" });
      }

      return tenant;
    }),

  // Approve tenant
  approve: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const tenant = await prisma.tenant.update({
        where: { id: input.id },
        data: { status: "ACTIVE" },
      });

      return { success: true, tenant };
    }),

  // Suspend tenant
  suspend: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const tenant = await prisma.tenant.update({
        where: { id: input.id },
        data: { status: "SUSPENDED" },
      });

      return { success: true, tenant };
    }),

  // Update tenant settings
  updateSettings: pharmacyProcedure
    .input(
      z.object({
        name: z.string().optional(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        address: z.string().optional(),
        taxNumber: z.string().optional(),
        settings: z.record(z.any()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session.user.tenantId) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const tenant = await prisma.tenant.update({
        where: { id: ctx.session.user.tenantId },
        data: input,
      });

      return { success: true, tenant };
    }),

  // Get current tenant info
  getCurrent: pharmacyProcedure.query(async ({ ctx }) => {
    if (!ctx.session.user.tenantId) {
      throw new TRPCError({ code: "FORBIDDEN" });
    }

    const tenant = await prisma.tenant.findUnique({
      where: { id: ctx.session.user.tenantId },
      include: {
        _count: {
          select: {
            users: true,
            products: true,
            inventories: true,
            sales: true,
            customers: true,
          },
        },
      },
    });

    return tenant;
  }),

  // Get tenant stats
  getStats: adminProcedure.query(async () => {
    const [total, active, pending, suspended] = await Promise.all([
      prisma.tenant.count(),
      prisma.tenant.count({ where: { status: "ACTIVE" } }),
      prisma.tenant.count({ where: { status: "PENDING" } }),
      prisma.tenant.count({ where: { status: "SUSPENDED" } }),
    ]);

    return { total, active, pending, suspended };
  }),
});

