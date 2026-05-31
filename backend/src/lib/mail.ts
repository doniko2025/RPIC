import nodemailer from "nodemailer";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

let tr: nodemailer.Transporter|null = null;
const getTr = () => tr ?? (tr = nodemailer.createTransport({
  host: process.env.SMTP_HOST, port: +(process.env.SMTP_PORT||"587"),
  secure: process.env.SMTP_SECURE==="true",
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
}));

export interface MailOpts { to:string; subject:string; html:string; contexte?:string; entiteId?:string; expediteurId?:string; }

export async function sendMail(o: MailOpts) {
  const log = await prisma.mailLog.create({
    data: { destinataire:o.to, sujet:o.subject, corps:o.html, statut:"EN_ATTENTE",
            contexte:o.contexte, entiteId:o.entiteId, expediteurId:o.expediteurId },
  });
  try {
    await getTr().sendMail({ from: process.env.SMTP_FROM, to:o.to, subject:o.subject, html:o.html });
    await prisma.mailLog.update({ where:{id:log.id}, data:{statut:"ENVOYE", envoyeAt:new Date()} });
  } catch (err) {
    await prisma.mailLog.update({ where:{id:log.id}, data:{statut:"ECHEC", tentatives:{increment:1},
      erreur: err instanceof Error ? err.message : String(err) } });
    logger.error("Mail echec",err);
    throw err;
  }
}

export async function retryMails() {
  const list = await prisma.mailLog.findMany({ where:{statut:"ECHEC", tentatives:{lt:3}}, take:20 });
  for (const m of list) {
    try {
      await getTr().sendMail({ from:process.env.SMTP_FROM, to:m.destinataire, subject:m.sujet, html:m.corps });
      await prisma.mailLog.update({ where:{id:m.id}, data:{statut:"ENVOYE", envoyeAt:new Date()} });
    } catch (err) {
      await prisma.mailLog.update({ where:{id:m.id}, data:{tentatives:{increment:1},
        erreur: err instanceof Error ? err.message : String(err)} });
    }
  }
}

export const tpl = {
  alerteRC: (d:{nom:string;nitg:string;dateMax:string;restants:number}) => ({
    subject: `[RPIC] Alerte RC ${d.nitg} — J-${d.restants}`,
    html: `<h2>Alerte délai RC</h2><p><b>${d.nom}</b> (${d.nitg}) doit être expédiée avant le <b>${d.dateMax}</b> (${d.restants} j restant(s)).</p>`,
  }),
  depassementRC: (d:{nom:string;nitg:string;dateMax:string;jours:number}) => ({
    subject: `[RPIC] ⚠ DÉPASSEMENT RC ${d.nitg}`,
    html: `<h2 style="color:red">Dépassement RC</h2><p><b>${d.nom}</b> (${d.nitg}) n'a pas été expédiée à temps (date limite : ${d.dateMax}, ${d.jours} j depuis le tri).</p>`,
  }),
  retourTRANS: (d:{nitg:string;num:string}) => ({
    subject: `[RPIC] Retour TRANS sans motif — ${d.num}`,
    html: `<h2>Retour TRANS</h2><p>Expédition <b>${d.num}</b> (${d.nitg}) retournée par TRANS sans motif. Réexpédition DHL recommandée.</p>`,
  }),
  resetPassword: (d:{prenom:string;token:string;base:string}) => ({
    subject: "[RPIC] Réinitialisation mot de passe",
    html: `<p>Bonjour ${d.prenom},</p><p><a href="${d.base}/reset-password?token=${d.token}">Cliquez ici</a> pour réinitialiser votre mot de passe (lien valable 1h).</p>`,
  }),
};
