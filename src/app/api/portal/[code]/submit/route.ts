import { NextRequest, NextResponse } from "next/server";
import {
  getInfluencerByCode,
  getApplication,
  submitContent,
  submitSettlementNew,
  submitSettlementFromExistingProfile,
} from "@/lib/store";

export const runtime = "nodejs";

const clean = (v: unknown) => String(v ?? "").trim();
const digits = (v: unknown) => clean(v).replace(/[^0-9]/g, "");

export async function POST(req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const influencer = getInfluencerByCode(code);
  if (!influencer) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  const applicationId = String(body.applicationId || "");
  const application = getApplication(applicationId);
  if (!application || application.influencerId !== influencer.id) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  if (application.status !== "selected") {
    return NextResponse.json({ error: "선정된 캠페인만 제출할 수 있어요" }, { status: 400 });
  }

  // 1) 콘텐츠 링크 제출
  if (body.type === "content") {
    const contentUrl = clean(body.contentUrl);
    if (!/^https?:\/\//i.test(contentUrl)) {
      return NextResponse.json({ error: "콘텐츠 링크는 http로 시작하는 전체 주소로 입력해 주세요" }, { status: 400 });
    }
    const updated = submitContent(applicationId, contentUrl);
    return NextResponse.json({ ok: true, application: updated });
  }

  // 2) 정산정보 — 기존 프로필 재사용
  if (body.type === "settlement_reuse") {
    const updated = submitSettlementFromExistingProfile(applicationId, influencer.id);
    if (!updated) return NextResponse.json({ error: "재사용할 정산 정보가 없어요" }, { status: 400 });
    return NextResponse.json({ ok: true, application: updated });
  }

  // 3) 정산정보 — 신규 작성
  if (body.type === "settlement_new") {
    const realName = clean(body.realName);
    const phone = clean(body.phone);
    const bankName = clean(body.bankName);
    const bankAccount = digits(body.bankAccount);
    const holder = clean(body.holder);
    const rrn = digits(body.rrn);
    const agreed = !!body.agreed;

    if (!realName || !phone || !bankName || !bankAccount || !holder || !rrn) {
      return NextResponse.json({ error: "모든 항목을 입력해 주세요" }, { status: 400 });
    }
    if (rrn.length !== 13) {
      return NextResponse.json({ error: "주민등록번호는 13자리 숫자로 입력해 주세요" }, { status: 400 });
    }
    if (!agreed) {
      return NextResponse.json({ error: "정산정보 수집·이용 동의가 필요해요" }, { status: 400 });
    }

    const updated = submitSettlementNew(applicationId, influencer.id, {
      realName,
      phone,
      bankName,
      bankAccount,
      holder,
      rrn,
    });
    return NextResponse.json({ ok: true, application: updated });
  }

  return NextResponse.json({ error: "unknown type" }, { status: 400 });
}
