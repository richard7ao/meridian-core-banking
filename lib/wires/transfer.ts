import { z } from "zod";

export const WireInstructionSchema = z.object({
  from: z.string().min(8).max(34),
  to: z.string().min(8).max(34),
  amount: z.number().positive().max(50_000_000),
  currency: z.enum(["USD", "EUR", "GBP"]).default("USD"),
  memo: z.string().max(140).optional(),
  referenceId: z.string().uuid().optional(),
});

export type WireInstruction = z.infer<typeof WireInstructionSchema>;

export function buildWireInstruction(params: {
  from: string;
  to: string;
  amount: number;
  memo?: string;
}): WireInstruction {
  const instruction = WireInstructionSchema.parse({
    from: params.from,
    to: params.to,
    amount: params.amount,
    currency: "USD",
    memo: params.memo,
    referenceId: crypto.randomUUID(),
  });

  return instruction;
}

export function formatWireForAudit(wire: WireInstruction): string {
  return [
    `REF: ${wire.referenceId ?? "PENDING"}`,
    `FROM: ${wire.from}`,
    `TO: ${wire.to}`,
    `AMT: ${wire.currency} ${wire.amount.toLocaleString()}`,
    wire.memo ? `MEMO: ${wire.memo}` : null,
  ]
    .filter(Boolean)
    .join(" | ");
}
