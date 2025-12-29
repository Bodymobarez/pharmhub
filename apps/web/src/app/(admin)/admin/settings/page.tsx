"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Settings,
  Save,
  Globe,
  CreditCard,
  Shield,
  Bell,
  Database,
  BarChart3,
  Users,
  Package,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Button,
  Input,
  Label,
  Switch,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
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
  Badge,
} from "@pharmacy/ui";
import { trpc } from "@/lib/trpc/client";
import toast from "react-hot-toast";

export default function SettingsPage() {
  const { data: settings, isLoading } = trpc.settings.getSystemSettings.useQuery();
  const { data: plans } = trpc.settings.getPlans.useQuery();
  const { data: health } = trpc.settings.getSystemHealth.useQuery();

  const updateMutation = trpc.settings.updateSystemSettings.useMutation({
    onSuccess: () => {
      toast.success("تم حفظ الإعدادات بنجاح");
    },
    onError: (error) => toast.error(error.message),
  });

  const [formData, setFormData] = useState({
    appName: settings?.appName || "",
    defaultCurrency: settings?.defaultCurrency || "EGP",
    defaultLanguage: settings?.defaultLanguage || "ar",
    timezone: settings?.timezone || "Africa/Cairo",
    allowPharmacyRegistration: settings?.allowPharmacyRegistration ?? true,
    requireApproval: settings?.requireApproval ?? true,
    defaultPlan: settings?.defaultPlan || "FREE",
    enableBarcode: settings?.enableBarcode ?? true,
    enablePrescription: settings?.enablePrescription ?? true,
    enableCredit: settings?.enableCredit ?? true,
    enableMultiInventory: settings?.enableMultiInventory ?? true,
    defaultTaxRate: settings?.defaultTaxRate || 14,
    enableVAT: settings?.enableVAT ?? true,
    emailNotifications: settings?.emailNotifications ?? true,
    smsNotifications: settings?.smsNotifications ?? false,
    autoBackup: settings?.autoBackup ?? true,
    backupFrequency: settings?.backupFrequency || "daily",
    passwordMinLength: settings?.passwordMinLength || 6,
    requireStrongPassword: settings?.requireStrongPassword ?? false,
    sessionTimeout: settings?.sessionTimeout || 30,
    maxUsersPerTenant: settings?.maxUsersPerTenant || 50,
    maxProductsPerTenant: settings?.maxProductsPerTenant || 10000,
    maxStorageGB: settings?.maxStorageGB || 10,
  });

  const handleSave = () => {
    updateMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-32 bg-card rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">إعدادات النظام</h1>
          <p className="text-muted-foreground mt-1">
            إدارة إعدادات النظام العامة
          </p>
        </div>
        <Button onClick={handleSave} className="gap-2" disabled={updateMutation.isPending}>
          <Save className="w-4 h-4" />
          حفظ الإعدادات
        </Button>
      </div>

      {/* System Health */}
      {health && (
        <Card className="glass border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5 text-primary" />
              حالة النظام
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">الحالة العامة</p>
                <Badge
                  variant={health.status === "healthy" ? "success" : "destructive"}
                  className="mt-1"
                >
                  {health.status === "healthy" ? "سليم" : "مشكلة"}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">قاعدة البيانات</p>
                <Badge
                  variant={health.database === "healthy" ? "success" : "destructive"}
                  className="mt-1"
                >
                  {health.database === "healthy" ? "متصل" : "غير متصل"}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">الصيدليات النشطة</p>
                <p className="text-lg font-bold mt-1">
                  {health.stats.tenants.active}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">المبيعات (24 ساعة)</p>
                <p className="text-lg font-bold mt-1">
                  {health.stats.sales24h}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">عام</TabsTrigger>
          <TabsTrigger value="pharmacy">الصيدليات</TabsTrigger>
          <TabsTrigger value="features">الميزات</TabsTrigger>
          <TabsTrigger value="security">الأمان</TabsTrigger>
          <TabsTrigger value="plans">الخطط</TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-4">
          <Card className="glass border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-primary" />
                الإعدادات العامة
              </CardTitle>
              <CardDescription>
                إعدادات النظام الأساسية
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>اسم التطبيق</Label>
                  <Input
                    value={formData.appName}
                    onChange={(e) =>
                      setFormData({ ...formData, appName: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>العملة الافتراضية</Label>
                  <Select
                    value={formData.defaultCurrency}
                    onValueChange={(value) =>
                      setFormData({ ...formData, defaultCurrency: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EGP">جنيه مصري (EGP)</SelectItem>
                      <SelectItem value="USD">دولار (USD)</SelectItem>
                      <SelectItem value="EUR">يورو (EUR)</SelectItem>
                      <SelectItem value="SAR">ريال سعودي (SAR)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>اللغة الافتراضية</Label>
                  <Select
                    value={formData.defaultLanguage}
                    onValueChange={(value) =>
                      setFormData({ ...formData, defaultLanguage: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ar">العربية</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>المنطقة الزمنية</Label>
                  <Input
                    value={formData.timezone}
                    onChange={(e) =>
                      setFormData({ ...formData, timezone: e.target.value })
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pharmacy Settings */}
        <TabsContent value="pharmacy" className="space-y-4">
          <Card className="glass border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                إعدادات الصيدليات
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>السماح بتسجيل صيدليات جديدة</Label>
                  <p className="text-sm text-muted-foreground">
                    السماح للمستخدمين بتسجيل صيدليات جديدة
                  </p>
                </div>
                <Switch
                  checked={formData.allowPharmacyRegistration}
                  onCheckedChange={(checked) =>
                    setFormData({
                      ...formData,
                      allowPharmacyRegistration: checked,
                    })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>يتطلب موافقة الإدارة</Label>
                  <p className="text-sm text-muted-foreground">
                    طلبات التسجيل تحتاج موافقة قبل التفعيل
                  </p>
                </div>
                <Switch
                  checked={formData.requireApproval}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, requireApproval: checked })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>الخطة الافتراضية</Label>
                <Select
                  value={formData.defaultPlan}
                  onValueChange={(value: any) =>
                    setFormData({ ...formData, defaultPlan: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FREE">مجاني</SelectItem>
                    <SelectItem value="BASIC">أساسي</SelectItem>
                    <SelectItem value="PRO">احترافي</SelectItem>
                    <SelectItem value="ENTERPRISE">مؤسسات</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Features */}
        <TabsContent value="features" className="space-y-4">
          <Card className="glass border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5 text-primary" />
                الميزات
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>تفعيل الباركود</Label>
                  <p className="text-sm text-muted-foreground">
                    السماح بقراءة وإنشاء الباركود
                  </p>
                </div>
                <Switch
                  checked={formData.enableBarcode}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, enableBarcode: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>تفعيل الروشتات</Label>
                  <p className="text-sm text-muted-foreground">
                    السماح بإدخال الروشتات الطبية
                  </p>
                </div>
                <Switch
                  checked={formData.enablePrescription}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, enablePrescription: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>تفعيل البيع الآجل</Label>
                  <p className="text-sm text-muted-foreground">
                    السماح بالبيع بالآجل للعملاء
                  </p>
                </div>
                <Switch
                  checked={formData.enableCredit}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, enableCredit: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>مخازن متعددة</Label>
                  <p className="text-sm text-muted-foreground">
                    السماح بإنشاء أكثر من مخزن
                  </p>
                </div>
                <Switch
                  checked={formData.enableMultiInventory}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, enableMultiInventory: checked })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>معدل الضريبة الافتراضي (%)</Label>
                  <Input
                    type="number"
                    value={formData.defaultTaxRate}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        defaultTaxRate: parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                </div>
                <div className="flex items-center justify-between pt-6">
                  <Label>تفعيل ضريبة القيمة المضافة</Label>
                  <Switch
                    checked={formData.enableVAT}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, enableVAT: checked })
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security */}
        <TabsContent value="security" className="space-y-4">
          <Card className="glass border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                الأمان
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>الحد الأدنى لطول كلمة المرور</Label>
                  <Input
                    type="number"
                    value={formData.passwordMinLength}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        passwordMinLength: parseInt(e.target.value) || 6,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>انتهاء الجلسة (أيام)</Label>
                  <Input
                    type="number"
                    value={formData.sessionTimeout}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        sessionTimeout: parseInt(e.target.value) || 30,
                      })
                    }
                  />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>يتطلب كلمة مرور قوية</Label>
                  <p className="text-sm text-muted-foreground">
                    كلمة المرور يجب أن تحتوي على أحرف كبيرة وصغيرة وأرقام
                  </p>
                </div>
                <Switch
                  checked={formData.requireStrongPassword}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, requireStrongPassword: checked })
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Plans */}
        <TabsContent value="plans" className="space-y-4">
          <Card className="glass border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary" />
                خطط الاشتراك
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>الخطة</TableHead>
                    <TableHead>السعر</TableHead>
                    <TableHead>المستخدمين</TableHead>
                    <TableHead>المنتجات</TableHead>
                    <TableHead>التخزين</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {plans?.map((plan) => (
                    <TableRow key={plan.id}>
                      <TableCell className="font-medium">
                        {plan.name} ({plan.nameEn})
                      </TableCell>
                      <TableCell>
                        {plan.price === 0
                          ? "مجاني"
                          : `${plan.price} ج.م/شهر`}
                      </TableCell>
                      <TableCell>
                        {plan.limits.users === -1
                          ? "غير محدود"
                          : plan.limits.users}
                      </TableCell>
                      <TableCell>
                        {plan.limits.products === -1
                          ? "غير محدود"
                          : plan.limits.products}
                      </TableCell>
                      <TableCell>{plan.limits.storage} GB</TableCell>
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

