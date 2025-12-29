"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Receipt,
  Search,
  Eye,
  RotateCcw,
  Calendar,
  Filter,
  Download,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Input,
  Badge,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@pharmacy/ui";
import { trpc } from "@/lib/trpc/client";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import toast from "react-hot-toast";

export default function SalesPage() {
  const [selectedSale, setSelectedSale] = useState<any>(null);
  const [showDetails, setShowDetails] = useState(false);

  const { data, isLoading, refetch } = trpc.sale.getAll.useQuery();
  const { data: todaySummary } = trpc.sale.getTodaySummary.useQuery();

  const refundMutation = trpc.sale.refund.useMutation({
    onSuccess: () => {
      toast.success("تم استرجاع الفاتورة بنجاح");
      setShowDetails(false);
      refetch();
    },
    onError: (error) => toast.error(error.message),
  });

  const viewSale = async (sale: any) => {
    setSelectedSale(sale);
    setShowDetails(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <Badge variant="success">مكتمل</Badge>;
      case "REFUNDED":
        return <Badge variant="warning">مسترد</Badge>;
      case "CANCELLED":
        return <Badge variant="destructive">ملغي</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getPaymentBadge = (method: string) => {
    switch (method) {
      case "CASH":
        return <Badge variant="secondary">نقدي</Badge>;
      case "CARD":
        return <Badge variant="info">بطاقة</Badge>;
      case "MOBILE_WALLET":
        return <Badge variant="neon">محفظة</Badge>;
      case "CREDIT":
        return <Badge variant="warning">آجل</Badge>;
      default:
        return <Badge>{method}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">المبيعات</h1>
          <p className="text-muted-foreground mt-1">عرض وإدارة فواتير المبيعات</p>
        </div>
        <Button variant="outline" className="gap-2">
          <Download className="w-5 h-5" />
          تصدير
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="glass border-border/50">
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">مبيعات اليوم</p>
            <p className="text-2xl font-bold text-primary mt-1">
              {formatCurrency(todaySummary?.total || 0)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {todaySummary?.count || 0} فاتورة
            </p>
          </CardContent>
        </Card>
        <Card className="glass border-border/50">
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">نقدي</p>
            <p className="text-2xl font-bold mt-1">
              {formatCurrency(todaySummary?.cash || 0)}
            </p>
          </CardContent>
        </Card>
        <Card className="glass border-border/50">
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">بطاقة</p>
            <p className="text-2xl font-bold mt-1">
              {formatCurrency(todaySummary?.card || 0)}
            </p>
          </CardContent>
        </Card>
        <Card className="glass border-border/50">
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">آجل</p>
            <p className="text-2xl font-bold text-warning mt-1">
              {formatCurrency(todaySummary?.credit || 0)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Sales Table */}
      <Card className="glass border-border/50">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>رقم الفاتورة</TableHead>
                <TableHead>التاريخ</TableHead>
                <TableHead>العميل</TableHead>
                <TableHead>عدد الأصناف</TableHead>
                <TableHead>طريقة الدفع</TableHead>
                <TableHead>الإجمالي</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={8}>
                      <div className="h-12 bg-muted/50 rounded animate-pulse" />
                    </TableCell>
                  </TableRow>
                ))
              ) : data?.sales.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12">
                    <Receipt className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">لا توجد فواتير</p>
                  </TableCell>
                </TableRow>
              ) : (
                data?.sales.map((sale) => (
                  <TableRow key={sale.id}>
                    <TableCell className="font-mono">{sale.invoiceNumber}</TableCell>
                    <TableCell>{formatDateTime(sale.createdAt)}</TableCell>
                    <TableCell>{sale.customer?.name || "عميل نقدي"}</TableCell>
                    <TableCell>{sale._count.items}</TableCell>
                    <TableCell>{getPaymentBadge(sale.paymentMethod)}</TableCell>
                    <TableCell className="font-bold text-primary">
                      {formatCurrency(sale.total)}
                    </TableCell>
                    <TableCell>{getStatusBadge(sale.status)}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => viewSale(sale)}
                      >
                        <Eye className="w-5 h-5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Sale Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Receipt className="w-5 h-5 text-primary" />
              فاتورة {selectedSale?.invoiceNumber}
            </DialogTitle>
          </DialogHeader>

          {selectedSale && (
            <div className="space-y-6">
              {/* Sale Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">التاريخ</p>
                  <p className="font-medium">
                    {formatDateTime(selectedSale.createdAt)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">البائع</p>
                  <p className="font-medium">{selectedSale.user?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">العميل</p>
                  <p className="font-medium">
                    {selectedSale.customer?.name || "عميل نقدي"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">طريقة الدفع</p>
                  {getPaymentBadge(selectedSale.paymentMethod)}
                </div>
              </div>

              {/* Items Table would go here - simplified for now */}
              <div className="border-t border-b border-border py-4">
                <p className="text-muted-foreground text-center">
                  {selectedSale._count?.items || 0} صنف
                </p>
              </div>

              {/* Totals */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">المجموع الفرعي</span>
                  <span>{formatCurrency(selectedSale.subtotal)}</span>
                </div>
                {selectedSale.discountAmount > 0 && (
                  <div className="flex justify-between text-green-500">
                    <span>الخصم</span>
                    <span>-{formatCurrency(selectedSale.discountAmount)}</span>
                  </div>
                )}
                {selectedSale.taxAmount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">الضريبة</span>
                    <span>{formatCurrency(selectedSale.taxAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold pt-2 border-t">
                  <span>الإجمالي</span>
                  <span className="text-primary">
                    {formatCurrency(selectedSale.total)}
                  </span>
                </div>
              </div>

              {/* Actions */}
              {selectedSale.status === "COMPLETED" && (
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => window.print()}
                  >
                    طباعة
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1 gap-2"
                    onClick={() =>
                      refundMutation.mutate({
                        saleId: selectedSale.id,
                        reason: "استرجاع",
                      })
                    }
                    disabled={refundMutation.isPending}
                  >
                    <RotateCcw className="w-4 h-4" />
                    استرجاع
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

