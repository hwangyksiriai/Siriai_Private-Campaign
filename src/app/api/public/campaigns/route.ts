import { NextResponse } from "next/server";
import { listCampaigns } from "@/lib/store";

export const runtime = "nodejs";

export async function GET() {
  const campaigns = await listCampaigns();
  return NextResponse.json({ campaigns });
}
