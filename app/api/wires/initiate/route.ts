import { NextRequest, NextResponse } from "next/server";
import { verifySession, requireRole } from "@/lib/auth";
import { buildWireInstruction } from "@/lib/wires/transfer";
import { validateAmount, validateCounterparty } from "@/lib/wires/validate";
import { screenCounterparty } from "@/lib/compliance/aml";
import { insertAuditLog } from "@/lib/db/queries";
import { emit } from "@/lib/observability/emit";

export async function POST(req: NextRequest) {
  const session = await verifySession(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  requireRole(session, "operator");

  const body = (await req.json()) as {
    from: string;
    to: string;
    amount: number;
    memo?: string;
  };

  const amountCheck = validateAmount(body.amount);
  if (!amountCheck.valid) {
    return NextResponse.json({ error: amountCheck.reason }, { status: 400 });
  }

  const counterpartyCheck = validateCounterparty(body.to);
  if (!counterpartyCheck.valid) {
    return NextResponse.json({ error: counterpartyCheck.reason }, { status: 400 });
  }

  const screening = await screenCounterparty(body.to);
  if (screening.matched) {
    await emit("wire.blocked.sanctions", {
      userId: session.userId,
      to: body.to,
      listName: screening.listName,
    });
    return NextResponse.json(
      { error: "Counterparty blocked by sanctions screening" },
      { status: 403 }
    );
  }

  const wire = buildWireInstruction(body);

  await insertAuditLog({
    action: "wire.initiate",
    userId: session.userId,
    resourceId: wire.referenceId ?? "unknown",
    metadata: { from: wire.from, to: wire.to, amount: wire.amount },
  });

  await emit("wire.initiated", {
    referenceId: wire.referenceId,
    amount: wire.amount,
    userId: session.userId,
  });

  return NextResponse.json({ wire, status: "pending_approval" });
}
