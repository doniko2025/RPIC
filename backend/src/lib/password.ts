import bcrypt from "bcryptjs";
const R = parseInt(process.env.BCRYPT_ROUNDS || "12", 10);
export const hashPassword    = (p: string) => bcrypt.hash(p, R);
export const comparePassword = (p: string, h: string) => bcrypt.compare(p, h);
