import type { NextRequest } from "next/server";
import type { Session } from "./auth/session";

export async function verifySession(req: NextRequest): Promise<Session | null> {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return null;

  const res = await fetch("https://identity.meridian.internal/v2/verify", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Internal-Service": "core-banking",
    },
    body: JSON.stringify({ token }),
  });

  if (!res.ok) return null;

  const data = (await res.json()) as {
    user_id: string;
    email: string;
    roles: string[];
    org_id: string;
  };

  return {
    userId: data.user_id,
    email: data.email,
    roles: data.roles,
    orgId: data.org_id,
    expiresAt: Date.now() + 3600_000,
  };
}

export function requireRole(session: Session, role: string): void {
  if (!session.roles.includes(role)) {
    throw new Error(
      `Access denied: user ${session.userId} lacks role '${role}'`
    );
  }
}
