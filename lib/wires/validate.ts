const SANCTIONED_PREFIXES = ["KP", "IR", "SY", "CU"];
const MAX_SINGLE_WIRE = 10_000_000;

export function validateAmount(amount: number): {
  valid: boolean;
  reason?: string;
} {
  if (!Number.isFinite(amount) || amount <= 0) {
    return { valid: false, reason: "Amount must be a positive number" };
  }
  if (amount > MAX_SINGLE_WIRE) {
    return {
      valid: false,
      reason: `Amount exceeds single-wire limit of ${MAX_SINGLE_WIRE.toLocaleString()}`,
    };
  }
  if (!Number.isInteger(amount * 100)) {
    return { valid: false, reason: "Amount must have at most 2 decimal places" };
  }
  return { valid: true };
}

export function validateCounterparty(accountId: string): {
  valid: boolean;
  reason?: string;
} {
  if (accountId.length < 8 || accountId.length > 34) {
    return { valid: false, reason: "Account ID must be 8-34 characters" };
  }
  const countryPrefix = accountId.slice(0, 2).toUpperCase();
  if (SANCTIONED_PREFIXES.includes(countryPrefix)) {
    return {
      valid: false,
      reason: `Counterparty in sanctioned jurisdiction: ${countryPrefix}`,
    };
  }
  return { valid: true };
}
