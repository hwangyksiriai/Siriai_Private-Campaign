import { NextRequest, NextResponse } from "next/server";
import { createPublicApplication, getSecureProfileSummary } from "@/lib/store";

export const runtime = "nodejs";

const clean = (v: unknown) => String(v ?? "").trim();

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const campaignId = clean(body.campaignId);
  const name = clean(body.name);
  const phone = clean(body.phone);
  const handle = clean(body.handle);

  if (!campaignId || !name || !phone || !handle) {
    return NextResponse.json({ error: "이름·연락처·인스타 핸들을 모두 입력해 주세요" }, { status: 400 });
  }

  const application = await createPublicApplication({ campaignId, name, phone, handle });
  const secureProfile = await getSecureProfileSummary(application.influencerId);

  return NextResponse.json({ ok: true, application, secureProfile });
}
