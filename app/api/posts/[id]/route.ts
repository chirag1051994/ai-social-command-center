import { getAuthenticatedUserId, unauthorizedResponse } from "@/lib/api/auth";
import { apiResponse } from "@/lib/api/responses";
import {
  deletePost,
  getPostById,
  updatePost,
} from "@/lib/services/posts.service";
import type { Post } from "@/lib/types";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return unauthorizedResponse();
  }

  const { id } = await context.params;
  const result = await getPostById(id, userId);
  return apiResponse(result);
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return unauthorizedResponse();
  }

  const body = (await request.json()) as Partial<Post>;
  const { id } = await context.params;
  const result = await updatePost(id, userId, body);
  return apiResponse(result);
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return unauthorizedResponse();
  }

  const { id } = await context.params;
  const result = await deletePost(id, userId);
  return apiResponse(result);
}
