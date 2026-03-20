import { NextResponse } from "next/server";

import type { ApiResponse } from "@/lib/types";

function statusForError(error: string): number {
  const normalized = error.toLowerCase();

  if (normalized.includes("unauthorized")) {
    return 401;
  }

  if (normalized.includes("not found")) {
    return 404;
  }

  if (
    normalized.includes("required") ||
    normalized.includes("invalid") ||
    normalized.includes("at least") ||
    normalized.includes("must") ||
    normalized.includes("json")
  ) {
    return 400;
  }

  return 500;
}

export function apiResponse<T>(
  result: ApiResponse<T>,
  successStatus = 200,
) {
  const status = result.error ? statusForError(result.error) : successStatus;
  return NextResponse.json(result, { status });
}

export function badRequest(message: string) {
  return NextResponse.json<ApiResponse<null>>(
    { data: null, error: message },
    { status: 400 },
  );
}
