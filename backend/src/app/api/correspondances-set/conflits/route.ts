import { NextRequest } from "next/server";
import { paginated, handleError } from "@/lib/response";
import { CorrespondanceSetService } from "@/services/correspondance-set.service";

export async function GET(req: NextRequest) {
  try {
    const { data, meta } = await CorrespondanceSetService.getConflits(req.nextUrl.searchParams);
    return paginated(data, meta);
  } catch (e) { return handleError(e); }
}
