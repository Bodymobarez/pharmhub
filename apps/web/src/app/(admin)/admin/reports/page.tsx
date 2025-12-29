"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Building2,
  Users,
  Package,
  ShoppingCart,
  Calendar,
  Download,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@pharmacy/ui";
import { trpc } from "@/lib/trpc/client";
import { formatCurrency } from "@/lib/utils";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState<"week" | "month" | "year" | "all">("month");
  const [tenantFilter, setTenantFilter] = useState<string | undefined>();

  const { data: tenants } = trpc.tenant.getAll.useQuery({});
  const { data: report, isLoading } = trpc.reports.getSystemReport.useQuery({
    tenantId: tenantFilter,
    startDate: getStartDate(dateRange),
  });

  function getStartDate(range: string): Date | undefined {
    const now = new Date();
    switch (range) {
      case "week":
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case "month":
        return new Date(now.getFullYear(), now.getMonth(), 1);
      case "year":
        return new Date(now.getFullYear(), 0, 1);
      default:
        return undefined;
    }
  }

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">التقارير الإدارية</h1>
          <p className="text-muted-foreground mt-1">
            تقارير شاملة عن جميع الصيدليات
          </p>
        </div>
        <div className="flex gap-2">
          <Select
            value={dateRange}
            onValueChange={(value: any) => setDateRange(value)}
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">آخر أسبوع</SelectItem>
              <SelectItem value="month">هذا الشهر</SelectItem>
              <SelectItem value="year">هذا العام</SelectItem>
              <SelectItem value="all">الكل</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={tenantFilter || "all"}
            onValueChange={(value) =>
              setTenantFilter(value === "all" ? undefined : value)
            }
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="الصيدلية" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الصيدليات</SelectItem>
              {tenants?.tenants.map((tenant) => (
                <SelectItem key={tenant.id} value={tenant.id}>
                  {tenant.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            تصدير
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="glass border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">إجمالي الإيرادات</p>
                <p className="text-2xl font-bold mt-1">
                  {formatCurrency(report?.overview.totalRevenue || 0)}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-neon-green/10 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-neon-green" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">إجمالي المبيعات</p>
                <p className="text-2xl font-bold mt-1">
                  {report?.overview.totalSales || 0}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-neon-cyan/10 flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-neon-cyan" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">الصيدليات</p>
                <p className="text-2xl font-bold mt-1">
                  {report?.overview.tenants || 0}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-neon-purple/10 flex items-center justify-center">
                <Building2 className="w-6 h-6 text-neon-purple" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">المنتجات</p>
                <p className="text-2xl font-bold mt-1">
                  {report?.overview.totalProducts || 0}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center">
                <Package className="w-6 h-6 text-yellow-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="sales" className="space-y-4">
        <TabsList>
          <TabsTrigger value="sales">المبيعات</TabsTrigger>
          <TabsTrigger value="tenants">الصيدليات</TabsTrigger>
          <TabsTrigger value="products">المنتجات</TabsTrigger>
          <TabsTrigger value="payment">طرق الدفع</TabsTrigger>
        </TabsList>

        {/* Sales Chart */}
        <TabsContent value="sales" className="space-y-4">
          <Card className="glass border-border/50">
            <CardHeader>
              <CardTitle>المبيعات حسب اليوم</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={report?.salesByDay || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value: any) => formatCurrency(value)} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="total"
                    stroke="#10b981"
                    strokeWidth={2}
                    name="الإيرادات"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="glass border-border/50">
            <CardHeader>
              <CardTitle>المبيعات حسب الصيدلية</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>الصيدلية</TableHead>
                    <TableHead>عدد المبيعات</TableHead>
                    <TableHead>إجمالي الإيرادات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {report?.salesByTenant.map((item) => (
                    <TableRow key={item.tenantId}>
                      <TableCell className="font-medium">
                        {item.tenantName}
                      </TableCell>
                      <TableCell>{item.count}</TableCell>
                      <TableCell>{formatCurrency(item.total)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Top Tenants */}
        <TabsContent value="tenants" className="space-y-4">
          <Card className="glass border-border/50">
            <CardHeader>
              <CardTitle>أفضل الصيدليات</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={report?.topTenants || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="tenantName" />
                  <YAxis />
                  <Tooltip formatter={(value: any) => formatCurrency(value)} />
                  <Legend />
                  <Bar dataKey="revenue" fill="#10b981" name="الإيرادات" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Top Products */}
        <TabsContent value="products" className="space-y-4">
          <Card className="glass border-border/50">
            <CardHeader>
              <CardTitle>الأكثر مبيعاً</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>المنتج</TableHead>
                    <TableHead>الكمية المباعة</TableHead>
                    <TableHead>إجمالي الإيرادات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {report?.topProducts.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">
                        {item.productName}
                      </TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>{formatCurrency(item.revenue)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment Methods */}
        <TabsContent value="payment" className="space-y-4">
          <Card className="glass border-border/50">
            <CardHeader>
              <CardTitle>المبيعات حسب طريقة الدفع</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={report?.salesByPaymentMethod || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="method" />
                  <YAxis />
                  <Tooltip formatter={(value: any) => formatCurrency(value)} />
                  <Legend />
                  <Bar dataKey="total" fill="#3b82f6" name="الإيرادات" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

