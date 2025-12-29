// Application Constants

export const APP_NAME = "Pharmacy Hub";
export const APP_NAME_AR = "نظام إدارة الصيدليات";

// Currency
export const DEFAULT_CURRENCY = "EGP";
export const CURRENCY_SYMBOL = "ج.م";

// Tax
export const DEFAULT_TAX_RATE = 14; // 14% VAT in Egypt

// Pagination
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

// Stock Alerts
export const LOW_STOCK_THRESHOLD = 10;
export const EXPIRY_WARNING_DAYS = 90;

// Invoice Prefixes
export const INVOICE_PREFIX = "INV";
export const PURCHASE_ORDER_PREFIX = "PO";
export const BARCODE_PREFIX = "PHB";

// Role Labels (Arabic)
export const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: "مدير النظام",
  PHARMACY_OWNER: "صاحب الصيدلية",
  PHARMACY_MANAGER: "مدير الصيدلية",
  PHARMACY_EMPLOYEE: "موظف",
  CASHIER: "كاشير",
};

// Status Labels (Arabic)
export const STATUS_LABELS: Record<string, string> = {
  PENDING: "في الانتظار",
  ACTIVE: "نشط",
  SUSPENDED: "موقوف",
  CANCELLED: "ملغي",
  COMPLETED: "مكتمل",
  REFUNDED: "مسترد",
};

// Payment Method Labels (Arabic)
export const PAYMENT_LABELS: Record<string, string> = {
  CASH: "نقدي",
  CARD: "بطاقة",
  MOBILE_WALLET: "محفظة إلكترونية",
  CREDIT: "آجل",
};

// Product Type Labels (Arabic)
export const PRODUCT_TYPE_LABELS: Record<string, string> = {
  MEDICINE: "دواء",
  COSMETIC: "مستحضر تجميل",
  SUPPLEMENT: "مكمل غذائي",
  MEDICAL_DEVICE: "جهاز طبي",
  OTHER: "أخرى",
};

// Stock Movement Labels (Arabic)
export const MOVEMENT_TYPE_LABELS: Record<string, string> = {
  IN: "إدخال",
  OUT: "إخراج",
  ADJUSTMENT: "تعديل",
  TRANSFER: "تحويل",
  RETURN: "مرتجع",
  EXPIRED: "منتهي الصلاحية",
};

