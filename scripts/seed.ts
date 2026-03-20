import { addDays, subDays, subHours } from "date-fns";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import type { CampaignStatus, MessageType, Platform, PostStatus, Sentiment } from "@/lib/types";

interface DemoSocialAccountSeed {
  platform: Platform;
  account_name: string;
  account_handle: string;
  followers_count: number;
}

interface DemoCampaignSeed {
  name: string;
  description: string;
  color: string;
  status: CampaignStatus;
  start_date: string | null;
  end_date: string | null;
}

interface DemoPostSeed {
  content: string;
  platforms: Platform[];
  hashtags: string[];
  status: PostStatus;
  ai_generated: boolean;
  dayOffset: number | null;
  campaignIndex: number | null;
}

interface DemoInboxSeed {
  socialPlatform: Platform;
  message_type: MessageType;
  sender_name: string;
  sender_handle: string;
  content: string;
  is_read: boolean;
  is_replied: boolean;
  sentiment: Sentiment;
  receivedOffsetHours: number;
}

interface InsertedSocialAccount {
  id: string;
  platform: Platform;
  followers_count: number;
}

interface InsertedCampaign {
  id: string;
}

interface InsertedPost {
  id: string;
  status: PostStatus;
  platforms: Platform[];
  published_at: string | null;
}

function requiredEnv(name: string): string {
  const value = process.env[name];

  if (!value || value.startsWith("REPLACE_WITH_")) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

async function main() {
  const supabaseUrl = requiredEnv("NEXT_PUBLIC_SUPABASE_URL");
  const serviceRoleKey = requiredEnv("SUPABASE_SERVICE_ROLE_KEY");

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const demoEmail = "demo@phootsuite.com";
  const demoPassword = "Demo@1234";

  const { data: userList, error: listError } = await supabase.auth.admin.listUsers();

  if (listError) {
    throw listError;
  }

  let demoUser = userList.users.find((user) => user.email === demoEmail) ?? null;

  if (!demoUser) {
    const { data: createdUser, error: createUserError } = await supabase.auth.admin.createUser({
      email: demoEmail,
      password: demoPassword,
      email_confirm: true,
      user_metadata: {
        full_name: "Alex Johnson",
        company_name: "Brandify Agency",
      },
    });

    if (createUserError || !createdUser.user) {
      throw createUserError ?? new Error("Failed to create demo user");
    }

    demoUser = createdUser.user;
  }

  const demoUserId = demoUser.id;

  await clearExistingData(supabase, demoUserId);

  const { error: profileError } = await supabase.from("profiles").upsert({
    id: demoUserId,
    full_name: "Alex Johnson",
    company_name: "Brandify Agency",
    avatar_url: null,
    plan: "pro",
    timezone: "Asia/Kolkata",
  });

  if (profileError) {
    throw profileError;
  }

  const socialAccountsSeed: DemoSocialAccountSeed[] = [
    {
      platform: "twitter",
      account_name: "Brandify Agency",
      account_handle: "brandifyagency",
      followers_count: 24300,
    },
    {
      platform: "instagram",
      account_name: "Brandify Agency",
      account_handle: "brandify.agency",
      followers_count: 18750,
    },
    {
      platform: "linkedin",
      account_name: "Brandify Agency",
      account_handle: "brandify-agency",
      followers_count: 8920,
    },
    {
      platform: "facebook",
      account_name: "Brandify Agency",
      account_handle: "BrandifyAgency",
      followers_count: 12400,
    },
    {
      platform: "tiktok",
      account_name: "Brandify Agency",
      account_handle: "brandifyagency",
      followers_count: 31200,
    },
    {
      platform: "pinterest",
      account_name: "Brandify Agency",
      account_handle: "brandifyagency",
      followers_count: 5600,
    },
  ];

  const { data: socialAccounts, error: socialAccountsError } = await supabase
    .from("social_accounts")
    .insert(
      socialAccountsSeed.map((account) => ({
        user_id: demoUserId,
        ...account,
        avatar_url: null,
        is_connected: true,
      })),
    )
    .select("*");

  if (socialAccountsError || !socialAccounts) {
    throw socialAccountsError ?? new Error("Failed to seed social accounts");
  }
  const insertedSocialAccounts = socialAccounts as InsertedSocialAccount[];

  const campaignsSeed: DemoCampaignSeed[] = [
    {
      name: "Q1 Product Launch",
      description: "Coordinated multi-platform launch campaign for the flagship AI workspace release.",
      color: "#6366f1",
      status: "active",
      start_date: subDays(new Date(), 14).toISOString().slice(0, 10),
      end_date: addDays(new Date(), 30).toISOString().slice(0, 10),
    },
    {
      name: "Brand Awareness March",
      description: "March storytelling campaign focused on agency proof points and client results.",
      color: "#f59e0b",
      status: "active",
      start_date: subDays(new Date(), 9).toISOString().slice(0, 10),
      end_date: addDays(new Date(), 12).toISOString().slice(0, 10),
    },
    {
      name: "Easter Sale 2026",
      description: "Draft creative pipeline for Easter promotional bundles and limited offers.",
      color: "#10b981",
      status: "draft",
      start_date: addDays(new Date(), 6).toISOString().slice(0, 10),
      end_date: addDays(new Date(), 16).toISOString().slice(0, 10),
    },
  ];

  const { data: campaigns, error: campaignsError } = await supabase
    .from("campaigns")
    .insert(
      campaignsSeed.map((campaign) => ({
        user_id: demoUserId,
        ...campaign,
      })),
    )
    .select("*");

  if (campaignsError || !campaigns) {
    throw campaignsError ?? new Error("Failed to seed campaigns");
  }
  const insertedCampaigns = campaigns as InsertedCampaign[];

  const postsSeed: DemoPostSeed[] = [
    {
      content:
        "Launch week momentum is real. Our client success team shaved 11 hours off weekly reporting by moving every approval and scheduled publish into one workspace.",
      platforms: ["linkedin", "twitter"],
      hashtags: ["#AgencyOps", "#SocialMediaManagement", "#AIWorkflows"],
      status: "published",
      ai_generated: false,
      dayOffset: -5,
      campaignIndex: 0,
    },
    {
      content:
        "Creative teams move faster when strategy, copy, and scheduling live in the same room. Today we are sharing the exact operating rhythm our agency uses for 5 client brands.",
      platforms: ["instagram", "facebook"],
      hashtags: ["#ContentStrategy", "#MarketingAgency", "#GrowthSystems"],
      status: "published",
      ai_generated: false,
      dayOffset: -4,
      campaignIndex: 1,
    },
    {
      content:
        "A strong publishing system is less about volume and more about repeatable clarity. Here are the three workflow checkpoints we never skip before a client campaign goes live.",
      platforms: ["linkedin"],
      hashtags: ["#MarketingOperations", "#AgencyLife", "#CampaignPlanning"],
      status: "published",
      ai_generated: false,
      dayOffset: -3,
      campaignIndex: 1,
    },
    {
      content:
        "TikTok reach climbed after we shifted from isolated content ideas to a real content calendar. Weekly review loops changed everything for our retail client.",
      platforms: ["tiktok", "instagram"],
      hashtags: ["#TikTokMarketing", "#RetailGrowth", "#ContentCalendar"],
      status: "published",
      ai_generated: false,
      dayOffset: -2,
      campaignIndex: 0,
    },
    {
      content:
        "Pinterest is still one of the most underused intent channels for product discovery. We mapped our top-performing creative themes into a weekly pinning engine.",
      platforms: ["pinterest", "facebook"],
      hashtags: ["#PinterestMarketing", "#EcommerceGrowth", "#CreativeSystems"],
      status: "published",
      ai_generated: false,
      dayOffset: -1,
      campaignIndex: 1,
    },
    {
      content:
        "Tomorrow we are revealing the internal review checklist our strategists use before every product-launch sequence goes live. It keeps messaging sharp and approvals fast.",
      platforms: ["linkedin", "twitter"],
      hashtags: ["#ProductLaunch", "#AgencySystems", "#SocialPlanning"],
      status: "scheduled",
      ai_generated: true,
      dayOffset: 1,
      campaignIndex: 0,
    },
    {
      content:
        "Fresh campaign sprint, cleaner approvals, zero tab chaos. Our next walkthrough covers how we batch creative, captions, and analytics in one weekly operating block.",
      platforms: ["instagram", "facebook"],
      hashtags: ["#CreativeOps", "#MarketingWorkflow", "#AgencyScale"],
      status: "scheduled",
      ai_generated: true,
      dayOffset: 2,
      campaignIndex: 0,
    },
    {
      content:
        "We are lining up a carousel that breaks down client reporting templates every agency can adapt for monthly stakeholder updates.",
      platforms: ["linkedin", "instagram"],
      hashtags: ["#ClientReporting", "#SocialAnalytics", "#AgencyTemplates"],
      status: "scheduled",
      ai_generated: false,
      dayOffset: 3,
      campaignIndex: 1,
    },
    {
      content:
        "Drafting a short-form series around the moments agencies lose scheduling momentum and how to recover without scrambling.",
      platforms: ["twitter", "tiktok"],
      hashtags: ["#ContentOps", "#ShortFormVideo", "#AgencyExecution"],
      status: "draft",
      ai_generated: false,
      dayOffset: null,
      campaignIndex: 2,
    },
    {
      content:
        "Draft concept: Easter sale countdown content for brands that need urgency without discount fatigue. Messaging still in workshop mode.",
      platforms: ["facebook", "instagram", "pinterest"],
      hashtags: ["#SeasonalMarketing", "#EasterCampaign", "#BrandStrategy"],
      status: "draft",
      ai_generated: false,
      dayOffset: null,
      campaignIndex: 2,
    },
  ];

  const { data: posts, error: postsError } = await supabase
    .from("posts")
    .insert(
      postsSeed.map((post) => {
        const scheduledAt =
          post.dayOffset !== null ? addDays(new Date(), post.dayOffset).toISOString() : null;
        const publishedAt =
          post.status === "published" && post.dayOffset !== null
            ? addDays(new Date(), post.dayOffset).toISOString()
            : null;

        return {
          user_id: demoUserId,
          campaign_id:
            post.campaignIndex !== null ? insertedCampaigns[post.campaignIndex]?.id ?? null : null,
          content: post.content,
          media_urls: [],
          platforms: post.platforms,
          hashtags: post.hashtags,
          status: post.status,
          scheduled_at: scheduledAt,
          published_at: publishedAt,
          ai_generated: post.ai_generated,
        };
      }),
    )
    .select("*");

  if (postsError || !posts) {
    throw postsError ?? new Error("Failed to seed posts");
  }
  const insertedPosts = posts as InsertedPost[];

  const publishedPosts = insertedPosts.filter((post) => post.status === "published");
  const postAnalyticsRows = publishedPosts.flatMap((post, postIndex) =>
    post.platforms.map((platform, platformIndex) => ({
      post_id: post.id,
      platform,
      impressions: 2200 + postIndex * 1500 + platformIndex * 800,
      reach: 1700 + postIndex * 1200 + platformIndex * 600,
      likes: 90 + postIndex * 55 + platformIndex * 24,
      comments: 18 + postIndex * 7 + platformIndex * 3,
      shares: 12 + postIndex * 5 + platformIndex * 2,
      clicks: 20 + postIndex * 6 + platformIndex * 4,
      engagement_rate: Number((2.1 + postIndex * 0.7 + platformIndex * 0.28).toFixed(2)),
      recorded_at: post.published_at ?? new Date().toISOString(),
    })),
  );

  const { error: postAnalyticsError } = await supabase
    .from("post_analytics")
    .insert(postAnalyticsRows);

  if (postAnalyticsError) {
    throw postAnalyticsError;
  }

  const accountAnalyticsRows = insertedSocialAccounts.flatMap((account, accountIndex) =>
    Array.from({ length: 30 }).map((_, dayIndex) => ({
      social_account_id: account.id,
      date: subDays(new Date(), 29 - dayIndex).toISOString().slice(0, 10),
      followers: account.followers_count - (29 - dayIndex) * (15 + (accountIndex % 4)),
      following: 210 + accountIndex * 12,
      impressions: 1100 + dayIndex * 70 + accountIndex * 110,
      reach: 820 + dayIndex * 55 + accountIndex * 95,
      profile_visits: 90 + dayIndex * 5 + accountIndex * 8,
      new_followers: 15 + (dayIndex % 6) + accountIndex,
    })),
  );

  const { error: accountAnalyticsError } = await supabase
    .from("account_analytics")
    .insert(accountAnalyticsRows);

  if (accountAnalyticsError) {
    throw accountAnalyticsError;
  }

  const socialAccountMap = Object.fromEntries(
    insertedSocialAccounts.map((account) => [account.platform, account.id]),
  ) as Record<Platform, string>;

  const inboxSeed: DemoInboxSeed[] = [
    {
      socialPlatform: "twitter",
      message_type: "mention",
      sender_name: "Riya Shah",
      sender_handle: "@riyashahmedia",
      content: "The agency workflow thread was sharp. Are you planning a deeper breakdown of how your team handles approvals?",
      is_read: false,
      is_replied: false,
      sentiment: "positive",
      receivedOffsetHours: 2,
    },
    {
      socialPlatform: "instagram",
      message_type: "dm",
      sender_name: "Urban Loom",
      sender_handle: "@urbanloom.co",
      content: "We are exploring a new agency partner this quarter. Can your team handle multi-market campaign scheduling?",
      is_read: false,
      is_replied: false,
      sentiment: "positive",
      receivedOffsetHours: 4,
    },
    {
      socialPlatform: "linkedin",
      message_type: "comment",
      sender_name: "Maya Collins",
      sender_handle: "maya-collins-growth",
      content: "This is exactly the kind of operations thinking most social teams skip. Appreciate the level of detail here.",
      is_read: true,
      is_replied: false,
      sentiment: "positive",
      receivedOffsetHours: 6,
    },
    {
      socialPlatform: "facebook",
      message_type: "reply",
      sender_name: "Brandcraft Studio",
      sender_handle: "brandcraftstudio",
      content: "Helpful framework. Would love to see how you adapt it for retail clients with daily publishing volume.",
      is_read: true,
      is_replied: true,
      sentiment: "neutral",
      receivedOffsetHours: 8,
    },
    {
      socialPlatform: "twitter",
      message_type: "mention",
      sender_name: "Dev Patel",
      sender_handle: "@devpatelwrites",
      content: "Your weekly reporting setup looks solid. Curious whether you also automate stakeholder digests.",
      is_read: false,
      is_replied: false,
      sentiment: "positive",
      receivedOffsetHours: 12,
    },
    {
      socialPlatform: "instagram",
      message_type: "comment",
      sender_name: "Sora Beauty",
      sender_handle: "@sorabeauty",
      content: "The concept is strong, but the reel pacing felt slow in the middle. Tightening the hook could help.",
      is_read: true,
      is_replied: false,
      sentiment: "negative",
      receivedOffsetHours: 16,
    },
    {
      socialPlatform: "linkedin",
      message_type: "dm",
      sender_name: "Nexus Retail",
      sender_handle: "nexus-retail",
      content: "Could you share your team’s process for coordinating campaign calendars across multiple client brands?",
      is_read: false,
      is_replied: false,
      sentiment: "neutral",
      receivedOffsetHours: 20,
    },
    {
      socialPlatform: "facebook",
      message_type: "mention",
      sender_name: "Scale Spark",
      sender_handle: "scalesparkhq",
      content: "Really useful operational point on batching approvals. We implemented a similar checkpoint and saw faster turnaround too.",
      is_read: true,
      is_replied: false,
      sentiment: "positive",
      receivedOffsetHours: 28,
    },
  ];

  const { error: inboxError } = await supabase.from("inbox_messages").insert(
    inboxSeed.map((message) => ({
      user_id: demoUserId,
      social_account_id: socialAccountMap[message.socialPlatform],
      platform: message.socialPlatform,
      message_type: message.message_type,
      sender_name: message.sender_name,
      sender_handle: message.sender_handle,
      sender_avatar: null,
      content: message.content,
      is_read: message.is_read,
      is_replied: message.is_replied,
      sentiment: message.sentiment,
      received_at: subHours(new Date(), message.receivedOffsetHours).toISOString(),
    })),
  );

  if (inboxError) {
    throw inboxError;
  }

  console.log("✅ Seed complete!");
  console.log("  → 6 social accounts");
  console.log("  → 3 campaigns");
  console.log("  → 10 posts (5 published, 3 scheduled, 2 draft)");
  console.log("  → post analytics records");
  console.log("  → 180 account analytics rows");
  console.log("  → 8 inbox messages");
  console.log("  Demo login: demo@phootsuite.com / Demo@1234");
}

async function clearExistingData(
  supabase: SupabaseClient,
  userId: string,
) {
  const { data: posts } = await supabase.from("posts").select("id").eq("user_id", userId);
  const { data: socialAccounts } = await supabase
    .from("social_accounts")
    .select("id")
    .eq("user_id", userId);

  await supabase.from("inbox_messages").delete().eq("user_id", userId);

  if (posts && posts.length > 0) {
    await supabase.from("posts").delete().eq("user_id", userId);
  }

  await supabase.from("campaigns").delete().eq("user_id", userId);

  if (socialAccounts && socialAccounts.length > 0) {
    await supabase.from("social_accounts").delete().eq("user_id", userId);
  }
}

main().catch((error) => {
  console.error("Seed failed:", error instanceof Error ? error.message : error);
  process.exit(1);
});
