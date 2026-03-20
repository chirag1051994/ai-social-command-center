import { createClient } from "@/lib/supabase/server";
import type { ApiResponse, InboxMessage, MessageType, Platform } from "@/lib/types";

import { failure, success, toInboxMessage } from "@/lib/services/shared";

interface MessageFilters {
  type?: MessageType;
  platform?: Platform;
  isRead?: boolean;
}

export async function getMessages(
  userId: string,
  filters?: MessageFilters,
): Promise<ApiResponse<InboxMessage[]>> {
  try {
    const supabase = await createClient();
    let query = supabase
      .from("inbox_messages")
      .select("*")
      .eq("user_id", userId)
      .order("received_at", { ascending: false });

    if (filters?.type) {
      query = query.eq("message_type", filters.type);
    }

    if (filters?.platform) {
      query = query.eq("platform", filters.platform);
    }

    if (typeof filters?.isRead === "boolean") {
      query = query.eq("is_read", filters.isRead);
    }

    const { data, error } = await query;

    if (error) {
      return failure(error);
    }

    return success((data as InboxMessage[] | null)?.map(toInboxMessage) ?? []);
  } catch (error) {
    return failure(error);
  }
}

export async function markMessageRead(
  id: string,
  userId: string,
): Promise<ApiResponse<InboxMessage>> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("inbox_messages")
      .update({ is_read: true })
      .eq("id", id)
      .eq("user_id", userId)
      .select("*")
      .maybeSingle();

    if (error) {
      return failure(error);
    }

    if (!data) {
      return { data: null, error: "Message not found" };
    }

    return success(toInboxMessage(data as InboxMessage));
  } catch (error) {
    return failure(error);
  }
}

export async function markAllRead(userId: string): Promise<ApiResponse<null>> {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("inbox_messages")
      .update({ is_read: true })
      .eq("user_id", userId)
      .eq("is_read", false);

    if (error) {
      return failure(error);
    }

    return success(null);
  } catch (error) {
    return failure(error);
  }
}

export async function getUnreadCount(userId: string): Promise<ApiResponse<number>> {
  try {
    const supabase = await createClient();
    const { count, error } = await supabase
      .from("inbox_messages")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("is_read", false);

    if (error) {
      return failure(error);
    }

    return success(count ?? 0);
  } catch (error) {
    return failure(error);
  }
}
