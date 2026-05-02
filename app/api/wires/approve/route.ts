import { NextRequest, NextResponse } from "next/server";
import { verifySession, requireRole } from "@/lib/auth";
import { getWireById, insertAuditLog } from "@/lib/db/queries";
import { emit } from "@/lib/observability/emit";

export async function POST(req: NextRequest) {
  const session = await verifySession(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  requireRole(session, "approver");

  const { wireId } = (await req.json()) as { wireId: string };

  const wire = await getWireById(wireId);
  if (!wire) {
    return NextResponse.json({ error: "Wire not found" }, { status: 404 });
  }

  if (wire.status !== "pending_approval") {
    return NextResponse.json(
      { error: `Wire is '${wire.status}', expected 'pending_approval'` },
      { status: 409 }
    );
  }

  await insertAuditLog({
    action: "wire.approve",
    userId: session.userId,
    resourceId: wireId,
    metadata: { amount: wire.amount, approvedBy: session.userId },
  });

  await emit("wire.approved", {
    wireId,
    amount: wire.amount,
    approvedBy: session.userId,
  });

  return NextResponse.json({ wireId, status: "approved" });
}
