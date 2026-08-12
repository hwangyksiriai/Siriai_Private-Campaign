"use client";

import { useState } from "react";
import type { Campaign } from "@/lib/store";

export default function CampaignCard({
  campaign,
  applied,
  onApply,
  applying,
}: {
  campaign: Campaign;
  applied: boolean;
  onApply: () => void;
  applying: boolean;
}) {
  // 마운트 시점 한 번만 계산 — lazy initializer는 렌더 중 impure 호출이 허용되는 위치
  const [now] = useState(() => Date.now());
  const dday = campaign.applyEnd ? Math.round((+new Date(campaign.applyEnd) - now) / 86400000) : null;
  const expired = dday !== null && dday < 0;

  return (
    <article className="flex flex-col justify-between rounded-3xl border border-[var(--line)] bg-[var(--paper)] p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_-24px_rgba(38,34,28,0.2)]">
      <div>
        <div className="mb-4 flex items-center justify-between">
          <span className="rounded-full border border-[var(--accent)]/40 bg-[var(--accent)]/8 px-3 py-1 text-xs font-medium text-[var(--accent)]">
            {campaign.brand}
          </span>
          <span className="text-xs text-[var(--ink-soft)]">{campaign.category}</span>
        </div>

        <div className="mb-3 flex flex-wrap gap-1.5">
          {campaign.channels.map((ch) => (
            <span key={ch} className="rounded-full bg-[var(--bg-soft)] px-2.5 py-1 text-[11px] text-[var(--ink-soft)]">
              {ch}
            </span>
          ))}
        </div>

        <h3 className="font-display text-xl leading-snug text-[var(--ink)]">{campaign.title}</h3>
        <p className="mt-2 text-sm text-[var(--ink-soft)]">{campaign.product}</p>

        <div className="mt-4 flex flex-wrap gap-x-2 gap-y-1 text-xs text-[var(--accent)]">
          {campaign.hashtags.map((h) => (
            <span key={h}>{h}</span>
          ))}
        </div>
      </div>

      <div className="mt-8 flex items-center justify-between border-t border-[var(--line)] pt-5">
        <span className="text-xs text-[var(--ink-soft)]">
          {dday === null ? "상시 모집" : expired ? "신청이 마감되었습니다" : `신청 마감 D-${dday}`}
        </span>
        <button
          onClick={onApply}
          disabled={applied || applying || expired}
          className="rounded-full bg-[var(--ink)] px-4 py-2 text-xs font-medium text-[var(--paper)] transition-colors duration-300 hover:bg-[var(--accent)] disabled:cursor-not-allowed disabled:bg-[var(--ink-soft)]/40"
        >
          {expired ? "마감" : applied ? "신청완료" : applying ? "신청 중…" : "신청하기 →"}
        </button>
      </div>
    </article>
  );
}
