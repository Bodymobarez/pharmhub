"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { PharmacySidebar } from "@/components/layout/pharmacy-sidebar";
import { TopBar } from "@/components/layout/top-bar";

export default function PharmacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/login");
      return;
    }
    // Super admin should go to admin dashboard unless impersonating
    const isImpersonating = session.user.isImpersonating;
    if (session.user.role === "SUPER_ADMIN" && !session.user.tenantId && !isImpersonating) {
      router.push("/admin");
    }
    // If impersonating, ensure tenantId is set
    if (isImpersonating && !session.user.tenantId) {
      router.push("/admin/enter-pharmacy");
    }
  }, [session, status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex">
      <PharmacySidebar />
      <div className="flex-1 flex flex-col">
        <TopBar />
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}

