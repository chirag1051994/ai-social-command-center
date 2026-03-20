import { getAuthenticatedUserId, unauthorizedResponse } from "@/lib/api/auth";
import { badRequest, apiResponse } from "@/lib/api/responses";
import { getPostsByDateRange } from "@/lib/services/posts.service";

export async function GET(request: Request) {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return unauthorizedResponse();
  }

  const { searchParams } = new URL(request.url);
  const start = searchParams.get("start");
  const end = searchParams.get("end");

  if (!start || !end) {
    return badRequest("Start and end are required");
  }

  const result = await getPostsByDateRange(userId, start, end);
  return apiResponse(result);
}
