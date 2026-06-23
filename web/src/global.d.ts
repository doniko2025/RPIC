// web/src/global.d.ts
// FIX ts(2882) : TypeScript ne trouve pas de déclarations pour les imports CSS
// side-effect (import "./globals.css"). Ce fichier déclare tous les .css comme
// modules valides (sans export) pour satisfaire le compilateur.
// À placer dans web/src/ (inclus automatiquement via tsconfig "include").
declare module "*.css" {}