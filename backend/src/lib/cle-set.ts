//backend/src/lib/cle-set.ts
export interface CleParams {
  nitg: string; refPieceCause: string;
  projetVehicule?:string|null; indiceVehicule?:string|null;
  projetMoteur?:string|null;   indiceMoteur?:string|null;
  projetBoite?:string|null;    indiceBoite?:string|null;
}
const seg = (v?:string|null) => (v??"").trim().toUpperCase()||"_";

export function genCle(p: CleParams): string {
  return [seg(p.nitg),seg(p.refPieceCause),
    seg(p.projetVehicule),seg(p.indiceVehicule),
    seg(p.projetMoteur),seg(p.indiceMoteur),
    seg(p.projetBoite),seg(p.indiceBoite)].join("|");
}
