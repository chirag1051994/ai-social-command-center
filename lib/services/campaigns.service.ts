import { createClient } from "@/lib/supabase/server";
import type { ApiResponse, Campaign } from "@/lib/types";

import {
  failure,
  normalizeOptionalString,
  normalizeRequiredString,
  success,
  toCampaign,
} from "@/lib/services/shared";

export async function getCampaigns(
  userId: string,
): Promise<ApiResponse<Campaign[]>> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("campaigns")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      return failure(error);
    }

    return success((data as Campaign[] | null)?.map(toCampaign) ?? []);
  } catch (error) {
    return failure(error);
  }
}

export async function createCampaign(
  userId: string,
  data: Omit<Campaign, "id" | "user_id" | "created_at">,
): Promise<ApiResponse<Campaign>> {
  try {
    const supabase = await createClient();
    const payload = {
      user_id: userId,
      name: normalizeRequiredString(data.name, "Campaign name"),
      description: normalizeOptionalString(data.description),
      color: normalizeRequiredString(data.color, "Campaign color"),
      start_date: data.start_date,
      end_date: data.end_date,
      status: data.status,
    };

    const { data: campaign, error } = await supabase
      .from("campaigns")
      .insert(payload)
      .select("*")
      .single();

    if (error) {
      return failure(error);
    }

    return success(toCampaign(campaign as Campaign));
  } catch (error) {
    return failure(error);
  }
}

export async function deleteCampaign(
  id: string,
  userId: string,
): Promise<ApiResponse<null>> {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("campaigns")
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
