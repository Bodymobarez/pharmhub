import { z } from "zod";
import bcrypt from "bcryptjs";
import { router, adminProcedure, pharmacyProcedure } from "@/lib/trpc/server";
import { prisma } from "@pharmacy/database";
import { TRPCError } from "@trpc/server";

export const userRouter = router({
  // Get all users (admin only - from all tenants)
  getAll: adminProcedure
    .input(
      z.object({
        tenantId: z.string().optional(),
        role: z.enum(["SUPER_ADMIN", "PHARMACY_OWNER", "PHARMACY_MANAGER", "PHARMACY_EMPLOYEE", "CASHIER"]).optional(),
        search: z.string().optional(),
        isActive: z.boolean().optional(),
        page: z.number().default(1),
        limit: z.number().default(50),
      }).optional()
    )
    .query(async ({ input }) => {
      const { tenantId, role, search, isActive, page = 1, limit = 50 } = input || {};

      const where = {
        ...(tenantId && { tenantId }),
        ...(role && { role }),
        ...(isActive !== undefined && { isActive }),
        ...(search && {
          OR: [
            { username: { contains: search, mode: "insensitive" as const } },
            { name: { contains: search, mode: "insensitive" as const } },
            { email: { contains: search, mode: "insensitive" as const } },
            { phone: { contains: search } },
          ],
        }),
      };

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where,
          include: {
            tenant: {
              select: {
                id: true,
                name: true,
                slug: true,
                status: true,
              },
            },
            _count: {
              select: {
                sales: true,
                stockMovements: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
          skip: (page - 1) * limit,
          take: limit,
        }),
        prisma.user.count({ where }),
      ]);

      return {
        users,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    }),

  // Get user by ID
  getById: adminProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const user = await prisma.user.findUnique({
        where: { id: input.id },
        include: {
          tenant: true,
          sales: {
            take: 10,
            orderBy: { createdAt: "desc" },
            include: {
              items: {
                include: { product: { select: { name: true } } },
              },
            },
          },
          stockMovements: {
            take: 10,
            orderBy: { createdAt: "desc" },
            include: {
              product: { select: { name: true } },
            },
          },
        },
      });

      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND", message: "المستخدم غير موجود" });
      }

      return user;
    }),

  // Create user (admin only)
  create: adminProcedure
    .input(
      z.object({
        username: z.string().min(3),
        email: z.string().email().optional(),
        password: z.string().min(6),
        name: z.string().min(2),
        phone: z.string().optional(),
        role: z.enum(["PHARMACY_OWNER", "PHARMACY_MANAGER", "PHARMACY_EMPLOYEE", "CASHIER"]),
        tenantId: z.string(),
        isActive: z.boolean().default(true),
      })
    )
    .mutation(async ({ input }) => {
      // Check if username exists
      const existingUser = await prisma.user.findUnique({
        where: { username: input.username },
      });

      if (existingUser) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "اسم المستخدم مستخدم بالفعل",
        });
      }

      // Check if email exists (if provided)
      if (input.email) {
        const existingEmail = await prisma.user.findUnique({
          where: { email: input.email },
        });

        if (existingEmail) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "البريد الإلكتروني مستخدم بالفعل",
          });
        }
      }

      // Verify tenant exists
      const tenant = await prisma.tenant.findUnique({
        where: { id: input.tenantId },
      });

      if (!tenant) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "الصيدلية غير موجودة",
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(input.password, 12);

      // Create user
      const user = await prisma.user.create({
        data: {
          username: input.username,
          email: input.email,
          password: hashedPassword,
          name: input.name,
          phone: input.phone,
          role: input.role,
          tenantId: input.tenantId,
          isActive: input.isActive,
        },
        include: {
          tenant: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      return user;
    }),

  // Update user (admin only)
  update: adminProcedure
    .input(
      z.object({
        id: z.string(),
        data: z.object({
          username: z.string().min(3).optional(),
          email: z.string().email().optional(),
          name: z.string().min(2).optional(),
          phone: z.string().optional(),
          role: z.enum(["PHARMACY_OWNER", "PHARMACY_MANAGER", "PHARMACY_EMPLOYEE", "CASHIER"]).optional(),
          tenantId: z.string().optional(),
          isActive: z.boolean().optional(),
          password: z.string().min(6).optional(),
        }),
      })
    )
    .mutation(async ({ input }) => {
      const user = await prisma.user.findUnique({
        where: { id: input.id },
      });

      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND", message: "المستخدم غير موجود" });
      }

      // Check username uniqueness if changed
      if (input.data.username && input.data.username !== user.username) {
        const existing = await prisma.user.findUnique({
          where: { username: input.data.username },
        });
        if (existing) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "اسم المستخدم مستخدم بالفعل",
          });
        }
      }

      // Check email uniqueness if changed
      if (input.data.email && input.data.email !== user.email) {
        const existing = await prisma.user.findUnique({
          where: { email: input.data.email },
        });
        if (existing) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "البريد الإلكتروني مستخدم بالفعل",
          });
        }
      }

      // Hash password if provided
      const updateData: any = { ...input.data };
      if (input.data.password) {
        updateData.password = await bcrypt.hash(input.data.password, 12);
      }

      const updatedUser = await prisma.user.update({
        where: { id: input.id },
        data: updateData,
        include: {
          tenant: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      return updatedUser;
    }),

  // Delete user (admin only - soft delete)
  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const user = await prisma.user.findUnique({
        where: { id: input.id },
      });

      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND", message: "المستخدم غير موجود" });
      }

      // Don't allow deleting super admin
      if (user.role === "SUPER_ADMIN") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "لا يمكن حذف مدير النظام",
        });
      }

      // Soft delete
      await prisma.user.update({
        where: { id: input.id },
        data: { isActive: false },
      });

      return { success: true };
    }),

  // Get users by tenant (pharmacy can see their users)
  getByTenant: pharmacyProcedure
    .input(
      z.object({
        search: z.string().optional(),
        role: z.enum(["PHARMACY_OWNER", "PHARMACY_MANAGER", "PHARMACY_EMPLOYEE", "CASHIER"]).optional(),
        page: z.number().default(1),
        limit: z.number().default(50),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      if (!ctx.session.user.tenantId) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const { search, role, page = 1, limit = 50 } = input || {};

      const where = {
        tenantId: ctx.session.user.tenantId,
        ...(role && { role }),
        ...(search && {
          OR: [
            { username: { contains: search, mode: "insensitive" as const } },
            { name: { contains: search, mode: "insensitive" as const } },
            { email: { contains: search, mode: "insensitive" as const } },
          ],
        }),
      };

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where,
          include: {
            _count: {
              select: {
                sales: true,
                stockMovements: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
          skip: (page - 1) * limit,
          take: limit,
        }),
        prisma.user.count({ where }),
      ]);

      return {
        users,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    }),

  // Get user stats
  getStats: adminProcedure.query(async () => {
    const [
      total,
      active,
      inactive,
      byRole,
      byTenant,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { isActive: true } }),
      prisma.user.count({ where: { isActive: false } }),
      prisma.user.groupBy({
        by: ["role"],
        _count: true,
      }),
      prisma.user.groupBy({
        by: ["tenantId"],
        _count: true,
      }),
    ]);

    return {
      total,
      active,
      inactive,
      byRole: byRole.map((r) => ({
        role: r.role,
        count: r._count,
      })),
      byTenant: byTenant.length,
    };
  }),
});

