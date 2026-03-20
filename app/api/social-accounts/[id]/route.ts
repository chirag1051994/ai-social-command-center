import { getAuthenticatedUserId, unauthorizedResponse } from "@/lib/api/auth";
import { apiResponse } from "@/lib/api/responses";
import {
  deleteSocialAccount,
  updateSocialAccount,
} from "@/lib/services/social-accounts.service";
import type { SocialAccount } from "@/lib/types";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return unauthorizedResponse();
  }

  const body = (await request.json()) as Partial<SocialAccount>;
  const { id } = await context.params;
  const result = await updateSocialAccount(id, userId, body);
  return apiResponse(result);
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return unauthorizedResponse();
  }

  const { id } = await context.params;
  const result = await deleteSocialAccount(id, userId);
  return apiResponse(result);
}
