import { charsWithZhuyin } from "@/lib/zhuyin";

const TONE_MARKS = new Set(["ˊ", "ˇ", "ˋ", "˙"]);

function ZhuyinAnnotation({ zhuyin }: { zhuyin: string }) {
  const lastChar = zhuyin.slice(-1);
  const hasTone = TONE_MARKS.has(lastChar);
  const base = hasTone ? zhuyin.slice(0, -1) : zhuyin;

  return (
    <span aria-hidden className="relative mr-0.5 inline-block align-top">
      <span
        className="text-[0.42em] leading-[1.15] text-stone-400 select-none dark:text-stone-500"
        style={{ writingMode: "vertical-rl", textOrientation: "upright" }}
      >
        {base}
      </span>
      {hasTone && (
        <span
          className="absolute text-[0.4em] text-stone-400 select-none dark:text-stone-500"
          style={
            lastChar === "˙"
              ? { left: "-0.5em", top: "-0.2em" }
              : { right: "-0.6em", top: "-0.1em" }
          }
        >
          {lastChar}
        </span>
      )}
    </span>
  );
}

export function RubyText({
  text,
  overrides,
  className,
}: {
  text: string;
  overrides?: Record<number, string>;
  className?: string;
}) {
  return (
    <span className={`inline-flex flex-wrap items-start ${className ?? ""}`}>
      {charsWithZhuyin(text, overrides).map(({ char, zhuyin }, i) =>
        zhuyin ? (
          <span key={i} className="inline-flex items-start">
            <span>{char}</span>
            <ZhuyinAnnotation zhuyin={zhuyin} />
          </span>
        ) : (
          <span key={i}>{char}</span>
        )
      )}
    </span>
  );
}
