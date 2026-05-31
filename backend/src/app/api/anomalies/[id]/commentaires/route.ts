import { NextRequest } from "next/server";
import { created, handleError } from "@/lib/response";
import { getUserCtx } from "@/lib/middleware/withAuth";
import { AnomalieService } from "@/services/anomalie.service";
import { CommentaireSchema } from "@/validators/anomalie.validator";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { userId } = getUserCtx(req);
    const { contenu } = CommentaireSchema.parse(await req.json());
    return created(await AnomalieService.addCommentaire(params.id, contenu, userId));
  } catch (e) { return handleError(e); }
}
