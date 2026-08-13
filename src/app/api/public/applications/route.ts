import { NextRequest, NextResponse } from "next/server";
import { listApplicationsByPhone, getSecureProfileSummary } from "@/lib/store";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const phone = req.nextUrl.searchParams.get("phone")?.trim();
  if (!phone) {
    return NextResponse.json({ error: "phone required" }, { status: 400 });
  }

  const applications = await listApplicationsByPhone(phone);
  const influencerId = applications.find((a) => a.influencerId)?.influencerId ?? null;
  const secureProfile = await getSecureProfileSummary(influencerId);

  return NextResponse.json({ applications, secureProfile });
}
