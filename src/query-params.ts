export function parsePage(value?: string): number {
  // Query params arrive as strings; default page=1.
  const n = parseInt(value ?? '1', 10);

  return Number.isFinite(n) && n >= 1 ? n : 1;
}

export function parseLimit(value?: string): number {
  // Default limit=20; cap at 100 so clients can't request huge pages.
  const n = parseInt(value ?? '20', 10);
  if (!Number.isFinite(n) || n < 1) return 20;

  return Math.min(n, 100);
}
