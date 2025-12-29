"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Warehouse,
  Plus,
  Package,
  AlertTriangle,
  Clock,
  ArrowLeftRight,
  MoreHorizontal,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@pharmacy/ui";
import { trpc } from "@/lib/trpc/client";
import { formatDate } from "@/lib/utils";
import toast from "react-hot-toast";

export default function InventoryPage() {
  const [showAddStock, setShowAddStock] = useState(false);
  const [showTransfer, setShowTransfer] = useState(false);
  const [addStockData, setAddStockData] = useState({
    productId: "",
    inventoryId: "",
    quantity: 0,
    batchNumber: "",
    expiryDate: "",
    costPrice: 0,
  });
  const [transferData, setTransferData] = useState({
    productId: "",
    fromInventoryId: "",
    toInventoryId: "",
    quantity: 0,
  });

  const { data: inventories, refetch } = trpc.inventory.getAll.useQuery();
  const { data: products } = trpc.product.getAll.useQuery();
  const { data: expiringItems } = trpc.inventory.getExpiring.useQuery({ days: 90 });
  const { data: movements } = trpc.inventory.getMovements.useQuery({ limit: 20 });

  const addStockMutation = trpc.inventory.addStock.useMutation({
    onSuccess: () => {
      toast.success("تم إضافة المخزون بنجاح");
      setShowAddStock(false);
      setAddStockData({
        productId: "",
        inventoryId: "",
        quantity: 0,
        batchNumber: "",
        expiryDate: "",
        costPrice: 0,
      });
      refetch();
    },
    onError: (error) => toast.error(error.message),
  });

  const transferMutation = trpc.inventory.transferStock.useMutation({
    onSuccess: () => {
      toast.success("تم التحويل بنجاح");
      setShowTransfer(false);
      setTransferData({
        productId: "",
        fromInventoryId: "",
        toInventoryId: "",
        quantity: 0,
      });
      refetch();
    },
    onError: (error) => toast.error(error.message),
  });

  const handleAddStock = () => {
    if (!addStockData.productId || !addStockData.inventoryId || !addStockData.quantity) {
      toast.error("يرجى ملء الحقول المطلوبة");
      return;
    }
    addStockMutation.mutate({
      ...addStockData,
      expiryDate: addStockData.expiryDate ? new Date(addStockData.expiryDate) : undefined,
    });
  };

  const handleTransfer = () => {
    if (
      !transferData.productId ||
      !transferData.fromInventoryId ||
      !transferData.toInventoryId ||
      !transferData.quantity
    ) {
      toast.error("يرجى ملء الحقول المطلوبة");
      return;
    }
    transferMutation.mutate(transferData);
  };

  const getMovementTypeBadge = (type: string) => {
    switch (type) {
      case "IN":
        return <Badge variant="success">إدخال</Badge>;
      case "OUT":
        return <Badge variant="destructive">إخراج</Badge>;
      case "ADJUSTMENT":
        return <Badge variant="warning">تعديل</Badge>;
      case "TRANSFER":
        return <Badge variant="info">تحويل</Badge>;
      case "RETURN":
        return <Badge variant="secondary">مرتجع</Badge>;
      default:
        return <Badge>{type}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">إدارة المخازن</h1>
          <p className="text-muted-foreground mt-1">
            تتبع المخزون والكميات والصلاحية
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={() => setShowTransfer(true)}>
            <ArrowLeftRight className="w-5 h-5" />
            تحويل
          </Button>
          <Button className="gap-2" onClick={() => setShowAddStock(true)}>
            <Plus className="w-5 h-5" />
            إضافة مخزون
          </Button>
        </div>
      </div>

      {/* Inventories Grid */}
      <div className="grid gap-4 md:grid-cols-3">
        {inventories?.map((inventory) => (
          <motion.div
            key={inventory.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="glass border-border/50 hover:glow-green transition-all">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Warehouse className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-bold">{inventory.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {inventory.location || "بدون موقع"}
                      </p>
                    </div>
                  </div>
                  {inventory.isDefault && (
                    <Badge variant="neon">رئيسي</Badge>
                  )}
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-border/30">
                  <div>
                    <p className="text-sm text-muted-foreground">عدد الأصناف</p>
                    <p className="text-2xl font-bold">{inventory._count.items}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="expiring" className="w-full">
        <TabsList>
          <TabsTrigger value="expiring" className="gap-2">
            <Clock className="w-4 h-4" />
            قارب على الانتهاء
          </TabsTrigger>
          <TabsTrigger value="movements" className="gap-2">
            <ArrowLeftRight className="w-4 h-4" />
            حركات المخزون
          </TabsTrigger>
        </TabsList>

        <TabsContent value="expiring">
          <Card className="glass border-border/50">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>المنتج</TableHead>
                    <TableHead>المخزن</TableHead>
                    <TableHead>رقم التشغيلة</TableHead>
                    <TableHead>الكمية</TableHead>
                    <TableHead>تاريخ الانتهاء</TableHead>
                    <TableHead>الحالة</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expiringItems?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-12">
                        <Clock className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">
                          لا توجد منتجات قاربت على الانتهاء
                        </p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    expiringItems?.map((item) => {
                      const daysLeft = item.expiryDate
                        ? Math.ceil(
                            (new Date(item.expiryDate).getTime() - Date.now()) /
                              (1000 * 60 * 60 * 24)
                          )
                        : 0;

                      return (
                        <TableRow key={item.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Package className="w-4 h-4 text-muted-foreground" />
                              {item.product.name}
                            </div>
                          </TableCell>
                          <TableCell>{item.inventory.name}</TableCell>
                          <TableCell>{item.batchNumber || "-"}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>
                            {item.expiryDate
                              ? formatDate(item.expiryDate)
                              : "-"}
                          </TableCell>
                          <TableCell>
                            {daysLeft < 0 ? (
                              <Badge variant="destructive">منتهي</Badge>
                            ) : daysLeft <= 30 ? (
                              <Badge variant="destructive">
                                {daysLeft} يوم
                              </Badge>
                            ) : (
                              <Badge variant="warning">{daysLeft} يوم</Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="movements">
          <Card className="glass border-border/50">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>المنتج</TableHead>
                    <TableHead>النوع</TableHead>
                    <TableHead>الكمية</TableHead>
                    <TableHead>المخزن</TableHead>
                    <TableHead>السبب</TableHead>
                    <TableHead>التاريخ</TableHead>
                    <TableHead>المستخدم</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {movements?.movements.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-12">
                        <ArrowLeftRight className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">لا توجد حركات</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    movements?.movements.map((movement) => (
                      <TableRow key={movement.id}>
                        <TableCell>{movement.product.name}</TableCell>
                        <TableCell>
                          {getMovementTypeBadge(movement.type)}
                        </TableCell>
                        <TableCell
                          className={
                            movement.type === "IN" || movement.type === "RETURN"
                              ? "text-green-500"
                              : "text-red-500"
                          }
                        >
                          {movement.type === "IN" || movement.type === "RETURN"
                            ? "+"
                            : "-"}
                          {Math.abs(movement.quantity)}
                        </TableCell>
                        <TableCell>
                          {movement.toInventory?.name ||
                            movement.fromInventory?.name ||
                            "-"}
                        </TableCell>
                        <TableCell>{movement.reason || "-"}</TableCell>
                        <TableCell>
                          {formatDate(movement.createdAt)}
                        </TableCell>
                        <TableCell>{movement.user.name}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Stock Dialog */}
      <Dialog open={showAddStock} onOpenChange={setShowAddStock}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-primary" />
              إضافة مخزون
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>المنتج *</Label>
              <Select
                value={addStockData.productId}
                onValueChange={(v) =>
                  setAddStockData({ ...addStockData, productId: v })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر المنتج" />
                </SelectTrigger>
                <SelectContent>
                  {products?.products.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>المخزن *</Label>
              <Select
                value={addStockData.inventoryId}
                onValueChange={(v) =>
                  setAddStockData({ ...addStockData, inventoryId: v })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر المخزن" />
                </SelectTrigger>
                <SelectContent>
                  {inventories?.map((inv) => (
                    <SelectItem key={inv.id} value={inv.id}>
                      {inv.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>الكمية *</Label>
                <Input
                  type="number"
                  value={addStockData.quantity}
                  onChange={(e) =>
                    setAddStockData({
                      ...addStockData,
                      quantity: Number(e.target.value),
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>رقم التشغيلة</Label>
                <Input
                  value={addStockData.batchNumber}
                  onChange={(e) =>
                    setAddStockData({
                      ...addStockData,
                      batchNumber: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>تاريخ الانتهاء</Label>
                <Input
                  type="date"
                  value={addStockData.expiryDate}
                  onChange={(e) =>
                    setAddStockData({
                      ...addStockData,
                      expiryDate: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>سعر الشراء</Label>
                <Input
                  type="number"
                  value={addStockData.costPrice}
                  onChange={(e) =>
                    setAddStockData({
                      ...addStockData,
                      costPrice: Number(e.target.value),
                    })
                  }
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddStock(false)}>
              إلغاء
            </Button>
            <Button onClick={handleAddStock} disabled={addStockMutation.isPending}>
              إضافة
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Transfer Dialog */}
      <Dialog open={showTransfer} onOpenChange={setShowTransfer}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ArrowLeftRight className="w-5 h-5 text-primary" />
              تحويل مخزون
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>المنتج *</Label>
              <Select
                value={transferData.productId}
                onValueChange={(v) =>
                  setTransferData({ ...transferData, productId: v })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر المنتج" />
                </SelectTrigger>
                <SelectContent>
                  {products?.products.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name} ({product.totalStock})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>من مخزن *</Label>
                <Select
                  value={transferData.fromInventoryId}
                  onValueChange={(v) =>
                    setTransferData({ ...transferData, fromInventoryId: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر" />
                  </SelectTrigger>
                  <SelectContent>
                    {inventories?.map((inv) => (
                      <SelectItem key={inv.id} value={inv.id}>
                        {inv.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>إلى مخزن *</Label>
                <Select
                  value={transferData.toInventoryId}
                  onValueChange={(v) =>
                    setTransferData({ ...transferData, toInventoryId: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر" />
                  </SelectTrigger>
                  <SelectContent>
                    {inventories
                      ?.filter((inv) => inv.id !== transferData.fromInventoryId)
                      .map((inv) => (
                        <SelectItem key={inv.id} value={inv.id}>
                          {inv.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>الكمية *</Label>
              <Input
                type="number"
                value={transferData.quantity}
                onChange={(e) =>
                  setTransferData({
                    ...transferData,
                    quantity: Number(e.target.value),
                  })
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTransfer(false)}>
              إلغاء
            </Button>
            <Button onClick={handleTransfer} disabled={transferMutation.isPending}>
              تحويل
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

