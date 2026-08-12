"use client";

import { useState } from "react";
import type { Application, Campaign } from "@/lib/store";

const STATUS_LABEL: Record<Application["status"], string> = {
  applied: "신청완료 · 검토중",
  selected: "선정되었어요 🎉",
  rejected: "이번엔 함께하지 못했어요",
};

const STATUS_STYLE: Record<Application["status"], string> = {
  applied: "text-[var(--ink-soft)] bg-[var(--bg-soft)] border-[var(--line)]",
  selected: "text-[var(--accent)] bg-[var(--accent)]/8 border-[var(--accent)]/30",
  rejected: "text-[var(--ink-faint)] bg-[var(--bg-soft)] border-[var(--line)]",
};

type SecureProfile = { hasProfile: boolean; bankName?: string; maskedAccount?: string };

export default function ApplicationPanel({
  code,
  application,
  campaign,
  secureProfile,
  onUpdated,
}: {
  code: string;
  application: Application;
  campaign: Campaign | undefined;
  secureProfile: SecureProfile;
  onUpdated: (app: Application) => void;
}) {
  const [contentUrl, setContentUrl] = useState(application.contentUrl || "");
  const [savingContent, setSavingContent] = useState(false);
  const [contentErr, setContentErr] = useState("");

  const [settleMode, setSettleMode] = useState<"choose" | "new">(secureProfile.hasProfile ? "choose" : "new");
  const [settleSaving, setSettleSaving] = useState(false);
  const [settleErr, setSettleErr] = useState("");
  const [form, setForm] = useState({
    realName: "",
    phone: "",
    bankName: "",
    bankAccount: "",
    holder: "",
    rrn: "",
    agreed: false,
  });

  async function submit(body: Record<string, unknown>) {
    const r = await fetch(`/api/portal/${code}/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ applicationId: application.id, ...body }),
    });
    const d = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(d.error || "제출에 실패했어요");
    return d.application as Application;
  }

  async function handleContentSubmit() {
    setContentErr("");
    if (!/^https?:\/\//i.test(contentUrl.trim())) {
      setContentErr("http로 시작하는 게시물 전체 주소를 입력해 주세요");
      return;
    }
    setSavingContent(true);
    try {
      const updated = await submit({ type: "content", contentUrl: contentUrl.trim() });
      onUpdated(updated);
    } catch (e) {
      setContentErr(e instanceof Error ? e.message : "제출에 실패했어요");
    } finally {
      setSavingContent(false);
    }
  }

  async function handleReuse() {
    setSettleErr("");
    setSettleSaving(true);
    try {
      const updated = await submit({ type: "settlement_reuse" });
      onUpdated(updated);
    } catch (e) {
      setSettleErr(e instanceof Error ? e.message : "제출에 실패했어요");
    } finally {
      setSettleSaving(false);
    }
  }

  async function handleNewSettlement() {
    setSettleErr("");
    if (!form.realName || !form.phone || !form.bankName || !form.bankAccount || !form.holder || !form.rrn) {
      setSettleErr("모든 항목을 입력해 주세요");
      return;
    }
    if (form.rrn.replace(/\D/g, "").length !== 13) {
      setSettleErr("주민등록번호는 13자리 숫자로 입력해 주세요");
      return;
    }
    if (!form.agreed) {
      setSettleErr("정산정보 수집·이용 동의가 필요해요");
      return;
    }
    setSettleSaving(true);
    try {
      const updated = await submit({ type: "settlement_new", ...form });
      onUpdated(updated);
    } catch (e) {
      setSettleErr(e instanceof Error ? e.message : "제출에 실패했어요");
    } finally {
      setSettleSaving(false);
    }
  }

  const contentDone = !!application.contentSubmittedAt;
  const settleDone = !!application.settleSubmittedAt;

  return (
    <div className="rounded-3xl border border-[var(--line)] bg-[var(--paper)] p-6">
      <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-display text-lg text-[var(--ink)]">
          {campaign ? campaign.title : "캠페인"}
        </h3>
        <span className={`rounded-full border px-3 py-1 text-xs font-medium ${STATUS_STYLE[application.status]}`}>
          {STATUS_LABEL[application.status]}
        </span>
      </div>
      {campaign && <p className="mb-5 text-sm text-[var(--ink-soft)]">{campaign.brand} · {campaign.product}</p>}

      {application.status === "selected" && (
        <div className="space-y-5 border-t border-[var(--line)] pt-5">
          {/* 1. 콘텐츠 링크 */}
          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className="text-sm font-semibold text-[var(--ink)]">1. 콘텐츠 링크</span>
              {contentDone && (
                <span className="rounded-full bg-[var(--accent)]/10 px-2 py-0.5 text-[10px] font-semibold text-[var(--accent)]">
                  제출됨
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <input
                value={contentUrl}
                onChange={(e) => setContentUrl(e.target.value)}
                placeholder="https://www.instagram.com/reel/..."
                className="flex-1 rounded-xl border border-[var(--line)] bg-white px-3.5 py-2.5 text-sm text-[var(--ink)] outline-none focus:border-[var(--accent)]"
              />
              <button
                onClick={handleContentSubmit}
                disabled={savingContent}
                className="shrink-0 rounded-xl bg-[var(--ink)] px-4 text-sm font-medium text-[var(--paper)] transition-colors hover:bg-[var(--accent)] disabled:opacity-50"
              >
                {savingContent ? "저장 중…" : contentDone ? "갱신" : "제출"}
              </button>
            </div>
            {contentErr && <p className="mt-1.5 text-xs text-red-500">{contentErr}</p>}
          </div>

          {/* 2. 정산 정보 */}
          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className="text-sm font-semibold text-[var(--ink)]">2. 정산 정보</span>
              {settleDone && (
                <span className="rounded-full bg-[var(--accent)]/10 px-2 py-0.5 text-[10px] font-semibold text-[var(--accent)]">
                  제출됨
                </span>
              )}
            </div>

            {settleDone ? (
              <p className="text-sm text-[var(--ink-soft)]">
                정산 정보를 제출했어요. 순차적으로 확인 후 정산을 진행할게요.
              </p>
            ) : settleMode === "choose" ? (
              <div className="rounded-2xl border border-[var(--accent)]/25 bg-[var(--accent)]/5 p-4">
                <p className="text-sm text-[var(--ink)]">
                  이전에 제출하신 정산 정보가 있어요
                  {secureProfile.bankName && (
                    <>
                      {" "}
                      ({secureProfile.bankName} {secureProfile.maskedAccount})
                    </>
                  )}
                  . 이 정보로 정산 받으실까요?
                </p>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={handleReuse}
                    disabled={settleSaving}
                    className="rounded-full bg-[var(--ink)] px-4 py-2 text-xs font-medium text-[var(--paper)] hover:bg-[var(--accent)] disabled:opacity-50"
                  >
                    {settleSaving ? "처리 중…" : "이 정보로 정산받기"}
                  </button>
                  <button
                    onClick={() => setSettleMode("new")}
                    className="rounded-full border border-[var(--line)] px-4 py-2 text-xs font-medium text-[var(--ink)] hover:bg-[var(--bg-soft)]"
                  >
                    새 정보 입력하기
                  </button>
                </div>
                {settleErr && <p className="mt-2 text-xs text-red-500">{settleErr}</p>}
              </div>
            ) : (
              <div className="space-y-3 rounded-2xl border border-[var(--line)] p-4">
                <p className="text-xs text-[var(--ink-soft)]">
                  고료 지급을 위한 정보예요. 암호화되어 담당자만 확인할 수 있어요.
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="예금주 실명" value={form.realName} onChange={(v) => setForm((f) => ({ ...f, realName: v }))} placeholder="홍길동" />
                  <Field label="연락처" value={form.phone} onChange={(v) => setForm((f) => ({ ...f, phone: v }))} placeholder="010-0000-0000" />
                  <Field label="은행" value={form.bankName} onChange={(v) => setForm((f) => ({ ...f, bankName: v }))} placeholder="국민은행" />
                  <Field label="예금주" value={form.holder} onChange={(v) => setForm((f) => ({ ...f, holder: v }))} placeholder="홍길동" />
                  <Field label="계좌번호" value={form.bankAccount} onChange={(v) => setForm((f) => ({ ...f, bankAccount: v }))} placeholder="- 없이 숫자만" />
                  <Field label="주민등록번호" value={form.rrn} onChange={(v) => setForm((f) => ({ ...f, rrn: v }))} placeholder="13자리 숫자" />
                </div>
                <label className="flex items-start gap-2 rounded-xl bg-[var(--bg-soft)] p-3 text-xs text-[var(--ink-soft)]">
                  <input
                    type="checkbox"
                    checked={form.agreed}
                    onChange={(e) => setForm((f) => ({ ...f, agreed: e.target.checked }))}
                    className="mt-0.5"
                  />
                  고료 정산 및 세무 신고를 위해 계좌·주민등록번호 등 정보 수집·이용에 동의합니다. 수집 정보는 정산
                  목적으로만 사용되며 암호화 보관됩니다.
                </label>
                {settleErr && <p className="text-xs text-red-500">{settleErr}</p>}
                <div className="flex gap-2">
                  <button
                    onClick={handleNewSettlement}
                    disabled={settleSaving}
                    className="rounded-full bg-[var(--ink)] px-4 py-2 text-xs font-medium text-[var(--paper)] hover:bg-[var(--accent)] disabled:opacity-50"
                  >
                    {settleSaving ? "제출 중…" : "제출하기"}
                  </button>
                  {secureProfile.hasProfile && (
                    <button
                      onClick={() => setSettleMode("choose")}
                      className="rounded-full border border-[var(--line)] px-4 py-2 text-xs font-medium text-[var(--ink)] hover:bg-[var(--bg-soft)]"
                    >
                      취소
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-[var(--ink-soft)]">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-[var(--line)] bg-white px-3.5 py-2.5 text-sm text-[var(--ink)] outline-none focus:border-[var(--accent)]"
      />
    </div>
  );
}
