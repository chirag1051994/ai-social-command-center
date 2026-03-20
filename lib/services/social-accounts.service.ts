import { createClient } from "@/lib/supabase/server";
import type { ApiResponse, SocialAccount } from "@/lib/types";

import {
  failure,
  normalizeOptionalString,
  normalizeRequiredString,
  success,
  toSocialAccount,
} from "@/lib/services/shared";

export async function getSocialAccounts(
  userId: string,
): Promise<ApiResponse<SocialAccount[]>> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("social_accounts")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      return failure(error);
    }

    return success((data as SocialAccount[] | null)?.map(toSocialAccount) ?? []);
  } catch (error) {
    return failure(error);
  }
}

export async function createSocialAccount(
  userId: string,
  data: Omit<SocialAccount, "id" | "user_id" | "created_at">,
): Promise<ApiResponse<SocialAccount>> {
  try {
    const supabase = await createClient();
    const payload = {
      user_id: userId,
      platform: data.platform,
      account_name: normalizeRequiredString(data.account_name, "Account name"),
      account_handle: normalizeRequiredString(data.account_handle, "Account handle"),
      avatar_url: normalizeOptionalString(data.avatar_url),
      followers_count: Math.max(0, data.followers_count),
      is_connected: data.is_connected,
    };

    const { data: account, error } = await supabase
      .from("social_accounts")
      .insert(payload)
      .select("*")
      .single();

    if (error) {
      return failure(error);
    }

    return success(toSocialAccount(account as SocialAccount));
  } catch (error) {
    return failure(error);
  }
}

export async function updateSocialAccount(
  id: string,
  userId: string,
  data: Partial<SocialAccount>,
): Promise<ApiResponse<SocialAccount>> {
  try {
    const supabase = await createClient();
    const payload: Partial<SocialAccount> = {};

    if (typeof data.account_name === "string") {
      payload.account_name = normalizeRequiredString(data.account_name, "Account name");
    }

    if (typeof data.account_handle === "string") {
      payload.account_handle = normalizeRequiredString(
        data.account_handle,
        "Account handle",
      );
    }

    if ("avatar_url" in data) {
      payload.avatar_url = normalizeOptionalString(data.avatar_url);
    }

    if (typeof data.followers_count === "number") {
      payload.followers_count = Math.max(0, data.followers_count);
    }

    if (typeof data.is_connected === "boolean") {
      payload.is_connected = data.is_connected;
    }

    if (data.platform) {
      payload.platform = data.platform;
    }

    const { data: account, error } = await supabase
      .from("social_accounts")
      .update(payload)
      .eq("id", id)
      .eq("user_id", userId)
      .select("*")
      .maybeSingle();

    if (error) {
      return failure(error);
    }

    if (!account) {
      return { data: null, error: "Social account not found" };
    }

    return success(toSocialAccount(account as SocialAccount));
  } catch (error) {
    return failure(error);
  }
}

export async function deleteSocialAccount(
  id: string,
  userId: string,
): Promise<ApiResponse<null>> {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("social_accounts")
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
