export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-[var(--line)]/70 bg-white/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
        <a href="#top" className="font-display text-2xl tracking-tight text-[var(--ink)]">
          siri<span className="text-[var(--accent)]">AI</span>
        </a>

        <nav className="hidden items-center gap-8 text-sm text-[var(--ink-soft)] md:flex">
          <a href="#about" className="link-underline">
            소개
          </a>
          <a href="#how" className="link-underline">
            협업 프로세스
          </a>
          <a
            href="https://siriai.co.kr"
            target="_blank"
            rel="noreferrer"
            className="link-underline"
          >
            siriai.co.kr
          </a>
        </nav>

        <span className="rounded-full border border-[var(--line)] px-3 py-1 text-[11px] tracking-[0.1em] text-[var(--ink-faint)] uppercase">
          Private Access
        </span>
      </div>
    </header>
  );
}
