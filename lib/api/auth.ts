import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import type { ApiResponse } from "@/lib/types";

export async function getAuthenticatedUserId(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return user.id;
}

export function unauthorizedResponse() {
  return NextResponse.json<ApiResponse<null>>(
    { data: null, error: "Unauthorized" },
    { status: 401 },
  );
}
