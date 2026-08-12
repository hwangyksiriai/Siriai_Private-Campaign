"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import CampaignCard from "@/components/portal/CampaignCard";
import ApplicationPanel from "@/components/portal/ApplicationPanel";
import type { Campaign, Application } from "@/lib/store";

type PortalData = {
  influencer: { name: string; instagramHandle: string };
  campaigns: { ongoing: Campaign[]; new: Campaign[] };
  applications: Application[];
  secureProfile: { hasProfile: boolean; bankName?: string; maskedAccount?: string };
};

export default function PortalPage() {
  const { code } = useParams<{ code: string }>();
  const [data, setData] = useState<PortalData | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [applyingId, setApplyingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    const r = await fetch(`/api/portal/${code}`);
    if (!r.ok) {
      setNotFound(true);
      return;
    }
    setData(await r.json());
  }, [code]);

  useEffect(() => {
    let ignore = false;
    (async () => {
      const r = await fetch(`/api/portal/${code}`);
      if (ignore) return;
      if (!r.ok) {
        setNotFound(true);
        return;
      }
      setData(await r.json());
    })();
    return () => {
      ignore = true;
    };
  }, [code]);

  async function handleApply(campaignId: string) {
    setApplyingId(campaignId);
    try {
      await fetch(`/api/portal/${code}/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ campaignId }),
      });
      await load();
    } finally {
      setApplyingId(null);
    }
  }

  function handleApplicationUpdated(updated: Application) {
    setData((prev) =>
      prev
        ? { ...prev, applications: prev.applications.map((a) => (a.id === updated.id ? updated : a)) }
        : prev
    );
  }

  if (notFound) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-white px-6 text-center">
        <p className="font-display text-3xl text-[var(--ink)]">유효하지 않은 코드예요</p>
        <p className="text-sm text-[var(--ink-soft)]">
          링크를 다시 확인해 주시거나 담당자에게 문의해 주세요.
        </p>
        <Link href="/" className="mt-2 text-sm text-[var(--accent)] link-underline">
          코드 다시 입력하기
        </Link>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white">
        <p className="text-sm text-[var(--ink-faint)]">불러오는 중…</p>
      </main>
    );
  }

  const campaignById = new Map(
    [...data.campaigns.ongoing, ...data.campaigns.new].map((c) => [c.id, c])
  );
  const appliedCampaignIds = new Set(data.applications.map((a) => a.campaignId));
  const selectedApps = data.applications.filter((a) => a.status === "selected");
  const otherApps = data.applications.filter((a) => a.status !== "selected");

  return (
    <main className="min-h-screen bg-white">
      {/* header */}
      <header className="border-b border-[var(--line)] bg-white/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <span className="font-display text-xl text-[var(--ink)]">
            siri<span className="text-[var(--accent)]">AI</span>
          </span>
          <span className="rounded-full border border-[var(--line)] px-3 py-1 text-[11px] tracking-[0.1em] text-[var(--ink-faint)] uppercase">
            Private Access
          </span>
        </div>
      </header>

      {/* greeting */}
      <section className="mx-auto max-w-5xl px-6 pt-16 pb-10">
        <p className="reveal text-xs tracking-[0.2em] text-[var(--accent)] uppercase">
          Welcome back
        </p>
        <h1 className="reveal font-display mt-3 text-4xl text-[var(--ink)] sm:text-5xl" style={{ animationDelay: "0.06s" }}>
          {data.influencer.name}님, 다시 만나 반가워요
        </h1>
        <p className="reveal mt-4 text-sm text-[var(--ink-soft)]" style={{ animationDelay: "0.12s" }}>
          {data.influencer.instagramHandle}
        </p>
      </section>

      {/* 내 신청 현황 */}
      {data.applications.length > 0 && (
        <section className="mx-auto max-w-5xl px-6 pb-16">
          <h2 className="font-display mb-5 text-2xl text-[var(--ink)]">내 신청 현황</h2>
          <div className="space-y-4">
            {selectedApps.map((app) => (
              <ApplicationPanel
                key={app.id}
                code={code}
                application={app}
                campaign={campaignById.get(app.campaignId)}
                secureProfile={data.secureProfile}
                onUpdated={handleApplicationUpdated}
              />
            ))}
            {otherApps.map((app) => (
              <ApplicationPanel
                key={app.id}
                code={code}
                application={app}
                campaign={campaignById.get(app.campaignId)}
                secureProfile={data.secureProfile}
                onUpdated={handleApplicationUpdated}
              />
            ))}
          </div>
        </section>
      )}

      {/* 진행 중인 캠페인 */}
      <section className="mx-auto max-w-5xl px-6 pb-16">
        <h2 className="font-display mb-5 text-2xl text-[var(--ink)]">진행 중인 캠페인</h2>
        <div className="grid gap-6 sm:grid-cols-2">
          {data.campaigns.ongoing.map((c) => (
            <CampaignCard
              key={c.id}
              campaign={c}
              applied={appliedCampaignIds.has(c.id)}
              applying={applyingId === c.id}
              onApply={() => handleApply(c.id)}
            />
          ))}
        </div>
      </section>

      {/* 신규 캠페인 */}
      <section className="mx-auto max-w-5xl px-6 pb-24">
        <div className="mb-5 flex items-center gap-3">
          <h2 className="font-display text-2xl text-[var(--ink)]">신규 캠페인</h2>
          <span className="rounded-full bg-[var(--accent)] px-2.5 py-0.5 text-[10px] font-bold text-white">
            NEW
          </span>
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          {data.campaigns.new.map((c) => (
            <CampaignCard
              key={c.id}
              campaign={c}
              applied={appliedCampaignIds.has(c.id)}
              applying={applyingId === c.id}
              onApply={() => handleApply(c.id)}
            />
          ))}
        </div>
      </section>

      <footer className="border-t border-[var(--line)] px-6 py-8 text-center text-xs text-[var(--ink-faint)]">
        © 2026 siriAI. 이 페이지는 {data.influencer.name}님만을 위한 개인 링크예요 — 다른 분과 공유하지 말아주세요.
      </footer>
    </main>
  );
}
