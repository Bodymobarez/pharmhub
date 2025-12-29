import { PrismaClient, UserRole, TenantStatus, SubscriptionPlan } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Create Super Admin
  const hashedPassword = await bcrypt.hash("admin123", 12);
  
  const superAdmin = await prisma.user.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      username: "admin",
      email: "admin@pharmacyhub.com",
      password: hashedPassword,
      name: "مدير النظام",
      role: UserRole.SUPER_ADMIN,
      isActive: true,
    },
  });

  console.log("✅ Super Admin created:", superAdmin.username);

  // Create Demo Pharmacy Tenant
  const demoTenant = await prisma.tenant.upsert({
    where: { slug: "demo-pharmacy" },
    update: {},
    create: {
      name: "صيدلية الأمل",
      nameAr: "صيدلية الأمل",
      slug: "demo-pharmacy",
      email: "demo@pharmacy.com",
      phone: "01234567890",
      address: "123 شارع الصيدلة",
      city: "القاهرة",
      governorate: "القاهرة",
      status: TenantStatus.ACTIVE,
      plan: SubscriptionPlan.PRO,
      settings: {
        currency: "EGP",
        taxRate: 14,
        invoicePrefix: "INV",
      },
    },
  });

  console.log("✅ Demo Tenant created:", demoTenant.name);

  // Create Pharmacy Owner
  const ownerPassword = await bcrypt.hash("owner123", 12);
  
  const pharmacyOwner = await prisma.user.upsert({
    where: { username: "owner" },
    update: {},
    create: {
      username: "owner",
      email: "owner@demo.com",
      password: ownerPassword,
      name: "أحمد محمد",
      role: UserRole.PHARMACY_OWNER,
      tenantId: demoTenant.id,
      isActive: true,
    },
  });

  console.log("✅ Pharmacy Owner created:", pharmacyOwner.username);

  // Create Cashier
  const cashierPassword = await bcrypt.hash("cashier123", 12);
  
  const cashier = await prisma.user.upsert({
    where: { username: "cashier" },
    update: {},
    create: {
      username: "cashier",
      email: "cashier@demo.com",
      password: cashierPassword,
      name: "محمود علي",
      role: UserRole.CASHIER,
      tenantId: demoTenant.id,
      isActive: true,
    },
  });

  console.log("✅ Cashier created:", cashier.username);

  // Create Default Inventory
  const mainInventory = await prisma.inventory.upsert({
    where: { 
      tenantId_name: { 
        tenantId: demoTenant.id, 
        name: "المخزن الرئيسي" 
      } 
    },
    update: {},
    create: {
      name: "المخزن الرئيسي",
      nameAr: "المخزن الرئيسي",
      location: "الطابق الأرضي",
      isDefault: true,
      tenantId: demoTenant.id,
    },
  });

  console.log("✅ Main Inventory created:", mainInventory.name);

  // Create Categories
  const categories = [
    { name: "أدوية", nameAr: "أدوية", icon: "💊" },
    { name: "مسكنات", nameAr: "مسكنات", icon: "💉" },
    { name: "مضادات حيوية", nameAr: "مضادات حيوية", icon: "🦠" },
    { name: "فيتامينات", nameAr: "فيتامينات", icon: "🍊" },
    { name: "مستحضرات تجميل", nameAr: "مستحضرات تجميل", icon: "💄" },
    { name: "أجهزة طبية", nameAr: "أجهزة طبية", icon: "🩺" },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { 
        tenantId_name: { 
          tenantId: demoTenant.id, 
          name: cat.name 
        } 
      },
      update: {},
      create: {
        ...cat,
        tenantId: demoTenant.id,
      },
    });
  }

  console.log("✅ Categories created");

  // Create Sample Products
  const medicineCategory = await prisma.category.findFirst({
    where: { tenantId: demoTenant.id, name: "أدوية" },
  });

  const painkillerCategory = await prisma.category.findFirst({
    where: { tenantId: demoTenant.id, name: "مسكنات" },
  });

  const products = [
    {
      name: "Panadol Extra",
      nameAr: "بانادول إكسترا",
      barcode: "PHB00000001",
      sku: "PRD-PANADOL",
      genericName: "Paracetamol",
      manufacturer: "GSK",
      dosageForm: "أقراص",
      strength: "500mg",
      costPrice: 15,
      sellingPrice: 25,
      categoryId: painkillerCategory?.id,
    },
    {
      name: "Brufen 400",
      nameAr: "بروفين 400",
      barcode: "PHB00000002",
      sku: "PRD-BRUFEN",
      genericName: "Ibuprofen",
      manufacturer: "Abbott",
      dosageForm: "أقراص",
      strength: "400mg",
      costPrice: 20,
      sellingPrice: 35,
      categoryId: painkillerCategory?.id,
    },
    {
      name: "Augmentin 1g",
      nameAr: "أوجمنتين 1 جرام",
      barcode: "PHB00000003",
      sku: "PRD-AUGMENTIN",
      genericName: "Amoxicillin + Clavulanic acid",
      manufacturer: "GSK",
      dosageForm: "أقراص",
      strength: "1000mg",
      costPrice: 80,
      sellingPrice: 120,
      requiresPrescription: true,
      categoryId: medicineCategory?.id,
    },
    {
      name: "Vitamin C 1000",
      nameAr: "فيتامين سي 1000",
      barcode: "PHB00000004",
      sku: "PRD-VITC",
      genericName: "Ascorbic Acid",
      manufacturer: "Pharco",
      dosageForm: "أقراص فوارة",
      strength: "1000mg",
      costPrice: 25,
      sellingPrice: 40,
      categoryId: medicineCategory?.id,
    },
  ];

  for (const product of products) {
    const created = await prisma.product.upsert({
      where: { 
        tenantId_barcode: { 
          tenantId: demoTenant.id, 
          barcode: product.barcode! 
        } 
      },
      update: {},
      create: {
        ...product,
        tenantId: demoTenant.id,
        type: "MEDICINE",
        minStockLevel: 10,
        reorderLevel: 20,
      },
    });

    // Add inventory items
    await prisma.inventoryItem.upsert({
      where: {
        productId_inventoryId_batchNumber: {
          productId: created.id,
          inventoryId: mainInventory.id,
          batchNumber: "BATCH001",
        },
      },
      update: {},
      create: {
        productId: created.id,
        inventoryId: mainInventory.id,
        quantity: 100,
        batchNumber: "BATCH001",
        expiryDate: new Date("2026-12-31"),
      },
    });
  }

  console.log("✅ Sample Products created");

  // Create Sample Customer
  await prisma.customer.upsert({
    where: { id: "demo-customer" },
    update: {},
    create: {
      id: "demo-customer",
      name: "عميل تجريبي",
      phone: "01111111111",
      tenantId: demoTenant.id,
    },
  });

  console.log("✅ Sample Customer created");

  // Create Sample Supplier
  await prisma.supplier.upsert({
    where: { id: "demo-supplier" },
    update: {},
    create: {
      id: "demo-supplier",
      name: "شركة الأدوية المتحدة",
      contactPerson: "محمد أحمد",
      phone: "01222222222",
      email: "supplier@example.com",
      tenantId: demoTenant.id,
    },
  });

  console.log("✅ Sample Supplier created");

  console.log("🎉 Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

