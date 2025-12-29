"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Pill,
  LayoutDashboard,
  Building2,
  Users,
  Settings,
  BarChart3,
  Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin", label: "لوحة التحكم", icon: LayoutDashboard },
  { href: "/admin/tenants", label: "الصيدليات", icon: Building2 },
  { href: "/admin/enter-pharmacy", label: "الدخول إلى صيدلية", icon: Building2 },
  { href: "/admin/activities", label: "جميع الحركات", icon: Activity },
  { href: "/admin/users", label: "المستخدمين", icon: Users },
  { href: "/admin/reports", label: "التقارير", icon: BarChart3 },
  { href: "/admin/settings", label: "الإعدادات", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-l border-border/50 bg-card/50 backdrop-blur-xl flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-border/50">
        <Link href="/admin" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-neon-green to-neon-cyan flex items-center justify-center">
            <Pill className="w-5 h-5 text-black" />
          </div>
          <div>
            <h1 className="font-bold text-gradient">Pharmacy Hub</h1>
            <p className="text-xs text-muted-foreground">Admin Panel</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== "/admin" && pathname.startsWith(item.href));

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

      {/* Footer */}
      <div className="p-4 border-t border-border/50">
        <div className="p-4 rounded-xl glass text-center">
          <p className="text-sm text-muted-foreground">Admin Panel</p>
          <p className="text-xs text-muted-foreground mt-1">v1.0.0</p>
        </div>
      </div>
    </aside>
  );
}

