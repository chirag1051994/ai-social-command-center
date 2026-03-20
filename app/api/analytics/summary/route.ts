import { getAuthenticatedUserId, unauthorizedResponse } from "@/lib/api/auth";
import { badRequest, apiResponse } from "@/lib/api/responses";
import { asWindow } from "@/lib/api/validators";
import { getAnalyticsSummary } from "@/lib/services/analytics.service";

export async function GET(request: Request) {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return unauthorizedResponse();
  }

  const { searchParams } = new URL(request.url);
  const days = asWindow(searchParams.get("days") ?? "30");

  if (!days) {
    return badRequest("Invalid analytics window");
  }

  const result = await getAnalyticsSummary(userId, days);
  return apiResponse(result);
}
