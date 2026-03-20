import { createAnthropicClient, extractTextFromMessage, parseJsonObject } from "@/lib/ai/anthropic";
import { getAuthenticatedUserId, unauthorizedResponse } from "@/lib/api/auth";
import { badRequest, apiResponse } from "@/lib/api/responses";
import { asPlatform, asTone } from "@/lib/api/validators";
import type { ApiResponse, Platform, Tone } from "@/lib/types";

interface CaptionRequestBody {
  topic: string;
  platform: string;
  tone: string;
}

interface CaptionResponse {
  captions: string[];
}

export async function POST(request: Request) {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return unauthorizedResponse();
  }

  try {
    const body = (await request.json()) as CaptionRequestBody;
    const platform = asPlatform(body.platform);
    const tone = asTone(body.tone);

    if (!body.topic?.trim()) {
      return badRequest("Topic is required");
    }

    if (!platform || !tone) {
      return badRequest("Invalid platform or tone");
    }

    const anthropic = createAnthropicClient();
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 600,
      system: buildCaptionSystemPrompt(platform, tone, body.topic.trim()),
      messages: [
        {
          role: "user",
          content: `Topic: ${body.topic.trim()}`,
        },
      ],
    });

    const parsed = parseJsonObject<CaptionResponse>(extractTextFromMessage(response.content));

    if (!Array.isArray(parsed.captions) || parsed.captions.length !== 3) {
      return apiResponse<ApiResponse<CaptionResponse>>(
        { data: null, error: "Invalid AI caption response" },
      );
    }

    return apiResponse({ data: { captions: parsed.captions }, error: null });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to generate AI captions";

    return apiResponse<CaptionResponse>({ data: null, error: message });
  }
}

function buildCaptionSystemPrompt(
  platform: Platform,
  tone: Tone,
  topic: string,
): string {
  return `You are an expert social media copywriter. Generate 3 distinct engaging captions for ${platform} about: ${topic}. Tone: ${tone}. Max chars: twitter=280, instagram=2200, linkedin=3000, tiktok=2200, facebook=2000, pinterest=500. Start each caption differently. Include relevant emojis. Return ONLY valid JSON with no markdown: {"captions":["caption1","caption2","caption3"]}`;
}
