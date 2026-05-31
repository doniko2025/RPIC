import { ok, handleError } from "@/lib/response";
import { MentionLegaleService } from "@/services/mention-legale.service";

export async function GET() {
  try { return ok(await MentionLegaleService.findActive()); }
  catch (e) { return handleError(e); }
}
