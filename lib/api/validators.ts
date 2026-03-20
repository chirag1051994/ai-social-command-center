import type { MessageType, Platform, PostStatus, Tone } from "@/lib/types";

const PLATFORM_SET = new Set<Platform>([
  "twitter",
  "instagram",
  "linkedin",
  "facebook",
  "tiktok",
  "pinterest",
]);

const POST_STATUS_SET = new Set<PostStatus>([
  "draft",
  "scheduled",
  "published",
  "failed",
]);

const MESSAGE_TYPE_SET = new Set<MessageType>(["dm", "mention", "comment", "reply"]);

const TONE_SET = new Set<Tone>([
  "professional",
  "casual",
  "humorous",
  "inspirational",
  "promotional",
]);

export function asPlatform(value: string | null): Platform | undefined {
  if (!value || !PLATFORM_SET.has(value as Platform)) {
    return undefined;
  }

  return value as Platform;
}

export function asPostStatus(value: string | null): PostStatus | undefined {
  if (!value || !POST_STATUS_SET.has(value as PostStatus)) {
    return undefined;
  }

  return value as PostStatus;
}

export function asMessageType(value: string | null): MessageType | undefined {
  if (!value || !MESSAGE_TYPE_SET.has(value as MessageType)) {
    return undefined;
  }

  return value as MessageType;
}

export function asTone(value: string): Tone | undefined {
  if (!TONE_SET.has(value as Tone)) {
    return undefined;
  }

  return value as Tone;
}

export function asWindow(value: string | null): 7 | 30 | 90 | undefined {
  if (value === "7" || value === "30" || value === "90") {
    return Number(value) as 7 | 30 | 90;
  }

  return undefined;
}

export function asOptionalBoolean(value: string | null): boolean | undefined {
  if (value === "true") {
    return true;
  }

  if (value === "false") {
    return false;
  }

  return undefined;
}

export function asOptionalNumber(value: string | null): number | undefined {
  if (!value) {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}
