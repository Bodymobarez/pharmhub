import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency: string = "EGP"): string {
  return new Intl.NumberFormat("ar-EG", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("ar-EG", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));
}

export function formatDateTime(date: Date | string): string {
  return new Intl.DateTimeFormat("ar-EG", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function generateBarcode(): string {
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
  return `PHB${timestamp}${random}`;
}

export function generateSKU(prefix: string = "PRD"): string {
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}-${random}`;
}

export function calculateExpiryStatus(expiryDate: Date): "expired" | "expiring-soon" | "valid" {
  const now = new Date();
  const expiry = new Date(expiryDate);
  const daysUntilExpiry = Math.ceil(
    (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysUntilExpiry < 0) return "expired";
  if (daysUntilExpiry <= 90) return "expiring-soon";
  return "valid";
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + "...";
}

