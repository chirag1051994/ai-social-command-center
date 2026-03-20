import { getAuthenticatedUserId, unauthorizedResponse } from "@/lib/api/auth";
import { apiResponse } from "@/lib/api/responses";
import { deleteCampaign } from "@/lib/services/campaigns.service";

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return unauthorizedResponse();
  }

  const { id } = await context.params;
  const result = await deleteCampaign(id, userId);
  return apiResponse(result);
}
