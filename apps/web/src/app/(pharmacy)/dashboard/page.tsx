"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  ShoppingCart,
  Package,
  Warehouse,
  Users,
  TrendingUp,
  TrendingDown,
  DollarSign,
  AlertTriangle,
  Clock,
  Receipt,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Badge,
} from "@pharmacy/ui";
import { trpc } from "@/lib/trpc/client";
import { formatCurrency } from "@/lib/utils";

export default function PharmacyDashboardPage() {
  const { data: stats, isLoading } = trpc.dashboard.getPharmacyStats.useQuery();
  const { data: chartData } = trpc.dashboard.getSalesChart.useQuery({ period: "week" });
  const { data: topProducts } = trpc.dashboard.getTopProducts.useQuery({ limit: 5 });
  const { data: activities } = trpc.dashboard.getRecentActivities.useQuery({ limit: 5 });

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
      title: "مبيعات اليوم",
      value: formatCurrency(stats?.today.sales || 0),
      subValue: `${stats?.today.transactions || 0} فاتورة`,
      icon: DollarSign,
      color: "text-neon-green",
      bgColor: "bg-neon-green/10",
    },
    {
      title: "مبيعات الشهر",
      value: formatCurrency(stats?.month.sales || 0),
      subValue: `${stats?.month.transactions || 0} فاتورة`,
      icon: TrendingUp,
      color: "text-neon-cyan",
      bgColor: "bg-neon-cyan/10",
      trend: stats?.month.growth || 0,
    },
    {
      title: "المنتجات",
      value: stats?.products.total || 0,
      subValue: `${stats?.products.lowStock || 0} منخفض`,
      icon: Package,
      color: "text-neon-purple",
      bgColor: "bg-neon-purple/10",
      alert: (stats?.products.lowStock || 0) > 0,
    },
    {
      title: "العملاء",
      value: stats?.customers.total || 0,
      subValue: formatCurrency(stats?.customers.pendingCredit || 0) + " آجل",
      icon: Users,
      color: "text-neon-blue",
      bgColor: "bg-neon-blue/10",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">لوحة التحكم</h1>
          <p className="text-muted-foreground mt-1">
            مرحباً بك في نظام إدارة الصيدلية
          </p>
        </div>
        <Link href="/dashboard/pos">
          <Button size="lg" className="gap-2">
            <ShoppingCart className="w-5 h-5" />
            نقطة البيع
          </Button>
        </Link>
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
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-xs text-muted-foreground">{stat.subValue}</p>
                      {stat.trend !== undefined && (
                        <Badge
                          variant={stat.trend >= 0 ? "success" : "destructive"}
                          className="text-xs"
                        >
                          {stat.trend >= 0 ? "+" : ""}
                          {stat.trend.toFixed(1)}%
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div
                    className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center relative`}
                  >
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                    {stat.alert && (
                      <span className="absolute -top-1 -left-1 w-3 h-3 bg-destructive rounded-full animate-pulse" />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Products */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="glass border-border/50">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                الأكثر مبيعاً
              </CardTitle>
              <Link href="/dashboard/reports">
                <Button variant="ghost" size="sm">
                  عرض الكل
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topProducts?.map((item, index) => (
                  <div
                    key={item.product?.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-background/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{item.product?.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.quantity} وحدة
                        </p>
                      </div>
                    </div>
                    <p className="font-bold text-primary">
                      {formatCurrency(item.revenue)}
                    </p>
                  </div>
                ))}
                {!topProducts?.length && (
                  <p className="text-center text-muted-foreground py-4">
                    لا توجد مبيعات بعد
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Activities */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="glass border-border/50">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                آخر الأنشطة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activities?.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center gap-3 p-3 rounded-xl bg-background/50"
                  >
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        activity.type === "sale"
                          ? "bg-green-500/10"
                          : "bg-blue-500/10"
                      }`}
                    >
                      {activity.type === "sale" ? (
                        <Receipt className="w-5 h-5 text-green-500" />
                      ) : (
                        <Package className="w-5 h-5 text-blue-500" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{activity.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {activity.user} -{" "}
                        {new Date(activity.createdAt).toLocaleTimeString("ar-EG")}
                      </p>
                    </div>
                  </div>
                ))}
                {!activities?.length && (
                  <p className="text-center text-muted-foreground py-4">
                    لا توجد أنشطة بعد
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Alerts */}
      {(stats?.products.lowStock || 0) > 0 || (stats?.products.expiring || 0) > 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="glass border-destructive/30 bg-destructive/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="w-5 h-5" />
                تنبيهات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {(stats?.products.lowStock || 0) > 0 && (
                  <div className="p-4 rounded-xl bg-background/50 border border-yellow-500/30">
                    <div className="flex items-center gap-3">
                      <Package className="w-8 h-8 text-yellow-500" />
                      <div>
                        <p className="font-bold">{stats?.products.lowStock} منتج</p>
                        <p className="text-sm text-muted-foreground">
                          مخزون منخفض
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                {(stats?.products.expiring || 0) > 0 && (
                  <div className="p-4 rounded-xl bg-background/50 border border-red-500/30">
                    <div className="flex items-center gap-3">
                      <Clock className="w-8 h-8 text-red-500" />
                      <div>
                        <p className="font-bold">{stats?.products.expiring} منتج</p>
                        <p className="text-sm text-muted-foreground">
                          قارب على الانتهاء
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ) : null}
    </div>
  );
}

