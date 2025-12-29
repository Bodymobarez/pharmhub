import { z } from "zod";
import { router, pharmacyProcedure } from "@/lib/trpc/server";
import { prisma } from "@pharmacy/database";
import { TRPCError } from "@trpc/server";

export const customerRouter = router({
  // Get all customers
  getAll: pharmacyProcedure
    .input(
      z.object({
        search: z.string().optional(),
        hasBalance: z.boolean().optional(),
        page: z.number().default(1),
        limit: z.number().default(50),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      if (!ctx.session.user.tenantId) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const { search, hasBalance, page = 1, limit = 50 } = input || {};

      const where = {
        tenantId: ctx.session.user.tenantId,
        isActive: true,
        ...(hasBalance && { balance: { gt: 0 } }),
        ...(search && {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { phone: { contains: search } },
          ],
        }),
      };

      const [customers, total] = await Promise.all([
        prisma.customer.findMany({
          where,
          include: {
            _count: { select: { sales: true } },
          },
          orderBy: { name: "asc" },
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

  // Get customer by ID
  getById: pharmacyProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      if (!ctx.session.user.tenantId) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const customer = await prisma.customer.findFirst({
        where: {
          id: input.id,
          tenantId: ctx.session.user.tenantId,
        },
        include: {
          sales: {
            take: 10,
            orderBy: { createdAt: "desc" },
            include: {
              _count: { select: { items: true } },
            },
          },
        },
      });

      if (!customer) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return customer;
    }),

  // Create customer
  create: pharmacyProcedure
    .input(
      z.object({
        name: z.string().min(2),
        phone: z.string().optional(),
        email: z.string().email().optional(),
        address: z.string().optional(),
        creditLimit: z.number().default(0),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session.user.tenantId) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const customer = await prisma.customer.create({
        data: {
          ...input,
          tenantId: ctx.session.user.tenantId,
        },
      });

      return customer;
    }),

  // Update customer
  update: pharmacyProcedure
    .input(
      z.object({
        id: z.string(),
        data: z.object({
          name: z.string().min(2).optional(),
          phone: z.string().optional(),
          email: z.string().email().optional(),
          address: z.string().optional(),
          creditLimit: z.number().optional(),
          notes: z.string().optional(),
        }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session.user.tenantId) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const customer = await prisma.customer.update({
        where: {
          id: input.id,
          tenantId: ctx.session.user.tenantId,
        },
        data: input.data,
      });

      return customer;
    }),

  // Pay balance
  payBalance: pharmacyProcedure
    .input(
      z.object({
        customerId: z.string(),
        amount: z.number().min(0.01),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session.user.tenantId) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const customer = await prisma.customer.update({
        where: {
          id: input.customerId,
          tenantId: ctx.session.user.tenantId,
        },
        data: {
          balance: { decrement: input.amount },
        },
      });

      return customer;
    }),

  // Delete customer (soft delete)
  delete: pharmacyProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session.user.tenantId) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      await prisma.customer.update({
        where: {
          id: input.id,
          tenantId: ctx.session.user.tenantId,
        },
        data: { isActive: false },
      });

      return { success: true };
    }),
});

