import { getAuthenticatedUserId, unauthorizedResponse } from "@/lib/api/auth";
import { badRequest, apiResponse } from "@/lib/api/responses";
import { asPlatform } from "@/lib/api/validators";
import {
  createSocialAccount,
  getSocialAccounts,
} from "@/lib/services/social-accounts.service";

interface CreateSocialAccountBody {
  platform: string;
  account_name: string;
  account_handle: string;
  followers_count?: number;
}

export async function GET() {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return unauthorizedResponse();
  }

  const result = await getSocialAccounts(userId);
  return apiResponse(result);
}

export async function POST(request: Request) {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return unauthorizedResponse();
  }

  const body = (await request.json()) as CreateSocialAccountBody;
  const platform = asPlatform(body.platform);

  if (!platform) {
    return badRequest("Invalid platform");
  }

  const result = await createSocialAccount(userId, {
    platform,
    account_name: body.account_name,
    account_handle: body.account_handle,
    avatar_url: null,
    followers_count: body.followers_count ?? 0,
    is_connected: true,
  });

  return apiResponse(result, 201);
}
