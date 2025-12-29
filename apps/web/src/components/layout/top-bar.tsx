"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Bell,
  Search,
  LogOut,
  User,
  Settings,
  Moon,
  Sun,
  ChevronDown,
  Building2,
  X,
} from "lucide-react";
import { useTheme } from "next-themes";
import {
  Button,
  Input,
  Avatar,
  AvatarFallback,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Badge,
} from "@pharmacy/ui";
import toast from "react-hot-toast";

export function TopBar() {
  const { data: session, update } = useSession();
  const { theme, setTheme } = useTheme();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/login");
  };

  const handleExitImpersonation = async () => {
    try {
      await update({
        ...session,
        user: {
          ...session?.user,
          isImpersonating: false,
          impersonatingTenantId: undefined,
          tenantId: null,
          tenantName: undefined,
        },
      });
      toast.success("تم الخروج من الصيدلية");
      router.push("/admin");
    } catch (error) {
      toast.error("حدث خطأ");
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="h-16 border-b border-border/50 bg-card/50 backdrop-blur-xl px-6 flex items-center justify-between">
      {/* Search */}
      <div className="relative w-96">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          placeholder="بحث..."
          className="pr-10 bg-background/50"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4">
        {/* Impersonation Badge */}
        {session?.user?.isImpersonating && (
          <Badge variant="warning" className="gap-2">
            <Building2 className="w-3 h-3" />
            داخل: {session.user.impersonatingTenantName || session.user.tenantName}
            <Button
              variant="ghost"
              size="sm"
              className="h-4 w-4 p-0 ml-2 hover:bg-destructive/20"
              onClick={handleExitImpersonation}
            >
              <X className="w-3 h-3" />
            </Button>
          </Badge>
        )}

        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          {theme === "dark" ? (
            <Sun className="w-5 h-5" />
          ) : (
            <Moon className="w-5 h-5" />
          )}
        </Button>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 left-1 w-2 h-2 bg-destructive rounded-full" />
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-3 pr-2">
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-primary/10 text-primary text-sm">
                  {session?.user?.name ? getInitials(session.user.name) : "U"}
                </AvatarFallback>
              </Avatar>
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium">{session?.user?.name}</p>
                <p className="text-xs text-muted-foreground">
                  {session?.user?.isImpersonating
                    ? `مدير - ${session.user.impersonatingTenantName || session.user.tenantName}`
                    : session?.user?.role === "SUPER_ADMIN"
                    ? "مدير النظام"
                    : session?.user?.tenantName || "صيدلية"}
                </p>
              </div>
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem>
              <User className="w-4 h-4 ml-2" />
              الملف الشخصي
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="w-4 h-4 ml-2" />
              الإعدادات
            </DropdownMenuItem>
            {session?.user?.isImpersonating && (
              <>
                <DropdownMenuItem onClick={handleExitImpersonation}>
                  <X className="w-4 h-4 ml-2" />
                  الخروج من الصيدلية
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}
            <DropdownMenuItem
              onClick={handleLogout}
              className="text-destructive"
            >
              <LogOut className="w-4 h-4 ml-2" />
              تسجيل الخروج
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

