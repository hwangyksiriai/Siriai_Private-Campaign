"use client";

import { useState } from "react";
import type { Campaign, Application } from "@/lib/store";

declare global {
  interface Window {
    daum?: {
      Postcode: new (opts: { oncomplete: (data: { zonecode: string; roadAddress: string }) => void }) => {
        open: () => void;
      };
    };
  }
}

const won = (n: number | null) => (n === null ? null : `₩${n.toLocaleString("ko-KR")}`);
const fmtDate = (iso: string | null) => {
  if (!iso) return null;
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

type SecureProfile = { hasProfile: boolean; bankName?: string; maskedAccount?: string };

export default function CampaignModal({
  campaign,
  onClose,
  onApplied,
}: {
  campaign: Campaign;
  onClose: () => void;
  onApplied: (result: { application: Application; secureProfile: SecureProfile }) => void;
}) {
  const [step, setStep] = useState<"detail" | "apply">("detail");
  const [copied, setCopied] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    instagramLink: "",
    phone: "",
    email: "",
    postalCode: "",
    address: "",
    addressDetail: "",
    request: "",
  });
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function copy(text: string, key: string) {
    navigator.clipboard?.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied((c) => (c === key ? null : c)), 1500);
  }

  function openPostcode() {
    if (!window.daum?.Postcode) {
      const script = document.createElement("script");
      script.src = "https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";
      script.onload = () => launchPostcode();
      document.body.appendChild(script);
      return;
    }
    launchPostcode();
  }

  function launchPostcode() {
    if (!window.daum?.Postcode) return;
    new window.daum.Postcode({
      oncomplete: (data) => {
        setForm((f) => ({ ...f, postalCode: data.zonecode, address: data.roadAddress }));
      },
    }).open();
  }

  async function submit() {
    setError("");
    if (!form.name.trim() || !form.instagramLink.trim() || !form.phone.trim() || !form.address.trim() || !form.addressDetail.trim()) {
      setError("필수 항목(*)을 모두 입력해 주세요");
      return;
    }
    if (!agreed) {
      setError("가이드라인 및 고료 조건 동의가 필요해요");
      return;
    }
    setSubmitting(true);
    try {
      const r = await fetch("/api/public/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ campaignId: campaign.id, ...form, agreed }),
      });
      const d = await r.json();
      if (!r.ok) {
        setError(d.error || "신청에 실패했어요");
        return;
      }
      onApplied({ application: d.application, secureProfile: d.secureProfile });
      onClose();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-black/40 p-4 sm:p-8">
      <div className="relative w-full max-w-2xl rounded-3xl bg-white shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-lg text-[var(--ink-soft)] shadow hover:bg-[var(--bg-soft)]"
        >
          ×
        </button>

        {step === "detail" ? (
          <div className="p-6 sm:p-10">
            <div className="mb-4 flex items-center gap-2">
              {campaign.brandLogoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={campaign.brandLogoUrl} alt="" className="h-8 w-8 rounded-full object-cover" />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--accent)]/10 text-xs font-bold text-[var(--accent)]">
                  {campaign.brand.slice(0, 1)}
                </div>
              )}
              <span className="text-sm font-medium text-[var(--ink-soft)]">{campaign.brand}</span>
            </div>

            <h2 className="font-display text-3xl leading-snug text-[var(--ink)]">{campaign.title}</h2>

            {campaign.feeAmount !== null && (
              <p className="mt-3 text-2xl font-bold text-[var(--ink)]">
                {won(campaign.feeAmount)}
                {campaign.productValue ? (
                  <span className="ml-2 text-sm font-normal text-[var(--ink-faint)]">
                    + 제품 {won(campaign.productValue)} 상당
                  </span>
                ) : null}
              </p>
            )}

            <div className="mt-4 flex flex-wrap gap-1.5">
              {campaign.channels.map((ch) => (
                <span key={ch} className="rounded-full bg-[var(--bg-soft)] px-2.5 py-1 text-[11px] text-[var(--ink-soft)]">
                  {ch}
                </span>
              ))}
              {campaign.collabRequired && (
                <span className="rounded-full bg-[var(--accent)]/10 px-2.5 py-1 text-[11px] text-[var(--accent)]">
                  공동작업자 필수
                </span>
              )}
              {campaign.secondUseRequired && (
                <span className="rounded-full bg-[var(--accent)]/10 px-2.5 py-1 text-[11px] text-[var(--accent)]">
                  2차활용 필수
                </span>
              )}
              {campaign.targetRecruitCount && (
                <span className="rounded-full bg-[var(--bg-soft)] px-2.5 py-1 text-[11px] text-[var(--ink-soft)]">
                  지원 {campaign.targetRecruitCount}명
                </span>
              )}
            </div>

            {campaign.brandDescription && (
              <div className="mt-6">
                <p className="mb-1.5 text-xs font-semibold text-[var(--ink-faint)] uppercase">브랜드 소개</p>
                <p className="text-sm leading-relaxed text-[var(--ink-soft)]">{campaign.brandDescription}</p>
              </div>
            )}

            <div className="mt-6 border-t border-[var(--line)] pt-6">
              <p className="mb-2 text-xs font-semibold text-[var(--ink-faint)] uppercase">캠페인 개요</p>
              <dl className="space-y-1.5 text-sm">
                {campaign.channels[0] && <Row k="콘텐츠 형식" v={campaign.channels[0]} />}
                {campaign.feeAmount !== null && <Row k="고료" v={won(campaign.feeAmount)!} />}
                {(campaign.uploadStart || campaign.uploadEnd) && (
                  <Row k="업로드 기간" v={`${fmtDate(campaign.uploadStart) || "?"} ~ ${fmtDate(campaign.uploadEnd) || "?"}`} />
                )}
              </dl>
            </div>

            {(campaign.applyEnd || campaign.timelineSelectionDate || campaign.timelineShippingDate) && (
              <div className="mt-6 border-t border-[var(--line)] pt-6">
                <p className="mb-2 text-xs font-semibold text-[var(--ink-faint)] uppercase">타임라인</p>
                <dl className="space-y-1.5 text-sm">
                  {campaign.applyEnd && <Row k="신청 마감" v={fmtDate(campaign.applyEnd)!} />}
                  {campaign.timelineSelectionDate && <Row k="선정자 발표" v={fmtDate(campaign.timelineSelectionDate)!} />}
                  {campaign.timelineShippingDate && <Row k="제품 발송" v={fmtDate(campaign.timelineShippingDate)!} />}
                  {(campaign.uploadStart || campaign.uploadEnd) && (
                    <Row k="콘텐츠 업로드" v={`${fmtDate(campaign.uploadStart) || "?"} ~ ${fmtDate(campaign.uploadEnd) || "?"}`} />
                  )}
                </dl>
                <p className="mt-2 text-[11px] text-[var(--ink-faint)]">
                  ⓘ 타임라인은 캠페인 신청 상황에 따라 소폭씩 변경될 수 있어요.
                </p>
              </div>
            )}

            {campaign.products.length > 0 && (
              <div className="mt-6 border-t border-[var(--line)] pt-6">
                <p className="mb-3 text-xs font-semibold text-[var(--ink-faint)] uppercase">제공 제품</p>
                <div className="space-y-2">
                  {campaign.products.map((p, i) => (
                    <div key={i} className="flex items-center gap-3 rounded-xl bg-[var(--bg-soft)] p-3">
                      {p.photoUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.photoUrl} alt="" className="h-10 w-10 rounded-lg object-cover" />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-[var(--ink)]">{p.name}</p>
                        {p.link && (
                          <a
                            href={p.link}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-[var(--accent)] link-underline"
                          >
                            제품 링크 보기 ↗
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(campaign.guideFileUrl || campaign.guideMust || campaign.guideForbidden || campaign.guideRecommended) && (
              <div className="mt-6 border-t border-[var(--line)] pt-6">
                <p className="mb-3 text-xs font-semibold text-[var(--ink-faint)] uppercase">콘텐츠 제작 가이드</p>
                {campaign.guideFileUrl && (
                  <a
                    href={campaign.guideFileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mb-3 block rounded-xl bg-[var(--accent)]/10 px-4 py-3 text-center text-sm font-medium text-[var(--accent)] hover:bg-[var(--accent)]/15"
                  >
                    📄 가이드 파일 보기 ↗
                  </a>
                )}
                <div className="space-y-2">
                  {campaign.guideMust && <GuideBlock icon="✅" label="필수 사항" text={campaign.guideMust} />}
                  {campaign.guideForbidden && <GuideBlock icon="🚫" label="금지 사항" text={campaign.guideForbidden} />}
                  {campaign.guideRecommended && <GuideBlock icon="💡" label="추천 사항" text={campaign.guideRecommended} />}
                </div>
              </div>
            )}

            {(campaign.collabHandles.length > 0 || campaign.hashtags.length > 0) && (
              <div className="mt-6 border-t border-[var(--line)] pt-6">
                <p className="mb-3 text-xs font-semibold text-[var(--ink-faint)] uppercase">업로드 가이드</p>
                <div className="space-y-2">
                  {campaign.collabHandles.map((h, i) => (
                    <CopyRow key={h} label={`공동작업자 계정 ${campaign.collabHandles.length > 1 ? i + 1 : ""}`} value={h} onCopy={() => copy(h, `handle${i}`)} copied={copied === `handle${i}`} />
                  ))}
                  {campaign.hashtags.length > 0 && (
                    <CopyRow
                      label="필수 해시태그"
                      value={campaign.hashtags.join(" ")}
                      onCopy={() => copy(campaign.hashtags.join(" "), "hashtags")}
                      copied={copied === "hashtags"}
                    />
                  )}
                </div>
              </div>
            )}

            <button
              onClick={() => setStep("apply")}
              className="mt-8 w-full rounded-full bg-[var(--ink)] py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--accent)]"
            >
              신청하기 →
            </button>
          </div>
        ) : (
          <div className="p-6 sm:p-10">
            <p className="mb-1 text-xs tracking-[0.2em] text-[var(--accent)] uppercase">Application</p>
            <h2 className="font-display mb-6 text-2xl text-[var(--ink)]">캠페인 신청</h2>

            <div className="space-y-4">
              <Field label="이름" required value={form.name} onChange={(v) => setForm({ ...form, name: v })} placeholder="홍길동" />
              <Field
                label="인스타그램 링크"
                required
                value={form.instagramLink}
                onChange={(v) => setForm({ ...form, instagramLink: v })}
                placeholder="@username 또는 instagram.com/username"
              />
              <Field label="휴대폰" required value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} placeholder="010-0000-0000" />
              <Field label="이메일 (선택)" value={form.email} onChange={(v) => setForm({ ...form, email: v })} placeholder="name@email.com" />

              <div>
                <label className="mb-1 block text-xs font-medium text-[var(--ink-soft)]">
                  우편번호 <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    value={form.postalCode}
                    readOnly
                    placeholder="00000"
                    className="flex-1 rounded-xl border border-[var(--line)] bg-[var(--bg-soft)] px-3.5 py-2.5 text-sm text-[var(--ink)] outline-none"
                  />
                  <button
                    onClick={openPostcode}
                    className="shrink-0 rounded-xl bg-[var(--ink)] px-4 text-sm font-medium text-white hover:bg-[var(--accent)]"
                  >
                    주소 검색
                  </button>
                </div>
              </div>
              <Field
                label="배송지 주소"
                required
                value={form.address}
                onChange={(v) => setForm({ ...form, address: v })}
                placeholder="도로명 주소"
                readOnly
              />
              <Field
                label="상세 주소"
                required
                value={form.addressDetail}
                onChange={(v) => setForm({ ...form, addressDetail: v })}
                placeholder="동·호수 등"
              />
              <div>
                <label className="mb-1 block text-xs font-medium text-[var(--ink-soft)]">요청사항 (선택)</label>
                <textarea
                  value={form.request}
                  onChange={(e) => setForm({ ...form, request: e.target.value })}
                  placeholder="배송 관련 요청사항을 적어주세요"
                  rows={3}
                  className="w-full resize-none rounded-xl border border-[var(--line)] bg-white px-3.5 py-2.5 text-sm text-[var(--ink)] outline-none focus:border-[var(--accent)]"
                />
              </div>
            </div>

            <div className="mt-5 rounded-xl bg-[var(--accent)]/8 p-4 text-xs leading-relaxed text-[var(--ink-soft)]">
              ⚠️ 배송지는 매 캠페인마다 새로 확인합니다.
              <br />
              오배송 방지를 위해 입력값을 다시 한번 체크해 주세요.
            </div>

            <div className="mt-3 space-y-3 rounded-xl border border-dashed border-[var(--line)] p-4 text-xs leading-relaxed text-[var(--ink-soft)]">
              <p>
                📌 <strong className="text-[var(--ink)]">업로드·정산 안내</strong>
                <br />
                안내된 업로드 마감일까지 업로드 시 정산이 진행됩니다.
                <br />
                정산은 매월 5일 일괄 지급됩니다.
              </p>
              <p>
                📌 <strong className="text-[var(--ink)]">콘텐츠 활용 안내</strong>
                <br />
                콘텐츠는 브랜드 계정 내 스토리, 피드에 활용될 수 있습니다.
                <br />
                2차 활용에 동의해 주신 분들의 콘텐츠는 유료 공식 홈페이지, SNS, 플랫폼 등에 활용될 수 있는 점 참고 부탁드립니다.
              </p>
            </div>

            <label className="mt-4 flex items-start gap-2 text-xs text-[var(--ink-soft)]">
              <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-0.5" />
              안내된 캠페인별 가이드라인 및 고료 조건을 확인했으며 이에 동의합니다.
            </label>
            <p className="mt-2 text-xs text-[var(--ink-soft)]">제작된 콘텐츠는 브랜드 및 SIRIAI의 2차 활용에 동의합니다.</p>
            <p className="mt-1 text-xs text-[var(--ink-faint)]">
              (필수) 진행 제품은 브랜드 프로모션 상황에 따라 일부 변경될 수 있습니다.
            </p>

            {error && <p className="mt-3 text-xs text-red-500">{error}</p>}

            <button
              onClick={submit}
              disabled={submitting}
              className="mt-5 w-full rounded-full bg-[var(--ink)] py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--accent)] disabled:opacity-50"
            >
              {submitting ? "제출 중…" : `${campaign.brand} 캠페인 지원서 제출하기`}
            </button>
            <button
              onClick={() => setStep("detail")}
              className="mt-2 w-full rounded-full py-2 text-xs text-[var(--ink-faint)] hover:text-[var(--ink)]"
            >
              ← 캠페인 정보 다시 보기
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex gap-3">
      <dt className="w-24 shrink-0 text-[var(--ink-faint)]">{k}</dt>
      <dd className="text-[var(--ink)]">{v}</dd>
    </div>
  );
}

function GuideBlock({ icon, label, text }: { icon: string; label: string; text: string }) {
  return (
    <div className="rounded-xl bg-[var(--bg-soft)] p-3.5">
      <p className="mb-1 text-xs font-semibold text-[var(--ink)]">
        {icon} {label}
      </p>
      <p className="text-xs leading-relaxed whitespace-pre-line text-[var(--ink-soft)]">{text}</p>
    </div>
  );
}

function CopyRow({ label, value, onCopy, copied }: { label: string; value: string; onCopy: () => void; copied: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-[var(--bg-soft)] px-3.5 py-2.5">
      <div className="min-w-0">
        <p className="text-[10px] text-[var(--ink-faint)]">{label}</p>
        <p className="truncate text-sm text-[var(--ink)]">{value}</p>
      </div>
      <button
        onClick={onCopy}
        className="ml-3 shrink-0 rounded-full border border-[var(--line)] px-3 py-1 text-[11px] text-[var(--ink-soft)] hover:bg-white"
      >
        {copied ? "복사됨" : "복사"}
      </button>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  required,
  readOnly,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  required?: boolean;
  readOnly?: boolean;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-[var(--ink-soft)]">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        value={value}
        readOnly={readOnly}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full rounded-xl border border-[var(--line)] px-3.5 py-2.5 text-sm text-[var(--ink)] outline-none focus:border-[var(--accent)] ${readOnly ? "bg-[var(--bg-soft)]" : "bg-white"}`}
      />
    </div>
  );
}
