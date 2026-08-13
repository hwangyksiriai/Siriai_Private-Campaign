"use client";

import { useCallback, useEffect, useState } from "react";
import CampaignCard from "@/components/portal/CampaignCard";
import ApplicationPanel from "@/components/portal/ApplicationPanel";
import CampaignModal from "@/components/CampaignModal";
import type { Campaign, Application } from "@/lib/store";

type SecureProfile = { hasProfile: boolean; bankName?: string; maskedAccount?: string };
type LookupApplication = Application & { campaignTitle: string; campaignBrand: string };

export default function PublicCampaigns() {
  const [campaigns, setCampaigns] = useState<{ ongoing: Campaign[]; new: Campaign[] } | null>(null);
  const [modalCampaign, setModalCampaign] = useState<Campaign | null>(null);
  const [appliedCampaignId, setAppliedCampaignId] = useState<string | null>(null);

  const [lookupPhone, setLookupPhone] = useState("");
  const [lookupApps, setLookupApps] = useState<LookupApplication[] | null>(null);
  const [lookupSecureProfile, setLookupSecureProfile] = useState<SecureProfile>({ hasProfile: false });
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState("");

  useEffect(() => {
    fetch("/api/public/campaigns")
      .then((r) => r.json())
      .then((d) => setCampaigns(d.campaigns));
  }, []);

  const runLookup = useCallback(async (phone: string) => {
    setLookupError("");
    if (!phone.trim()) {
      setLookupError("연락처를 입력해 주세요");
      return;
    }
    setLookupLoading(true);
    try {
      const r = await fetch(`/api/public/applications?phone=${encodeURIComponent(phone.trim())}`);
      const d = await r.json();
      if (!r.ok) {
        setLookupError(d.error || "조회에 실패했어요");
        return;
      }
      if (!d.applications.length) {
        setLookupError("이 연락처로 신청한 내역이 없어요");
        setLookupApps(null);
        return;
      }
      setLookupApps(d.applications);
      setLookupSecureProfile(d.secureProfile);
    } finally {
      setLookupLoading(false);
    }
  }, []);

  function updateLookupApp(updated: Application) {
    setLookupApps((prev) => (prev ? prev.map((a) => (a.id === updated.id ? { ...a, ...updated } : a)) : prev));
  }

  if (!campaigns) {
    return (
      <section className="px-6 py-20 text-center text-sm text-[var(--ink-faint)] lg:px-10">
        캠페인을 불러오는 중…
      </section>
    );
  }

  const allCampaigns = [...campaigns.ongoing, ...campaigns.new];

  return (
    <section id="campaigns" className="px-6 py-28 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-14 flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="mb-3 text-xs tracking-[0.25em] text-[var(--accent)] uppercase">Open Campaigns</p>
            <h2 className="font-display text-4xl text-[var(--ink)] sm:text-5xl">지금 신청할 수 있는 캠페인</h2>
          </div>

          <div className="w-full max-w-xs">
            <p className="mb-1.5 text-xs font-medium text-[var(--ink-soft)]">이미 신청하셨나요? 내 신청 현황 조회</p>
            <div className="flex gap-2">
              <input
                value={lookupPhone}
                onChange={(e) => {
                  setLookupPhone(e.target.value);
                  if (lookupError) setLookupError("");
                }}
                onKeyDown={(e) => e.key === "Enter" && runLookup(lookupPhone)}
                placeholder="신청하신 연락처"
                className="flex-1 rounded-full border border-[var(--line)] bg-white px-4 py-2 text-sm text-[var(--ink)] outline-none focus:border-[var(--accent)]"
              />
              <button
                onClick={() => runLookup(lookupPhone)}
                disabled={lookupLoading}
                className="shrink-0 rounded-full bg-[var(--ink)] px-4 py-2 text-xs font-medium text-white hover:bg-[var(--accent)] disabled:opacity-50"
              >
                {lookupLoading ? "조회 중…" : "조회"}
              </button>
            </div>
            {lookupError && <p className="mt-1.5 text-xs text-red-500">{lookupError}</p>}
          </div>
        </div>

        {lookupApps && (
          <div className="mb-12">
            <h3 className="font-display mb-5 text-2xl text-[var(--ink)]">내 신청 현황</h3>
            <div className="space-y-4">
              {lookupApps.map((app) => (
                <ApplicationPanel
                  key={app.id}
                  submitUrl="/api/public/submit"
                  application={app}
                  campaign={{ title: app.campaignTitle, brand: app.campaignBrand, product: "" }}
                  secureProfile={lookupSecureProfile}
                  forceShowForms
                  onUpdated={updateLookupApp}
                />
              ))}
            </div>
          </div>
        )}

        {allCampaigns.length > 0 ? (
          <div>
            <div className="mb-5 flex items-center gap-3">
              <h3 className="font-display text-2xl text-[var(--ink)]">신규 캠페인</h3>
              <span className="rounded-full bg-[var(--accent)] px-2.5 py-0.5 text-[10px] font-bold text-white">
                NEW
              </span>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {allCampaigns.map((c) => (
                <CampaignCard
                  key={c.id}
                  campaign={c}
                  applied={appliedCampaignId === c.id}
                  applying={false}
                  onApply={() => setModalCampaign(c)}
                />
              ))}
            </div>
          </div>
        ) : (
          <p className="text-sm text-[var(--ink-faint)]">지금은 모집 중인 캠페인이 없어요.</p>
        )}
      </div>

      {modalCampaign && (
        <CampaignModal
          campaign={modalCampaign}
          onClose={() => setModalCampaign(null)}
          onApplied={({ phone }) => {
            setAppliedCampaignId(modalCampaign.id);
            setLookupPhone(phone);
            runLookup(phone);
          }}
        />
      )}
    </section>
  );
}
