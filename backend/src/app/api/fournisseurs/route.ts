import { NextRequest } from "next/server";
import { paginated, created, handleError } from "@/lib/response";
import { getUserCtx } from "@/lib/middleware/withAuth";
import { FournisseurService } from "@/services/fournisseur.service";
import { CreateFournisseurSchema } from "@/validators/fournisseur.validator";

export async function GET(req: NextRequest) {
  try {
    const { data, meta } = await FournisseurService.findAll(req.nextUrl.searchParams);
    return paginated(data, meta);
  } catch (e) { return handleError(e); }
}
export async function POST(req: NextRequest) {
  try {
    const user = getUserCtx(req);
    const dto  = CreateFournisseurSchema.parse(await req.json());
    return created(await FournisseurService.create(dto as never));
  } catch (e) { return handleError(e); }
}
