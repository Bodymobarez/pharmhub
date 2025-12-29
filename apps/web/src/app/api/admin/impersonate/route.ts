import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@pharmacy/database";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { tenantId } = await req.json();

    if (!tenantId) {
      return NextResponse.json(
        { error: "Tenant ID is required" },
        { status: 400 }
      );
    }

    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      return NextResponse.json(
        { error: "Tenant not found" },
        { status: 404 }
      );
    }

    // Return data to be stored in session via client-side update
    return NextResponse.json({
      success: true,
      tenantId: tenant.id,
      tenantName: tenant.name,
    });
  } catch (error) {
    console.error("Impersonation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

