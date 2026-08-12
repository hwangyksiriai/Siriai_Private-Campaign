"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Hero() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState("");

  async function enter() {
    const trimmed = code.trim();
    if (!trimmed) return;
    setError("");
    setChecking(true);
    const r = await fetch(`/api/portal/${encodeURIComponent(trimmed)}`);
    setChecking(false);
    if (!r.ok) {
      setError("유효하지 않은 코드예요. 다시 확인해 주세요.");
      return;
    }
    router.push(`/p/${encodeURIComponent(trimmed)}`);
  }

  return (
    <section
      id="top"
      className="relative flex h-screen min-h-[640px] flex-col items-center justify-center overflow-hidden bg-white"
    >
      {/* 개인 코드 입력 */}
      <div className="absolute top-6 left-1/2 w-full max-w-[380px] -translate-x-1/2 px-5">
        <div className="flex items-center gap-2 rounded-full border border-black/8 bg-white/88 py-1.5 pr-1.5 pl-4 shadow-[0_2px_10px_rgba(0,0,0,0.04)] backdrop-blur-xl">
          <input
            value={code}
            onChange={(e) => {
              setCode(e.target.value);
              if (error) setError("");
            }}
            onKeyDown={(e) => e.key === "Enter" && enter()}
            placeholder="개인 초대 코드를 입력하세요"
            autoCapitalize="none"
            className="flex-1 border-none bg-transparent text-[12.5px] text-[#111] outline-none placeholder:text-black/35"
          />
          <button
            onClick={enter}
            disabled={checking || !code.trim()}
            className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full bg-[#4d4da7]/13 disabled:opacity-50"
          >
            <span className="text-[13px] leading-none font-bold text-[#4d4da7]">→</span>
          </button>
        </div>
        {error && (
          <p className="mt-2 text-center text-[11.5px] text-red-500">{error}</p>
        )}
      </div>

      {/* 로고 + 텍스트 흐름 */}
      <div className="flex flex-col items-stretch gap-1 select-none">
        <span className="block text-center leading-none tracking-[-0.02em] text-black/13 [animation:textFlow_.8s_cubic-bezier(.22,.6,.36,1)_.2s_both] [font-size:clamp(56px,8vw,96px)]">
          <span
            style={{ fontFamily: "var(--font-logo-serif)" }}
            className="font-normal"
          >
            Siri
          </span>
          <span
            style={{ fontFamily: "var(--font-body)" }}
            className="font-black"
          >
            ai
          </span>
        </span>
        <div className="flex items-baseline justify-center gap-[0.3em]">
          <span className="[animation:textFlow_.8s_cubic-bezier(.22,.6,.36,1)_.75s_both] [font-size:clamp(15px,2vw,22px)] font-light tracking-[-0.01em] text-[#111]">
            Architecture for Insight,
          </span>
          <span className="[animation:textFlow_.8s_cubic-bezier(.22,.6,.36,1)_1.25s_both] [font-size:clamp(15px,2vw,22px)] font-normal tracking-[-0.01em] text-[#111]">
            AI
          </span>
        </div>
        <p className="[animation:textFlow_.8s_cubic-bezier(.22,.6,.36,1)_1.6s_both] mt-6 text-center text-[13px] tracking-[0.02em] text-black/35">
          함께한 인플루언서분들만을 위한 프라이빗 캠페인 페이지예요
        </p>
      </div>

      {/* 스크롤 인디케이터 대신 안내 */}
      <div className="absolute bottom-12 flex flex-col items-center gap-2.5">
        <span className="text-[9.5px] tracking-[.22em] text-black/20 uppercase">
          Invite Only
        </span>
      </div>
    </section>
  );
}
