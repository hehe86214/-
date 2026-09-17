"use client";

import { useState } from "react";
import Link from "next/link";

type Stamp = {
  emoji: string;
  title: string;
  message: string;
  color: string;
};

const STAMPS: Stamp[] = [
  { emoji: "🌟", title: "閃亮之星", message: "今天的你超級閃耀，繼續發光發熱！", color: "#D98E73" },
  { emoji: "🏆", title: "冠軍等級", message: "表現優異，值得驕傲！", color: "#7FA99B" },
  { emoji: "👍", title: "讚讚讚", message: "做得很好，繼續保持！", color: "#E0B24C" },
  { emoji: "💯", title: "滿分表現", message: "完美的一天，太厲害了！", color: "#8497B0" },
  { emoji: "🎖️", title: "勇氣勳章", message: "勇敢挑戰自己，好棒！", color: "#C98CA0" },
  { emoji: "🌈", title: "彩虹活力", message: "帶著好心情，充滿活力！", color: "#82AD7A" },
  { emoji: "🍀", title: "幸運草", message: "今天運氣特別好，把握機會！", color: "#C97B6B" },
  { emoji: "📚", title: "認真學習", message: "專注認真，收穫滿滿！", color: "#9C8AC9" },
  { emoji: "🎉", title: "值得慶祝", message: "辛苦了，好好慶祝一下！", color: "#D98E73" },
  { emoji: "🌻", title: "陽光笑容", message: "你的笑容感染了大家！", color: "#E0B24C" },
  { emoji: "🦋", title: "蛻變成長", message: "今天又進步了一點點！", color: "#7FA99B" },
  { emoji: "⭐", title: "小巨星", message: "你是今天的最佳表現！", color: "#8497B0" },
];

const TODAY = new Date().toLocaleDateString("zh-TW", {
  year: "numeric",
  month: "long",
  day: "numeric",
  weekday: "long",
});

export default function LuckyDrawPage() {
  const [current, setCurrent] = useState<Stamp | null>(null);
  const [drawCount, setDrawCount] = useState(0);
  const [history, setHistory] = useState<Stamp[]>([]);

  function draw() {
    const stamp = STAMPS[Math.floor(Math.random() * STAMPS.length)];
    setCurrent(stamp);
    setDrawCount((c) => c + 1);
    setHistory((prev) => [stamp, ...prev].slice(0, 8));
  }

  function clearHistory() {
    setCurrent(null);
    setHistory([]);
  }

  return (
    <div className="flex flex-1 flex-col items-center gap-8 bg-gradient-to-b from-[#FBF4EA] to-[#FDFAF5] px-6 py-12 dark:from-[#221D18] dark:to-[#171310]">
      <div className="w-full max-w-4xl">
        <Link
          href="/"
          className="text-sm font-medium text-stone-400 hover:text-stone-600 dark:text-stone-500 dark:hover:text-stone-300"
        >
          ← 返回首頁
        </Link>
      </div>

      <div className="text-center">
        <h1 className="text-3xl font-bold text-stone-800 dark:text-stone-100">🎐 好運抽籤</h1>
        <p className="mt-2 text-stone-500 dark:text-stone-400">{TODAY}</p>
        <p className="mt-1 text-stone-500 dark:text-stone-400">抽一張籤，看看你今天表現得多棒！</p>
      </div>

      <div className="flex flex-col items-center gap-6">
        <div className="flex h-64 w-64 items-center justify-center">
          {current ? (
            <div
              key={drawCount}
              className="animate-stamp-pop flex h-56 w-56 flex-col items-center justify-center gap-2 rounded-full border-4 border-dashed text-center"
              style={{ borderColor: current.color, backgroundColor: `${current.color}1A` }}
            >
              <span className="text-6xl">{current.emoji}</span>
              <p className="px-4 text-xl font-bold" style={{ color: current.color }}>
                {current.title}
              </p>
            </div>
          ) : (
            <div className="flex h-56 w-56 flex-col items-center justify-center gap-2 rounded-full border-4 border-dashed border-stone-300 text-stone-400 dark:border-stone-700">
              <span className="text-5xl">🎁</span>
              <p className="text-sm">還沒抽過喔</p>
            </div>
          )}
        </div>

        {current && (
          <p className="max-w-xs text-center text-lg font-medium text-stone-700 dark:text-stone-200">
            {current.message}
          </p>
        )}

        <button
          onClick={draw}
          className="rounded-full bg-[#D97757] px-8 py-3 text-lg font-bold text-white shadow-md transition hover:bg-[#C6684A]"
        >
          {current ? "再抽一次" : "🥠 抽一張好棒棒籤"}
        </button>
      </div>

      {history.length > 0 && (
        <div className="flex w-full max-w-2xl flex-col items-center gap-3">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-stone-500 dark:text-stone-400">今天抽過的籤</p>
            <button
              onClick={clearHistory}
              className="text-sm font-medium text-stone-400 hover:text-[#C97B6B]"
            >
              清除紀錄
            </button>
          </div>
          <ul className="flex flex-wrap justify-center gap-2">
            {history.map((stamp, i) => (
              <li
                key={i}
                className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium"
                style={{ backgroundColor: `${stamp.color}1A`, color: stamp.color }}
              >
                <span>{stamp.emoji}</span>
                {stamp.title}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
