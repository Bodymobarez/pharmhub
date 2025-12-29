import { router } from "@/lib/trpc/server";
import { authRouter } from "./auth";
import { tenantRouter } from "./tenant";
import { productRouter } from "./product";
import { inventoryRouter } from "./inventory";
import { saleRouter } from "./sale";
import { customerRouter } from "./customer";
import { supplierRouter } from "./supplier";
import { dashboardRouter } from "./dashboard";
import { adminRouter } from "./admin";
import { userRouter } from "./user";
import { reportsRouter } from "./reports";
import { settingsRouter } from "./settings";

export const appRouter = router({
  auth: authRouter,
  tenant: tenantRouter,
  product: productRouter,
  inventory: inventoryRouter,
  sale: saleRouter,
  customer: customerRouter,
  supplier: supplierRouter,
  dashboard: dashboardRouter,
  admin: adminRouter,
  user: userRouter,
  reports: reportsRouter,
  settings: settingsRouter,
});

export type AppRouter = typeof appRouter;

