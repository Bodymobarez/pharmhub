"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Pill,
  LayoutDashboard,
  Package,
  ShoppingCart,
  Warehouse,
  Users,
  Truck,
  BarChart3,
  Settings,
  QrCode,
  Receipt,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "لوحة التحكم", icon: LayoutDashboard },
  { href: "/dashboard/pos", label: "نقطة البيع", icon: ShoppingCart },
  { href: "/dashboard/products", label: "المنتجات", icon: Package },
  { href: "/dashboard/inventory", label: "المخازن", icon: Warehouse },
  { href: "/dashboard/sales", label: "المبيعات", icon: Receipt },
  { href: "/dashboard/customers", label: "العملاء", icon: Users },
  { href: "/dashboard/suppliers", label: "الموردين", icon: Truck },
  { href: "/dashboard/reports", label: "التقارير", icon: BarChart3 },
  { href: "/dashboard/settings", label: "الإعدادات", icon: Settings },
];

export function PharmacySidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-l border-border/50 bg-card/50 backdrop-blur-xl flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-border/50">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-neon-green to-neon-cyan flex items-center justify-center">
            <Pill className="w-5 h-5 text-black" />
          </div>
          <div>
            <h1 className="font-bold text-gradient">Pharmacy Hub</h1>
            <p className="text-xs text-muted-foreground">Pharmacy System</p>
          </div>
        </Link>
      </div>

      {/* Quick Action */}
      <div className="p-4">
        <Link href="/dashboard/pos">
          <div className="p-4 rounded-xl bg-gradient-to-r from-primary to-neon-cyan text-black text-center hover:opacity-90 transition-opacity">
            <ShoppingCart className="w-6 h-6 mx-auto mb-2" />
            <span className="font-bold">نقطة البيع</span>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Alerts */}
      <div className="p-4 border-t border-border/50">
        <Link href="/dashboard/alerts">
          <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 flex items-center gap-3 hover:bg-destructive/20 transition-colors">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            <div>
              <p className="text-sm font-medium text-destructive">تنبيهات</p>
              <p className="text-xs text-muted-foreground">3 منتجات منخفضة</p>
            </div>
          </div>
        </Link>
      </div>
    </aside>
  );
}

