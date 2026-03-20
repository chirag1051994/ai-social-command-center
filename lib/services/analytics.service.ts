import { subDays } from "date-fns";

import { createClient } from "@/lib/supabase/server";
import { getPostById } from "@/lib/services/posts.service";
import { failure, success, toPost, toPostAnalytics } from "@/lib/services/shared";
import type {
  AnalyticsSummary,
  ApiResponse,
  DashboardStats,
  Platform,
  Post,
  PostAnalytics,
} from "@/lib/types";

interface PostAnalyticsWithPost extends PostAnalytics {
  posts: Post | null;
}

interface SocialAccountOwnerLink {
  social_accounts: {
    user_id: string;
  } | null;
}

function startDateForWindow(days: 7 | 30 | 90): string {
  return subDays(new Date(), days - 1).toISOString();
}

export async function getDashboardStats(
  userId: string,
): Promise<ApiResponse<DashboardStats>> {
  try {
    const supabase = await createClient();

    const [
      totalPostsResult,
      scheduledPostsResult,
      publishedPostsResult,
      unreadMessagesResult,
      connectedAccountsResult,
      reachRowsResult,
    ] = await Promise.all([
      supabase.from("posts").select("*", { count: "exact", head: true }).eq("user_id", userId),
      supabase
        .from("posts")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("status", "scheduled"),
      supabase
        .from("posts")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("status", "published"),
      supabase
        .from("inbox_messages")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("is_read", false),
      supabase
        .from("social_accounts")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("is_connected", true),
      supabase
        .from("post_analytics")
        .select("reach, posts!inner(user_id)")
        .eq("posts.user_id", userId),
    ]);

    const errors = [
      totalPostsResult.error,
      scheduledPostsResult.error,
      publishedPostsResult.error,
      unreadMessagesResult.error,
      connectedAccountsResult.error,
      reachRowsResult.error,
    ].filter(Boolean);

    if (errors.length > 0) {
      return failure(errors[0]);
    }

    const totalReach = ((reachRowsResult.data as Array<{ reach: number }> | null) ?? []).reduce(
      (sum, row) => sum + row.reach,
      0,
    );

    return success({
      totalPosts: totalPostsResult.count ?? 0,
      scheduledPosts: scheduledPostsResult.count ?? 0,
      publishedPosts: publishedPostsResult.count ?? 0,
      totalReach,
      unreadMessages: unreadMessagesResult.count ?? 0,
      connectedAccounts: connectedAccountsResult.count ?? 0,
    });
  } catch (error) {
    return failure(error);
  }
}

export async function getAnalyticsSummary(
  userId: string,
  days: 7 | 30 | 90,
): Promise<ApiResponse<AnalyticsSummary>> {
  try {
    const supabase = await createClient();
    const windowStart = startDateForWindow(days);

    const { data, error } = await supabase
      .from("post_analytics")
      .select("*, posts!inner(*)")
      .eq("posts.user_id", userId)
      .gte("recorded_at", windowStart)
      .order("recorded_at", { ascending: true });

    if (error) {
      return failure(error);
    }

    const rows = (data as PostAnalyticsWithPost[] | null) ?? [];
    const totalImpressions = rows.reduce((sum, row) => sum + row.impressions, 0);
    const totalReach = rows.reduce((sum, row) => sum + row.reach, 0);
    const totalEngagements = rows.reduce(
      (sum, row) => sum + row.likes + row.comments + row.shares + row.clicks,
      0,
    );
    const avgEngagementRate =
      rows.length > 0
        ? Number(
            (
              rows.reduce((sum, row) => sum + row.engagement_rate, 0) / rows.length
            ).toFixed(2),
          )
        : 0;

    const platformCounts = rows.reduce<Record<Platform, number>>(
      (accumulator, row) => {
        accumulator[row.platform] += 1;
        return accumulator;
      },
      {
        twitter: 0,
        instagram: 0,
        linkedin: 0,
        facebook: 0,
        tiktok: 0,
        pinterest: 0,
      },
    );

    const platformBreakdown = (Object.entries(platformCounts) as Array<[Platform, number]>)
      .filter(([, count]) => count > 0)
      .map(([platform, count]) => ({
        platform,
        count,
        percentage: rows.length > 0 ? Number(((count / rows.length) * 100).toFixed(2)) : 0,
      }));

    const dailyMap = rows.reduce<Record<string, { impressions: number; reach: number }>>(
      (accumulator, row) => {
        const day = row.recorded_at.slice(0, 10);
        const current = accumulator[day] ?? { impressions: 0, reach: 0 };
        current.impressions += row.impressions;
        current.reach += row.reach;
        accumulator[day] = current;
        return accumulator;
      },
      {},
    );

    const dailyImpressions = Object.entries(dailyMap)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([date, metrics]) => ({
        date,
        impressions: metrics.impressions,
        reach: metrics.reach,
      }));

    const postMap = new Map<string, Post & { analytics: PostAnalytics[] }>();

    rows.forEach((row) => {
      if (!row.posts) {
        return;
      }

      const existing = postMap.get(row.post_id);

      if (existing) {
        existing.analytics.push(toPostAnalytics(row));
        return;
      }

      postMap.set(row.post_id, {
        ...toPost(row.posts),
        analytics: [toPostAnalytics(row)],
      });
    });

    const topPosts = Array.from(postMap.values())
      .sort((left, right) => {
        const leftAverage =
          left.analytics.reduce((sum, item) => sum + item.engagement_rate, 0) /
          left.analytics.length;
        const rightAverage =
          right.analytics.reduce((sum, item) => sum + item.engagement_rate, 0) /
          right.analytics.length;

        return rightAverage - leftAverage;
      })
      .slice(0, 5);

    return success({
      totalImpressions,
      totalReach,
      totalEngagements,
      avgEngagementRate,
      platformBreakdown,
      dailyImpressions,
      topPosts,
    });
  } catch (error) {
    return failure(error);
  }
}

export async function getPostWithAnalytics(
  postId: string,
  userId: string,
): Promise<ApiResponse<Post & { analytics: PostAnalytics[] }>> {
  try {
    const postResult = await getPostById(postId, userId);

    if (postResult.error || !postResult.data) {
      return { data: null, error: postResult.error ?? "Post not found" };
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("post_analytics")
      .select("*, posts!inner(user_id)")
      .eq("post_id", postId)
      .eq("posts.user_id", userId)
      .order("recorded_at", { ascending: true });

    if (error) {
      return failure(error);
    }

    return success({
      ...postResult.data,
      analytics: ((data as Array<PostAnalytics & SocialAccountOwnerLink> | null) ?? []).map(
        (row) => toPostAnalytics(row as PostAnalytics),
      ),
    });
  } catch (error) {
    return failure(error);
  }
}
