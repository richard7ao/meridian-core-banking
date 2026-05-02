export type Session = {
  userId: string;
  email: string;
  roles: string[];
  orgId: string;
  expiresAt: number;
};

export type SessionToken = {
  sub: string;
  iat: number;
  exp: number;
  aud: string;
  iss: string;
};

export function isExpired(session: Session): boolean {
  return Date.now() > session.expiresAt;
}

export function sessionToHeaders(session: Session): Record<string, string> {
  return {
    "X-User-Id": session.userId,
    "X-User-Email": session.email,
    "X-User-Roles": session.roles.join(","),
    "X-Org-Id": session.orgId,
  };
}
