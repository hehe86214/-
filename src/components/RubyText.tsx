import { charsWithZhuyin } from "@/lib/zhuyin";

const TONE_MARKS = new Set(["ˊ", "ˇ", "ˋ", "˙"]);

// how far down the stack each base symbol advances, in units of the
// *ancestor's* font-size (matches the base span's text-[0.42em] * leading-[1.15])
const SYMBOL_STEP_EM = 0.42 * 1.15;

function ZhuyinAnnotation({ zhuyin }: { zhuyin: string }) {
  const lastChar = zhuyin.slice(-1);
  const hasTone = TONE_MARKS.has(lastChar);
  const base = hasTone ? zhuyin.slice(0, -1) : zhuyin;

  // Print zhuyin anchors tone marks 2nd/3rd/4th to the upper-right corner of
  // the LAST phonetic symbol (so it sits lower for longer syllables), and the
  // neutral-tone dot to the upper-left corner of the FIRST symbol.
  const toneTopEm = lastChar === "˙" ? -0.1 : (base.length - 1) * SYMBOL_STEP_EM - 0.03;

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
          className="absolute inline-block text-stone-400 select-none dark:text-stone-500"
          style={{
            top: `${toneTopEm}em`,
            transform: "scale(0.42)",
            transformOrigin: lastChar === "˙" ? "top left" : "top right",
            ...(lastChar === "˙" ? { left: "-0.55em" } : { right: "-0.55em" }),
          }}
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
