//backend/src/app/api/correspondances-set/conflits/[id]/resoudre/route.ts
import { NextRequest } from "next/server";
import { ok, handleError } from "@/lib/response";
import { CorrespondanceSetService } from "@/services/correspondance-set.service";
import { z } from "zod";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { noteResolution } = z.object({ noteResolution: z.string().min(1) }).parse(await req.json());
    return ok(await CorrespondanceSetService.resoudreConflit(params.id, noteResolution));
  } catch (e) { return handleError(e); }
}
