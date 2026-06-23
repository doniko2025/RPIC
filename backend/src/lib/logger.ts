//backend/src/lib/logger.ts
type L = "debug" | "info" | "warn" | "error";

const rank: Record<L, number> = { debug: 0, info: 1, warn: 2, error: 3 };
const lvl = (process.env.LOG_LEVEL || "info") as L;

const log = (l: L, msg: string, meta?: unknown) => {
  if (rank[l] < rank[lvl]) return;
  const ts = new Date().toISOString();
  const fn = l === "error" ? console.error : l === "warn" ? console.warn : console.log;
  // FIX : ternaire-statement interdit par no-unused-expressions → if/else
  if (meta !== undefined) {
    fn(`[${ts}][${l.toUpperCase()}]`, msg, meta);
  } else {
    fn(`[${ts}][${l.toUpperCase()}]`, msg);
  }
};

export const logger = {
  debug: (m: string, x?: unknown) => log("debug", m, x),
  info:  (m: string, x?: unknown) => log("info",  m, x),
  warn:  (m: string, x?: unknown) => log("warn",  m, x),
  error: (m: string, x?: unknown) => log("error", m, x),
};