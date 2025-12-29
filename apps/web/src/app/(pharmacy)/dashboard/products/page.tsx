"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Package,
  Search,
  Plus,
  Edit,
  Trash2,
  QrCode,
  MoreHorizontal,
  Filter,
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
  DialogFooter,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@pharmacy/ui";
import { trpc } from "@/lib/trpc/client";
import { formatCurrency } from "@/lib/utils";
import toast from "react-hot-toast";
import Barcode from "react-barcode";

export default function ProductsPage() {
  const [search, setSearch] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showBarcodeDialog, setShowBarcodeDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [newProduct, setNewProduct] = useState({
    name: "",
    nameAr: "",
    barcode: "",
    genericName: "",
    manufacturer: "",
    dosageForm: "",
    strength: "",
    costPrice: 0,
    sellingPrice: 0,
    categoryId: "",
    type: "MEDICINE" as const,
  });

  const { data, isLoading, refetch } = trpc.product.getAll.useQuery({
    search: search || undefined,
  });
  const { data: categories } = trpc.product.getCategories.useQuery();

  const createMutation = trpc.product.create.useMutation({
    onSuccess: () => {
      toast.success("تم إضافة المنتج بنجاح");
      setShowAddDialog(false);
      setNewProduct({
        name: "",
        nameAr: "",
        barcode: "",
        genericName: "",
        manufacturer: "",
        dosageForm: "",
        strength: "",
        costPrice: 0,
        sellingPrice: 0,
        categoryId: "",
        type: "MEDICINE",
      });
      refetch();
    },
    onError: (error) => toast.error(error.message),
  });

  const deleteMutation = trpc.product.delete.useMutation({
    onSuccess: () => {
      toast.success("تم حذف المنتج");
      refetch();
    },
    onError: (error) => toast.error(error.message),
  });

  const handleCreate = () => {
    if (!newProduct.name || !newProduct.sellingPrice) {
      toast.error("يرجى ملء الحقول المطلوبة");
      return;
    }
    createMutation.mutate(newProduct);
  };

  const showBarcode = (product: any) => {
    setSelectedProduct(product);
    setShowBarcodeDialog(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">المنتجات</h1>
          <p className="text-muted-foreground mt-1">
            إدارة الأدوية والمنتجات
          </p>
        </div>
        <Button className="gap-2" onClick={() => setShowAddDialog(true)}>
          <Plus className="w-5 h-5" />
          إضافة منتج
        </Button>
      </div>

      {/* Search & Filters */}
      <Card className="glass border-border/50">
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="بحث بالاسم أو الباركود..."
                className="pr-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card className="glass border-border/50">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>المنتج</TableHead>
                <TableHead>الباركود</TableHead>
                <TableHead>الفئة</TableHead>
                <TableHead>سعر الشراء</TableHead>
                <TableHead>سعر البيع</TableHead>
                <TableHead>المخزون</TableHead>
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
              ) : data?.products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12">
                    <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">لا توجد منتجات</p>
                  </TableCell>
                </TableRow>
              ) : (
                data?.products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{product.name}</p>
                        {product.genericName && (
                          <p className="text-xs text-muted-foreground">
                            {product.genericName}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <button
                        onClick={() => showBarcode(product)}
                        className="flex items-center gap-2 text-sm font-mono hover:text-primary"
                      >
                        <QrCode className="w-4 h-4" />
                        {product.barcode}
                      </button>
                    </TableCell>
                    <TableCell>{product.category?.name || "-"}</TableCell>
                    <TableCell>{formatCurrency(product.costPrice)}</TableCell>
                    <TableCell className="font-bold text-primary">
                      {formatCurrency(product.sellingPrice)}
                    </TableCell>
                    <TableCell>
                      <span
                        className={
                          product.totalStock <= product.minStockLevel
                            ? "text-destructive font-bold"
                            : ""
                        }
                      >
                        {product.totalStock}
                      </span>
                    </TableCell>
                    <TableCell>
                      {product.isLowStock ? (
                        <Badge variant="warning">منخفض</Badge>
                      ) : (
                        <Badge variant="success">متوفر</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="w-5 h-5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => showBarcode(product)}>
                            <QrCode className="w-4 h-4 ml-2" />
                            عرض الباركود
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="w-4 h-4 ml-2" />
                            تعديل
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => deleteMutation.mutate({ id: product.id })}
                            className="text-destructive"
                          >
                            <Trash2 className="w-4 h-4 ml-2" />
                            حذف
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Product Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="w-5 h-5 text-primary" />
              إضافة منتج جديد
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>اسم المنتج *</Label>
                <Input
                  value={newProduct.name}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, name: e.target.value })
                  }
                  placeholder="Panadol Extra"
                />
              </div>
              <div className="space-y-2">
                <Label>الاسم بالعربي</Label>
                <Input
                  value={newProduct.nameAr}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, nameAr: e.target.value })
                  }
                  placeholder="بانادول إكسترا"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>الباركود</Label>
                <Input
                  value={newProduct.barcode}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, barcode: e.target.value })
                  }
                  placeholder="سيتم إنشاؤه تلقائياً"
                />
              </div>
              <div className="space-y-2">
                <Label>الفئة</Label>
                <Select
                  value={newProduct.categoryId}
                  onValueChange={(v) =>
                    setNewProduct({ ...newProduct, categoryId: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الفئة" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories?.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>الاسم العلمي</Label>
                <Input
                  value={newProduct.genericName}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, genericName: e.target.value })
                  }
                  placeholder="Paracetamol"
                />
              </div>
              <div className="space-y-2">
                <Label>الشكل الدوائي</Label>
                <Input
                  value={newProduct.dosageForm}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, dosageForm: e.target.value })
                  }
                  placeholder="أقراص"
                />
              </div>
              <div className="space-y-2">
                <Label>التركيز</Label>
                <Input
                  value={newProduct.strength}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, strength: e.target.value })
                  }
                  placeholder="500mg"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>سعر الشراء *</Label>
                <Input
                  type="number"
                  value={newProduct.costPrice}
                  onChange={(e) =>
                    setNewProduct({
                      ...newProduct,
                      costPrice: Number(e.target.value),
                    })
                  }
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label>سعر البيع *</Label>
                <Input
                  type="number"
                  value={newProduct.sellingPrice}
                  onChange={(e) =>
                    setNewProduct({
                      ...newProduct,
                      sellingPrice: Number(e.target.value),
                    })
                  }
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              إلغاء
            </Button>
            <Button
              onClick={handleCreate}
              disabled={createMutation.isPending}
              className="gap-2"
            >
              {createMutation.isPending ? (
                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <Plus className="w-5 h-5" />
              )}
              إضافة
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Barcode Dialog */}
      <Dialog open={showBarcodeDialog} onOpenChange={setShowBarcodeDialog}>
        <DialogContent className="max-w-sm text-center">
          <DialogHeader>
            <DialogTitle>{selectedProduct?.name}</DialogTitle>
          </DialogHeader>
          <div className="py-6 flex justify-center">
            {selectedProduct?.barcode && (
              <Barcode
                value={selectedProduct.barcode}
                width={2}
                height={80}
                fontSize={14}
              />
            )}
          </div>
          <Button onClick={() => window.print()}>
            <QrCode className="w-4 h-4 ml-2" />
            طباعة
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}

