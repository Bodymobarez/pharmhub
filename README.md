# Pharmacy Hub - نظام إدارة الصيدليات المتكامل

نظام احترافي متكامل لإدارة سلاسل الصيدليات مع دعم Multi-Tenant كامل.

## 🏗️ هيكل المشروع

```
Phrmacy/
├── apps/
│   ├── web/          # Next.js 14 - Web Application
│   └── mobile/       # Flutter - Mobile Application
├── packages/
│   ├── database/     # Prisma Schema & Database
│   ├── shared/       # Shared Types & Utilities
│   └── ui/          # Shared UI Components
```

## 🚀 التقنيات المستخدمة

- **Frontend**: Next.js 14 + React 18 + Tailwind CSS + shadcn/ui
- **Backend**: Next.js API Routes + tRPC
- **Database**: PostgreSQL + Prisma ORM
- **Authentication**: NextAuth.js
- **Mobile**: Flutter 3.x + Riverpod
- **Hosting**: Vercel + Railway

## 📦 التثبيت

```bash
# Install pnpm if not installed
npm install -g pnpm

# Install dependencies
pnpm install

# Generate Prisma client
pnpm db:generate

# Push database schema
pnpm db:push

# Run development server
pnpm dev
```

## 🔧 Environment Variables

Create `.env` file in `apps/web/`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/pharmacy_hub"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

## 📱 الميزات

### Super Admin
- إدارة جميع الصيدليات
- الموافقة على التسجيلات
- التقارير العامة
- إدارة الاشتراكات

### نظام الصيدلية
- إدارة المنتجات والأدوية
- نظام الباركود والتكويد
- إدارة المخازن المتعددة
- نظام نقطة البيع (POS)
- الفواتير والتقارير
- إدارة الموردين والعملاء

### تطبيق الموبايل
- قارئ باركود
- نظام بيع سريع
- إدارة المخزون
- وضع Offline

## 📄 License

MIT License

