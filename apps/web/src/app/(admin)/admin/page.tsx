"use client";

import { motion } from "framer-motion";
import {
  Building2,
  Users,
  TrendingUp,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, Badge } from "@pharmacy/ui";
import { trpc } from "@/lib/trpc/client";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function AdminDashboardPage() {
  const { data: stats, isLoading } = trpc.dashboard.getAdminStats.useQuery();
  const { data: tenantStats } = trpc.tenant.getStats.useQuery();

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-card rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: "إجمالي الصيدليات",
      value: stats?.tenants.total || 0,
      icon: Building2,
      color: "text-neon-green",
      bgColor: "bg-neon-green/10",
    },
    {
      title: "الصيدليات النشطة",
      value: stats?.tenants.active || 0,
      icon: CheckCircle,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      title: "في انتظار الموافقة",
      value: stats?.tenants.pending || 0,
      icon: Clock,
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10",
    },
    {
      title: "إجمالي المبيعات",
      value: formatCurrency(stats?.sales.total || 0),
      icon: DollarSign,
      color: "text-neon-cyan",
      bgColor: "bg-neon-cyan/10",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">لوحة تحكم المدير</h1>
          <p className="text-muted-foreground mt-1">
            مرحباً بك في لوحة إدارة النظام
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="glass border-border/50 hover:glow-green transition-all">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold mt-1">{stat.value}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Recent Tenants */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="glass border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" />
              أحدث الصيدليات المسجلة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.recentTenants.map((tenant) => (
                <div
                  key={tenant.id}
                  className="flex items-center justify-between p-4 rounded-xl bg-background/50 border border-border/30"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{tenant.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(tenant.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-left">
                      <p className="text-sm text-muted-foreground">مستخدمين</p>
                      <p className="font-medium">{tenant._count.users}</p>
                    </div>
                    <div className="text-left">
                      <p className="text-sm text-muted-foreground">مبيعات</p>
                      <p className="font-medium">{tenant._count.sales}</p>
                    </div>
                    <Badge
                      variant={
                        tenant.status === "ACTIVE"
                          ? "success"
                          : tenant.status === "PENDING"
                          ? "warning"
                          : "destructive"
                      }
                    >
                      {tenant.status === "ACTIVE"
                        ? "نشط"
                        : tenant.status === "PENDING"
                        ? "معلق"
                        : "موقوف"}
                    </Badge>
                  </div>
                </div>
              ))}
              {!stats?.recentTenants.length && (
                <p className="text-center text-muted-foreground py-8">
                  لا توجد صيدليات مسجلة بعد
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

