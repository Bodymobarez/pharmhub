"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  Building2,
  DollarSign,
  Package,
  Users,
  ShoppingCart,
  TrendingUp,
  Calendar,
  BarChart3,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
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
import { formatCurrency, formatDate } from "@/lib/utils";

export default function TenantDetailPage() {
  const params = useParams();
  const tenantId = params.id as string;

  const [dateRange, setDateRange] = useState<"week" | "month" | "year" | "all">("month");

  const startDate = (() => {
    const now = new Date();
    switch (dateRange) {
      case "week":
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case "month":
        return new Date(now.getFullYear(), now.getMonth(), 1);
      case "year":
        return new Date(now.getFullYear(), 0, 1);
      default:
        return undefined;
    }
  })();

  const { data: report, isLoading } = trpc.admin.getTenantReport.useQuery({
    tenantId,
    startDate,
  });

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-32 bg-card rounded-xl" />
        <div className="grid gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-card rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">الصيدلية غير موجودة</p>
      </div>
    );
  }

  const { tenant, stats, sales, products, customers, stockMovements } = report;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{tenant?.name}</h1>
          <p className="text-muted-foreground mt-1">
            تقرير مفصل عن الصيدلية
          </p>
        </div>
        <div className="flex gap-2">
          <Badge
            variant={
              tenant?.status === "ACTIVE"
                ? "success"
                : tenant?.status === "PENDING"
                ? "warning"
                : "destructive"
            }
          >
            {tenant?.status === "ACTIVE"
              ? "نشط"
              : tenant?.status === "PENDING"
              ? "معلق"
              : "موقوف"}
          </Badge>
          <Badge variant="secondary">{tenant?.plan}</Badge>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="glass border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">إجمالي المبيعات</p>
                <p className="text-2xl font-bold mt-1">
                  {formatCurrency(stats.sales.total)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.sales.count} عملية
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
                <p className="text-sm text-muted-foreground">المنتجات</p>
                <p className="text-2xl font-bold mt-1">
                  {tenant?._count.products || 0}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-neon-cyan/10 flex items-center justify-center">
                <Package className="w-6 h-6 text-neon-cyan" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">العملاء</p>
                <p className="text-2xl font-bold mt-1">
                  {tenant?._count.customers || 0}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-neon-purple/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-neon-purple" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">المستخدمين</p>
                <p className="text-2xl font-bold mt-1">
                  {tenant?._count.users || 0}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-yellow-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="sales" className="space-y-4">
        <TabsList>
          <TabsTrigger value="sales">المبيعات</TabsTrigger>
          <TabsTrigger value="products">المنتجات</TabsTrigger>
          <TabsTrigger value="customers">العملاء</TabsTrigger>
          <TabsTrigger value="movements">حركات المخزون</TabsTrigger>
          <TabsTrigger value="top">الأكثر مبيعاً</TabsTrigger>
        </TabsList>

        {/* Sales Tab */}
        <TabsContent value="sales" className="space-y-4">
          <Card className="glass border-border/50">
            <CardHeader>
              <CardTitle>المبيعات</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>رقم الفاتورة</TableHead>
                    <TableHead>التاريخ</TableHead>
                    <TableHead>المستخدم</TableHead>
                    <TableHead>العميل</TableHead>
                    <TableHead>الإجمالي</TableHead>
                    <TableHead>الحالة</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sales.map((sale) => (
                    <TableRow key={sale.id}>
                      <TableCell className="font-medium">
                        {sale.invoiceNumber}
                      </TableCell>
                      <TableCell>{formatDate(sale.createdAt)}</TableCell>
                      <TableCell>{sale.user.name}</TableCell>
                      <TableCell>
                        {sale.customer?.name || "عميل نقدي"}
                      </TableCell>
                      <TableCell>{formatCurrency(sale.total)}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            sale.status === "COMPLETED"
                              ? "success"
                              : sale.status === "PENDING"
                              ? "warning"
                              : "destructive"
                          }
                        >
                          {sale.status === "COMPLETED"
                            ? "مكتمل"
                            : sale.status === "PENDING"
                            ? "معلق"
                            : "ملغي"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Products Tab */}
        <TabsContent value="products" className="space-y-4">
          <Card className="glass border-border/50">
            <CardHeader>
              <CardTitle>المنتجات</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>الاسم</TableHead>
                    <TableHead>الباركود</TableHead>
                    <TableHead>سعر الشراء</TableHead>
                    <TableHead>سعر البيع</TableHead>
                    <TableHead>المخزون</TableHead>
                    <TableHead>الحالة</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => {
                    const totalStock = product.inventoryItems.reduce(
                      (sum, item) => sum + item.quantity,
                      0
                    );
                    return (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">
                          {product.nameAr || product.name}
                        </TableCell>
                        <TableCell>{product.barcode || "-"}</TableCell>
                        <TableCell>{formatCurrency(product.costPrice)}</TableCell>
                        <TableCell>{formatCurrency(product.sellingPrice)}</TableCell>
                        <TableCell>{totalStock}</TableCell>
                        <TableCell>
                          <Badge
                            variant={product.isActive ? "success" : "secondary"}
                          >
                            {product.isActive ? "نشط" : "غير نشط"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Customers Tab */}
        <TabsContent value="customers" className="space-y-4">
          <Card className="glass border-border/50">
            <CardHeader>
              <CardTitle>العملاء</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>الاسم</TableHead>
                    <TableHead>الهاتف</TableHead>
                    <TableHead>البريد</TableHead>
                    <TableHead>عدد المبيعات</TableHead>
                    <TableHead>الرصيد</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell className="font-medium">
                        {customer.name}
                      </TableCell>
                      <TableCell>{customer.phone || "-"}</TableCell>
                      <TableCell>{customer.email || "-"}</TableCell>
                      <TableCell>{customer._count.sales}</TableCell>
                      <TableCell>
                        {formatCurrency(customer.balance)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Stock Movements Tab */}
        <TabsContent value="movements" className="space-y-4">
          <Card className="glass border-border/50">
            <CardHeader>
              <CardTitle>حركات المخزون</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>التاريخ</TableHead>
                    <TableHead>المنتج</TableHead>
                    <TableHead>النوع</TableHead>
                    <TableHead>الكمية</TableHead>
                    <TableHead>المستخدم</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stockMovements.map((movement) => (
                    <TableRow key={movement.id}>
                      <TableCell>{formatDate(movement.createdAt)}</TableCell>
                      <TableCell className="font-medium">
                        {movement.product.name}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{movement.type}</Badge>
                      </TableCell>
                      <TableCell>{movement.quantity}</TableCell>
                      <TableCell>{movement.user.name}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Top Products Tab */}
        <TabsContent value="top" className="space-y-4">
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
                  {stats.topProducts.map((item, index) => (
                    <TableRow key={item.product?.id || index}>
                      <TableCell className="font-medium">
                        {item.product?.nameAr || item.product?.name || "-"}
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
      </Tabs>
    </div>
  );
}

