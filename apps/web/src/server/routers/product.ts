import { z } from "zod";
import { router, pharmacyProcedure } from "@/lib/trpc/server";
import { prisma } from "@pharmacy/database";
import { TRPCError } from "@trpc/server";
import { generateBarcode, generateSKU } from "@/lib/utils";

const productInput = z.object({
  name: z.string().min(1),
  nameAr: z.string().optional(),
  description: z.string().optional(),
  barcode: z.string().optional(),
  sku: z.string().optional(),
  type: z.enum(["MEDICINE", "COSMETIC", "SUPPLEMENT", "MEDICAL_DEVICE", "OTHER"]).default("MEDICINE"),
  genericName: z.string().optional(),
  manufacturer: z.string().optional(),
  activeIngredient: z.string().optional(),
  dosageForm: z.string().optional(),
  strength: z.string().optional(),
  costPrice: z.number().min(0),
  sellingPrice: z.number().min(0),
  minSellingPrice: z.number().optional(),
  taxRate: z.number().default(0),
  isVatExempt: z.boolean().default(false),
  minStockLevel: z.number().default(10),
  maxStockLevel: z.number().optional(),
  reorderLevel: z.number().default(20),
  requiresPrescription: z.boolean().default(false),
  isControlled: z.boolean().default(false),
  storageConditions: z.string().optional(),
  categoryId: z.string().optional(),
  image: z.string().optional(),
});

export const productRouter = router({
  // Get all products
  getAll: pharmacyProcedure
    .input(
      z.object({
        search: z.string().optional(),
        categoryId: z.string().optional(),
        type: z.enum(["MEDICINE", "COSMETIC", "SUPPLEMENT", "MEDICAL_DEVICE", "OTHER"]).optional(),
        lowStock: z.boolean().optional(),
        page: z.number().default(1),
        limit: z.number().default(50),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      if (!ctx.session.user.tenantId) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const { search, categoryId, type, lowStock, page = 1, limit = 50 } = input || {};

      const where = {
        tenantId: ctx.session.user.tenantId,
        isActive: true,
        ...(categoryId && { categoryId }),
        ...(type && { type }),
        ...(search && {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { nameAr: { contains: search, mode: "insensitive" as const } },
            { barcode: { contains: search } },
            { genericName: { contains: search, mode: "insensitive" as const } },
          ],
        }),
      };

      const [products, total] = await Promise.all([
        prisma.product.findMany({
          where,
          include: {
            category: true,
            inventoryItems: {
              include: { inventory: true },
            },
          },
          orderBy: { name: "asc" },
          skip: (page - 1) * limit,
          take: limit,
        }),
        prisma.product.count({ where }),
      ]);

      // Calculate total stock for each product
      const productsWithStock = products.map((product) => ({
        ...product,
        totalStock: product.inventoryItems.reduce((sum, item) => sum + item.quantity, 0),
        isLowStock: product.inventoryItems.reduce((sum, item) => sum + item.quantity, 0) <= product.minStockLevel,
      }));

      // Filter by low stock if needed
      const filteredProducts = lowStock
        ? productsWithStock.filter((p) => p.isLowStock)
        : productsWithStock;

      return {
        products: filteredProducts,
        pagination: {
          page,
          limit,
          total: lowStock ? filteredProducts.length : total,
          totalPages: Math.ceil((lowStock ? filteredProducts.length : total) / limit),
        },
      };
    }),

  // Get product by ID
  getById: pharmacyProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      if (!ctx.session.user.tenantId) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const product = await prisma.product.findFirst({
        where: {
          id: input.id,
          tenantId: ctx.session.user.tenantId,
        },
        include: {
          category: true,
          inventoryItems: {
            include: { inventory: true },
          },
        },
      });

      if (!product) {
        throw new TRPCError({ code: "NOT_FOUND", message: "المنتج غير موجود" });
      }

      return {
        ...product,
        totalStock: product.inventoryItems.reduce((sum, item) => sum + item.quantity, 0),
      };
    }),

  // Get product by barcode
  getByBarcode: pharmacyProcedure
    .input(z.object({ barcode: z.string() }))
    .query(async ({ ctx, input }) => {
      if (!ctx.session.user.tenantId) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const product = await prisma.product.findFirst({
        where: {
          barcode: input.barcode,
          tenantId: ctx.session.user.tenantId,
          isActive: true,
        },
        include: {
          category: true,
          inventoryItems: {
            where: { quantity: { gt: 0 } },
            include: { inventory: true },
            orderBy: { expiryDate: "asc" },
          },
        },
      });

      if (!product) {
        throw new TRPCError({ code: "NOT_FOUND", message: "المنتج غير موجود" });
      }

      return {
        ...product,
        totalStock: product.inventoryItems.reduce((sum, item) => sum + item.quantity, 0),
      };
    }),

  // Create product
  create: pharmacyProcedure
    .input(productInput)
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session.user.tenantId) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      // Generate barcode if not provided
      const barcode = input.barcode || generateBarcode();
      const sku = input.sku || generateSKU();

      // Check if barcode already exists
      const existingProduct = await prisma.product.findFirst({
        where: {
          barcode,
          tenantId: ctx.session.user.tenantId,
        },
      });

      if (existingProduct) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "الباركود مستخدم بالفعل",
        });
      }

      const product = await prisma.product.create({
        data: {
          ...input,
          barcode,
          sku,
          tenantId: ctx.session.user.tenantId,
        },
        include: { category: true },
      });

      return product;
    }),

  // Update product
  update: pharmacyProcedure
    .input(
      z.object({
        id: z.string(),
        data: productInput.partial(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session.user.tenantId) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const product = await prisma.product.update({
        where: {
          id: input.id,
          tenantId: ctx.session.user.tenantId,
        },
        data: input.data,
        include: { category: true },
      });

      return product;
    }),

  // Delete product (soft delete)
  delete: pharmacyProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session.user.tenantId) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      await prisma.product.update({
        where: {
          id: input.id,
          tenantId: ctx.session.user.tenantId,
        },
        data: { isActive: false },
      });

      return { success: true };
    }),

  // Get categories
  getCategories: pharmacyProcedure.query(async ({ ctx }) => {
    if (!ctx.session.user.tenantId) {
      throw new TRPCError({ code: "FORBIDDEN" });
    }

    const categories = await prisma.category.findMany({
      where: { tenantId: ctx.session.user.tenantId },
      include: {
        _count: { select: { products: true } },
      },
      orderBy: { name: "asc" },
    });

    return categories;
  }),

  // Create category
  createCategory: pharmacyProcedure
    .input(
      z.object({
        name: z.string().min(1),
        nameAr: z.string().optional(),
        description: z.string().optional(),
        icon: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session.user.tenantId) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const category = await prisma.category.create({
        data: {
          ...input,
          tenantId: ctx.session.user.tenantId,
        },
      });

      return category;
    }),
});

