"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Building2,
  Search,
  CheckCircle,
  XCircle,
  Eye,
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
import { formatDate } from "@/lib/utils";
import toast from "react-hot-toast";

export default function TenantsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | undefined>();

  const { data, isLoading, refetch } = trpc.tenant.getAll.useQuery({
    search: search || undefined,
    status: statusFilter as any,
  });

  const approveMutation = trpc.tenant.approve.useMutation({
    onSuccess: () => {
      toast.success("تم تفعيل الصيدلية بنجاح");
      refetch();
    },
    onError: (error) => toast.error(error.message),
  });

  const suspendMutation = trpc.tenant.suspend.useMutation({
    onSuccess: () => {
      toast.success("تم إيقاف الصيدلية");
      refetch();
    },
    onError: (error) => toast.error(error.message),
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <Badge variant="success">نشط</Badge>;
      case "PENDING":
        return <Badge variant="warning">في الانتظار</Badge>;
      case "SUSPENDED":
        return <Badge variant="destructive">موقوف</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPlanBadge = (plan: string) => {
    switch (plan) {
      case "FREE":
        return <Badge variant="secondary">مجاني</Badge>;
      case "BASIC":
        return <Badge variant="info">أساسي</Badge>;
      case "PRO":
        return <Badge variant="neon">احترافي</Badge>;
      case "ENTERPRISE":
        return <Badge variant="default">مؤسسات</Badge>;
      default:
        return <Badge variant="secondary">{plan}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">إدارة الصيدليات</h1>
          <p className="text-muted-foreground mt-1">
            عرض وإدارة جميع الصيدليات المسجلة
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card className="glass border-border/50">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="بحث بالاسم أو البريد..."
                className="pr-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={!statusFilter ? "default" : "outline"}
                onClick={() => setStatusFilter(undefined)}
              >
                الكل
              </Button>
              <Button
                variant={statusFilter === "PENDING" ? "default" : "outline"}
                onClick={() => setStatusFilter("PENDING")}
              >
                في الانتظار
              </Button>
              <Button
                variant={statusFilter === "ACTIVE" ? "default" : "outline"}
                onClick={() => setStatusFilter("ACTIVE")}
              >
                نشط
              </Button>
              <Button
                variant={statusFilter === "SUSPENDED" ? "default" : "outline"}
                onClick={() => setStatusFilter("SUSPENDED")}
              >
                موقوف
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="glass border-border/50">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الصيدلية</TableHead>
                <TableHead>البريد</TableHead>
                <TableHead>الهاتف</TableHead>
                <TableHead>الخطة</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>تاريخ التسجيل</TableHead>
                <TableHead>الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={7}>
                      <div className="h-12 bg-muted/50 rounded animate-pulse" />
                    </TableCell>
                  </TableRow>
                ))
              ) : data?.tenants.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12">
                    <Building2 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">لا توجد صيدليات</p>
                  </TableCell>
                </TableRow>
              ) : (
                data?.tenants.map((tenant) => (
                  <TableRow key={tenant.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Building2 className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{tenant.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {tenant.city}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{tenant.email}</TableCell>
                    <TableCell>{tenant.phone}</TableCell>
                    <TableCell>{getPlanBadge(tenant.plan)}</TableCell>
                    <TableCell>{getStatusBadge(tenant.status)}</TableCell>
                    <TableCell>{formatDate(tenant.createdAt)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="w-5 h-5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/tenants/${tenant.id}`}>
                              <Eye className="w-4 h-4 ml-2" />
                              عرض التفاصيل
                            </Link>
                          </DropdownMenuItem>
                          {tenant.status === "PENDING" && (
                            <DropdownMenuItem
                              onClick={() => approveMutation.mutate({ id: tenant.id })}
                            >
                              <CheckCircle className="w-4 h-4 ml-2" />
                              تفعيل
                            </DropdownMenuItem>
                          )}
                          {tenant.status === "ACTIVE" && (
                            <DropdownMenuItem
                              onClick={() => suspendMutation.mutate({ id: tenant.id })}
                              className="text-destructive"
                            >
                              <XCircle className="w-4 h-4 ml-2" />
                              إيقاف
                            </DropdownMenuItem>
                          )}
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

      {/* Pagination */}
      {data && data.pagination.totalPages > 1 && (
        <div className="flex justify-center">
          <div className="flex items-center gap-2">
            {[...Array(data.pagination.totalPages)].map((_, i) => (
              <Button
                key={i}
                variant={data.pagination.page === i + 1 ? "default" : "outline"}
                size="sm"
              >
                {i + 1}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

