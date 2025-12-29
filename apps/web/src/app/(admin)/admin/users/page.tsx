"use client";

import { useState, useEffect } from "react";
import {
  Users,
  Search,
  Plus,
  Edit,
  Trash2,
  Building2,
  UserCheck,
  UserX,
  MoreHorizontal,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Input,
  Badge,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  Label,
} from "@pharmacy/ui";
import { trpc } from "@/lib/trpc/client";
import { formatDate } from "@/lib/utils";
import toast from "react-hot-toast";

export default function UsersPage() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string | undefined>();
  const [tenantFilter, setTenantFilter] = useState<string | undefined>();
  const [isActiveFilter, setIsActiveFilter] = useState<boolean | undefined>();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const { data: tenants } = trpc.tenant.getAll.useQuery({});
  const { data, isLoading, refetch } = trpc.user.getAll.useQuery({
    search: search || undefined,
    role: roleFilter as any,
    tenantId: tenantFilter,
    isActive: isActiveFilter,
  });

  const createMutation = trpc.user.create.useMutation({
    onSuccess: () => {
      toast.success("تم إنشاء المستخدم بنجاح");
      setIsCreateOpen(false);
      refetch();
    },
    onError: (error) => toast.error(error.message),
  });

  const updateMutation = trpc.user.update.useMutation({
    onSuccess: () => {
      toast.success("تم تحديث المستخدم بنجاح");
      setIsEditOpen(false);
      setSelectedUser(null);
      refetch();
    },
    onError: (error) => toast.error(error.message),
  });

  const deleteMutation = trpc.user.delete.useMutation({
    onSuccess: () => {
      toast.success("تم حذف المستخدم بنجاح");
      refetch();
    },
    onError: (error) => toast.error(error.message),
  });

  const getRoleBadge = (role: string) => {
    const roles: Record<string, { label: string; variant: any }> = {
      SUPER_ADMIN: { label: "مدير النظام", variant: "destructive" },
      PHARMACY_OWNER: { label: "صاحب الصيدلية", variant: "default" },
      PHARMACY_MANAGER: { label: "مدير الصيدلية", variant: "secondary" },
      PHARMACY_EMPLOYEE: { label: "موظف", variant: "outline" },
      CASHIER: { label: "كاشير", variant: "outline" },
    };
    const roleInfo = roles[role] || { label: role, variant: "outline" };
    return <Badge variant={roleInfo.variant}>{roleInfo.label}</Badge>;
  };

  const handleCreate = (formData: any) => {
    createMutation.mutate(formData);
  };

  const handleUpdate = (id: string, formData: any) => {
    updateMutation.mutate({ id, data: formData });
  };

  const handleDelete = (id: string) => {
    if (typeof window !== "undefined" && window.confirm("هل أنت متأكد من حذف هذا المستخدم؟")) {
      deleteMutation.mutate({ id });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">إدارة المستخدمين</h1>
          <p className="text-muted-foreground mt-1">
            إدارة جميع المستخدمين من جميع الصيدليات
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          إضافة مستخدم جديد
        </Button>
      </div>

      <Card className="glass border-border/50">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="بحث..."
                className="pr-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select
              value={tenantFilter || "all"}
              onValueChange={(value) =>
                setTenantFilter(value === "all" ? undefined : value)
              }
            >
              <SelectTrigger>
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
            <Select
              value={roleFilter || "all"}
              onValueChange={(value) =>
                setRoleFilter(value === "all" ? undefined : value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="الدور" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الأدوار</SelectItem>
                <SelectItem value="PHARMACY_OWNER">صاحب الصيدلية</SelectItem>
                <SelectItem value="PHARMACY_MANAGER">مدير الصيدلية</SelectItem>
                <SelectItem value="PHARMACY_EMPLOYEE">موظف</SelectItem>
                <SelectItem value="CASHIER">كاشير</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={
                isActiveFilter === undefined
                  ? "all"
                  : isActiveFilter
                  ? "active"
                  : "inactive"
              }
              onValueChange={(value) =>
                setIsActiveFilter(
                  value === "all"
                    ? undefined
                    : value === "active"
                    ? true
                    : false
                )
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="الحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">الكل</SelectItem>
                <SelectItem value="active">نشط</SelectItem>
                <SelectItem value="inactive">غير نشط</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="glass border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">إجمالي المستخدمين</p>
                <p className="text-2xl font-bold mt-1">{data?.pagination.total || 0}</p>
              </div>
              <Users className="w-8 h-8 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="glass border-border/50">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>المستخدم</TableHead>
                <TableHead>الصيدلية</TableHead>
                <TableHead>الدور</TableHead>
                <TableHead>البريد</TableHead>
                <TableHead>الهاتف</TableHead>
                <TableHead>تاريخ الإنشاء</TableHead>
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
              ) : data?.users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12">
                    <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">لا توجد مستخدمين</p>
                  </TableCell>
                </TableRow>
              ) : (
                data?.users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-muted-foreground">
                          @{user.username}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {user.tenant ? (
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-muted-foreground" />
                          <span>{user.tenant.name}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell>{user.email || "-"}</TableCell>
                    <TableCell>{user.phone || "-"}</TableCell>
                    <TableCell>{formatDate(user.createdAt)}</TableCell>
                    <TableCell>
                      {user.isActive ? (
                        <Badge variant="success" className="gap-1">
                          <UserCheck className="w-3 h-3" />
                          نشط
                        </Badge>
                      ) : (
                        <Badge variant="destructive" className="gap-1">
                          <UserX className="w-3 h-3" />
                          غير نشط
                        </Badge>
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
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedUser(user);
                              setIsEditOpen(true);
                            }}
                          >
                            <Edit className="w-4 h-4 ml-2" />
                            تعديل
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(user.id)}
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

      {(isCreateOpen || isEditOpen) && (
        <UserDialog
          open={isCreateOpen || isEditOpen}
          onClose={() => {
            setIsCreateOpen(false);
            setIsEditOpen(false);
            setSelectedUser(null);
          }}
          user={selectedUser}
          tenants={tenants?.tenants || []}
          onSubmit={isCreateOpen ? handleCreate : (data) => handleUpdate(selectedUser.id, data)}
          isLoading={createMutation.isPending || updateMutation.isPending}
        />
      )}
    </div>
  );
}

function UserDialog({
  open,
  onClose,
  user,
  tenants,
  onSubmit,
  isLoading,
}: {
  open: boolean;
  onClose: () => void;
  user?: any;
  tenants: any[];
  onSubmit: (data: any) => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    name: "",
    phone: "",
    role: "PHARMACY_EMPLOYEE",
    tenantId: "",
    isActive: true,
  });

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || "",
        email: user.email || "",
        password: "",
        name: user.name || "",
        phone: user.phone || "",
        role: user.role || "PHARMACY_EMPLOYEE",
        tenantId: user.tenantId || "",
        isActive: user.isActive ?? true,
      });
    } else {
      setFormData({
        username: "",
        email: "",
        password: "",
        name: "",
        phone: "",
        role: "PHARMACY_EMPLOYEE",
        tenantId: "",
        isActive: true,
      });
    }
  }, [user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data: any = { ...formData };
    if (!user && !data.password) {
      toast.error("كلمة المرور مطلوبة");
      return;
    }
    if (user && !data.password) {
      delete (data as any).password;
    }
    onSubmit(data);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{user ? "تعديل المستخدم" : "إضافة مستخدم جديد"}</DialogTitle>
          <DialogDescription>
            {user
              ? "قم بتعديل بيانات المستخدم"
              : "أدخل بيانات المستخدم الجديد"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>اسم المستخدم *</Label>
              <Input
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label>الاسم الكامل *</Label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>البريد الإلكتروني</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>الهاتف</Label>
              <Input
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>كلمة المرور {!user && "*"}</Label>
              <Input
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required={!user}
                placeholder={user ? "اتركه فارغاً للحفاظ على الكلمة الحالية" : ""}
              />
            </div>
            <div className="space-y-2">
              <Label>الدور *</Label>
              <Select
                value={formData.role}
                onValueChange={(value) =>
                  setFormData({ ...formData, role: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PHARMACY_OWNER">صاحب الصيدلية</SelectItem>
                  <SelectItem value="PHARMACY_MANAGER">مدير الصيدلية</SelectItem>
                  <SelectItem value="PHARMACY_EMPLOYEE">موظف</SelectItem>
                  <SelectItem value="CASHIER">كاشير</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>الصيدلية *</Label>
            <Select
              value={formData.tenantId}
              onValueChange={(value) =>
                setFormData({ ...formData, tenantId: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="اختر الصيدلية" />
              </SelectTrigger>
              <SelectContent>
                {tenants.map((tenant) => (
                  <SelectItem key={tenant.id} value={tenant.id}>
                    {tenant.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              إلغاء
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "جاري الحفظ..." : user ? "تحديث" : "إنشاء"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

