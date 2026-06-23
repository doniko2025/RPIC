//backend/src/app/api/pieces-tri-impossible/[id]/commentaires/route.ts
import { NextRequest } from "next/server";
import { created, handleError } from "@/lib/response";
import { getUserCtx } from "@/lib/middleware/withAuth";
import { PieceTriImpossibleService } from "@/services/piece-tri-impossible.service";
import { CommentTriImpSchema } from "@/validators/piece-tri-impossible.validator";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { userId } = getUserCtx(req);
    const { contenu, auteurNom } = CommentTriImpSchema.parse(await req.json());
    return created(await PieceTriImpossibleService.addCommentaire(params.id, contenu, userId, auteurNom));
  } catch (e) { return handleError(e); }
}
