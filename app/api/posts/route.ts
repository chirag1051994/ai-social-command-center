import { badRequest, apiResponse } from "@/lib/api/responses";
import {
  asOptionalNumber,
  asPostStatus,
} from "@/lib/api/validators";
import { getAuthenticatedUserId, unauthorizedResponse } from "@/lib/api/auth";
import { createPost, getPosts } from "@/lib/services/posts.service";
import type { Platform, PostStatus } from "@/lib/types";

interface CreatePostBody {
  content: string;
  platforms: Platform[];
  hashtags?: string[];
  media_urls?: string[];
  status: PostStatus;
  scheduled_at?: string | null;
  published_at?: string | null;
  campaign_id?: string | null;
  ai_generated?: boolean;
}

export async function GET(request: Request) {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return unauthorizedResponse();
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const limit = asOptionalNumber(searchParams.get("limit"));
  const offset = asOptionalNumber(searchParams.get("offset"));

  if (status && !asPostStatus(status)) {
    return badRequest("Invalid post status");
  }

  if (
    (typeof limit === "number" && limit < 0) ||
    (typeof offset === "number" && offset < 0)
  ) {
    return badRequest("Invalid pagination parameters");
  }

  const result = await getPosts(userId, {
    status: asPostStatus(status),
    limit,
    offset,
  });

  return apiResponse(result);
}

export async function POST(request: Request) {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return unauthorizedResponse();
  }

  const body = (await request.json()) as CreatePostBody;

  if (!Array.isArray(body.platforms) || body.platforms.length === 0) {
    return badRequest("At least one platform is required");
  }

  const result = await createPost(userId, {
    campaign_id: body.campaign_id ?? null,
    content: body.content,
    media_urls: Array.isArray(body.media_urls) ? body.media_urls : [],
    platforms: body.platforms,
    hashtags: Array.isArray(body.hashtags) ? body.hashtags : [],
    status: body.status,
    scheduled_at: body.scheduled_at ?? null,
    published_at: body.published_at ?? null,
    ai_generated: body.ai_generated ?? false,
  });

  return apiResponse(result, 201);
}
