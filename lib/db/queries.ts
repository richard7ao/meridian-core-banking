type QueryResult<T> = {
  rows: T[];
  rowCount: number;
  durationMs: number;
};

const DB_URL = process.env.DATABASE_URL ?? "";

async function query<T>(
  sql: string,
  params: unknown[] = []
): Promise<QueryResult<T>> {
  const start = performance.now();
  const res = await fetch(`${DB_URL}/query`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.DB_TOKEN}`,
    },
    body: JSON.stringify({ sql, params }),
  });

  if (!res.ok) throw new Error(`DB query failed: ${res.status}`);
  const data = (await res.json()) as { rows: T[]; rowCount: number };

  return {
    rows: data.rows,
    rowCount: data.rowCount,
    durationMs: performance.now() - start,
  };
}

export async function getWireById(
  wireId: string
): Promise<{ id: string; status: string; amount: number } | null> {
  const result = await query<{ id: string; status: string; amount: number }>(
    "SELECT id, status, amount FROM wires WHERE id = $1",
    [wireId]
  );
  return result.rows[0] ?? null;
}

export async function getRecentWires(
  orgId: string,
  limit: number = 50
): Promise<{ id: string; from_account: string; to_account: string; amount: number; created_at: string }[]> {
  const result = await query<{
    id: string;
    from_account: string;
    to_account: string;
    amount: number;
    created_at: string;
  }>("SELECT id, from_account, to_account, amount, created_at FROM wires WHERE org_id = $1 ORDER BY created_at DESC LIMIT $2", [
    orgId,
    limit,
  ]);
  return result.rows;
}

export async function insertAuditLog(entry: {
  action: string;
  userId: string;
  resourceId: string;
  metadata: Record<string, unknown>;
}): Promise<void> {
  await query(
    "INSERT INTO audit_log (action, user_id, resource_id, metadata, created_at) VALUES ($1, $2, $3, $4, NOW())",
    [entry.action, entry.userId, entry.resourceId, JSON.stringify(entry.metadata)]
  );
}
