import { createClient } from "@/lib/supabase/server";
import type { ApiResponse, Profile } from "@/lib/types";

import {
  failure,
  maybeSingle,
  normalizeOptionalString,
  success,
  toProfile,
} from "@/lib/services/shared";

export async function getProfile(userId: string): Promise<ApiResponse<Profile>> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      return failure(error);
    }

    return maybeSingle(data ? toProfile(data as Profile) : null, "Profile not found");
  } catch (error) {
    return failure(error);
  }
}

export async function upsertProfile(
  userId: string,
  data: Partial<Profile>,
): Promise<ApiResponse<Profile>> {
  try {
    const supabase = await createClient();
    const payload = {
      id: userId,
      full_name: normalizeOptionalString(data.full_name),
      avatar_url: normalizeOptionalString(data.avatar_url),
      company_name: normalizeOptionalString(data.company_name),
      plan: data.plan,
      timezone: normalizeOptionalString(data.timezone) ?? "UTC",
    };

    const { data: profile, error } = await supabase
      .from("profiles")
      .upsert(payload, { onConflict: "id" })
      .select("*")
      .single();

    if (error) {
      return failure(error);
    }

    return success(toProfile(profile as Profile));
  } catch (error) {
    return failure(error);
  }
}
