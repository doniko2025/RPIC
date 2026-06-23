//backend/src/app/api/sites-expedition/route.ts
import { NextRequest } from "next/server";
import { paginated, created, handleError } from "@/lib/response";
import { getUserCtx } from "@/lib/middleware/withAuth";
import { SiteExpeditionService } from "@/services/site-expedition.service";
import { CreateSiteSchema } from "@/validators/site-expedition.validator";

export async function GET(req: NextRequest) {
  try {
    const { data, meta } = await SiteExpeditionService.findAll(req.nextUrl.searchParams);
    return paginated(data, meta);
  } catch (e) { return handleError(e); }
}
export async function POST(req: NextRequest) {
  try {
    getUserCtx(req); // vérification auth — userId non requis dans ce handler
    const dto = CreateSiteSchema.parse(await req.json());
    return created(await SiteExpeditionService.create(dto as never));
  } catch (e) { return handleError(e); }
}