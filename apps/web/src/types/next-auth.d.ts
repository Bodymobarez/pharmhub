import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface User {
    id: string;
    username: string;
    role: string;
    tenantId: string | null;
    tenantName?: string;
  }

  interface Session {
    user: {
      id: string;
      username: string;
      email?: string | null;
      name?: string | null;
      image?: string | null;
      role: string;
      tenantId: string | null;
      tenantName?: string;
      // Admin impersonation
      isImpersonating?: boolean;
      originalRole?: string;
      impersonatingTenantId?: string | null;
      impersonatingTenantName?: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    username: string;
    role: string;
    tenantId: string | null;
    tenantName?: string;
    // Admin impersonation
    isImpersonating?: boolean;
    originalRole?: string;
    impersonatingTenantId?: string | null;
    impersonatingTenantName?: string;
  }
}

