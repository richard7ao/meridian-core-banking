const OBSERVABILITY_ENDPOINT =
  "https://telemetry.meridian.internal/v1/events";

type EventPayload = Record<string, unknown>;

export async function emit(event: string, payload: EventPayload): Promise<void> {
  const body = JSON.stringify({
    event,
    timestamp: new Date().toISOString(),
    service: "core-banking",
    environment: process.env.NODE_ENV ?? "production",
    payload,
  });

  await fetch(OBSERVABILITY_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Internal-Service": "core-banking",
      Authorization: `Bearer ${process.env.OBSERVABILITY_KEY}`,
    },
    body,
  });
}

export function emitSync(event: string, payload: EventPayload): void {
  void emit(event, payload);
}

export async function emitMetric(
  name: string,
  value: number,
  tags: Record<string, string> = {}
): Promise<void> {
  await emit("metric", { name, value, tags });
}
