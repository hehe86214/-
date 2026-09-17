"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";

type Question = {
  id: string;
  prompt: string;
  options: string[];
  correctIndex: number;
};

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

const DEFAULT_QUESTIONS: Question[] = [
  { id: "q1", prompt: "1 + 1 等於多少？", options: ["1", "2", "3", "4"], correctIndex: 1 },
  { id: "q2", prompt: "太陽從哪個方向升起？", options: ["東邊", "西邊", "南邊", "北邊"], correctIndex: 0 },
];

function isValidQuestion(q: Question) {
  return (
    q.prompt.trim().length > 0 &&
    q.options.filter((o) => o.trim().length > 0).length >= 2
  );
}

export default function LuckyWheelPage() {
  // rewards on the wheel
  const [rewardsText, setRewardsText] = useState(DEFAULT_REWARDS.join("\n"));
  const [rewards, setRewards] = useState<string[]>(DEFAULT_REWARDS);
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const pendingWinnerRef = useRef<string | null>(null);

  // quiz gate
  const [questions, setQuestions] = useState<Question[]>(DEFAULT_QUESTIONS);
  const [editMode, setEditMode] = useState(false);
  const [answers, setAnswers] = useState<Record<string, number | undefined>>({});
  const [submitted, setSubmitted] = useState(false);
  const [allCorrect, setAllCorrect] = useState(false);
  const [spinCredits, setSpinCredits] = useState(0);

  const validQuestions = useMemo(() => questions.filter(isValidQuestion), [questions]);
  const quizActive = validQuestions.length > 0;
  const allAnswered = validQuestions.every((q) => answers[q.id] !== undefined);
  const canSpin = rewards.length >= 2 && !spinning && (!quizActive || spinCredits > 0);

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
    if (quizActive) setSpinCredits((c) => c - 1);
  }

  function handleTransitionEnd() {
    if (!spinning) return;
    setSpinning(false);
    setWinner(pendingWinnerRef.current);
  }

  // quiz: kid answering
  function selectAnswer(qId: string, idx: number) {
    setAnswers((prev) => ({ ...prev, [qId]: idx }));
    setSubmitted(false);
  }

  function submitQuiz() {
    const correct = validQuestions.every((q) => answers[q.id] === q.correctIndex);
    setSubmitted(true);
    setAllCorrect(correct);
    if (correct) setSpinCredits((c) => c + 1);
  }

  function resetQuiz() {
    setAnswers({});
    setSubmitted(false);
  }

  // quiz: parent editing
  function toggleEditMode() {
    setEditMode((v) => {
      if (v) resetQuiz();
      return !v;
    });
  }

  function updatePrompt(id: string, value: string) {
    setQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, prompt: value } : q)));
  }

  function updateOption(id: string, idx: number, value: string) {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === id
          ? { ...q, options: q.options.map((o, i) => (i === idx ? value : o)) }
          : q
      )
    );
  }

  function setCorrectOption(id: string, idx: number) {
    setQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, correctIndex: idx } : q)));
  }

  function addOption(id: string) {
    setQuestions((prev) =>
      prev.map((q) => (q.id === id && q.options.length < 4 ? { ...q, options: [...q.options, ""] } : q))
    );
  }

  function removeOption(id: string, idx: number) {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== id || q.options.length <= 2) return q;
        const options = q.options.filter((_, i) => i !== idx);
        let correctIndex = q.correctIndex;
        if (idx === q.correctIndex) correctIndex = 0;
        else if (idx < q.correctIndex) correctIndex -= 1;
        return { ...q, options, correctIndex };
      })
    );
  }

  function addQuestion() {
    setQuestions((prev) => [
      ...prev,
      { id: crypto.randomUUID(), prompt: "", options: ["", ""], correctIndex: 0 },
    ]);
  }

  function removeQuestion(id: string) {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
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
          答對所有題目，就能轉一次幸運轉盤，拿到獎勵！
        </p>
      </div>

      <div className="flex w-full max-w-4xl flex-col gap-8">
        {/* Quiz section */}
        <section className="rounded-2xl border border-stone-200 bg-[#FFFDF9]/90 p-6 shadow-sm dark:border-stone-700/60 dark:bg-[#241F1A]/70">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-stone-800 dark:text-stone-100">
              📚 答題關卡
            </h2>
            <button
              onClick={toggleEditMode}
              className="rounded-full border border-stone-300 px-4 py-1.5 text-sm font-medium text-stone-600 hover:bg-stone-50 dark:border-stone-700 dark:text-stone-300 dark:hover:bg-stone-800"
            >
              {editMode ? "完成編輯" : "✏️ 編輯題目（家長）"}
            </button>
          </div>

          {editMode ? (
            <div className="flex flex-col gap-4">
              {questions.map((q) => (
                <div
                  key={q.id}
                  className="flex flex-col gap-3 rounded-lg border border-stone-200 p-4 dark:border-stone-700"
                >
                  <div className="flex gap-2">
                    <input
                      value={q.prompt}
                      onChange={(e) => updatePrompt(q.id, e.target.value)}
                      placeholder="輸入題目，例如：1 + 1 等於多少？"
                      className="flex-1 rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm focus:border-[#8497B0] focus:outline-none dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100"
                    />
                    <button
                      onClick={() => removeQuestion(q.id)}
                      className="rounded-lg border border-stone-300 px-3 text-sm text-stone-500 hover:border-[#C97B6B] hover:text-[#C97B6B] dark:border-stone-700"
                    >
                      刪除題目
                    </button>
                  </div>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {q.options.map((opt, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name={`correct-${q.id}`}
                          checked={q.correctIndex === i}
                          onChange={() => setCorrectOption(q.id, i)}
                          title="標記為正確答案"
                          className="accent-[#7FA99B]"
                        />
                        <input
                          value={opt}
                          onChange={(e) => updateOption(q.id, i, e.target.value)}
                          placeholder={`選項 ${i + 1}`}
                          className="flex-1 rounded-lg border border-stone-300 bg-white px-2 py-1.5 text-sm focus:border-[#8497B0] focus:outline-none dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100"
                        />
                        {q.options.length > 2 && (
                          <button
                            onClick={() => removeOption(q.id, i)}
                            aria-label="移除選項"
                            className="text-stone-400 hover:text-[#C97B6B]"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  {q.options.length < 4 && (
                    <button
                      onClick={() => addOption(q.id)}
                      className="self-start text-sm font-medium text-[#6E86A0] hover:underline dark:text-[#AFC2D4]"
                    >
                      + 新增選項
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={addQuestion}
                className="self-start rounded-lg bg-[#8497B0] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-[#728299]"
              >
                + 新增題目
              </button>
            </div>
          ) : !quizActive ? (
            <p className="text-sm text-stone-400">
              目前沒有題目，小朋友可以直接轉轉盤。家長可點「編輯題目」設定關卡。
            </p>
          ) : (
            <div className="flex flex-col gap-5">
              {validQuestions.map((q) => (
                <div key={q.id}>
                  <p className="font-medium text-stone-800 dark:text-stone-100">{q.prompt}</p>
                  <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {q.options
                      .map((opt, i) => ({ opt, i }))
                      .filter(({ opt }) => opt.trim().length > 0)
                      .map(({ opt, i }) => (
                        <button
                          key={i}
                          onClick={() => selectAnswer(q.id, i)}
                          className={optionClasses(q.id, i, q.correctIndex)}
                        >
                          {opt}
                        </button>
                      ))}
                  </div>
                </div>
              ))}

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  onClick={submitQuiz}
                  disabled={!allAnswered}
                  className="rounded-full bg-[#7FA99B] px-6 py-2 font-medium text-white shadow-sm transition hover:bg-[#6C9686] disabled:cursor-not-allowed disabled:bg-stone-300"
                >
                  提交答案
                </button>
                {submitted && (
                  <button
                    onClick={resetQuiz}
                    className="rounded-full border border-stone-300 px-4 py-2 text-sm font-medium text-stone-600 hover:bg-stone-50 dark:border-stone-700 dark:text-stone-300 dark:hover:bg-stone-800"
                  >
                    重新作答
                  </button>
                )}
                {submitted &&
                  (allCorrect ? (
                    <span className="font-medium text-[#5C8B76] dark:text-[#A9CBBB]">
                      🎉 全部答對！可以轉一次囉！
                    </span>
                  ) : (
                    <span className="font-medium text-[#C97B6B]">
                      有答錯的喔，再檢查一次！
                    </span>
                  ))}
              </div>
            </div>
          )}
        </section>

        {quizActive && (
          <p className="text-center text-sm font-medium text-stone-500 dark:text-stone-400">
            🎯 目前可抽獎次數：{spinCredits} 次
          </p>
        )}

        <div className="flex flex-col items-center gap-10 md:flex-row md:items-start md:justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="relative h-72 w-72 sm:h-80 sm:w-80">
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
            {rewards.length >= 2 && quizActive && spinCredits <= 0 && !spinning && (
              <p className="text-sm text-[#B98A4E]">請先在上方答對所有題目，才能得到抽獎機會！</p>
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
