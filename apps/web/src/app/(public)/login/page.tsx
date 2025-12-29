"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { motion } from "framer-motion";
import { Pill, User, Lock, ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import { Button, Input, Label, Card, CardContent, CardHeader, CardTitle, CardDescription } from "@pharmacy/ui";

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        username: formData.username,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        setError("اسم المستخدم أو كلمة المرور غير صحيحة");
      } else {
        // Redirect based on user role
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err) {
      setError("حدث خطأ. حاول مرة أخرى");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 bg-grid-pattern opacity-30" />
      <div className="fixed inset-0 bg-gradient-radial from-primary/5 via-transparent to-transparent" />
      <div className="fixed top-20 right-20 w-72 h-72 bg-neon-green/20 rounded-full blur-[100px] animate-pulse" />
      <div className="fixed bottom-20 left-20 w-96 h-96 bg-neon-purple/10 rounded-full blur-[120px] animate-pulse" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-neon-green to-neon-cyan flex items-center justify-center">
              <Pill className="w-8 h-8 text-black" />
            </div>
            <div className="text-right">
              <h1 className="text-2xl font-bold text-gradient">Pharmacy Hub</h1>
              <p className="text-sm text-muted-foreground">نظام إدارة الصيدليات</p>
            </div>
          </Link>
        </div>

        <Card className="glass border-border/50">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">تسجيل الدخول</CardTitle>
            <CardDescription>
              أدخل بياناتك للوصول إلى لوحة التحكم
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="flex items-center gap-2 p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive"
                >
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm">{error}</span>
                </motion.div>
              )}

              <div className="space-y-2">
                <Label htmlFor="username">اسم المستخدم</Label>
                <div className="relative">
                  <User className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="أدخل اسم المستخدم"
                    className="pr-10"
                    value={formData.username}
                    onChange={(e) =>
                      setFormData({ ...formData, username: e.target.value })
                    }
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">كلمة المرور</Label>
                <div className="relative">
                  <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="أدخل كلمة المرور"
                    className="pr-10"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <Button type="submit" className="w-full gap-2" disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    تسجيل الدخول
                    <ArrowLeft className="w-5 h-5" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-muted-foreground">
              ليس لديك حساب؟{" "}
              <Link href="/register" className="text-primary hover:underline">
                سجل صيدليتك الآن
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Demo Credentials */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 p-4 rounded-xl glass border-border/50"
        >
          <p className="text-sm text-muted-foreground text-center mb-3">
            للتجربة، استخدم البيانات التالية:
          </p>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="p-3 rounded-lg bg-background/50">
              <p className="text-muted-foreground mb-1">المدير:</p>
              <p className="font-mono">admin / admin123</p>
            </div>
            <div className="p-3 rounded-lg bg-background/50">
              <p className="text-muted-foreground mb-1">صيدلية:</p>
              <p className="font-mono">owner / owner123</p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

