"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Pill,
  Building2,
  User,
  Mail,
  Phone,
  MapPin,
  Lock,
  ArrowLeft,
  Loader2,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { Button, Input, Label, Card, CardContent, CardHeader, CardTitle, CardDescription } from "@pharmacy/ui";
import { trpc } from "@/lib/trpc/client";

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    pharmacyName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    ownerName: "",
    username: "",
    password: "",
    confirmPassword: "",
  });

  const registerMutation = trpc.auth.register.useMutation({
    onSuccess: () => {
      setSuccess(true);
    },
    onError: (error) => {
      // Extract error message from Zod validation or TRPC error
      const message = error.data?.zodError?.fieldErrors 
        ? Object.values(error.data.zodError.fieldErrors).flat().join(", ")
        : error.message || "حدث خطأ. حاول مرة أخرى";
      setError(message);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (step === 1) {
      if (!formData.pharmacyName || !formData.email || !formData.phone || !formData.address || !formData.city) {
        setError("يرجى ملء جميع الحقول المطلوبة");
        return;
      }
      
      if (formData.pharmacyName.length < 2) {
        setError("اسم الصيدلية يجب أن يكون حرفين على الأقل");
        return;
      }
      
      if (formData.address.length < 5) {
        setError("العنوان يجب أن يكون 5 أحرف على الأقل");
        return;
      }
      
      if (formData.city.length < 2) {
        setError("المدينة يجب أن تكون حرفين على الأقل");
        return;
      }
      
      if (formData.phone.length < 10) {
        setError("رقم الهاتف يجب أن يكون 10 أرقام على الأقل");
        return;
      }
      
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        setError("البريد الإلكتروني غير صحيح");
        return;
      }
      
      setStep(2);
      return;
    }

    if (!formData.ownerName || !formData.username || !formData.password || !formData.confirmPassword) {
      setError("يرجى ملء جميع الحقول المطلوبة");
      return;
    }
    
    if (formData.ownerName.length < 2) {
      setError("اسم المسؤول يجب أن يكون حرفين على الأقل");
      return;
    }
    
    if (formData.username.length < 3) {
      setError("اسم المستخدم يجب أن يكون 3 أحرف على الأقل");
      return;
    }

    if (formData.password.length < 6) {
      setError("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("كلمة المرور غير متطابقة");
      return;
    }

    registerMutation.mutate({
      pharmacyName: formData.pharmacyName,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
      city: formData.city,
      ownerName: formData.ownerName,
      username: formData.username,
      password: formData.password,
    });
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
        <div className="fixed inset-0 bg-grid-pattern opacity-30" />
        <div className="fixed inset-0 bg-gradient-radial from-primary/5 via-transparent to-transparent" />

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md relative z-10"
        >
          <Card className="glass border-neon-green/30 text-center">
            <CardContent className="pt-12 pb-8">
              <div className="w-20 h-20 rounded-full bg-neon-green/20 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-neon-green" />
              </div>
              <h2 className="text-2xl font-bold mb-4">تم التسجيل بنجاح!</h2>
              <p className="text-muted-foreground mb-6">
                تم تسجيل صيدليتك بنجاح. سيتم مراجعة طلبك والموافقة عليه قريباً.
              </p>
              <Link href="/login">
                <Button className="gap-2">
                  تسجيل الدخول
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

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
        className="w-full max-w-lg relative z-10"
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
            <CardTitle className="text-2xl">تسجيل صيدلية جديدة</CardTitle>
            <CardDescription>
              {step === 1 ? "أدخل بيانات الصيدلية" : "أدخل بيانات المسؤول"}
            </CardDescription>

            {/* Steps Indicator */}
            <div className="flex items-center justify-center gap-2 mt-4">
              <div
                className={`w-10 h-2 rounded-full transition-colors ${
                  step >= 1 ? "bg-primary" : "bg-muted"
                }`}
              />
              <div
                className={`w-10 h-2 rounded-full transition-colors ${
                  step >= 2 ? "bg-primary" : "bg-muted"
                }`}
              />
            </div>
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

              {step === 1 ? (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label htmlFor="pharmacyName">اسم الصيدلية</Label>
                    <div className="relative">
                      <Building2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="pharmacyName"
                        placeholder="صيدلية الأمل"
                        className="pr-10"
                        value={formData.pharmacyName}
                        onChange={(e) =>
                          setFormData({ ...formData, pharmacyName: e.target.value })
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">البريد الإلكتروني</Label>
                      <div className="relative">
                        <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="info@pharmacy.com"
                          className="pr-10"
                          value={formData.email}
                          onChange={(e) =>
                            setFormData({ ...formData, email: e.target.value })
                          }
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">رقم الهاتف</Label>
                      <div className="relative">
                        <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="01xxxxxxxxx"
                          className="pr-10"
                          value={formData.phone}
                          onChange={(e) =>
                            setFormData({ ...formData, phone: e.target.value })
                          }
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">العنوان</Label>
                    <div className="relative">
                      <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="address"
                        placeholder="123 شارع..."
                        className="pr-10"
                        value={formData.address}
                        onChange={(e) =>
                          setFormData({ ...formData, address: e.target.value })
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="city">المدينة</Label>
                    <Input
                      id="city"
                      placeholder="القاهرة"
                      value={formData.city}
                      onChange={(e) =>
                        setFormData({ ...formData, city: e.target.value })
                      }
                      required
                    />
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label htmlFor="ownerName">اسم المسؤول</Label>
                    <div className="relative">
                      <User className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="ownerName"
                        placeholder="أحمد محمد"
                        className="pr-10"
                        value={formData.ownerName}
                        onChange={(e) =>
                          setFormData({ ...formData, ownerName: e.target.value })
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="username">اسم المستخدم</Label>
                    <div className="relative">
                      <User className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="username"
                        placeholder="ahmed_pharmacy"
                        className="pr-10"
                        value={formData.username}
                        onChange={(e) =>
                          setFormData({ ...formData, username: e.target.value })
                        }
                        required
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
                        placeholder="••••••••"
                        className="pr-10"
                        value={formData.password}
                        onChange={(e) =>
                          setFormData({ ...formData, password: e.target.value })
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">تأكيد كلمة المرور</Label>
                    <div className="relative">
                      <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="••••••••"
                        className="pr-10"
                        value={formData.confirmPassword}
                        onChange={(e) =>
                          setFormData({ ...formData, confirmPassword: e.target.value })
                        }
                        required
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              <div className="flex gap-4">
                {step === 2 && (
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setStep(1)}
                  >
                    السابق
                  </Button>
                )}
                <Button
                  type="submit"
                  className="flex-1 gap-2"
                  disabled={registerMutation.isPending}
                >
                  {registerMutation.isPending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : step === 1 ? (
                    <>
                      التالي
                      <ArrowLeft className="w-5 h-5" />
                    </>
                  ) : (
                    "تسجيل الصيدلية"
                  )}
                </Button>
              </div>
            </form>

            <div className="mt-6 text-center text-sm text-muted-foreground">
              لديك حساب بالفعل؟{" "}
              <Link href="/login" className="text-primary hover:underline">
                تسجيل الدخول
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

