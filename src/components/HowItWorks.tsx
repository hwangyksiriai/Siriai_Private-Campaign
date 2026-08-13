const steps = [
  {
    icon: "01",
    title: "개인 링크로 입장",
    desc: "이전에 함께한 크리에이터분들께 개인 초대 링크를 보내드려요. 그 링크로만 캠페인 목록을 볼 수 있어요.",
  },
  {
    icon: "02",
    title: "캠페인 신청",
    desc: "진행중이거나 새로 열린 캠페인 중 원하는 걸 골라 신청해요.",
  },
  {
    icon: "03",
    title: "선정 & 제품 수령",
    desc: "채택되면 담당자가 안내드리고, 제품을 보내드려요.",
  },
  {
    icon: "04",
    title: "콘텐츠 제작 & 업로드",
    desc: "자유롭게 콘텐츠를 만들고, 게시 후 포스팅 링크를 페이지에 남겨주세요.",
  },
  {
    icon: "05",
    title: "정산",
    desc: "정산 정보를 제출하시면 확인 후 순차적으로 정산해드려요. 이전에 제출하신 정보가 있다면 재사용도 가능해요.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how" className="bg-[var(--bg-soft)] px-6 py-28 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <p className="mb-3 text-xs tracking-[0.25em] text-[var(--accent)] uppercase">
          Collaboration Process
        </p>
        <h2 className="font-display mb-16 text-4xl text-[var(--ink)] sm:text-5xl">
          함께하는 방식은 간단해요
        </h2>

        <div className="relative grid gap-10 md:grid-cols-5">
          <div
            aria-hidden
            className="absolute top-6 right-0 left-0 hidden h-px bg-[var(--line)] md:block"
          />
          {steps.map((s) => (
            <div key={s.icon} className="relative">
              <div className="relative z-10 mb-6 flex h-12 w-12 items-center justify-center rounded-full border border-[var(--ink)] bg-[var(--bg-soft)] font-display text-sm text-[var(--ink)]">
                {s.icon}
              </div>
              <h3 className="font-display mb-2 text-lg text-[var(--ink)]">
                {s.title}
              </h3>
              <p className="text-sm leading-relaxed text-[var(--ink-soft)]">
                {s.desc}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-20 rounded-3xl border border-[var(--accent)]/30 bg-[var(--paper)] p-8">
          <p className="mb-2 text-sm font-medium text-[var(--accent)]">
            이미 시리아이와 함께한 적이 있으신가요?
          </p>
          <p className="text-sm leading-relaxed text-[var(--ink-soft)]">
            담당자에게 요청하시면 개인 초대 링크를 보내드려요. 별도의 로그인 없이
            링크 하나로 진행중인 캠페인 확인부터 신청, 정산까지 한번에 할 수 있어요.
          </p>
        </div>
      </div>
    </section>
  );
}
