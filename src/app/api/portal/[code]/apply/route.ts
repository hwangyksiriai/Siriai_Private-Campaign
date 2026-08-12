import { NextRequest, NextResponse } from "next/server";
import { getInfluencerByCode, createApplication } from "@/lib/store";

export const runtime = "nodejs";

export async function POST(req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const influencer = await getInfluencerByCode(code);
  if (!influencer) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  const campaignId = String(body.campaignId || "");
  if (!campaignId) return NextResponse.json({ error: "campaignId required" }, { status: 400 });

  const application = await createApplication(influencer.id, campaignId);
  return NextResponse.json({ ok: true, application });
}
