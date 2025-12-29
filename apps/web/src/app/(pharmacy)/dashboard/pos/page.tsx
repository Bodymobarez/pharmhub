"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  QrCode,
  Plus,
  Minus,
  Trash2,
  ShoppingCart,
  CreditCard,
  Banknote,
  Smartphone,
  Clock,
  User,
  Receipt,
  Printer,
  X,
  Check,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@pharmacy/ui";
import { trpc } from "@/lib/trpc/client";
import { formatCurrency } from "@/lib/utils";
import toast from "react-hot-toast";

interface CartItem {
  id: string;
  productId: string;
  name: string;
  barcode: string;
  price: number;
  quantity: number;
  stock: number;
}

export default function POSPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState("");
  const [barcode, setBarcode] = useState("");
  const [showPayment, setShowPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "CARD" | "MOBILE_WALLET" | "CREDIT">("CASH");
  const [paidAmount, setPaidAmount] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [lastInvoice, setLastInvoice] = useState<any>(null);

  const barcodeInputRef = useRef<HTMLInputElement>(null);

  const { data: products } = trpc.product.getAll.useQuery({ search: search || undefined });
  const { data: customers } = trpc.customer.getAll.useQuery();
  const { data: todaySummary } = trpc.sale.getTodaySummary.useQuery();

  const createSaleMutation = trpc.sale.create.useMutation({
    onSuccess: (data) => {
      setLastInvoice(data);
      setShowPayment(false);
      setShowSuccess(true);
      setCart([]);
      setPaidAmount("");
      setSelectedCustomer(null);
      toast.success("تم إتمام البيع بنجاح");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const getProductByBarcode = trpc.product.getByBarcode.useQuery(
    { barcode },
    { enabled: barcode.length > 5 }
  );

  useEffect(() => {
    if (getProductByBarcode.data) {
      addToCart(getProductByBarcode.data);
      setBarcode("");
    }
  }, [getProductByBarcode.data]);

  useEffect(() => {
    // Focus barcode input on mount
    barcodeInputRef.current?.focus();
  }, []);

  const addToCart = (product: any) => {
    const existingItem = cart.find((item) => item.productId === product.id);

    if (existingItem) {
      if (existingItem.quantity >= product.totalStock) {
        toast.error("الكمية غير متوفرة");
        return;
      }
      setCart(
        cart.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      if (product.totalStock <= 0) {
        toast.error("المنتج غير متوفر");
        return;
      }
      setCart([
        ...cart,
        {
          id: crypto.randomUUID(),
          productId: product.id,
          name: product.name,
          barcode: product.barcode || "",
          price: product.sellingPrice,
          quantity: 1,
          stock: product.totalStock,
        },
      ]);
    }
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(
      cart.map((item) => {
        if (item.id === id) {
          const newQty = item.quantity + delta;
          if (newQty < 1) return item;
          if (newQty > item.stock) {
            toast.error("الكمية غير متوفرة");
            return item;
          }
          return { ...item, quantity: newQty };
        }
        return item;
      })
    );
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter((item) => item.id !== id));
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const total = subtotal;
  const change = Number(paidAmount) - total;

  const handlePayment = () => {
    if (cart.length === 0) {
      toast.error("السلة فارغة");
      return;
    }

    if (paymentMethod !== "CREDIT" && Number(paidAmount) < total) {
      toast.error("المبلغ المدفوع أقل من الإجمالي");
      return;
    }

    createSaleMutation.mutate({
      items: cart.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.price,
        discount: 0,
      })),
      paymentMethod,
      paidAmount: Number(paidAmount) || 0,
      customerId: selectedCustomer || undefined,
    });
  };

  const quickAmounts = [50, 100, 200, 500];

  return (
    <div className="h-[calc(100vh-7rem)] flex gap-6">
      {/* Products Section */}
      <div className="flex-1 flex flex-col">
        {/* Search & Barcode */}
        <div className="flex gap-4 mb-4">
          <div className="relative flex-1">
            <QrCode className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              ref={barcodeInputRef}
              placeholder="امسح الباركود أو اكتبه..."
              className="pr-10 text-lg h-14"
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && barcode) {
                  // Trigger barcode search
                }
              }}
            />
          </div>
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="بحث بالاسم..."
              className="pr-10 text-lg h-14"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Products Grid */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {products?.products.map((product) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="cursor-pointer"
                onClick={() => addToCart(product)}
              >
                <Card className="glass border-border/50 hover:border-primary/50 hover:glow-green transition-all h-full">
                  <CardContent className="p-4">
                    <div className="flex flex-col h-full">
                      <p className="font-medium text-sm line-clamp-2 mb-2">
                        {product.name}
                      </p>
                      <div className="mt-auto">
                        <p className="text-lg font-bold text-primary">
                          {formatCurrency(product.sellingPrice)}
                        </p>
                        <Badge
                          variant={product.totalStock > 10 ? "success" : "warning"}
                          className="mt-1"
                        >
                          {product.totalStock} متوفر
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Cart Section */}
      <div className="w-96 flex flex-col">
        <Card className="glass border-border/50 flex-1 flex flex-col">
          <CardHeader className="border-b border-border/50">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-primary" />
                السلة
              </div>
              <Badge variant="secondary">{cart.length} منتج</Badge>
            </CardTitle>
          </CardHeader>

          <CardContent className="flex-1 overflow-y-auto p-4">
            <AnimatePresence mode="popLayout">
              {cart.length === 0 ? (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <ShoppingCart className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>السلة فارغة</p>
                    <p className="text-sm">امسح الباركود أو ابحث عن منتج</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {cart.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="p-3 rounded-xl bg-background/50 border border-border/30"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <p className="font-medium text-sm flex-1">{item.name}</p>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-destructive hover:bg-destructive/10 p-1 rounded"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(item.id, -1)}
                            className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center hover:bg-muted/80"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-10 text-center font-bold">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, 1)}
                            className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center hover:bg-muted/80"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="font-bold text-primary">
                          {formatCurrency(item.price * item.quantity)}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </AnimatePresence>
          </CardContent>

          {/* Cart Footer */}
          <div className="border-t border-border/50 p-4 space-y-4">
            {/* Customer Select */}
            <Select value={selectedCustomer || ""} onValueChange={setSelectedCustomer}>
              <SelectTrigger>
                <User className="w-4 h-4 ml-2" />
                <SelectValue placeholder="اختر العميل (اختياري)" />
              </SelectTrigger>
              <SelectContent>
                {customers?.customers.map((customer) => (
                  <SelectItem key={customer.id} value={customer.id}>
                    {customer.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Totals */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">المجموع الفرعي</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold">
                <span>الإجمالي</span>
                <span className="text-primary">{formatCurrency(total)}</span>
              </div>
            </div>

            {/* Pay Button */}
            <Button
              size="lg"
              className="w-full gap-2 text-lg h-14"
              onClick={() => setShowPayment(true)}
              disabled={cart.length === 0}
            >
              <CreditCard className="w-5 h-5" />
              إتمام الدفع
            </Button>
          </div>
        </Card>

        {/* Today Summary */}
        <Card className="glass border-border/50 mt-4">
          <CardContent className="p-4">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-xs text-muted-foreground">مبيعات اليوم</p>
                <p className="text-lg font-bold text-primary">
                  {formatCurrency(todaySummary?.total || 0)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">عدد الفواتير</p>
                <p className="text-lg font-bold">{todaySummary?.count || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Dialog */}
      <Dialog open={showPayment} onOpenChange={setShowPayment}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-primary" />
              إتمام الدفع
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Payment Methods */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: "CASH", label: "نقدي", icon: Banknote },
                { value: "CARD", label: "بطاقة", icon: CreditCard },
                { value: "MOBILE_WALLET", label: "محفظة", icon: Smartphone },
                { value: "CREDIT", label: "آجل", icon: Clock },
              ].map((method) => (
                <button
                  key={method.value}
                  onClick={() => setPaymentMethod(method.value as any)}
                  className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                    paymentMethod === method.value
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <method.icon
                    className={`w-6 h-6 ${
                      paymentMethod === method.value
                        ? "text-primary"
                        : "text-muted-foreground"
                    }`}
                  />
                  <span className="text-sm font-medium">{method.label}</span>
                </button>
              ))}
            </div>

            {/* Amount */}
            <div>
              <p className="text-sm text-muted-foreground mb-2">الإجمالي المطلوب</p>
              <p className="text-3xl font-bold text-primary text-center">
                {formatCurrency(total)}
              </p>
            </div>

            {paymentMethod !== "CREDIT" && (
              <>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">المبلغ المدفوع</p>
                  <Input
                    type="number"
                    placeholder="0.00"
                    className="text-2xl text-center h-14"
                    value={paidAmount}
                    onChange={(e) => setPaidAmount(e.target.value)}
                  />
                </div>

                {/* Quick Amounts */}
                <div className="flex gap-2">
                  {quickAmounts.map((amount) => (
                    <Button
                      key={amount}
                      variant="outline"
                      className="flex-1"
                      onClick={() => setPaidAmount(String(amount))}
                    >
                      {amount}
                    </Button>
                  ))}
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setPaidAmount(String(total))}
                  >
                    مطابق
                  </Button>
                </div>

                {Number(paidAmount) >= total && (
                  <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30 text-center">
                    <p className="text-sm text-muted-foreground">الباقي</p>
                    <p className="text-2xl font-bold text-green-500">
                      {formatCurrency(change)}
                    </p>
                  </div>
                )}
              </>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPayment(false)}>
              إلغاء
            </Button>
            <Button
              onClick={handlePayment}
              disabled={createSaleMutation.isPending}
              className="gap-2"
            >
              {createSaleMutation.isPending ? (
                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <Check className="w-5 h-5" />
              )}
              تأكيد
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Success Dialog */}
      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent className="max-w-sm text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4"
          >
            <Check className="w-10 h-10 text-green-500" />
          </motion.div>
          <DialogTitle className="text-2xl">تمت العملية بنجاح!</DialogTitle>
          <p className="text-muted-foreground">
            رقم الفاتورة: {lastInvoice?.invoiceNumber}
          </p>
          <div className="flex gap-3 mt-4">
            <Button
              variant="outline"
              className="flex-1 gap-2"
              onClick={() => window.print()}
            >
              <Printer className="w-4 h-4" />
              طباعة
            </Button>
            <Button className="flex-1" onClick={() => setShowSuccess(false)}>
              عملية جديدة
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

