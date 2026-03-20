import { createClient } from "@/lib/supabase/server";
import type { ApiResponse, Post, PostStatus } from "@/lib/types";

import {
  ensurePlatforms,
  ensurePostContent,
  failure,
  normalizeStringArray,
  success,
  toPost,
} from "@/lib/services/shared";

interface PostFilters {
  status?: PostStatus;
  limit?: number;
  offset?: number;
}

export async function getPosts(
  userId: string,
  filters?: PostFilters,
): Promise<ApiResponse<Post[]>> {
  try {
    const supabase = await createClient();
    let query = supabase
      .from("posts")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (filters?.status) {
      query = query.eq("status", filters.status);
    }

    if (typeof filters?.offset === "number" && typeof filters?.limit === "number") {
      query = query.range(filters.offset, filters.offset + filters.limit - 1);
    } else if (typeof filters?.limit === "number") {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;

    if (error) {
      return failure(error);
    }

    return success((data as Post[] | null)?.map(toPost) ?? []);
  } catch (error) {
    return failure(error);
  }
}

export async function getPostById(
  id: string,
  userId: string,
): Promise<ApiResponse<Post>> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .eq("id", id)
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      return failure(error);
    }

    if (!data) {
      return { data: null, error: "Post not found" };
    }

    return success(toPost(data as Post));
  } catch (error) {
    return failure(error);
  }
}

export async function createPost(
  userId: string,
  data: Omit<Post, "id" | "user_id" | "created_at" | "updated_at">,
): Promise<ApiResponse<Post>> {
  try {
    const supabase = await createClient();
    const payload = {
      user_id: userId,
      campaign_id: data.campaign_id,
      content: ensurePostContent(data.content),
      media_urls: normalizeStringArray(data.media_urls),
      platforms: ensurePlatforms(data.platforms),
      hashtags: normalizeStringArray(data.hashtags),
      status: data.status,
      scheduled_at: data.scheduled_at,
      published_at: data.published_at,
      ai_generated: data.ai_generated,
    };

    const { data: post, error } = await supabase
      .from("posts")
      .insert(payload)
      .select("*")
      .single();

    if (error) {
      return failure(error);
    }

    return success(toPost(post as Post));
  } catch (error) {
    return failure(error);
  }
}

export async function updatePost(
  id: string,
  userId: string,
  data: Partial<Post>,
): Promise<ApiResponse<Post>> {
  try {
    const supabase = await createClient();
    const payload: Partial<Post> = {};

    if (typeof data.content === "string") {
      payload.content = ensurePostContent(data.content);
    }

    if (data.platforms) {
      payload.platforms = ensurePlatforms(data.platforms);
    }

    if (data.media_urls) {
      payload.media_urls = normalizeStringArray(data.media_urls);
    }

    if (data.hashtags) {
      payload.hashtags = normalizeStringArray(data.hashtags);
    }

    if ("campaign_id" in data) {
      payload.campaign_id = data.campaign_id ?? null;
    }

    if ("status" in data && data.status) {
      payload.status = data.status;
    }

    if ("scheduled_at" in data) {
      payload.scheduled_at = data.scheduled_at ?? null;
    }

    if ("published_at" in data) {
      payload.published_at = data.published_at ?? null;
    }

    if (typeof data.ai_generated === "boolean") {
      payload.ai_generated = data.ai_generated;
    }

    const { data: post, error } = await supabase
      .from("posts")
      .update(payload)
      .eq("id", id)
      .eq("user_id", userId)
      .select("*")
      .maybeSingle();

    if (error) {
      return failure(error);
    }

    if (!post) {
      return { data: null, error: "Post not found" };
    }

    return success(toPost(post as Post));
  } catch (error) {
    return failure(error);
  }
}

export async function deletePost(
  id: string,
  userId: string,
): Promise<ApiResponse<null>> {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("posts")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) {
      return failure(error);
    }

    return success(null);
  } catch (error) {
    return failure(error);
  }
}

export async function getPostsByDateRange(
  userId: string,
  start: string,
  end: string,
): Promise<ApiResponse<Post[]>> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .eq("user_id", userId)
      .gte("scheduled_at", start)
      .lte("scheduled_at", end)
      .order("scheduled_at", { ascending: true });

    if (error) {
      return failure(error);
    }

    return success((data as Post[] | null)?.map(toPost) ?? []);
  } catch (error) {
    return failure(error);
  }
}
