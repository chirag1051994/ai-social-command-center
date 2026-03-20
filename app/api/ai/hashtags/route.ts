import { createAnthropicClient, extractTextFromMessage, parseJsonObject } from "@/lib/ai/anthropic";
import { getAuthenticatedUserId, unauthorizedResponse } from "@/lib/api/auth";
import { badRequest, apiResponse } from "@/lib/api/responses";
import { asPlatform } from "@/lib/api/validators";

interface HashtagRequestBody {
  content: string;
  platform: string;
}

interface HashtagResponse {
  hashtags: string[];
}

export async function POST(request: Request) {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return unauthorizedResponse();
  }

  try {
    const body = (await request.json()) as HashtagRequestBody;
    const platform = asPlatform(body.platform);

    if (!body.content?.trim()) {
      return badRequest("Content is required");
    }

    if (!platform) {
      return badRequest("Invalid platform");
    }

    const anthropic = createAnthropicClient();
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 200,
      system: `Generate 12 hashtags for ${platform}. Post: ${body.content.trim()}. Mix: 4 broad, 4 niche, 4 specific. Return ONLY JSON: {"hashtags":["#tag1","#tag2"]}`,
      messages: [
        {
          role: "user",
          content: `Platform: ${platform}\nPost: ${body.content.trim()}`,
        },
      ],
    });

    const parsed = parseJsonObject<HashtagResponse>(extractTextFromMessage(response.content));

    if (!Array.isArray(parsed.hashtags) || parsed.hashtags.length === 0) {
      return apiResponse<HashtagResponse>({
        data: null,
        error: "Invalid AI hashtag response",
      });
    }

    return apiResponse({ data: { hashtags: parsed.hashtags }, error: null });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to generate AI hashtags";

    return apiResponse<HashtagResponse>({ data: null, error: message });
  }
}
