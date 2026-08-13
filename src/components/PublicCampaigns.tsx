"use client";

import { useEffect, useState } from "react";
import CampaignCard from "@/components/portal/CampaignCard";
import ApplicationPanel from "@/components/portal/ApplicationPanel";
import type { Campaign, Application } from "@/lib/store";

type SecureProfile = { hasProfile: boolean; bankName?: string; maskedAccount?: string };

export default function PublicCampaigns() {
  const [campaigns, setCampaigns] = useState<{ ongoing: Campaign[]; new: Campaign[] } | null>(null);
  const [formForCampaign, setFormForCampaign] = useState<Campaign | null>(null);
  const [form, setForm] = useState({ name: "", phone: "", handle: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
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

  async function handleApply(campaignId: string) {
    setError("");
    if (!form.name.trim() || !form.phone.trim() || !form.handle.trim()) {
      setError("이름·연락처·인스타 핸들을 모두 입력해 주세요");
      return;
    }
    setSubmitting(true);
    try {
      const r = await fetch("/api/public/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ campaignId, ...form }),
      });
      const d = await r.json();
      if (!r.ok) {
        setError(d.error || "신청에 실패했어요");
        return;
      }
      const campaign = [...(campaigns?.ongoing ?? []), ...(campaigns?.new ?? [])].find(
        (c) => c.id === campaignId
      );
      setResult({ application: d.application, campaign: campaign!, secureProfile: d.secureProfile });
      setFormForCampaign(null);
    } finally {
      setSubmitting(false);
    }
  }

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
                <div key={c.id}>
                  <CampaignCard
                    campaign={c}
                    applied={appliedCampaignId === c.id}
                    applying={false}
                    onApply={() => {
                      setFormForCampaign(c);
                      setError("");
                    }}
                  />
                  {formForCampaign?.id === c.id && (
                    <ApplyForm
                      form={form}
                      setForm={setForm}
                      error={error}
                      submitting={submitting}
                      onSubmit={() => handleApply(c.id)}
                      onCancel={() => setFormForCampaign(null)}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-sm text-[var(--ink-faint)]">지금은 모집 중인 캠페인이 없어요.</p>
        )}
      </div>
    </section>
  );
}

function ApplyForm({
  form,
  setForm,
  error,
  submitting,
  onSubmit,
  onCancel,
}: {
  form: { name: string; phone: string; handle: string };
  setForm: (f: { name: string; phone: string; handle: string }) => void;
  error: string;
  submitting: boolean;
  onSubmit: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="mt-3 space-y-2.5 rounded-2xl border border-[var(--accent)]/25 bg-[var(--accent)]/5 p-4">
      <input
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        placeholder="이름"
        className="w-full rounded-xl border border-[var(--line)] bg-white px-3.5 py-2.5 text-sm text-[var(--ink)] outline-none focus:border-[var(--accent)]"
      />
      <input
        value={form.phone}
        onChange={(e) => setForm({ ...form, phone: e.target.value })}
        placeholder="연락처 (010-0000-0000)"
        className="w-full rounded-xl border border-[var(--line)] bg-white px-3.5 py-2.5 text-sm text-[var(--ink)] outline-none focus:border-[var(--accent)]"
      />
      <input
        value={form.handle}
        onChange={(e) => setForm({ ...form, handle: e.target.value })}
        placeholder="인스타그램 핸들 (@ 없이)"
        className="w-full rounded-xl border border-[var(--line)] bg-white px-3.5 py-2.5 text-sm text-[var(--ink)] outline-none focus:border-[var(--accent)]"
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
      <div className="flex gap-2">
        <button
          onClick={onSubmit}
          disabled={submitting}
          className="rounded-full bg-[var(--ink)] px-4 py-2 text-xs font-medium text-[var(--paper)] hover:bg-[var(--accent)] disabled:opacity-50"
        >
          {submitting ? "신청 중…" : "신청 제출"}
        </button>
        <button
          onClick={onCancel}
          className="rounded-full border border-[var(--line)] px-4 py-2 text-xs font-medium text-[var(--ink)] hover:bg-white"
        >
          취소
        </button>
      </div>
    </div>
  );
}
