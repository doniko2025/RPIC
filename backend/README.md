# RPIC — Backend API

**Retour des Pièces Incidentées et Comex** — Backend Next.js 14 App Router / TypeScript / Prisma / PostgreSQL

## Structure

```
src/
├── app/api/          # Routes API (Next.js App Router)
│   ├── auth/         # Login, register, refresh, reset-password
│   ├── triages/      # Tri des pièces RC / IC (+ auto-apprentissage SET)
│   ├── correspondances-set/ # Référentiel SET auto-apprenant
│   ├── alertes-rc/   # Gestion des délais RC (J+5 / J+7)
│   ├── expeditions/  # Expéditions DHL / TRANS
│   ├── retours-expedition/ # Retours + alertes TRANS sans motif
│   ├── anomalies/    # Signalement et suivi anomalies
│   ├── dashboard/    # KPIs temps réel
│   └── ...
├── services/         # Logique métier
├── validators/       # Schémas Zod
├── lib/              # Prisma, JWT, mail, crons, utils
└── types/            # Types partagés
```

## Installation

```bash
npm install
cp .env.example .env
# Éditer .env avec vos credentials PostgreSQL et SMTP
npm run db:migrate
npm run db:generate
npm run db:seed
npm run dev
```

## Endpoints clés

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/auth/login` | Authentification |
| POST | `/api/triages` | Créer un tri (auto-apprentissage SET) |
| GET | `/api/correspondances-set/search?nitg=XXXX` | Rechercher le SET d'une pièce |
| GET | `/api/alertes-rc?statut=ACTIVE` | Alertes RC actives |
| POST | `/api/retours-expedition` | Saisir un retour (alerte TRANS auto) |
| GET | `/api/dashboard` | Tableau de bord KPIs |

## CRONs

```bash
npm run cron:rc     # Vérification délais RC (à programmer à 07h00)
npm run cron:stats  # Stats journalières (à programmer à 00h00)
```

## Rôles

| Rôle | Accès |
|------|-------|
| `ADMIN` | Accès total + gestion utilisateurs + audit |
| `MANAGER` | Accès complet sauf suppression utilisateurs |
| `EMPLOYEE` | Tri, expéditions, retours, anomalies |
