import { getAuthenticatedUserId, unauthorizedResponse } from "@/lib/api/auth";
import { badRequest, apiResponse } from "@/lib/api/responses";
import {
  asMessageType,
  asOptionalBoolean,
  asPlatform,
} from "@/lib/api/validators";
import { getMessages, markAllRead } from "@/lib/services/inbox.service";

interface MarkAllReadBody {
  markAll?: boolean;
}

export async function GET(request: Request) {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return unauthorizedResponse();
  }

  const { searchParams } = new URL(request.url);
  const typeValue = searchParams.get("type");
  const platformValue = searchParams.get("platform");
  const isReadValue = searchParams.get("is_read");

  if (typeValue && !asMessageType(typeValue)) {
    return badRequest("Invalid message type");
  }

  if (platformValue && !asPlatform(platformValue)) {
    return badRequest("Invalid platform");
  }

  const result = await getMessages(userId, {
    type: asMessageType(typeValue),
    platform: asPlatform(platformValue),
    isRead: asOptionalBoolean(isReadValue),
  });

  return apiResponse(result);
}

export async function PATCH(request: Request) {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return unauthorizedResponse();
  }

  const body = (await request.json()) as MarkAllReadBody;

  if (!body.markAll) {
    return badRequest("markAll must be true");
  }

  const result = await markAllRead(userId);
  return apiResponse(result);
}
