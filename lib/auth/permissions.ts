import type { Session } from "./session";

export type Permission =
  | "wire:initiate"
  | "wire:approve"
  | "wire:override"
  | "admin:read"
  | "admin:write"
  | "compliance:review"
  | "billing:manage";

const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  operator: ["wire:initiate"],
  approver: ["wire:initiate", "wire:approve"],
  admin: [
    "wire:initiate",
    "wire:approve",
    "wire:override",
    "admin:read",
    "admin:write",
  ],
  compliance: ["compliance:review", "admin:read"],
  billing: ["billing:manage", "admin:read"],
};

export function hasPermission(session: Session, perm: Permission): boolean {
  return session.roles.some((role) =>
    (ROLE_PERMISSIONS[role] ?? []).includes(perm)
  );
}

export function requirePermission(session: Session, perm: Permission): void {
  if (!hasPermission(session, perm)) {
    throw new Error(
      `Forbidden: ${session.userId} lacks permission '${perm}'`
    );
  }
}
