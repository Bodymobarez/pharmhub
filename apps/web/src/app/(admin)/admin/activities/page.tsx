"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  Building2,
  ShoppingCart,
  Package,
  Filter,
  Calendar,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@pharmacy/ui";
import { trpc } from "@/lib/trpc/client";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function ActivitiesPage() {
  const [tenantFilter, setTenantFilter] = useState<string | undefined>();
  const [typeFilter, setTypeFilter] = useState<string | undefined>();

  const { data: tenants } = trpc.tenant.getAll.useQuery({});
  const { data: activities, isLoading } = trpc.admin.getAllActivities.useQuery({
    tenantId: tenantFilter,
    limit: 100,
  });

  const filteredActivities = activities?.filter((activity) => {
    if (typeFilter === "sales" && activity.type !== "sale") return false;
    if (typeFilter === "stock" && activity.type !== "stock") return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">جميع الحركات</h1>
          <p className="text-muted-foreground mt-1">
            عرض جميع حركات الصيدليات في النظام
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card className="glass border-border/50">
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Select
                value={tenantFilter || "all"}
                onValueChange={(value) =>
                  setTenantFilter(value === "all" ? undefined : value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر الصيدلية" />
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
            </div>
            <div className="flex-1">
              <Select
                value={typeFilter || "all"}
                onValueChange={(value) =>
                  setTypeFilter(value === "all" ? undefined : value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="نوع الحركة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الأنواع</SelectItem>
                  <SelectItem value="sales">المبيعات</SelectItem>
                  <SelectItem value="stock">حركات المخزون</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activities List */}
      <Card className="glass border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            الحركات
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4 animate-pulse">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-20 bg-card rounded-xl" />
              ))}
            </div>
          ) : filteredActivities && filteredActivities.length > 0 ? (
            <div className="space-y-4">
              {filteredActivities.map((activity, index) => (
                <motion.div
                  key={`${activity.type}-${activity.id}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between p-4 rounded-xl bg-background/50 border border-border/30 hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        activity.type === "sale"
                          ? "bg-neon-green/10"
                          : "bg-neon-cyan/10"
                      }`}
                    >
                      {activity.type === "sale" ? (
                        <ShoppingCart className="w-6 h-6 text-neon-green" />
                      ) : (
                        <Package className="w-6 h-6 text-neon-cyan" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium">{activity.description}</p>
                        <Badge
                          variant={
                            activity.type === "sale" ? "success" : "secondary"
                          }
                        >
                          {activity.type === "sale" ? "بيع" : "مخزون"}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Building2 className="w-4 h-4" />
                          <span>{activity.tenant.name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(activity.createdAt)}</span>
                        </div>
                        <span>بواسطة: {activity.user}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>لا توجد حركات</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

