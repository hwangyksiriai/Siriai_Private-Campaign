import { NextRequest, NextResponse } from "next/server";
import {
  getInfluencerByCode,
  logAccess,
  listCampaigns,
  listApplicationsForInfluencer,
  getSecureProfileSummary,
} from "@/lib/store";

export const runtime = "nodejs";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const influencer = await getInfluencerByCode(code);
  if (!influencer) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  // 방문 기록은 내부 트래킹 전용 — 응답에는 포함하지 않음(인플루언서에게 노출 안 함)
  await logAccess(influencer.id, code);
  const [campaigns, applications, secureProfile] = await Promise.all([
    listCampaigns(),
    listApplicationsForInfluencer(influencer.id),
    getSecureProfileSummary(influencer.id),
  ]);

  return NextResponse.json({
    influencer: { name: influencer.name, instagramHandle: influencer.instagramHandle },
    campaigns,
    applications,
    secureProfile,
  });
}
