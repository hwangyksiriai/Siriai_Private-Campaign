export default function Hero() {
  return (
    <section
      id="top"
      className="relative flex h-screen min-h-[640px] flex-col items-center justify-center overflow-hidden bg-white"
    >
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
