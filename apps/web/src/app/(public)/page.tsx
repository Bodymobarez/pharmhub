"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Pill,
  BarChart3,
  QrCode,
  Shield,
  Smartphone,
  Building2,
  ArrowLeft,
  Sparkles,
  Database,
  Clock,
  Users,
} from "lucide-react";
import { Button } from "@pharmacy/ui";

const features = [
  {
    icon: Building2,
    title: "Multi-Tenant",
    titleAr: "نظام متعدد الصيدليات",
    description: "كل صيدلية لها نظامها الخاص وبياناتها منفصلة تماماً",
  },
  {
    icon: QrCode,
    title: "Barcode System",
    titleAr: "نظام الباركود",
    description: "قارئ باركود متكامل مع إمكانية طباعة الباركود",
  },
  {
    icon: Database,
    title: "Inventory Management",
    titleAr: "إدارة المخازن",
    description: "تتبع المخزون والكميات وتواريخ الصلاحية",
  },
  {
    icon: BarChart3,
    title: "Reports & Analytics",
    titleAr: "التقارير والإحصائيات",
    description: "تقارير مفصلة للمبيعات والأرباح والمخزون",
  },
  {
    icon: Smartphone,
    title: "Mobile App",
    titleAr: "تطبيق موبايل",
    description: "تطبيق لنظامي Android و iOS مع قارئ باركود",
  },
  {
    icon: Shield,
    title: "Secure & Reliable",
    titleAr: "آمن وموثوق",
    description: "نظام أمان متقدم مع نسخ احتياطي تلقائي",
  },
];

const stats = [
  { value: "99.9%", label: "Uptime" },
  { value: "50+", label: "صيدلية" },
  { value: "100K+", label: "عملية بيع" },
  { value: "24/7", label: "دعم فني" },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 bg-grid-pattern opacity-30" />
      <div className="fixed inset-0 bg-gradient-radial from-primary/5 via-transparent to-transparent" />

      {/* Floating Orbs */}
      <div className="fixed top-20 right-20 w-72 h-72 bg-neon-green/20 rounded-full blur-[100px] animate-pulse" />
      <div className="fixed bottom-20 left-20 w-96 h-96 bg-neon-purple/10 rounded-full blur-[120px] animate-pulse" />

      {/* Navigation */}
      <nav className="relative z-50 border-b border-border/50 backdrop-blur-xl">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-neon-green to-neon-cyan flex items-center justify-center">
                <Pill className="w-7 h-7 text-black" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gradient">Pharmacy Hub</h1>
                <p className="text-xs text-muted-foreground">نظام إدارة الصيدليات</p>
              </div>
            </Link>

            <div className="flex items-center gap-4">
              <Link href="/login">
                <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                  تسجيل الدخول
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="neon" className="gap-2">
                  <Sparkles className="w-4 h-4" />
                  سجل صيدليتك
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 py-32 px-6">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-neon-green/30 bg-neon-green/5 mb-8">
              <Sparkles className="w-4 h-4 text-neon-green" />
              <span className="text-sm text-neon-green">الإصدار 1.0 متاح الآن</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-display font-bold mb-6">
              <span className="text-gradient-animated">نظام إدارة الصيدليات</span>
              <br />
              <span className="text-foreground">الأكثر تطوراً</span>
            </h1>

            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-12">
              منصة متكاملة لإدارة سلاسل الصيدليات مع نظام POS احترافي، 
              قارئ باركود، إدارة مخازن، وتقارير مفصلة
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button size="xl" className="gap-2 text-lg px-8">
                  ابدأ الآن مجاناً
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <Link href="#features">
                <Button size="xl" variant="outline" className="text-lg px-8">
                  اكتشف المميزات
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-24 max-w-4xl mx-auto"
          >
            {stats.map((stat, index) => (
              <div
                key={index}
                className="glass rounded-2xl p-6 text-center hover:glow-green transition-all duration-300"
              >
                <div className="text-4xl font-display font-bold text-gradient mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 py-32 px-6">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">
              <span className="text-gradient">مميزات</span> النظام
            </h2>
            <p className="text-xl text-muted-foreground">
              كل ما تحتاجه لإدارة صيدليتك بكفاءة عالية
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="glass rounded-2xl p-8 hover:glow-green transition-all duration-500 group cursor-pointer"
              >
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-neon-green/20 to-neon-cyan/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-7 h-7 text-neon-green" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-foreground group-hover:text-neon-green transition-colors">
                  {feature.titleAr}
                </h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-32 px-6">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="glass rounded-3xl p-12 md:p-16 text-center relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-neon-green/10 via-transparent to-neon-purple/10" />
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">
                ابدأ الآن <span className="text-gradient">مجاناً</span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
                سجل صيدليتك واحصل على فترة تجريبية مجانية بدون قيود
              </p>
              <Link href="/register">
                <Button size="xl" className="gap-2 text-lg px-12 animate-glow">
                  <Building2 className="w-5 h-5" />
                  سجل صيدليتك الآن
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/50 py-12 px-6">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-neon-green to-neon-cyan flex items-center justify-center">
                <Pill className="w-5 h-5 text-black" />
              </div>
              <span className="font-bold text-gradient">Pharmacy Hub</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 Pharmacy Hub. جميع الحقوق محفوظة.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

