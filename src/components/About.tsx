const pillars = [
  {
    tag: "01 · CONNECT",
    title: "크리에이터의 목소리로,\n브랜드를 세상에",
    desc: "아무리 크게 외쳐도 고객은 브랜드를 이해하지 않아요. 사랑받는 법을 가장 잘 아는 크리에이터와 함께, 가장 쉽고 빠르게 고객에게 다가갑니다.",
  },
  {
    tag: "02 · ARCHITECT",
    title: "핵심을 짚는\n아키텍처링",
    desc: "IT·제조·아트·패션·뷰티를 아우르는 경험과 폭넓은 네트워크로 비즈니스 구조를 빠르게 설계해요. 페인포인트를 정확히 짚어내고, 기획부터 해결까지 함께합니다.",
  },
  {
    tag: "03 · BUILD",
    title: "2주 만에\n현실이 되는 아이디어",
    desc: "사라지는 기억보다 빠르게 아이디어를 검증하고, 화면에 감각적으로 구현해요. 상상 속 프로덕트를 가장 빠르게 현실로 만납니다.",
  },
];

export default function About() {
  return (
    <section id="about" className="relative bg-[var(--dark)] px-6 py-28 text-[var(--paper)] lg:px-10">
      <div className="grain absolute inset-0" />
      <div className="relative mx-auto max-w-7xl">
        <p className="mb-4 text-xs tracking-[0.25em] text-[var(--accent-tint)] uppercase">
          Value
        </p>
        <h2 className="font-display max-w-2xl text-4xl leading-tight sm:text-5xl">
          시리아이가 모두의
          <br />
          &ldquo;시리아이(<span style={{ fontFamily: '"Hiragino Sans", "Yu Gothic", -apple-system, sans-serif' }}>しりあい</span>)&rdquo;가 됩니다
        </h2>
        <p className="mt-8 max-w-xl text-base leading-relaxed text-[var(--paper)]/70">
          시리아이(<span style={{ fontFamily: '"Hiragino Sans", "Yu Gothic", -apple-system, sans-serif' }}>しりあい</span>)는 &lsquo;아는 사이&rsquo;, 이미 알고 지내던 사람이라는 뜻이에요.
          가장 쉬운 AI 리터러시를 통해 브랜드가 진짜 필요로 하는 것을 정확히 읽고,
          사람의 마음에 닿는 아키텍처링으로 문화적 영향력을 퍼트립니다.
        </p>

        <div className="mt-16 grid gap-8 border-t border-[var(--paper)]/15 pt-12 sm:grid-cols-3">
          {pillars.map((p) => (
            <div key={p.tag}>
              <p className="mb-3 text-xs font-semibold tracking-[0.15em] text-[var(--accent-tint)]">
                {p.tag}
              </p>
              <h3 className="font-display text-xl leading-snug whitespace-pre-line text-[var(--paper)]">
                {p.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-[var(--paper)]/60">{p.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 flex flex-wrap items-end gap-4 border-t border-[var(--paper)]/15 pt-12">
          <p className="font-display text-5xl text-[var(--accent-tint)] sm:text-6xl">+32%</p>
          <p className="max-w-xs text-sm leading-relaxed text-[var(--paper)]/60">
            사람의 마음에 닿는 아키텍처링을 통해 평균 32% 이상의 의사결정 비용을
            줄인 경험을 함께 만들어가요.
          </p>
        </div>
      </div>
    </section>
  );
}
