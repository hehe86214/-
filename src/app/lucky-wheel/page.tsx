"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { readSpinCredits, spendSpinCredit, SPIN_CREDITS_KEY } from "@/lib/spin-credits";

const COLORS = [
  "#D98E73", // terracotta
  "#7FA99B", // sage teal
  "#E0B24C", // muted gold
  "#8497B0", // dusty blue
  "#C98CA0", // dusty rose
  "#82AD7A", // sage green
  "#C97B6B", // soft brick
  "#9C8AC9", // soft periwinkle
];

const SPIN_DURATION_MS = 4200;

const DEFAULT_REWARDS = [
  "糖果一顆",
  "看電視一小時",
  "玩平板一小時",
  "貼紙一張",
  "多聽一個睡前故事",
];

export default function LuckyWheelPage() {
  const [rewardsText, setRewardsText] = useState(DEFAULT_REWARDS.join("\n"));
  const [rewards, setRewards] = useState<string[]>(DEFAULT_REWARDS);
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const pendingWinnerRef = useRef<string | null>(null);

  const [spinCredits, setSpinCredits] = useState(0);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reading browser-only localStorage, must defer past hydration
    setSpinCredits(readSpinCredits());
    function onStorage(e: StorageEvent) {
      if (e.key === SPIN_CREDITS_KEY || e.key === null) {
        setSpinCredits(readSpinCredits());
      }
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const canSpin = rewards.length >= 2 && !spinning && spinCredits > 0;

  const segAngle = rewards.length > 0 ? 360 / rewards.length : 0;

  const gradient = useMemo(() => {
    if (rewards.length === 0) return "#e5e7eb";
    const stops = rewards.map((_, i) => {
      const from = i * segAngle;
      const to = (i + 1) * segAngle;
      const color = COLORS[i % COLORS.length];
      return `${color} ${from}deg ${to}deg`;
    });
    return `conic-gradient(${stops.join(", ")})`;
  }, [rewards, segAngle]);

  function applyRewards() {
    const list = Array.from(
      new Set(
        rewardsText
          .split("\n")
          .map((r) => r.trim())
          .filter(Boolean)
      )
    );
    setRewards(list);
    setWinner(null);
    setRotation(0);
  }

  function removeReward(target: string) {
    setRewards((prev) => prev.filter((r) => r !== target));
  }

  function spin() {
    if (!canSpin) return;
    const idx = Math.floor(Math.random() * rewards.length);
    const seg = 360 / rewards.length;
    const targetAngle = (360 - (idx * seg + seg / 2) + 360) % 360;
    const currentMod = ((rotation % 360) + 360) % 360;
    const delta = (targetAngle - currentMod + 360) % 360;
    const extraSpins = 5 + Math.floor(Math.random() * 3);

    pendingWinnerRef.current = rewards[idx];
    setWinner(null);
    setSpinning(true);
    setRotation((prev) => prev + extraSpins * 360 + delta);
    setSpinCredits(spendSpinCredit());
  }

  function handleTransitionEnd() {
    if (!spinning) return;
    setSpinning(false);
    setWinner(pendingWinnerRef.current);
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
        <h1 className="text-3xl font-bold text-stone-800 dark:text-stone-100">
          🎡 幸運轉盤小獎勵
        </h1>
        <p className="mt-2 text-stone-500 dark:text-stone-400">
          在「小一國語練習」考 100 分，就能來這裡轉一次轉盤，拿到獎勵！
        </p>
      </div>

      <p className="text-sm font-medium text-stone-500 dark:text-stone-400">
        🎯 目前可抽獎次數：{spinCredits} 次
      </p>

      <div className="flex w-full max-w-4xl flex-col items-center gap-10 md:flex-row md:items-start md:justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative aspect-square w-[78vw] max-w-[320px]">
            <div className="absolute left-1/2 top-[-14px] z-10 h-0 w-0 -translate-x-1/2 border-l-[14px] border-r-[14px] border-t-[22px] border-l-transparent border-r-transparent border-t-[#D97757] drop-shadow" />
            <div
              onTransitionEnd={handleTransitionEnd}
              style={{
                backgroundImage: gradient,
                transform: `rotate(${rotation}deg)`,
                transition: spinning
                  ? `transform ${SPIN_DURATION_MS}ms cubic-bezier(0.17, 0.67, 0.32, 1)`
                  : "none",
              }}
              className="relative h-full w-full overflow-hidden rounded-full border-4 border-[#FFFDF9] shadow-xl dark:border-stone-800"
            >
              {rewards.length === 0 ? (
                <div className="flex h-full w-full items-center justify-center text-sm text-stone-400">
                  請先輸入獎勵
                </div>
              ) : (
                rewards.map((reward, i) => {
                  const angle = i * segAngle + segAngle / 2;
                  return (
                    <div
                      key={reward + i}
                      className="absolute left-1/2 top-1/2 h-0 w-[46%] origin-left"
                      style={{ transform: `rotate(${angle - 90}deg)` }}
                    >
                      <span className="ml-[14%] block max-w-[70px] truncate text-xs font-semibold text-white drop-shadow">
                        {reward}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
            <div className="absolute left-1/2 top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-[#FFFDF9] bg-[#E0B24C] shadow dark:border-stone-900" />
          </div>

          <button
            onClick={spin}
            disabled={!canSpin}
            className="rounded-full bg-[#D97757] px-8 py-3 text-lg font-bold text-white shadow-md transition hover:bg-[#C6684A] disabled:cursor-not-allowed disabled:bg-stone-300 disabled:text-stone-500"
          >
            {spinning ? "轉動中…" : "開始轉動"}
          </button>
          {rewards.length > 0 && rewards.length < 2 && (
            <p className="text-sm text-[#B98A4E]">至少需要 2 個獎勵才能轉動喔！</p>
          )}
          {rewards.length >= 2 && spinCredits <= 0 && !spinning && (
            <p className="max-w-xs text-center text-sm text-[#B98A4E]">
              請先到{" "}
              <Link href="/chinese-quiz" className="font-semibold underline">
                小一國語練習
              </Link>{" "}
              考 100 分，才能得到抽獎機會！
            </p>
          )}
        </div>

        <div className="flex w-full max-w-sm flex-col gap-3">
          <label className="text-sm font-medium text-stone-700 dark:text-stone-300">
            輸入獎勵（一行一個，例如：糖果一顆）
          </label>
          <textarea
            value={rewardsText}
            onChange={(e) => setRewardsText(e.target.value)}
            disabled={spinning}
            rows={6}
            placeholder={"糖果一顆\n看電視一小時\n玩平板一小時"}
            className="rounded-lg border border-stone-300 bg-white p-3 text-sm text-stone-900 shadow-sm focus:border-[#8497B0] focus:outline-none disabled:opacity-60 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100"
          />
          <button
            onClick={applyRewards}
            disabled={spinning}
            className="rounded-lg bg-[#8497B0] px-4 py-2 font-medium text-white shadow-sm transition hover:bg-[#728299] disabled:cursor-not-allowed disabled:bg-stone-300"
          >
            設定獎勵
          </button>

          {rewards.length > 0 && (
            <div className="mt-2 flex flex-col gap-2">
              <p className="text-sm font-medium text-stone-700 dark:text-stone-300">
                目前獎勵（{rewards.length}）
              </p>
              <ul className="flex flex-wrap gap-2">
                {rewards.map((reward) => (
                  <li
                    key={reward}
                    className="flex items-center gap-1 rounded-full bg-[#F5EEE3] px-3 py-1 text-sm text-stone-700 dark:bg-stone-800 dark:text-stone-200"
                  >
                    {reward}
                    <button
                      onClick={() => removeReward(reward)}
                      disabled={spinning}
                      aria-label={`移除 ${reward}`}
                      className="text-stone-400 hover:text-[#C97B6B] disabled:pointer-events-none"
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {winner && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/40 px-4">
          <div className="flex flex-col items-center gap-4 rounded-2xl bg-[#FFFDF9] px-10 py-8 text-center shadow-2xl dark:bg-stone-900">
            <span className="animate-bounce text-5xl">🎉</span>
            <p className="text-lg text-stone-500 dark:text-stone-400">獲得的獎勵是</p>
            <p className="text-4xl font-extrabold text-[#C6684A]">{winner}</p>
            <div className="mt-4 flex gap-3">
              <button
                onClick={() => setWinner(null)}
                className="rounded-full bg-[#D97757] px-5 py-2 font-medium text-white hover:bg-[#C6684A]"
              >
                收下獎勵
              </button>
              <button
                onClick={() => {
                  removeReward(winner);
                  setWinner(null);
                }}
                className="rounded-full border border-stone-300 px-5 py-2 font-medium text-stone-700 hover:bg-stone-50 dark:border-stone-700 dark:text-stone-200 dark:hover:bg-stone-800"
              >
                從轉盤移除（限量獎勵用）
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
