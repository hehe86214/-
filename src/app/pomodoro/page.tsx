"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Mode = "work" | "short" | "long";

type Settings = {
  work: number;
  shortBreak: number;
  longBreak: number;
  longBreakInterval: number;
};

const MODE_LABEL: Record<Mode, string> = {
  work: "認真學習",
  short: "休息一下",
  long: "好好休息",
};

const DEFAULT_SETTINGS: Settings = {
  work: 20,
  shortBreak: 5,
  longBreak: 15,
  longBreakInterval: 3,
};

const RADIUS = 120;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function durationFor(mode: Mode, settings: Settings) {
  if (mode === "work") return settings.work * 60;
  if (mode === "short") return settings.shortBreak * 60;
  return settings.longBreak * 60;
}

function formatTime(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
  const s = Math.floor(totalSeconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function clampMinutes(value: number) {
  if (Number.isNaN(value)) return 1;
  return Math.min(180, Math.max(1, Math.round(value)));
}

function playChime() {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = 660;
    gain.gain.setValueAtTime(0.001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.8);
    osc.onended = () => ctx.close();
  } catch {
    // audio unavailable, ignore
  }
}

export default function PomodoroPage() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [mode, setMode] = useState<Mode>("work");
  const [secondsLeft, setSecondsLeft] = useState(DEFAULT_SETTINGS.work * 60);
  const [running, setRunning] = useState(false);
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  const [celebrate, setCelebrate] = useState(false);
  const [notifyPermission, setNotifyPermission] = useState<NotificationPermission | "unsupported">(
    "unsupported"
  );

  useEffect(() => {
    if (typeof Notification !== "undefined") {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reading a browser-only API, must defer past hydration
      setNotifyPermission(Notification.permission);
    }
  }, []);

  // keep the paused clock in sync with settings edits
  useEffect(() => {
    if (!running) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- resets the paused countdown when settings change
      setSecondsLeft(durationFor(mode, settings));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings]);

  // tick
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev > 1) return prev - 1;

        playChime();
        if (typeof Notification !== "undefined" && Notification.permission === "granted") {
          new Notification(mode === "work" ? "🍅 時間到，休息一下吧！" : "🍅 休息結束，回來認真學習囉！");
        }

        if (mode === "work") {
          const nextCompleted = completedPomodoros + 1;
          setCompletedPomodoros(nextCompleted);
          const nextMode: Mode = nextCompleted % settings.longBreakInterval === 0 ? "long" : "short";
          setMode(nextMode);
          setCelebrate(true);
          return durationFor(nextMode, settings);
        }
        setMode("work");
        return durationFor("work", settings);
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running, mode, completedPomodoros, settings]);

  // reflect countdown in the tab title
  useEffect(() => {
    document.title = `${formatTime(secondsLeft)} · ${MODE_LABEL[mode]} – 學習計時器`;
    return () => {
      document.title = "學習小幫手";
    };
  }, [secondsLeft, mode]);

  function updateSetting(key: keyof Settings, value: number) {
    setSettings((prev) => ({ ...prev, [key]: clampMinutes(value) }));
  }

  function toggleRunning() {
    setRunning((r) => {
      if (!r) setCelebrate(false);
      return !r;
    });
  }

  function resetCurrentSession() {
    setRunning(false);
    setCelebrate(false);
    setSecondsLeft(durationFor(mode, settings));
  }

  function skipSession() {
    setRunning(false);
    setCelebrate(false);
    if (mode === "work") {
      const nextCompleted = completedPomodoros + 1;
      setCompletedPomodoros(nextCompleted);
      const nextMode: Mode = nextCompleted % settings.longBreakInterval === 0 ? "long" : "short";
      setMode(nextMode);
      setSecondsLeft(durationFor(nextMode, settings));
    } else {
      setMode("work");
      setSecondsLeft(durationFor("work", settings));
    }
  }

  function resetAll() {
    setRunning(false);
    setCelebrate(false);
    setMode("work");
    setCompletedPomodoros(0);
    setSecondsLeft(durationFor("work", settings));
  }

  async function requestNotifications() {
    if (typeof Notification === "undefined") return;
    const result = await Notification.requestPermission();
    setNotifyPermission(result);
  }

  const totalForMode = durationFor(mode, settings);
  const progress = totalForMode > 0 ? (totalForMode - secondsLeft) / totalForMode : 0;
  const dashOffset = CIRCUMFERENCE * (1 - progress);
  const accent = mode === "work" ? "#D97757" : "#7FA99B";
  const cycleProgress = completedPomodoros % settings.longBreakInterval;

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
        <h1 className="text-3xl font-bold text-stone-800 dark:text-stone-100">🍅 小朋友學習計時器</h1>
        <p className="mt-2 text-stone-500 dark:text-stone-400">
          認真讀書 {settings.work} 分鐘，休息一下，養成專心的好習慣！
        </p>
      </div>

      <div className="flex w-full max-w-md flex-col items-center gap-6">
        {celebrate && (
          <div
            key={completedPomodoros}
            className="animate-stamp-pop rounded-full border-2 border-dashed border-[#D97757] bg-[#D97757]/10 px-5 py-2 text-sm font-semibold text-[#C6684A]"
          >
            🌟 太棒了，完成一次認真學習！
          </div>
        )}
        <div className="relative flex aspect-square w-[78vw] max-w-[280px] items-center justify-center">
          <svg viewBox="0 0 280 280" className="h-full w-full -rotate-90">
            <circle
              cx="140"
              cy="140"
              r={RADIUS}
              fill="none"
              stroke="#EDE6D9"
              strokeWidth="14"
              className="dark:stroke-stone-800"
            />
            <circle
              cx="140"
              cy="140"
              r={RADIUS}
              fill="none"
              stroke={accent}
              strokeWidth="14"
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={dashOffset}
              style={{ transition: "stroke-dashoffset 1s linear" }}
            />
          </svg>
          <div className="absolute flex flex-col items-center gap-2">
            <span className="text-sm font-semibold uppercase tracking-wide" style={{ color: accent }}>
              {MODE_LABEL[mode]}
            </span>
            <span className="text-5xl font-bold tabular-nums text-stone-800 dark:text-stone-100">
              {formatTime(secondsLeft)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {Array.from({ length: settings.longBreakInterval }).map((_, i) => (
            <span
              key={i}
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: i < cycleProgress ? "#D97757" : "#E5DCCC" }}
            />
          ))}
        </div>
        <p className="text-sm text-stone-500 dark:text-stone-400">
          已經完成 {completedPomodoros} 次認真學習囉！
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={toggleRunning}
            className="rounded-full bg-[#D97757] px-8 py-3 text-lg font-bold text-white shadow-md transition hover:bg-[#C6684A]"
          >
            {running ? "暫停" : secondsLeft === totalForMode ? "開始學習" : "繼續"}
          </button>
          <button
            onClick={resetCurrentSession}
            className="rounded-full border border-stone-300 px-5 py-2.5 font-medium text-stone-600 hover:bg-stone-50 dark:border-stone-700 dark:text-stone-300 dark:hover:bg-stone-800"
          >
            重設本階段
          </button>
          <button
            onClick={skipSession}
            className="rounded-full border border-stone-300 px-5 py-2.5 font-medium text-stone-600 hover:bg-stone-50 dark:border-stone-700 dark:text-stone-300 dark:hover:bg-stone-800"
          >
            跳到下一階段
          </button>
        </div>
        <button
          onClick={resetAll}
          className="text-sm font-medium text-stone-400 hover:text-[#C97B6B]"
        >
          全部重新開始
        </button>

        {notifyPermission === "default" && (
          <button
            onClick={requestNotifications}
            className="text-sm font-medium text-[#6E86A0] hover:underline dark:text-[#AFC2D4]"
          >
            🔔 開啟時段結束通知
          </button>
        )}
      </div>

      <div className="w-full max-w-md rounded-2xl border border-stone-200 bg-[#FFFDF9]/90 p-6 shadow-sm dark:border-stone-700/60 dark:bg-[#241F1A]/70">
        <h2 className="mb-4 text-lg font-bold text-stone-800 dark:text-stone-100">⏱️ 時間設定（家長可調整，分鐘）</h2>
        <div className="grid grid-cols-2 gap-4">
          <label className="flex flex-col gap-1 text-sm font-medium text-stone-600 dark:text-stone-300">
            學習時間
            <input
              type="number"
              min={1}
              max={180}
              value={settings.work}
              disabled={running}
              onChange={(e) => updateSetting("work", Number(e.target.value))}
              className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm focus:border-[#D97757] focus:outline-none disabled:opacity-60 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-stone-600 dark:text-stone-300">
            短休息
            <input
              type="number"
              min={1}
              max={180}
              value={settings.shortBreak}
              disabled={running}
              onChange={(e) => updateSetting("shortBreak", Number(e.target.value))}
              className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm focus:border-[#7FA99B] focus:outline-none disabled:opacity-60 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-stone-600 dark:text-stone-300">
            長休息
            <input
              type="number"
              min={1}
              max={180}
              value={settings.longBreak}
              disabled={running}
              onChange={(e) => updateSetting("longBreak", Number(e.target.value))}
              className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm focus:border-[#7FA99B] focus:outline-none disabled:opacity-60 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-stone-600 dark:text-stone-300">
            幾輪後長休息
            <input
              type="number"
              min={1}
              max={12}
              value={settings.longBreakInterval}
              disabled={running}
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  longBreakInterval: Math.min(12, Math.max(1, Math.round(Number(e.target.value) || 1))),
                }))
              }
              className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm focus:border-[#8497B0] focus:outline-none disabled:opacity-60 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100"
            />
          </label>
        </div>
        {running && (
          <p className="mt-3 text-xs text-stone-400">暫停後才能調整時間設定。</p>
        )}
      </div>
    </div>
  );
}
