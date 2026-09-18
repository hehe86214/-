"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const TOOLS = [
  {
    href: "/lucky-wheel",
    emoji: "🎡",
    title: "幸運轉盤小獎勵",
    description: "小一國語考 100 分，就能來轉一次轉盤，抽出今天的獎勵。",
    accent: "#D97757",
  },
  {
    href: "/pomodoro",
    emoji: "🍅",
    title: "小朋友學習計時器",
    description: "認真讀書、規律休息，陪小朋友養成專心學習的好習慣。",
    accent: "#7FA99B",
  },
  {
    href: "/lucky-draw",
    emoji: "🎫",
    title: "棒棒集點章",
    description: "每天抽一次印章，看看今天表現得多棒，集滿一整個月的好表現。",
    accent: "#9C8AC9",
  },
  {
    href: "/chinese-quiz",
    emoji: "✏️",
    title: "小一國語練習",
    description: "隨機 20 題國語練習題，考 100 分就能得到一次抽獎機會！",
    accent: "#8497B0",
  },
] as const;

function useParallax() {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        setOffset(window.scrollY);
        ticking = false;
      });
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return offset;
}

export default function Home() {
  const scrollY = useParallax();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="flex flex-1 flex-col bg-[#FDFAF5] text-stone-800 dark:bg-[#171310] dark:text-stone-100">
      <header className="sticky top-0 z-30 border-b border-dashed border-stone-300/70 bg-[#FBF4EA]/85 backdrop-blur dark:border-stone-700/60 dark:bg-[#221D18]/85">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-3.5 sm:px-6 sm:py-4">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-dashed border-[#D97757] text-lg">
              📚
            </span>
            <span className="flex flex-col leading-tight">
              <span className="text-base font-bold">學習小幫手</span>
              <span className="hidden text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-400 sm:block">
                Daily Learning Toolkit
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {TOOLS.map((tool) => (
              <a
                key={tool.href}
                href={tool.href}
                className="rounded-full px-3 py-1.5 text-sm font-medium text-stone-500 transition hover:bg-stone-800/5 hover:text-stone-800 dark:text-stone-400 dark:hover:bg-stone-100/10 dark:hover:text-stone-100"
              >
                {tool.title}
              </a>
            ))}
          </nav>

          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? "關閉選單" : "開啟選單"}
            aria-expanded={menuOpen}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-stone-300 text-stone-500 md:hidden dark:border-stone-700 dark:text-stone-400"
          >
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>

        {menuOpen && (
          <nav className="flex flex-col gap-1 border-t border-dashed border-stone-300/70 px-4 py-3 md:hidden dark:border-stone-700/60">
            {TOOLS.map((tool) => (
              <a
                key={tool.href}
                href={tool.href}
                onClick={() => setMenuOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-medium text-stone-600 hover:bg-stone-800/5 dark:text-stone-300 dark:hover:bg-stone-100/10"
              >
                {tool.emoji} {tool.title}
              </a>
            ))}
          </nav>
        )}
      </header>

      <main className="relative flex flex-1 flex-col items-center overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 opacity-40 dark:opacity-15"
          style={{
            backgroundImage: "radial-gradient(circle, #C9BBA0 1px, transparent 1px)",
            backgroundSize: "22px 22px",
            transform: `translateY(${scrollY * 0.08}px)`,
          }}
        />
        <div
          className="pointer-events-none absolute -right-12 top-20 hidden h-56 w-56 rounded-full border-2 border-dashed border-[#D97757]/25 sm:block"
          style={{ transform: `translateY(${scrollY * 0.15}px) rotate(12deg)` }}
        />
        <div
          className="pointer-events-none absolute -left-16 top-80 hidden h-48 w-48 rounded-full border-2 border-dashed border-[#7FA99B]/25 sm:block"
          style={{ transform: `translateY(${scrollY * -0.1}px) rotate(-6deg)` }}
        />

        <section className="relative z-10 flex max-w-2xl flex-col items-center gap-5 px-6 pb-16 pt-20 text-center sm:pt-28">
          <span className="rounded-full border border-dashed border-stone-400/60 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-stone-500 dark:border-stone-600 dark:text-stone-400">
            Daily Learning Toolkit
          </span>
          <h1 className="text-4xl font-bold sm:text-5xl">學習小幫手</h1>
          <p className="text-lg text-stone-500 dark:text-stone-400">
            四個小工具，陪你獎勵自己、保持專注、替今天的表現打打氣。
          </p>
        </section>

        <section className="relative z-10 grid w-full max-w-5xl gap-6 px-4 pb-24 sm:grid-cols-2 sm:px-6 xl:grid-cols-4">
          {TOOLS.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className="group flex flex-col gap-4 rounded-2xl border border-stone-200 bg-[#FFFDF9]/95 p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:border-stone-700/60 dark:bg-[#241F1A]/80"
            >
              <div
                className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-dashed text-2xl"
                style={{ borderColor: `${tool.accent}66`, backgroundColor: `${tool.accent}14` }}
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

      <footer className="border-t border-dashed border-stone-300/70 dark:border-stone-700/60">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-10 sm:flex-row sm:items-start sm:justify-between sm:px-6">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-dashed border-[#D97757] text-sm">
                📚
              </span>
              <span className="font-bold">學習小幫手</span>
            </div>
            <p className="max-w-xs text-sm text-stone-500 dark:text-stone-400">
              陪你每天進步一點點——獎勵自己、保持專注、替今天的表現打打氣。
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-400">工具</span>
            {TOOLS.map((tool) => (
              <a
                key={tool.href}
                href={tool.href}
                className="text-sm text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-100"
              >
                {tool.title}
              </a>
            ))}
          </div>
        </div>
        <div className="border-t border-dashed border-stone-300/70 px-6 py-4 text-center text-xs text-stone-400 dark:border-stone-700/60 dark:text-stone-500">
          © {new Date().getFullYear()} 學習小幫手
        </div>
      </footer>
    </div>
  );
}
