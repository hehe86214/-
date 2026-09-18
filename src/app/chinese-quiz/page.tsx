"use client";

import { useState } from "react";
import Link from "next/link";
import { addSpinCredit } from "@/lib/spin-credits";
import { RubyText } from "@/components/RubyText";

type Question = {
  id: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  // 「一」在這些題目的提示句中變調（例如「一隻貓」的「一」讀ㄧˋ），
  // 因為正確量詞藏在填空選項裡、不在句子本身，無法自動判斷，需手動標示。
  promptZhuyinOverrides?: Record<number, string>;
};

const QUESTION_COUNT = 20;

// 原創的小一國語程度練習題，涵蓋量詞、反義詞、疊字形容詞、語詞填空、
// 注音符號（聲符開頭）與簡短閱讀理解。內容非特定版本課本原文。
const QUESTION_BANK: Question[] = [
  { id: "m1", prompt: "一（　　）貓", options: ["隻", "個", "張", "本"], correctIndex: 0, promptZhuyinOverrides: { 0: "ㄧˋ" } },
  { id: "m2", prompt: "一（　　）書", options: ["本", "隻", "張", "顆"], correctIndex: 0, promptZhuyinOverrides: { 0: "ㄧˋ" } },
  { id: "m3", prompt: "一（　　）椅子", options: ["張", "隻", "朵", "顆"], correctIndex: 0, promptZhuyinOverrides: { 0: "ㄧˋ" } },
  { id: "m4", prompt: "一（　　）花", options: ["朵", "隻", "本", "件"], correctIndex: 0, promptZhuyinOverrides: { 0: "ㄧˋ" } },
  { id: "m5", prompt: "一（　　）汽車", options: ["輛", "隻", "張", "顆"], correctIndex: 0, promptZhuyinOverrides: { 0: "ㄧˊ" } },
  { id: "m6", prompt: "一（　　）鉛筆", options: ["枝", "隻", "張", "朵"], correctIndex: 0, promptZhuyinOverrides: { 0: "ㄧˋ" } },
  { id: "m7", prompt: "一（　　）蘋果", options: ["顆", "張", "隻", "本"], correctIndex: 0, promptZhuyinOverrides: { 0: "ㄧˋ" } },
  { id: "m8", prompt: "一（　　）衣服", options: ["件", "隻", "張", "顆"], correctIndex: 0, promptZhuyinOverrides: { 0: "ㄧˊ" } },
  { id: "m9", prompt: "一（　　）魚", options: ["條", "張", "隻", "本"], correctIndex: 0, promptZhuyinOverrides: { 0: "ㄧˋ" } },
  { id: "a1", prompt: "「大」的反義詞是？", options: ["小", "多", "高", "長"], correctIndex: 0 },
  { id: "a2", prompt: "「高」的反義詞是？", options: ["矮", "大", "快", "重"], correctIndex: 0 },
  { id: "a3", prompt: "「快」的反義詞是？", options: ["慢", "高", "多", "長"], correctIndex: 0 },
  { id: "a4", prompt: "「多」的反義詞是？", options: ["少", "大", "高", "快"], correctIndex: 0 },
  { id: "a5", prompt: "「上」的反義詞是？", options: ["下", "左", "右", "前"], correctIndex: 0 },
  { id: "a6", prompt: "「新」的反義詞是？", options: ["舊", "大", "快", "多"], correctIndex: 0 },
  { id: "d1", prompt: "（　　）的太陽", options: ["紅紅", "藍藍", "綠綠", "黑黑"], correctIndex: 0 },
  { id: "d2", prompt: "（　　）的草地", options: ["綠綠", "紅紅", "黃黃", "白白"], correctIndex: 0 },
  { id: "d3", prompt: "（　　）的天空", options: ["藍藍", "紅紅", "黑黑", "黃黃"], correctIndex: 0 },
  { id: "d4", prompt: "（　　）的雪", options: ["白白", "黑黑", "紅紅", "綠綠"], correctIndex: 0 },
  { id: "d5", prompt: "（　　）的星星", options: ["亮亮", "暗暗", "重重", "慢慢"], correctIndex: 0 },
  { id: "s1", prompt: "今天天氣很（　　）。", options: ["熱", "矮", "慢", "重"], correctIndex: 0 },
  { id: "s2", prompt: "我（　　）學校上課。", options: ["去", "回", "坐", "吃"], correctIndex: 0 },
  { id: "s3", prompt: "小明（　　）早餐。", options: ["吃", "穿", "走", "聽"], correctIndex: 0 },
  { id: "s4", prompt: "媽媽（　　）衣服。", options: ["洗", "吃", "看", "聽"], correctIndex: 0 },
  { id: "s5", prompt: "弟弟在（　　）水。", options: ["喝", "穿", "看", "寫"], correctIndex: 0 },
  { id: "s6", prompt: "老師（　　）故事給我們聽。", options: ["說", "穿", "喝", "洗"], correctIndex: 0 },
  { id: "s7", prompt: "我用（　　）寫字。", options: ["鉛筆", "雨傘", "碗", "鞋子"], correctIndex: 0 },
  { id: "s8", prompt: "下雨天要帶（　　）。", options: ["雨傘", "鉛筆", "碗", "球"], correctIndex: 0 },
  { id: "z1", prompt: "哪一個字的注音是用「ㄅ」開頭？", options: ["爸", "媽", "拿", "啦"], correctIndex: 0 },
  { id: "z2", prompt: "哪一個字的注音是用「ㄇ」開頭？", options: ["媽", "爸", "拿", "啦"], correctIndex: 0 },
  { id: "z3", prompt: "哪一個字的注音是用「ㄉ」開頭？", options: ["大", "媽", "拿", "啦"], correctIndex: 0 },
  { id: "z4", prompt: "哪一個字的注音是用「ㄊ」開頭？", options: ["兔", "媽", "拿", "啦"], correctIndex: 0 },
  { id: "z5", prompt: "哪一個字的注音是用「ㄋ」開頭？", options: ["你", "媽", "啦", "大"], correctIndex: 0 },
  { id: "z6", prompt: "哪一個字的注音是用「ㄌ」開頭？", options: ["老", "媽", "拿", "大"], correctIndex: 0 },
  { id: "z7", prompt: "哪一個字的注音是用「ㄍ」開頭？", options: ["狗", "媽", "拿", "啦"], correctIndex: 0 },
  { id: "z8", prompt: "哪一個字的注音是用「ㄏ」開頭？", options: ["好", "媽", "拿", "啦"], correctIndex: 0 },
  {
    id: "r1",
    prompt: "小明去公園騎腳踏車。請問小明在公園做什麼？",
    options: ["騎腳踏車", "游泳", "睡覺", "唱歌"],
    correctIndex: 0,
  },
  {
    id: "r2",
    prompt: "妹妹說：「我要吃飯。」請問妹妹想做什麼？",
    options: ["吃飯", "睡覺", "洗澡", "寫字"],
    correctIndex: 0,
  },
  {
    id: "r3",
    prompt: "小華說：「今天是星期天，我不用上學。」請問小華今天上學嗎？",
    options: ["不用上學", "要上學", "要考試", "要吃飯"],
    correctIndex: 0,
  },
  {
    id: "r4",
    prompt: "小美得到一顆星星，她很開心。請問小美的心情如何？",
    options: ["開心", "難過", "生氣", "害怕"],
    correctIndex: 0,
  },
];

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function buildExam(): Question[] {
  return shuffle(QUESTION_BANK)
    .slice(0, QUESTION_COUNT)
    .map((q) => {
      const correctText = q.options[q.correctIndex];
      const shuffledOptions = shuffle(q.options);
      return { ...q, options: shuffledOptions, correctIndex: shuffledOptions.indexOf(correctText) };
    });
}

export default function ChineseQuizPage() {
  const [exam, setExam] = useState<Question[] | null>(null);
  const [answers, setAnswers] = useState<Record<string, number | undefined>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [justEarnedCredit, setJustEarnedCredit] = useState(false);

  const allAnswered = exam ? exam.every((q) => answers[q.id] !== undefined) : false;

  function startExam() {
    setExam(buildExam());
    setAnswers({});
    setSubmitted(false);
    setJustEarnedCredit(false);
  }

  function selectAnswer(qId: string, idx: number) {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [qId]: idx }));
  }

  function submitExam() {
    if (!exam || !allAnswered) return;
    const correctCount = exam.filter((q) => answers[q.id] === q.correctIndex).length;
    const finalScore = Math.round((correctCount / exam.length) * 100);
    setScore(finalScore);
    setSubmitted(true);
    if (finalScore === 100) {
      addSpinCredit();
      setJustEarnedCredit(true);
    }
  }

  function optionClasses(qId: string, idx: number, correctIndex: number) {
    const selected = answers[qId] === idx;
    const base = "rounded-lg border px-3 py-2 text-sm font-medium transition text-left";
    if (!submitted) {
      return `${base} ${
        selected
          ? "border-[#8497B0] bg-[#EEF2F6] text-[#48607A] dark:bg-[#2A3440] dark:text-[#AFC2D4]"
          : "border-stone-300 bg-white hover:border-[#AAB9C8] dark:border-stone-700 dark:bg-stone-900"
      }`;
    }
    if (idx === correctIndex) {
      return `${base} border-[#7FA99B] bg-[#EEF4F1] text-[#48705F] dark:bg-[#22322C] dark:text-[#A9CBBB]`;
    }
    if (selected) {
      return `${base} border-[#C97B6B] bg-[#F8EDE9] text-[#95513F] dark:bg-[#3A241D] dark:text-[#E0AC9C]`;
    }
    return `${base} border-stone-200 bg-white text-stone-400 dark:border-stone-800 dark:bg-stone-900`;
  }

  return (
    <div className="flex flex-1 flex-col items-center gap-8 bg-gradient-to-b from-[#FBF4EA] to-[#FDFAF5] px-6 py-12 dark:from-[#221D18] dark:to-[#171310]">
      <div className="w-full max-w-3xl">
        <Link
          href="/"
          className="text-sm font-medium text-stone-400 hover:text-stone-600 dark:text-stone-500 dark:hover:text-stone-300"
        >
          ← 返回首頁
        </Link>
      </div>

      <div className="text-center">
        <h1 className="text-3xl font-bold text-stone-800 dark:text-stone-100">✏️ 小一國語練習</h1>
        <p className="mt-2 text-stone-500 dark:text-stone-400">
          每次隨機出 {QUESTION_COUNT} 題，考 100 分就能到幸運轉盤抽一次獎！
        </p>
      </div>

      {!exam ? (
        <button
          onClick={startExam}
          className="rounded-full bg-[#8497B0] px-8 py-3 text-lg font-bold text-white shadow-md transition hover:bg-[#728299]"
        >
          📝 開始測驗
        </button>
      ) : (
        <div className="flex w-full max-w-3xl flex-col gap-6">
          {submitted && (
            <div
              className={`animate-stamp-pop rounded-2xl border-2 border-dashed p-6 text-center ${
                score === 100 ? "border-[#7FA99B] bg-[#EEF4F1] dark:bg-[#22322C]" : "border-[#D97757] bg-[#FBEFE8] dark:bg-[#332621]"
              }`}
            >
              <p className="text-4xl font-extrabold" style={{ color: score === 100 ? "#5C8B76" : "#C6684A" }}>
                {score} 分
              </p>
              {justEarnedCredit ? (
                <div className="mt-2 flex flex-col items-center gap-2">
                  <p className="font-semibold text-[#5C8B76] dark:text-[#A9CBBB]">
                    🎉 滿分！你獲得一次抽獎機會囉！
                  </p>
                  <Link
                    href="/lucky-wheel"
                    className="rounded-full bg-[#D97757] px-6 py-2 text-sm font-bold text-white shadow-sm hover:bg-[#C6684A]"
                  >
                    前往抽獎 →
                  </Link>
                </div>
              ) : (
                <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">
                  考到 100 分才能得到抽獎機會，再試一次看看！
                </p>
              )}
            </div>
          )}

          <div className="flex flex-col gap-5">
            {exam.map((q, i) => (
              <div
                key={q.id}
                className="rounded-2xl border border-stone-200 bg-[#FFFDF9]/90 p-5 shadow-sm dark:border-stone-700/60 dark:bg-[#241F1A]/70"
              >
                <p className="font-medium leading-loose text-stone-800 dark:text-stone-100">
                  {i + 1}. <RubyText text={q.prompt} overrides={q.promptZhuyinOverrides} />
                </p>
                <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {q.options.map((opt, idx) => (
                    <button
                      key={idx}
                      onClick={() => selectAnswer(q.id, idx)}
                      className={optionClasses(q.id, idx, q.correctIndex)}
                    >
                      <RubyText text={opt} />
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pb-4">
            {!submitted ? (
              <button
                onClick={submitExam}
                disabled={!allAnswered}
                className="rounded-full bg-[#7FA99B] px-8 py-3 text-lg font-bold text-white shadow-md transition hover:bg-[#6C9686] disabled:cursor-not-allowed disabled:bg-stone-300"
              >
                交卷
              </button>
            ) : (
              <button
                onClick={startExam}
                className="rounded-full bg-[#8497B0] px-8 py-3 text-lg font-bold text-white shadow-md transition hover:bg-[#728299]"
              >
                重新測驗
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
