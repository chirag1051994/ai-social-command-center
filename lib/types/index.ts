export type Platform =
  | "twitter"
  | "instagram"
  | "linkedin"
  | "facebook"
  | "tiktok"
  | "pinterest";

export type PostStatus = "draft" | "scheduled" | "published" | "failed";

export type MessageType = "dm" | "mention" | "comment" | "reply";

export type Sentiment = "positive" | "neutral" | "negative";

export type Plan = "starter" | "pro" | "enterprise";

export type CampaignStatus = "draft" | "active" | "paused" | "completed";

export type Tone =
  | "professional"
  | "casual"
  | "humorous"
  | "inspirational"
  | "promotional";

export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  company_name: string | null;
  plan: Plan;
  timezone: string;
  created_at: string;
  updated_at: string;
}

export interface SocialAccount {
  id: string;
  user_id: string;
  platform: Platform;
  account_name: string;
  account_handle: string;
  avatar_url: string | null;
  followers_count: number;
  is_connected: boolean;
  created_at: string;
}

export interface Campaign {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  color: string;
  start_date: string | null;
  end_date: string | null;
  status: CampaignStatus;
  created_at: string;
}

export interface Post {
  id: string;
  user_id: string;
  campaign_id: string | null;
  content: string;
  media_urls: string[];
  platforms: Platform[];
  hashtags: string[];
  status: PostStatus;
  scheduled_at: string | null;
  published_at: string | null;
  ai_generated: boolean;
  created_at: string;
  updated_at: string;
}

export interface PostAnalytics {
  id: string;
  post_id: string;
  platform: Platform;
  impressions: number;
  reach: number;
  likes: number;
  comments: number;
  shares: number;
  clicks: number;
  engagement_rate: number;
  recorded_at: string;
}

export interface AccountAnalytics {
  id: string;
  social_account_id: string;
  date: string;
  followers: number;
  following: number;
  impressions: number;
  reach: number;
  profile_visits: number;
  new_followers: number;
}

export interface InboxMessage {
  id: string;
  user_id: string;
  social_account_id: string | null;
  platform: Platform;
  message_type: MessageType;
  sender_name: string;
  sender_handle: string | null;
  sender_avatar: string | null;
  content: string;
  is_read: boolean;
  is_replied: boolean;
  sentiment: Sentiment | null;
  received_at: string;
}

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

export interface DashboardStats {
  totalPosts: number;
  scheduledPosts: number;
  publishedPosts: number;
  totalReach: number;
  unreadMessages: number;
  connectedAccounts: number;
}

export interface AnalyticsPlatformBreakdown {
  platform: Platform;
  count: number;
  percentage: number;
}

export interface AnalyticsDailyImpressions {
  date: string;
  impressions: number;
  reach: number;
}

export interface AnalyticsSummary {
  totalImpressions: number;
  totalReach: number;
  totalEngagements: number;
  avgEngagementRate: number;
  platformBreakdown: AnalyticsPlatformBreakdown[];
  dailyImpressions: AnalyticsDailyImpressions[];
  topPosts: Array<Post & { analytics: PostAnalytics[] }>;
}
