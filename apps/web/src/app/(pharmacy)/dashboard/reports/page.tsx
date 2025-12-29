"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Package,
  DollarSign,
  Calendar,
  Download,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@pharmacy/ui";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { trpc } from "@/lib/trpc/client";
import { formatCurrency } from "@/lib/utils";

export default function ReportsPage() {
  const [period, setPeriod] = useState<"week" | "month" | "year">("month");

  const { data: stats } = trpc.dashboard.getPharmacyStats.useQuery();
  const { data: chartData } = trpc.dashboard.getSalesChart.useQuery({ period });
  const { data: topProducts } = trpc.dashboard.getTopProducts.useQuery({ limit: 10 });

  const formatChartData = (data: any[]) => {
    return data?.map((item) => ({
      ...item,
      total: item.total,
      label: new Date(item.date).toLocaleDateString("ar-EG", {
        day: "numeric",
        month: "short",
      }),
    })) || [];
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">التقارير والإحصائيات</h1>
          <p className="text-muted-foreground mt-1">
            تحليل المبيعات والأداء
          </p>
        </div>
        <Button variant="outline" className="gap-2">
          <Download className="w-5 h-5" />
          تصدير تقرير
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="glass border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">مبيعات الشهر</p>
                  <p className="text-2xl font-bold mt-1">
                    {formatCurrency(stats?.month.sales || 0)}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    {(stats?.month.growth || 0) >= 0 ? (
                      <TrendingUp className="w-4 h-4 text-green-500" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-500" />
                    )}
                    <span
                      className={`text-sm ${
                        (stats?.month.growth || 0) >= 0
                          ? "text-green-500"
                          : "text-red-500"
                      }`}
                    >
                      {stats?.month.growth?.toFixed(1)}%
                    </span>
                  </div>
                </div>
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="glass border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">عدد الفواتير</p>
                  <p className="text-2xl font-bold mt-1">
                    {stats?.month.transactions || 0}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">هذا الشهر</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-neon-cyan/10 flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-neon-cyan" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="glass border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">إجمالي المنتجات</p>
                  <p className="text-2xl font-bold mt-1">
                    {stats?.products.total || 0}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {stats?.products.lowStock || 0} منخفض
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-neon-purple/10 flex items-center justify-center">
                  <Package className="w-6 h-6 text-neon-purple" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="glass border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">متوسط الفاتورة</p>
                  <p className="text-2xl font-bold mt-1">
                    {formatCurrency(
                      (stats?.month.sales || 0) /
                        Math.max(stats?.month.transactions || 1, 1)
                    )}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">لكل عملية</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-neon-green/10 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-neon-green" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Sales Chart */}
      <Card className="glass border-border/50">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            تحليل المبيعات
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant={period === "week" ? "default" : "outline"}
              size="sm"
              onClick={() => setPeriod("week")}
            >
              أسبوع
            </Button>
            <Button
              variant={period === "month" ? "default" : "outline"}
              size="sm"
              onClick={() => setPeriod("month")}
            >
              شهر
            </Button>
            <Button
              variant={period === "year" ? "default" : "outline"}
              size="sm"
              onClick={() => setPeriod("year")}
            >
              سنة
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={formatChartData(chartData || [])}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="hsl(var(--primary))"
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="95%"
                      stopColor="hsl(var(--primary))"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                />
                <XAxis
                  dataKey="label"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                  formatter={(value: number) => [
                    formatCurrency(value),
                    "المبيعات",
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="total"
                  stroke="hsl(var(--primary))"
                  fill="url(#colorSales)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Top Products */}
      <Card className="glass border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            المنتجات الأكثر مبيعاً
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={topProducts?.map((item) => ({
                  name: item.product?.name?.slice(0, 15) + "...",
                  revenue: item.revenue,
                  quantity: item.quantity,
                })) || []}
                layout="vertical"
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                />
                <XAxis
                  type="number"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  width={120}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                  formatter={(value: number, name: string) => [
                    name === "revenue"
                      ? formatCurrency(value)
                      : `${value} وحدة`,
                    name === "revenue" ? "الإيرادات" : "الكمية",
                  ]}
                />
                <Bar
                  dataKey="revenue"
                  fill="hsl(var(--primary))"
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

