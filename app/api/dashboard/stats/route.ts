import { getAuthenticatedUserId, unauthorizedResponse } from "@/lib/api/auth";
import { apiResponse } from "@/lib/api/responses";
import { getDashboardStats } from "@/lib/services/analytics.service";

export async function GET() {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return unauthorizedResponse();
  }

  const result = await getDashboardStats(userId);
  return apiResponse(result);
}
