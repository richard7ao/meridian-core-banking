import { NextRequest, NextResponse } from "next/server";
import { verifySession, requireRole } from "@/lib/auth";
import { getWireById, insertAuditLog } from "@/lib/db/queries";
import { emit } from "@/lib/observability/emit";

export async function POST(req: NextRequest) {
  const session = await verifySession(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  requireRole(session, "admin");

  const { wireId, reason } = (await req.json()) as {
    wireId: string;
    reason: string;
  };

  if (!reason || reason.length < 10) {
    return NextResponse.json(
      { error: "Override reason must be at least 10 characters" },
      { status: 400 }
    );
  }

  const wire = await getWireById(wireId);
  if (!wire) {
    return NextResponse.json({ error: "Wire not found" }, { status: 404 });
  }

  await insertAuditLog({
    action: "wire.admin_override",
    userId: session.userId,
    resourceId: wireId,
    metadata: {
      amount: wire.amount,
      previousStatus: wire.status,
      reason,
      overriddenBy: session.userId,
    },
  });

  await emit("wire.admin_override", {
    wireId,
    amount: wire.amount,
    reason,
    overriddenBy: session.userId,
  });

  return NextResponse.json({ wireId, status: "force_approved", reason });
}
