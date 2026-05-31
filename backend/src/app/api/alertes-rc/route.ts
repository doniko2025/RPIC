import { NextRequest } from "next/server";
import { paginated, handleError } from "@/lib/response";
import { AlerteRCService } from "@/services/alerte-rc.service";

export async function GET(req: NextRequest) {
  try {
    const { data, meta } = await AlerteRCService.findAll(req.nextUrl.searchParams);
    return paginated(data, meta);
  } catch (e) { return handleError(e); }
}
