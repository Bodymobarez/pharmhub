// User Roles
export type UserRole =
  | "SUPER_ADMIN"
  | "PHARMACY_OWNER"
  | "PHARMACY_MANAGER"
  | "PHARMACY_EMPLOYEE"
  | "CASHIER";

// Tenant Status
export type TenantStatus = "PENDING" | "ACTIVE" | "SUSPENDED" | "CANCELLED";

// Subscription Plans
export type SubscriptionPlan = "FREE" | "BASIC" | "PRO" | "ENTERPRISE";

// Product Types
export type ProductType =
  | "MEDICINE"
  | "COSMETIC"
  | "SUPPLEMENT"
  | "MEDICAL_DEVICE"
  | "OTHER";

// Sale Status
export type SaleStatus = "PENDING" | "COMPLETED" | "REFUNDED" | "CANCELLED";

// Payment Methods
export type PaymentMethod = "CASH" | "CARD" | "MOBILE_WALLET" | "CREDIT";

// Stock Movement Types
export type StockMovementType =
  | "IN"
  | "OUT"
  | "ADJUSTMENT"
  | "TRANSFER"
  | "RETURN"
  | "EXPIRED";

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Cart Item for POS
export interface CartItem {
  id: string;
  productId: string;
  name: string;
  barcode: string;
  price: number;
  quantity: number;
  stock: number;
  discount?: number;
}

// Dashboard Stats
export interface DashboardStats {
  today: {
    sales: number;
    transactions: number;
  };
  month: {
    sales: number;
    transactions: number;
    growth: number;
  };
  products: {
    total: number;
    lowStock: number;
    expiring: number;
  };
  customers: {
    total: number;
    pendingCredit: number;
  };
}

