import { prisma } from "@/lib/prisma";
import { hashPassword, comparePassword } from "@/lib/password";
import { signAccess, signRefresh, verifyRefreshToken } from "@/lib/auth";
import { AppError, NotFoundError, ConflictError, UnauthorizedError } from "@/lib/errors";
import { AuditService } from "./audit.service";
import { sendMail, tpl } from "@/lib/mail";
import { MAX_LOGIN_ATTEMPTS, LOCK_MINUTES } from "@/lib/constants";
import { v4 as uuid } from "uuid";
import dayjs from "dayjs";
import type { LoginDto, RegisterDto, ChangePasswordDto } from "@/validators/auth.validator";

const SAFE = {
  id:true,email:true,nom:true,prenom:true,telephone:true,role:true,
  matricule:true,lieuTravail:true,poste:true,typePrincipal:true,
  isActive:true,lastLoginAt:true,acceptedRgpdAt:true,rgpdVersion:true,
  createdAt:true,updatedAt:true,
};

export class AuthService {
  static async login(dto:LoginDto, ip?:string, ua?:string) {
    const user = await prisma.user.findUnique({ where:{ email:dto.email } });
    if (!user||!user.isActive) throw new UnauthorizedError("Email ou mot de passe incorrect");

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const m = dayjs(user.lockedUntil).diff(dayjs(),"minute");
      throw new AppError(`Compte verrouillé — réessayez dans ${m} min`,423);
    }
    const valid = await comparePassword(dto.password, user.password);
    if (!valid) {
      const att = user.failedLoginAttempts+1;
      const lock = att>=MAX_LOGIN_ATTEMPTS ? dayjs().add(LOCK_MINUTES,"minute").toDate() : null;
      await prisma.user.update({ where:{id:user.id}, data:{ failedLoginAttempts:att, ...(lock&&{lockedUntil:lock}) } });
      throw new UnauthorizedError("Email ou mot de passe incorrect");
    }
    await prisma.user.update({ where:{id:user.id}, data:{ failedLoginAttempts:0, lockedUntil:null, lastLoginAt:new Date(), lastLoginIp:ip } });

    const pl = { userId:user.id, email:user.email, role:user.role };
    const accessToken  = signAccess(pl);
    const refreshToken = signRefresh(pl);
    await prisma.refreshToken.create({ data:{ token:refreshToken, userId:user.id,
      expiresAt:dayjs().add(7,"day").toDate(), ipAdresse:ip, userAgent:ua } });
    await AuditService.log({ action:"AUTH_LOGIN", userId:user.id, userEmail:user.email, details:"Connexion", ipAdresse:ip, userAgent:ua });
    const { password:_, ...u } = user;
    return { accessToken, refreshToken, user: u };
  }

  static async logout(refreshToken:string, userId:string) {
    await prisma.refreshToken.updateMany({ where:{token:refreshToken,userId}, data:{isRevoked:true} });
    await AuditService.log({ action:"AUTH_LOGOUT", userId, details:"Déconnexion" });
  }

  static async refresh(token:string) {
    const pl = verifyRefreshToken(token);
    const stored = await prisma.refreshToken.findUnique({ where:{token} });
    if (!stored||stored.isRevoked||stored.expiresAt<new Date())
      throw new UnauthorizedError("Refresh token expiré ou révoqué");
    if (stored.userId!==pl.userId) throw new UnauthorizedError("Token invalide");
    const user = await prisma.user.findUnique({ where:{id:pl.userId} });
    if (!user||!user.isActive) throw new UnauthorizedError("Compte inactif");
    const newPl = { userId:user.id, email:user.email, role:user.role };
    const at = signAccess(newPl); const rt = signRefresh(newPl);
    await prisma.$transaction([
      prisma.refreshToken.update({ where:{token}, data:{isRevoked:true} }),
      prisma.refreshToken.create({ data:{ token:rt, userId:user.id, expiresAt:dayjs().add(7,"day").toDate() } }),
    ]);
    return { accessToken:at, refreshToken:rt };
  }

  static async requestReset(email:string, base:string) {
    const user = await prisma.user.findUnique({ where:{email} });
    if (!user) return; // sécurité : pas de révélation
    const token = uuid();
    await prisma.user.update({ where:{id:user.id}, data:{ resetPasswordToken:token, resetPasswordExpires:dayjs().add(1,"hour").toDate() } });
    const t = tpl.resetPassword({ prenom:user.prenom, token, base });
    await sendMail({ to:user.email, subject:t.subject, html:t.html }).catch(()=>{});
  }

  static async confirmReset(token:string, password:string) {
    const user = await prisma.user.findFirst({ where:{ resetPasswordToken:token, resetPasswordExpires:{gt:new Date()} } });
    if (!user) throw new AppError("Token invalide ou expiré",400);
    await prisma.user.update({ where:{id:user.id}, data:{
      password: await hashPassword(password),
      resetPasswordToken:null, resetPasswordExpires:null,
    }});
    await prisma.refreshToken.updateMany({ where:{userId:user.id}, data:{isRevoked:true} });
  }

  static async changePassword(userId:string, dto:ChangePasswordDto) {
    const user = await prisma.user.findUnique({ where:{id:userId} });
    if (!user) throw new NotFoundError("Utilisateur");
    if (!await comparePassword(dto.currentPassword, user.password))
      throw new AppError("Mot de passe actuel incorrect",400);
    await prisma.user.update({ where:{id:userId}, data:{ password: await hashPassword(dto.newPassword) } });
    await prisma.refreshToken.updateMany({ where:{userId}, data:{isRevoked:true} });
  }

  static async register(dto:RegisterDto) {
    const ex = await prisma.user.findUnique({ where:{email:dto.email} });
    if (ex) throw new ConflictError("Email déjà utilisé");
    const { password, ...rest } = dto;
    const user = await prisma.user.create({ data:{ ...rest, password: await hashPassword(password) }, select:SAFE });
    return user;
  }

  static async me(userId:string) {
    const u = await prisma.user.findUnique({ where:{id:userId}, select:{ ...SAFE, pilote:true } });
    if (!u) throw new NotFoundError("Utilisateur");
    return u;
  }
}
