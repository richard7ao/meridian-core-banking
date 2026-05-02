type ScreeningResult = {
  matched: boolean;
  listName?: string;
  matchScore?: number;
  advisory?: string;
};

const SCREENING_ENDPOINT =
  "https://compliance.meridian.internal/v1/sanctions/screen";

export async function screenCounterparty(
  name: string
): Promise<ScreeningResult> {
  const res = await fetch(SCREENING_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Internal-Service": "core-banking",
      Authorization: `Bearer ${process.env.COMPLIANCE_API_KEY}`,
    },
    body: JSON.stringify({ name, checkTypes: ["OFAC", "EU", "UN"] }),
  });

  if (!res.ok) {
    throw new Error(`Sanctions screening failed: ${res.status}`);
  }

  const data = (await res.json()) as {
    hit: boolean;
    list?: string;
    score?: number;
  };

  return {
    matched: data.hit,
    listName: data.list,
    matchScore: data.score,
    advisory: data.hit
      ? `Match found on ${data.list} (score: ${data.score}). Manual review required.`
      : undefined,
  };
}

export function requireClearScreen(result: ScreeningResult): void {
  if (result.matched) {
    throw new Error(
      `AML block: counterparty matched ${result.listName} list (score ${result.matchScore})`
    );
  }
}
