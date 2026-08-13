const brands = [
  "HYBE",
  "CJ ENM",
  "JYP",
  "MUSINSA",
  "COSRX",
  "innisfree",
  "moev",
  "oddtype",
  "8DIVISION",
  "Neverust",
  "QUADTHERA",
  "TOOMUCHTAX",
  "TOCOBO",
  "HARIM",
  "OJOS",
  "강릉시",
  "NONGSHIM",
];

export default function BrandMarquee() {
  const row = [...brands, ...brands];
  return (
    <section className="marquee-row border-y border-[var(--line)] bg-[var(--bg-soft)] py-6">
      <p className="mb-4 text-center text-[10px] tracking-[0.25em] text-[var(--ink-faint)] uppercase">
        Trusted by
      </p>
      <div className="overflow-hidden">
        <div className="marquee-track flex w-max items-center gap-14">
          {row.map((b, i) => (
            <span
              key={i}
              className="font-display shrink-0 text-2xl text-[var(--ink-soft)] opacity-70 sm:text-3xl"
            >
              {b}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
