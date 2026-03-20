import { createClient } from "@/lib/supabase/server";
import type {
  ApiResponse,
  Campaign,
  InboxMessage,
  Platform,
  Post,
  PostAnalytics,
  Profile,
  SocialAccount,
} from "@/lib/types";

export type ServiceSupabase = Awaited<ReturnType<typeof createClient>>;

export function success<T>(data: T): ApiResponse<T> {
  return { data, error: null };
}

export function failure<T>(error: unknown): ApiResponse<T> {
  const message = error instanceof Error ? error.message : "Unexpected server error";
  return { data: null, error: message };
}

export function trimString(value: string): string {
  return value.trim();
}

export function normalizeOptionalString(value: string | null | undefined): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function normalizeRequiredString(value: string, fieldName: string): string {
  const trimmed = trimString(value);

  if (!trimmed) {
    throw new Error(`${fieldName} is required`);
  }

  return trimmed;
}

export function normalizeStringArray(values: string[] | undefined): string[] {
  if (!values) {
    return [];
  }

  return values
    .map((value) => value.trim())
    .filter((value) => value.length > 0);
}

export function ensurePostContent(content: string): string {
  const trimmed = normalizeRequiredString(content, "Content");

  if (trimmed.length > 3000) {
    throw new Error("Content must be 3000 characters or fewer");
  }

  return trimmed;
}

export function ensurePlatforms(platforms: Platform[]): Platform[] {
  if (platforms.length === 0) {
    throw new Error("At least one platform is required");
  }

  return platforms;
}

export function maybeSingle<T>(
  row: T | null,
  emptyMessage: string,
): ApiResponse<T> {
  if (!row) {
    return { data: null, error: emptyMessage };
  }

  return success(row);
}

export function toProfile(row: Profile): Profile {
  return row;
}

export function toSocialAccount(row: SocialAccount): SocialAccount {
  return row;
}

export function toCampaign(row: Campaign): Campaign {
  return row;
}

export function toPost(row: Post): Post {
  return {
    ...row,
    media_urls: row.media_urls ?? [],
    platforms: row.platforms ?? [],
    hashtags: row.hashtags ?? [],
  };
}

export function toPostAnalytics(row: PostAnalytics): PostAnalytics {
  return row;
}

export function toInboxMessage(row: InboxMessage): InboxMessage {
  return row;
}
