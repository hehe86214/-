"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Stamp = {
  emoji: string;
  title: string;
  message: string;
  color: string;
};

type HistoryMap = Record<string, Stamp>;

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

const STORAGE_KEY = "lucky-draw-history";
const WEEKDAYS = ["日", "一", "二", "三", "四", "五", "六"];

function dateKey(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function LuckyDrawPage() {
  const [now] = useState(() => new Date());
  const [history, setHistory] = useState<HistoryMap>({});
  const [loaded, setLoaded] = useState(false);

  const todayKey = dateKey(now);
  const todayLabel = now.toLocaleDateString("zh-TW", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reading browser-only localStorage, must defer past hydration
      if (raw) setHistory(JSON.parse(raw));
    } catch {
      // ignore corrupted/unavailable storage
    }
    setLoaded(true);
  }, []);

  const todayStamp = history[todayKey];

  function draw() {
    if (todayStamp) return;
    const stamp = STAMPS[Math.floor(Math.random() * STAMPS.length)];
    const next = { ...history, [todayKey]: stamp };
    setHistory(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore unavailable storage
    }
  }

  function clearHistory() {
    if (!window.confirm("確定要清除所有集點章紀錄嗎？這個動作無法復原。")) return;
    setHistory({});
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore unavailable storage
    }
  }

  const year = now.getFullYear();
  const month = now.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const leadingBlanks = new Date(year, month, 1).getDay();
  const monthLabel = now.toLocaleDateString("zh-TW", { year: "numeric", month: "long" });
  const totalCollected = Object.keys(history).length;

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
        <h1 className="text-3xl font-bold text-stone-800 dark:text-stone-100">🎫 棒棒集點章</h1>
        <p className="mt-2 text-stone-500 dark:text-stone-400">{todayLabel}</p>
        <p className="mt-1 text-stone-500 dark:text-stone-400">
          每天可以抽一次印章，看看今天表現得多棒！
        </p>
      </div>

      <div className="flex flex-col items-center gap-6">
        <div className="flex aspect-square w-[70vw] max-w-[256px] items-center justify-center">
          {todayStamp ? (
            <div
              className="animate-stamp-pop flex h-[90%] w-[90%] flex-col items-center justify-center gap-2 rounded-full border-4 border-dashed text-center"
              style={{ borderColor: todayStamp.color, backgroundColor: `${todayStamp.color}1A` }}
            >
              <span className="text-6xl">{todayStamp.emoji}</span>
              <p className="px-4 text-xl font-bold" style={{ color: todayStamp.color }}>
                {todayStamp.title}
              </p>
            </div>
          ) : (
            <div className="flex h-[90%] w-[90%] flex-col items-center justify-center gap-2 rounded-full border-4 border-dashed border-stone-300 text-stone-400 dark:border-stone-700">
              <span className="text-5xl">🎁</span>
              <p className="text-sm">今天還沒蓋章喔</p>
            </div>
          )}
        </div>

        {todayStamp && (
          <p className="max-w-xs text-center text-lg font-medium text-stone-700 dark:text-stone-200">
            {todayStamp.message}
          </p>
        )}

        <button
          onClick={draw}
          disabled={!loaded || !!todayStamp}
          className="rounded-full bg-[#D97757] px-8 py-3 text-lg font-bold text-white shadow-md transition hover:bg-[#C6684A] disabled:cursor-not-allowed disabled:bg-stone-300"
        >
          {todayStamp ? "今天已經蓋過章囉" : "🥠 抽一張今日印章"}
        </button>
        {todayStamp && (
          <p className="text-sm text-stone-400">明天再回來抽下一張吧！</p>
        )}
      </div>

      <div className="w-full max-w-md rounded-2xl border border-stone-200 bg-[#FFFDF9]/90 p-6 shadow-sm dark:border-stone-700/60 dark:bg-[#241F1A]/70">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-stone-800 dark:text-stone-100">📅 {monthLabel}集章表</h2>
          <button
            onClick={clearHistory}
            className="text-sm font-medium text-stone-400 hover:text-[#C97B6B]"
          >
            清除紀錄
          </button>
        </div>
        <div className="mb-2 grid grid-cols-7 gap-1.5 text-center text-xs font-medium text-stone-400">
          {WEEKDAYS.map((w) => (
            <span key={w}>{w}</span>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1.5">
          {Array.from({ length: leadingBlanks }).map((_, i) => (
            <div key={`blank-${i}`} />
          ))}
          {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
            const key = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const stamp = history[key];
            const isToday = key === todayKey;
            return (
              <div
                key={key}
                className={`flex aspect-square flex-col items-center justify-center rounded-lg text-xs ${
                  isToday ? "ring-2 ring-[#D97757]" : ""
                }`}
                style={{ backgroundColor: stamp ? `${stamp.color}1A` : "transparent" }}
              >
                {stamp ? (
                  <span className="text-lg leading-none">{stamp.emoji}</span>
                ) : (
                  <span className="text-stone-300 dark:text-stone-700">{day}</span>
                )}
              </div>
            );
          })}
        </div>
        <p className="mt-4 text-center text-sm font-medium text-stone-500 dark:text-stone-400">
          已經集了 {totalCollected} 個印章囉！
        </p>
      </div>
    </div>
  );
}
