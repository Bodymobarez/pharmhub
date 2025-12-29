"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Building2,
  Search,
  ArrowRight,
  LogOut,
  CheckCircle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Input,
  Badge,
} from "@pharmacy/ui";
import { trpc } from "@/lib/trpc/client";
import { formatDate } from "@/lib/utils";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";

export default function EnterPharmacyPage() {
  const router = useRouter();
  const { data: session, update } = useSession();
  const [search, setSearch] = useState("");
  const [selectedTenantId, setSelectedTenantId] = useState<string | null>(null);

  const { data, isLoading } = trpc.tenant.getAll.useQuery({
    search: search || undefined,
    status: "ACTIVE",
  });

  const handleEnterPharmacy = async (tenantId: string) => {
    try {
      const tenant = data?.tenants.find((t) => t.id === tenantId);
      
      // Update session with impersonation
      await update({
        isImpersonating: true,
        originalRole: session?.user?.role,
        impersonatingTenantId: tenantId,
        impersonatingTenantName: tenant?.name,
      });

      toast.success("تم الدخول إلى الصيدلية بنجاح");
      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      console.error("Impersonation error:", error);
      toast.error("حدث خطأ. حاول مرة أخرى");
    }
  };

  const handleExitPharmacy = async () => {
    try {
      await update({
        isImpersonating: false,
        impersonatingTenantId: undefined,
        impersonatingTenantName: undefined,
      });

      toast.success("تم الخروج من الصيدلية");
      router.push("/admin");
      router.refresh();
    } catch (error) {
      console.error("Exit impersonation error:", error);
      toast.error("حدث خطأ. حاول مرة أخرى");
    }
  };

  // Check if already impersonating
  const isImpersonating = session?.user?.isImpersonating;
  const impersonatingTenant = isImpersonating
    ? data?.tenants.find((t) => t.id === session?.user?.impersonatingTenantId)
    : null;

  if (isImpersonating && impersonatingTenant) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <Card className="glass border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-primary" />
                أنت داخل صيدلية
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
                <div className="flex items-center gap-3 mb-2">
                  <Building2 className="w-8 h-8 text-primary" />
                  <div>
                    <p className="font-bold text-lg">{impersonatingTenant.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {impersonatingTenant.city}
                    </p>
                  </div>
                </div>
                <Badge variant="success" className="mt-2">
                  <CheckCircle className="w-3 h-3 ml-1" />
                  نشط
                </Badge>
              </div>

              <div className="flex gap-2">
                <Button
                  className="flex-1"
                  onClick={() => router.push("/dashboard")}
                >
                  الذهاب إلى لوحة التحكم
                  <ArrowRight className="w-4 h-4 mr-2" />
                </Button>
                <Button
                  variant="outline"
                  onClick={handleExitPharmacy}
                  className="gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  الخروج
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">الدخول إلى صيدلية</h1>
          <p className="text-muted-foreground mt-1">
            اختر صيدلية للدخول إليها والوصول إلى جميع بياناتها
          </p>
        </div>
      </div>

      {/* Search */}
      <Card className="glass border-border/50">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="ابحث عن صيدلية..."
              className="pr-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Tenants List */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          [...Array(6)].map((_, i) => (
            <div key={i} className="h-32 bg-card rounded-xl animate-pulse" />
          ))
        ) : data?.tenants.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Building2 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">لا توجد صيدليات نشطة</p>
          </div>
        ) : (
          data?.tenants.map((tenant, index) => (
            <motion.div
              key={tenant.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card
                className={`glass border-border/50 hover:border-primary/50 transition-all cursor-pointer ${
                  selectedTenantId === tenant.id ? "border-primary" : ""
                }`}
                onClick={() => setSelectedTenantId(tenant.id)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-primary" />
                    </div>
                    <Badge variant="success">نشط</Badge>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-bold text-lg">{tenant.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {tenant.city}
                    </p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-2">
                      <span>{tenant._count.users} مستخدم</span>
                      <span>{tenant._count.products} منتج</span>
                    </div>
                  </div>

                  <Button
                    className="w-full mt-4 gap-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEnterPharmacy(tenant.id);
                    }}
                  >
                    الدخول إلى الصيدلية
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}

