import Link from "next/link";

const TOOLS = [
  {
    href: "/lucky-wheel",
    emoji: "🎡",
    title: "幸運轉盤小獎勵",
    description: "答對題目才能轉一次轉盤，抽出今天的獎勵，讓學習更有動力。",
    accent: "#D97757",
  },
  {
    href: "/pomodoro",
    emoji: "🍅",
    title: "番茄鐘",
    description: "專注工作、規律休息，用番茄鐘幫你維持節奏、提升效率。",
    accent: "#7FA99B",
  },
  {
    href: "/lucky-draw",
    emoji: "🎐",
    title: "好運抽籤",
    description: "抽一張好棒棒籤，看看今天表現得多棒，替自己打打氣。",
    accent: "#9C8AC9",
  },
] as const;

export default function Home() {
  return (
    <div className="flex flex-1 flex-col bg-gradient-to-b from-[#FBF4EA] to-[#FDFAF5] text-stone-800 dark:from-[#221D18] dark:to-[#171310] dark:text-stone-100">
      <header className="sticky top-0 z-20 border-b border-stone-200/70 bg-[#FBF4EA]/80 backdrop-blur dark:border-stone-800/70 dark:bg-[#221D18]/80">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-5">
          <span className="text-lg font-bold">📚 學習小幫手</span>
          <nav className="hidden gap-6 text-sm font-medium text-stone-500 dark:text-stone-400 sm:flex">
            {TOOLS.map((tool) => (
              <a
                key={tool.href}
                href={tool.href}
                className="transition hover:text-stone-800 dark:hover:text-stone-100"
              >
                {tool.title}
              </a>
            ))}
          </nav>
        </div>
      </header>

      <main className="relative flex flex-1 flex-col items-center overflow-hidden px-6">
        <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-[#D97757]/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 top-40 h-72 w-72 rounded-full bg-[#7FA99B]/20 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-[#9C8AC9]/15 blur-3xl" />

        <section className="relative z-10 flex max-w-2xl flex-col items-center gap-4 py-20 text-center">
          <span className="rounded-full bg-stone-800/5 px-4 py-1 text-xs font-semibold uppercase tracking-wider text-stone-500 dark:bg-stone-100/10 dark:text-stone-400">
            Daily Learning Toolkit
          </span>
          <h1 className="text-4xl font-bold sm:text-5xl">學習小幫手</h1>
          <p className="text-lg text-stone-500 dark:text-stone-400">
            三個小工具，陪你獎勵自己、保持專注、替今天的表現打打氣。
          </p>
        </section>

        <section className="relative z-10 grid w-full max-w-5xl gap-6 pb-24 sm:grid-cols-2 lg:grid-cols-3">
          {TOOLS.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className="group flex flex-col gap-4 rounded-2xl border border-stone-200 bg-[#FFFDF9]/90 p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:border-stone-700/60 dark:bg-[#241F1A]/70"
            >
              <div
                className="flex h-14 w-14 items-center justify-center rounded-full text-2xl"
                style={{ backgroundColor: `${tool.accent}1A` }}
              >
                {tool.emoji}
              </div>
              <div className="flex flex-col gap-1">
                <h2 className="text-lg font-bold">{tool.title}</h2>
                <p className="text-sm text-stone-500 dark:text-stone-400">{tool.description}</p>
              </div>
              <span
                className="mt-auto inline-flex items-center gap-1 text-sm font-semibold transition group-hover:gap-2"
                style={{ color: tool.accent }}
              >
                前往使用 →
              </span>
            </Link>
          ))}
        </section>
      </main>

      <footer className="border-t border-stone-200/70 px-6 py-8 text-center text-sm text-stone-400 dark:border-stone-800/70 dark:text-stone-500">
        <p>學習小幫手 · 陪你每天進步一點點</p>
        <p className="mt-1">© {new Date().getFullYear()} 學習小幫手</p>
      </footer>
    </div>
  );
}
