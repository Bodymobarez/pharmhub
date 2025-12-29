import { z } from "zod";

// Login Schema
export const loginSchema = z.object({
  username: z.string().min(3, "اسم المستخدم يجب أن يكون 3 أحرف على الأقل"),
  password: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
});

// Register Schema
export const registerSchema = z.object({
  pharmacyName: z.string().min(2, "اسم الصيدلية مطلوب"),
  email: z.string().email("البريد الإلكتروني غير صحيح"),
  phone: z.string().min(10, "رقم الهاتف غير صحيح"),
  address: z.string().min(5, "العنوان مطلوب"),
  city: z.string().min(2, "المدينة مطلوبة"),
  ownerName: z.string().min(2, "اسم المسؤول مطلوب"),
  username: z.string().min(3, "اسم المستخدم يجب أن يكون 3 أحرف على الأقل"),
  password: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
});

// Product Schema
export const productSchema = z.object({
  name: z.string().min(1, "اسم المنتج مطلوب"),
  nameAr: z.string().optional(),
  barcode: z.string().optional(),
  sku: z.string().optional(),
  type: z.enum(["MEDICINE", "COSMETIC", "SUPPLEMENT", "MEDICAL_DEVICE", "OTHER"]),
  genericName: z.string().optional(),
  manufacturer: z.string().optional(),
  dosageForm: z.string().optional(),
  strength: z.string().optional(),
  costPrice: z.number().min(0, "سعر الشراء يجب أن يكون 0 أو أكثر"),
  sellingPrice: z.number().min(0, "سعر البيع يجب أن يكون 0 أو أكثر"),
  minStockLevel: z.number().default(10),
  categoryId: z.string().optional(),
});

// Customer Schema
export const customerSchema = z.object({
  name: z.string().min(2, "اسم العميل مطلوب"),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  address: z.string().optional(),
  creditLimit: z.number().default(0),
});

// Supplier Schema
export const supplierSchema = z.object({
  name: z.string().min(2, "اسم المورد مطلوب"),
  contactPerson: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  address: z.string().optional(),
  taxNumber: z.string().optional(),
});

// Sale Item Schema
export const saleItemSchema = z.object({
  productId: z.string(),
  quantity: z.number().min(1, "الكمية يجب أن تكون 1 على الأقل"),
  unitPrice: z.number().min(0),
  discount: z.number().default(0),
});

// Sale Schema
export const saleSchema = z.object({
  items: z.array(saleItemSchema).min(1, "يجب إضافة منتج واحد على الأقل"),
  customerId: z.string().optional(),
  paymentMethod: z.enum(["CASH", "CARD", "MOBILE_WALLET", "CREDIT"]),
  discountAmount: z.number().default(0),
  paidAmount: z.number().min(0),
  prescriptionNumber: z.string().optional(),
  doctorName: z.string().optional(),
  notes: z.string().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ProductInput = z.infer<typeof productSchema>;
export type CustomerInput = z.infer<typeof customerSchema>;
export type SupplierInput = z.infer<typeof supplierSchema>;
export type SaleInput = z.infer<typeof saleSchema>;

