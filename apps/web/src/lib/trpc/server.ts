import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import type { Session } from "next-auth";

interface CreateContextOptions {
  session: Session | null;
}

export const createInnerTRPCContext = (opts: CreateContextOptions) => {
  return {
    session: opts.session,
  };
};

export const createTRPCContext = async () => {
  const session = await getServerSession(authOptions);
  return createInnerTRPCContext({
    session,
  });
};

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

export const createCallerFactory = t.createCallerFactory;
export const router = t.router;
export const publicProcedure = t.procedure;

const enforceUserIsAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.session || !ctx.session.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({
    ctx: {
      session: { ...ctx.session, user: ctx.session.user },
    },
  });
});

export const protectedProcedure = t.procedure.use(enforceUserIsAuthed);

// Middleware for admin only
const enforceUserIsAdmin = t.middleware(({ ctx, next }) => {
  if (!ctx.session || !ctx.session.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  if (ctx.session.user.role !== "SUPER_ADMIN") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  }
  return next({
    ctx: {
      session: { ...ctx.session, user: ctx.session.user },
    },
  });
});

export const adminProcedure = t.procedure.use(enforceUserIsAdmin);

// Middleware for pharmacy owner/employee
const enforceUserIsPharmacy = t.middleware(({ ctx, next }) => {
  if (!ctx.session || !ctx.session.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  
  const user = ctx.session.user;
  const isAdmin = user.role === "SUPER_ADMIN";
  const isImpersonating = user.isImpersonating && isAdmin;
  const hasPharmacyRole = ["PHARMACY_OWNER", "PHARMACY_MANAGER", "PHARMACY_EMPLOYEE", "CASHIER"].includes(user.role);
  
  // Allow if: has pharmacy role OR is admin impersonating
  if (!hasPharmacyRole && !isImpersonating) {
    throw new TRPCError({ code: "FORBIDDEN", message: "Pharmacy access required" });
  }
  
  // When impersonating, ensure tenantId is set
  if (isImpersonating && !user.tenantId) {
    throw new TRPCError({ code: "FORBIDDEN", message: "No tenant selected for impersonation" });
  }
  
  return next({
    ctx: {
      session: { ...ctx.session, user: ctx.session.user },
    },
  });
});

export const pharmacyProcedure = t.procedure.use(enforceUserIsPharmacy);

