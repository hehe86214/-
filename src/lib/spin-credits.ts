const KEY = "spin-credits";

export function readSpinCredits(): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = window.localStorage.getItem(KEY);
    const n = raw ? parseInt(raw, 10) : 0;
    return Number.isFinite(n) && n > 0 ? n : 0;
  } catch {
    return 0;
  }
}

function writeSpinCredits(value: number) {
  try {
    window.localStorage.setItem(KEY, String(Math.max(0, value)));
  } catch {
    // ignore unavailable storage
  }
}

export function addSpinCredit(): number {
  const next = readSpinCredits() + 1;
  writeSpinCredits(next);
  return next;
}

export function spendSpinCredit(): number {
  const next = Math.max(0, readSpinCredits() - 1);
  writeSpinCredits(next);
  return next;
}

export const SPIN_CREDITS_KEY = KEY;
