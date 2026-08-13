"use client";

import { useEffect, useState } from "react";
import CampaignCard from "@/components/portal/CampaignCard";
import ApplicationPanel from "@/components/portal/ApplicationPanel";
import CampaignModal from "@/components/CampaignModal";
import type { Campaign, Application } from "@/lib/store";

type SecureProfile = { hasProfile: boolean; bankName?: string; maskedAccount?: string };

export default function PublicCampaigns() {
  const [campaigns, setCampaigns] = useState<{ ongoing: Campaign[]; new: Campaign[] } | null>(null);
  const [modalCampaign, setModalCampaign] = useState<Campaign | null>(null);
  const [result, setResult] = useState<{
    application: Application;
    campaign: Campaign;
    secureProfile: SecureProfile;
  } | null>(null);

  useEffect(() => {
    fetch("/api/public/campaigns")
      .then((r) => r.json())
      .then((d) => setCampaigns(d.campaigns));
  }, []);

  if (!campaigns) {
    return (
      <section className="px-6 py-20 text-center text-sm text-[var(--ink-faint)] lg:px-10">
        캠페인을 불러오는 중…
      </section>
    );
  }

  const appliedCampaignId = result?.application.campaignId;
  const allCampaigns = [...campaigns.ongoing, ...campaigns.new];

  return (
    <section id="campaigns" className="px-6 py-28 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <p className="mb-3 text-xs tracking-[0.25em] text-[var(--accent)] uppercase">Open Campaigns</p>
        <h2 className="font-display mb-14 text-4xl text-[var(--ink)] sm:text-5xl">
          지금 신청할 수 있는 캠페인
        </h2>

        {result && (
          <div className="mb-12">
            <ApplicationPanel
              submitUrl="/api/public/submit"
              application={result.application}
              campaign={result.campaign}
              secureProfile={result.secureProfile}
              forceShowForms
              onUpdated={(updated) => setResult((prev) => (prev ? { ...prev, application: updated } : prev))}
            />
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
          onApplied={({ application, secureProfile }) =>
            setResult({ application, campaign: modalCampaign, secureProfile })
          }
        />
      )}
    </section>
  );
}
