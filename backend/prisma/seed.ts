/**
 * Seed — données de référence RPIC
 * Exécuter via : npm run db:seed
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seed RPIC — démarrage...");

  // ── Admin par défaut ──────────────────────────────────────────────────────
  const admin = await prisma.user.upsert({
    where: { email: "admin@rpic.local" },
    update: {},
    create: {
      email:       "admin@rpic.local",
      password:    await bcrypt.hash("Admin1234!", 12),
      nom:         "Admin",
      prenom:      "RPIC",
      role:        "ADMIN",
      lieuTravail: "Technocentre Guyancourt",
      poste:       "Administrateur système",
      isActive:    true,
    },
  });
  console.log("  ✓ Admin créé :", admin.email);

  // ── Fournisseurs de référence ─────────────────────────────────────────────
  const fournisseurs = [
    { nom: "Valéo",      codeInterne: "VAL", delaiExpeMaxRC: 7 },
    { nom: "Continental",codeInterne: "CON", delaiExpeMaxRC: 7 },
    { nom: "Bosch",      codeInterne: "BOS", delaiExpeMaxRC: 7 },
    { nom: "Delphi",     codeInterne: "DEL", delaiExpeMaxRC: 7 },
    { nom: "Denso",      codeInterne: "DEN", delaiExpeMaxRC: 7 },
    { nom: "Hella",      codeInterne: "HEL", delaiExpeMaxRC: 7 },
    { nom: "Magneti Marelli", codeInterne: "MAG", delaiExpeMaxRC: 7 },
    { nom: "Schaeffler", codeInterne: "SCH", delaiExpeMaxRC: 7 },
    { nom: "ZF",         codeInterne: "ZF",  delaiExpeMaxRC: 7 },
  ];
  for (const f of fournisseurs) {
    await prisma.fournisseur.upsert({ where: { nom: f.nom }, update: {}, create: f });
  }
  console.log(`  ✓ ${fournisseurs.length} fournisseurs créés`);

  // ── Pilotes RC ────────────────────────────────────────────────────────────
  const pilotesRC = [
    { code: "RC411", type: "RC" as const },
    { code: "RC412", type: "RC" as const },
    { code: "RC413", type: "RC" as const },
    { code: "RC414", type: "RC" as const },
    { code: "RC415", type: "RC" as const },
  ];
  for (const p of pilotesRC) {
    await prisma.pilote.upsert({ where: { code: p.code }, update: {}, create: p });
  }

  // ── Pilotes IC ────────────────────────────────────────────────────────────
  const pilotesIC = [
    { code: "IC039", type: "IC" as const, categorieGeree: "Sondes",              emplacementKardex: "K-039" },
    { code: "IC047", type: "IC" as const, categorieGeree: "Turbocompresseurs",   emplacementKardex: "K-047" },
    { code: "IC062", type: "IC" as const, categorieGeree: "Injecteurs",          emplacementKardex: "K-062" },
    { code: "IC071", type: "IC" as const, categorieGeree: "Capteurs ABS",        emplacementKardex: "K-071" },
    { code: "IC085", type: "IC" as const, categorieGeree: "Calculateurs moteur", emplacementKardex: "K-085" },
  ];
  for (const p of pilotesIC) {
    await prisma.pilote.upsert({ where: { code: p.code }, update: {}, create: p });
  }
  console.log(`  ✓ ${pilotesRC.length + pilotesIC.length} pilotes créés`);

  // ── Mention légale par défaut ─────────────────────────────────────────────
  await prisma.mentionLegale.upsert({
    where: { version: "1.0" },
    update: {},
    create: {
      version:  "1.0",
      titre:    "Mentions légales RPIC",
      contenu:  "Les données collectées dans cette application sont utilisées exclusivement dans le cadre du processus de retour des pièces incidentées et du suivi Comex. Conformément au RGPD, vous disposez d\'un droit d\'accès, de rectification et de suppression de vos données.",
      isActive: true,
    },
  });
  console.log("  ✓ Mention légale v1.0 créée");

  // ── Sites d'expédition exemple ────────────────────────────────────────────
  const sites = [
    { code6Plus2: "417999-00", nom: "Site Valéo Cergy", paysRetour: "France" },
    { code6Plus2: "418000-01", nom: "Site Continental Toulouse", paysRetour: "France" },
    { code6Plus2: "419001-00", nom: "Site Bosch Stuttgart", paysRetour: "Allemagne" },
  ];
  for (const s of sites) {
    await prisma.siteExpedition.upsert({ where: { code6Plus2: s.code6Plus2 }, update: {}, create: s });
  }
  console.log(`  ✓ ${sites.length} sites d\'expédition créés`);

  console.log("🌱 Seed terminé avec succès.");
}

main()
  .catch((e) => { console.error("❌ Seed error:", e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
