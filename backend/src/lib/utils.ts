import dayjs from "dayjs";

// ── Normalisation ─────────────────────────────────────────────────────────
export const norm       = (s?: string | null) => (s ?? "").trim().toUpperCase();
export const normalise  = norm;  // alias utilisé dans les tests

// ── Dates ────────────────────────────────────────────────────────────────
export const calcMax       = (d: Date, days = 7)  => dayjs(d).add(days, "day").toDate();
export const joursRestants = (d: Date)            => dayjs(d).diff(dayjs(), "day");
export const formatDate    = (d?: Date | null)    => d ? dayjs(d).format("DD/MM/YYYY HH:mm") : "-";

// ── Rôles ────────────────────────────────────────────────────────────────
export const isAdmin      = (role: string) => role === "ADMIN";
export const isAdminOrMgr = (role: string) => role === "ADMIN" || role === "MANAGER";

// ── Validation RPIC ──────────────────────────────────────────────────────
export const NITG_RE     = /^[A-Z0-9]{4}$/i;
export const REF_RE      = /^[A-Z0-9]{10}$/i;
export const SET_RE      = /^[0-9]{5}$/;
export const CODE6P2_RE  = /^[0-9]{6}-[0-9]{2}$/;
export const NIS_RE      = /^[0-9]{11}$/;
export const PILOTE_RE   = /^(RC|IC)[0-9]{3}$/i;

export const isValidNitg  = (s: string) => NITG_RE.test(s.trim());
export const isValidSet   = (s: string) => SET_RE.test(s.trim());
export const isValidRef   = (s: string) => REF_RE.test(s.trim());
export const isValidNIS   = (s: string) => NIS_RE.test(s.trim());
export const isValid6Plus2 = (s: string) => CODE6P2_RE.test(s.trim());
