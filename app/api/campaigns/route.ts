import { getAuthenticatedUserId, unauthorizedResponse } from "@/lib/api/auth";
import { apiResponse } from "@/lib/api/responses";
import {
  createCampaign,
  getCampaigns,
} from "@/lib/services/campaigns.service";
import type { CampaignStatus } from "@/lib/types";

interface CreateCampaignBody {
  name: string;
  description?: string | null;
  color: string;
  start_date?: string | null;
  end_date?: string | null;
  status: CampaignStatus;
}

export async function GET() {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return unauthorizedResponse();
  }

  const result = await getCampaigns(userId);
  return apiResponse(result);
}

export async function POST(request: Request) {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return unauthorizedResponse();
  }

  const body = (await request.json()) as CreateCampaignBody;
  const result = await createCampaign(userId, {
    name: body.name,
    description: body.description ?? null,
    color: body.color,
    start_date: body.start_date ?? null,
    end_date: body.end_date ?? null,
    status: body.status,
  });

  return apiResponse(result, 201);
}
