# RPIC Frontend

Interface utilisateur de l'application RPIC (Retour des Pièces Incidentées & Comex) — Technocentre Renault Guyancourt.

## Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS** — design system rouge/gris
- **Recharts** — graphiques statistiques
- **React Hot Toast** — notifications
- **Lucide React** — icônes

## Design system

| Élément | Choix |
|---|---|
| Titres | Cormorant Garamond |
| Texte UI | DM Sans |
| Nombres / code | DM Mono |
| Couleur primaire | `#991B1B → #DC2626` (gradient rouge) |
| Fond | `#F3F4F6` (gris clair) |
| Cartes | Blanc + ombre douce + bord `surface-200` |

## Installation

\`\`\`bash
npm install
cp .env.example .env.local
# Renseigner NEXT_PUBLIC_API_URL
npm run dev        # http://localhost:3001
\`\`\`

Le backend doit tourner sur le port configuré dans `.env.local`.

## Structure

\`\`\`
src/
├── app/
│   ├── (auth)/          # Login, reset password
│   └── (dashboard)/     # Toutes les pages protégées
│       ├── dashboard/
│       ├── triages/
│       ├── correspondances-set/
│       ├── alertes-rc/
│       ├── expeditions/
│       ├── retours-expedition/
│       ├── receptions-logistique/
│       ├── pieces-logistique/
│       ├── anomalies/
│       ├── pieces-tri-impossible/
│       ├── conges/
│       ├── notifications/
│       ├── stats/
│       ├── profil/
│       └── admin/
├── components/
│   ├── ui/              # Composants de base (Button, Input, Modal…)
│   ├── layout/          # Sidebar, Header, PageHeader
│   ├── dashboard/       # StatCard
│   └── admin/           # AdminCrudPage (CRUD générique)
└── lib/
    ├── api.ts           # Client HTTP avec refresh automatique
    ├── auth-context.tsx # Contexte d'authentification
    ├── utils.ts         # Utilitaires (fmt, cn, couleurs statuts…)
    ├── constants.ts     # Labels statuts
    └── hooks/           # useApi, usePagination, useAuth
\`\`\`

## Pages

| URL | Description | Rôles |
|---|---|---|
| `/login` | Connexion | Public |
| `/reset-password` | Reset mot de passe | Public |
| `/dashboard` | KPIs + alertes RC + graphe 14j | Tous |
| `/triages` | Liste des triages | Tous |
| `/triages/nouveau` | Créer un tri + recherche SET auto | Tous |
| `/triages/:id` | Détail + actions RC/IC/caffutage | Tous |
| `/correspondances-set/search` | **Recherche SET** (central) | Tous |
| `/correspondances-set` | Référentiel auto-apprenant | Tous |
| `/alertes-rc` | Alertes dépassement 7j | Tous |
| `/expeditions` | Liste + création | Tous |
| `/expeditions/:id` | Détail | Tous |
| `/retours-expedition` | Retours + alerte TRANS auto | Tous |
| `/retours-expedition/:id` | Détail | Tous |
| `/receptions-logistique` | Réceptions logistique | Tous |
| `/pieces-logistique` | Pièces en stock logistique | Tous |
| `/anomalies` | Signalement + liste | Tous |
| `/anomalies/:id` | Détail + action corrective + commentaires | Tous |
| `/pieces-tri-impossible` | Déclarations de tri impossible | Tous |
| `/conges` | Gestion des congés | Tous |
| `/notifications` | Centre de notifications | Tous |
| `/stats` | Graphiques (Recharts) | Tous |
| `/profil` | Infos + changement mot de passe | Tous |
| `/admin/users` | CRUD utilisateurs | ADMIN, MANAGER |
| `/admin/fournisseurs` | CRUD fournisseurs | ADMIN, MANAGER |
| `/admin/sites-expedition` | CRUD sites 6+2 | ADMIN, MANAGER |
| `/admin/pilotes` | CRUD pilotes RC/IC | ADMIN, MANAGER |
| `/admin/garages` | CRUD garages | ADMIN, MANAGER |
| `/admin/sets` | CRUD SETs | ADMIN, MANAGER |
| `/admin/references-piece` | CRUD référentiel pièces | ADMIN, MANAGER |
| `/admin/audit-logs` | Journal d'audit | ADMIN |
| `/admin/mail-logs` | Journal emails + renvoi | ADMIN |
| `/admin/mentions-legales` | CRUD mentions légales | ADMIN |
