import { NextRequest, NextResponse } from "next/server";
import { createPublicApplication, getSecureProfileSummary } from "@/lib/store";

export const runtime = "nodejs";

const clean = (v: unknown) => String(v ?? "").trim();

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const campaignId = clean(body.campaignId);
  const name = clean(body.name);
  const phone = clean(body.phone);
  const instagramLink = clean(body.instagramLink);
  const email = clean(body.email);
  const postalCode = clean(body.postalCode);
  const address = clean(body.address);
  const addressDetail = clean(body.addressDetail);
  const request = clean(body.request);
  const agreed = !!body.agreed;

  if (!campaignId || !name || !phone || !instagramLink || !address || !addressDetail) {
    return NextResponse.json({ error: "필수 항목을 모두 입력해 주세요" }, { status: 400 });
  }
  if (!agreed) {
    return NextResponse.json({ error: "가이드라인 및 고료 조건 동의가 필요해요" }, { status: 400 });
  }

  const application = await createPublicApplication({
    campaignId,
    name,
    phone,
    instagramLink,
    email: email || undefined,
    postalCode: postalCode || undefined,
    address,
    addressDetail,
    request: request || undefined,
  });
  const secureProfile = await getSecureProfileSummary(application.influencerId);

  return NextResponse.json({ ok: true, application, secureProfile });
}
