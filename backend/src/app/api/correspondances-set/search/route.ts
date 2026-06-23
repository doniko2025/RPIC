//backend/src/app/api/correspondances-set/search/route.ts
import { NextRequest } from "next/server";
import { ok, handleError } from "@/lib/response";
import { CorrespondanceSetService } from "@/services/correspondance-set.service";
import { SearchCorrSchema } from "@/validators/correspondance-set.validator";

export async function GET(req: NextRequest) {
  try {
    const sp  = req.nextUrl.searchParams;
    const dto = SearchCorrSchema.parse({
      nitg:           sp.get("nitg"),
      refPieceCause:  sp.get("refPieceCause") ?? undefined,
      typePiece:      sp.get("typePiece")     ?? undefined,
      projetVehicule: sp.get("projetVehicule")  ?? undefined,
      indiceVehicule: sp.get("indiceVehicule")  ?? undefined,
      projetMoteur:   sp.get("projetMoteur")    ?? undefined,
      indiceMoteur:   sp.get("indiceMoteur")    ?? undefined,
      projetBoite:    sp.get("projetBoite")     ?? undefined,
      indiceBoite:    sp.get("indiceBoite")     ?? undefined,
    });
    return ok(await CorrespondanceSetService.search(dto));
  } catch (e) { return handleError(e); }
}
