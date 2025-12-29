import { z } from "zod";
import { router, adminProcedure } from "@/lib/trpc/server";
import { prisma } from "@pharmacy/database";
import { TRPCError } from "@trpc/server";

// System settings schema
const systemSettingsSchema = z.object({
  // General
  appName: z.string().optional(),
  appLogo: z.string().optional(),
  defaultCurrency: z.string().optional(),
  defaultLanguage: z.string().optional(),
  timezone: z.string().optional(),
  
  // Pharmacy registration
  allowPharmacyRegistration: z.boolean().optional(),
  requireApproval: z.boolean().optional(),
  defaultPlan: z.enum(["FREE", "BASIC", "PRO", "ENTERPRISE"]).optional(),
  
  // Features
  enableBarcode: z.boolean().optional(),
  enablePrescription: z.boolean().optional(),
  enableCredit: z.boolean().optional(),
  enableMultiInventory: z.boolean().optional(),
  
  // Tax
  defaultTaxRate: z.number().optional(),
  enableVAT: z.boolean().optional(),
  
  // Notifications
  emailNotifications: z.boolean().optional(),
  smsNotifications: z.boolean().optional(),
  
  // Backup
  autoBackup: z.boolean().optional(),
  backupFrequency: z.string().optional(),
  
  // Security
  passwordMinLength: z.number().optional(),
  requireStrongPassword: z.boolean().optional(),
  sessionTimeout: z.number().optional(),
  
  // Limits
  maxUsersPerTenant: z.number().optional(),
  maxProductsPerTenant: z.number().optional(),
  maxStorageGB: z.number().optional(),
});

export const settingsRouter = router({
  // Get system settings
  getSystemSettings: adminProcedure.query(async () => {
    // In a real app, you'd store settings in a database table
    // For now, we'll use a JSON field or return defaults
    const settings = {
      // General
      appName: "Pharmacy Hub",
      appLogo: null,
      defaultCurrency: "EGP",
      defaultLanguage: "ar",
      timezone: "Africa/Cairo",
      
      // Pharmacy registration
      allowPharmacyRegistration: true,
      requireApproval: true,
      defaultPlan: "FREE" as const,
      
      // Features
      enableBarcode: true,
      enablePrescription: true,
      enableCredit: true,
      enableMultiInventory: true,
      
      // Tax
      defaultTaxRate: 14,
      enableVAT: true,
      
      // Notifications
      emailNotifications: true,
      smsNotifications: false,
      
      // Backup
      autoBackup: true,
      backupFrequency: "daily",
      
      // Security
      passwordMinLength: 6,
      requireStrongPassword: false,
      sessionTimeout: 30, // days
      
      // Limits
      maxUsersPerTenant: 50,
      maxProductsPerTenant: 10000,
      maxStorageGB: 10,
    };

    return settings;
  }),

  // Update system settings
  updateSystemSettings: adminProcedure
    .input(systemSettingsSchema)
    .mutation(async ({ input }) => {
      // In a real app, you'd save to a database
      // For now, we'll just return the updated settings
      const currentSettings = {
        appName: "Pharmacy Hub",
        appLogo: null,
        defaultCurrency: "EGP",
        defaultLanguage: "ar",
        timezone: "Africa/Cairo",
        allowPharmacyRegistration: true,
        requireApproval: true,
        defaultPlan: "FREE" as const,
        enableBarcode: true,
        enablePrescription: true,
        enableCredit: true,
        enableMultiInventory: true,
        defaultTaxRate: 14,
        enableVAT: true,
        emailNotifications: true,
        smsNotifications: false,
        autoBackup: true,
        backupFrequency: "daily",
        passwordMinLength: 6,
        requireStrongPassword: false,
        sessionTimeout: 30,
        maxUsersPerTenant: 50,
        maxProductsPerTenant: 10000,
        maxStorageGB: 10,
      };

      const updatedSettings = {
        ...currentSettings,
        ...input,
      };

      // TODO: Save to database
      // await prisma.systemSettings.upsert({...})

      return updatedSettings;
    }),

  // Get subscription plans
  getPlans: adminProcedure.query(async () => {
    const plans = [
      {
        id: "FREE",
        name: "مجاني",
        nameEn: "Free",
        price: 0,
        features: [
          "صيدلية واحدة",
          "حتى 5 مستخدمين",
          "حتى 1000 منتج",
          "تقارير أساسية",
          "دعم بريد إلكتروني",
        ],
        limits: {
          users: 5,
          products: 1000,
          storage: 1, // GB
        },
      },
      {
        id: "BASIC",
        name: "أساسي",
        nameEn: "Basic",
        price: 299,
        features: [
          "صيدلية واحدة",
          "حتى 20 مستخدم",
          "حتى 5000 منتج",
          "تقارير متقدمة",
          "دعم فني",
          "نسخ احتياطي يومي",
        ],
        limits: {
          users: 20,
          products: 5000,
          storage: 5,
        },
      },
      {
        id: "PRO",
        name: "احترافي",
        nameEn: "Pro",
        price: 599,
        features: [
          "صيدليات متعددة",
          "مستخدمين غير محدود",
          "منتجات غير محدودة",
          "تقارير شاملة",
          "دعم فني 24/7",
          "نسخ احتياطي تلقائي",
          "API Access",
        ],
        limits: {
          users: -1, // unlimited
          products: -1,
          storage: 20,
        },
      },
      {
        id: "ENTERPRISE",
        name: "مؤسسات",
        nameEn: "Enterprise",
        price: 1499,
        features: [
          "كل شيء في Pro",
          "صيدليات غير محدودة",
          "تخصيص كامل",
          "دعم مخصص",
          "تدريب الفريق",
          "تكامل مخصص",
        ],
        limits: {
          users: -1,
          products: -1,
          storage: 100,
        },
      },
    ];

    return plans;
  }),

  // Update subscription plan
  updatePlan: adminProcedure
    .input(
      z.object({
        planId: z.enum(["FREE", "BASIC", "PRO", "ENTERPRISE"]),
        planData: z.object({
          name: z.string().optional(),
          nameEn: z.string().optional(),
          price: z.number().optional(),
          features: z.array(z.string()).optional(),
          limits: z.object({
            users: z.number().optional(),
            products: z.number().optional(),
            storage: z.number().optional(),
          }).optional(),
        }),
      })
    )
    .mutation(async ({ input }) => {
      // TODO: Save plan to database
      return { success: true, plan: input.planId };
    }),

  // Get system logs/audit
  getAuditLogs: adminProcedure
    .input(
      z.object({
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        action: z.string().optional(),
        entity: z.string().optional(),
        userId: z.string().optional(),
        tenantId: z.string().optional(),
        page: z.number().default(1),
        limit: z.number().default(50),
      }).optional()
    )
    .query(async ({ input }) => {
      const {
        startDate,
        endDate,
        action,
        entity,
        userId,
        tenantId,
        page = 1,
        limit = 50,
      } = input || {};

      const where = {
        ...(startDate || endDate) && {
          createdAt: {
            ...(startDate && { gte: startDate }),
            ...(endDate && { lte: endDate }),
          },
        },
        ...(action && { action }),
        ...(entity && { entity }),
        ...(userId && { userId }),
        ...(tenantId && { tenantId }),
      };

      const [logs, total] = await Promise.all([
        prisma.auditLog.findMany({
          where,
          orderBy: { createdAt: "desc" },
          skip: (page - 1) * limit,
          take: limit,
        }),
        prisma.auditLog.count({ where }),
      ]);

      return {
        logs,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    }),

  // Get system health
  getSystemHealth: adminProcedure.query(async () => {
    const [
      dbStatus,
      totalTenants,
      activeTenants,
      totalUsers,
      totalSales,
      recentErrors,
    ] = await Promise.all([
      // Check database connection
      prisma.$queryRaw`SELECT 1 as health`.then(() => "healthy").catch(() => "unhealthy"),
      prisma.tenant.count(),
      prisma.tenant.count({ where: { status: "ACTIVE" } }),
      prisma.user.count({ where: { isActive: true } }),
      prisma.sale.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // last 24 hours
          },
        },
      }),
      prisma.auditLog.findMany({
        where: {
          action: "ERROR",
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
          },
        },
        take: 10,
        orderBy: { createdAt: "desc" },
      }),
    ]);

    return {
      status: dbStatus === "healthy" ? "healthy" : "degraded",
      database: dbStatus,
      stats: {
        tenants: {
          total: totalTenants,
          active: activeTenants,
        },
        users: totalUsers,
        sales24h: totalSales,
      },
      recentErrors: recentErrors.length,
      timestamp: new Date(),
    };
  }),
});

