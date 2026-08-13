export default function Footer() {
  return (
    <footer className="border-t border-[var(--line)] px-6 py-12 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-start justify-between gap-8">
          <div>
            <span className="font-display text-xl text-[var(--ink)]">
              siri<span className="text-[var(--accent)]">AI</span>
            </span>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-[var(--ink-soft)]">
              가장 쉬운 AI 리터러시로 브랜드와 크리에이터를 잇습니다.
            </p>
            <a
              href="https://siriai.co.kr"
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-block text-xs text-[var(--accent)] link-underline"
            >
              siriai.co.kr →
            </a>
          </div>

          <div className="text-xs leading-relaxed text-[var(--ink-faint)]">
            <p>상호 시리아이(SIRIAI) · 대표 김동현</p>
            <p>사업자등록번호 405-23-02027 · 통신판매신고번호 제2024-서울용산-1589호</p>
            <p>서울특별시 용산구 한강대로 293, 4층 A호 (갈월동, 성원빌딩)</p>
            <p>대표전화 070-7576-1944 · 개인정보보호책임자 박슬범 (sbsiriai@gmail.com)</p>
          </div>
        </div>

        <div className="mt-10 flex flex-col-reverse items-center justify-between gap-4 border-t border-[var(--line)] pt-6 text-xs text-[var(--ink-faint)] sm:flex-row">
          <p>© 2026 SIRIAI. All rights reserved.</p>
          <p>Architecture for Insight, AI</p>
        </div>
      </div>
    </footer>
  );
}
