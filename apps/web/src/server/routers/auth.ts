import { z } from "zod";
import bcrypt from "bcryptjs";
import { router, publicProcedure, protectedProcedure } from "@/lib/trpc/server";
import { prisma } from "@pharmacy/database";
import { TRPCError } from "@trpc/server";

export const authRouter = router({
  // Register a new pharmacy
  register: publicProcedure
    .input(
      z.object({
        // Tenant info
        pharmacyName: z.string().min(2, "اسم الصيدلية يجب أن يكون حرفين على الأقل"),
        email: z.string().email("البريد الإلكتروني غير صحيح"),
        phone: z.string().min(10, "رقم الهاتف يجب أن يكون 10 أرقام على الأقل"),
        address: z.string().min(5, "العنوان يجب أن يكون 5 أحرف على الأقل"),
        city: z.string().min(2, "المدينة يجب أن تكون حرفين على الأقل"),
        // Owner info
        ownerName: z.string().min(2, "اسم المسؤول يجب أن يكون حرفين على الأقل"),
        username: z.string().min(3, "اسم المستخدم يجب أن يكون 3 أحرف على الأقل"),
        password: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
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

      // Create slug from pharmacy name
      const slug = input.pharmacyName
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "")
        + "-" + Date.now().toString(36);

      // Hash password
      const hashedPassword = await bcrypt.hash(input.password, 12);

      // Create tenant and user in transaction
      const result = await prisma.$transaction(async (tx) => {
        // Create tenant
        const tenant = await tx.tenant.create({
          data: {
            name: input.pharmacyName,
            nameAr: input.pharmacyName,
            slug,
            email: input.email,
            phone: input.phone,
            address: input.address,
            city: input.city,
            status: "PENDING",
            plan: "FREE",
          },
        });

        // Create owner user
        const user = await tx.user.create({
          data: {
            username: input.username,
            email: input.email,
            password: hashedPassword,
            name: input.ownerName,
            phone: input.phone,
            role: "PHARMACY_OWNER",
            tenantId: tenant.id,
          },
        });

        // Create default inventory
        await tx.inventory.create({
          data: {
            name: "المخزن الرئيسي",
            nameAr: "المخزن الرئيسي",
            isDefault: true,
            tenantId: tenant.id,
          },
        });

        // Create default categories
        const defaultCategories = [
          { name: "أدوية", nameAr: "أدوية" },
          { name: "مستحضرات تجميل", nameAr: "مستحضرات تجميل" },
          { name: "مكملات غذائية", nameAr: "مكملات غذائية" },
          { name: "أجهزة طبية", nameAr: "أجهزة طبية" },
        ];

        for (const cat of defaultCategories) {
          await tx.category.create({
            data: { ...cat, tenantId: tenant.id },
          });
        }

        return { tenant, user };
      });

      return {
        success: true,
        message: "تم تسجيل الصيدلية بنجاح. في انتظار موافقة الإدارة.",
        tenantId: result.tenant.id,
      };
    }),

  // Get current user
  getSession: protectedProcedure.query(async ({ ctx }) => {
    const user = await prisma.user.findUnique({
      where: { id: ctx.session.user.id },
      include: { tenant: true },
    });

    if (!user) {
      throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
    }

    return {
      id: user.id,
      username: user.username,
      name: user.name,
      email: user.email,
      role: user.role,
      tenant: user.tenant
        ? {
            id: user.tenant.id,
            name: user.tenant.name,
            slug: user.tenant.slug,
            status: user.tenant.status,
            plan: user.tenant.plan,
          }
        : null,
    };
  }),

  // Update password
  updatePassword: protectedProcedure
    .input(
      z.object({
        currentPassword: z.string(),
        newPassword: z.string().min(6),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = await prisma.user.findUnique({
        where: { id: ctx.session.user.id },
      });

      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const isValid = await bcrypt.compare(input.currentPassword, user.password);
      if (!isValid) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "كلمة المرور الحالية غير صحيحة",
        });
      }

      const hashedPassword = await bcrypt.hash(input.newPassword, 12);
      await prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword },
      });

      return { success: true };
    }),
});

