import { getAuthenticatedUserId, unauthorizedResponse } from "@/lib/api/auth";
import { apiResponse } from "@/lib/api/responses";
import { markMessageRead } from "@/lib/services/inbox.service";

export async function PATCH(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return unauthorizedResponse();
  }

  const { id } = await context.params;
  const result = await markMessageRead(id, userId);
  return apiResponse(result);
}
