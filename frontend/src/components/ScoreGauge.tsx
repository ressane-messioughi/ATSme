import { scoreLabel, scoreTone } from "../lib/resumeApi";

const TONE_COLOR = { good: "var(--t-accent)", warn: "var(--t-warn)", danger: "var(--t-danger)" };

export default function ScoreGauge({
  score,
  size = 96,
  stroke = 8,
  showLabel = true,
}: {
  score: number | null;
  size?: number;
  stroke?: number;
  showLabel?: boolean;
}) {
  const tone = scoreTone(score);
  const color = TONE_COLOR[tone];
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, score ?? 0)) / 100;
  const offset = c * (1 - pct);

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={r} stroke="var(--t-track)" strokeWidth={stroke} fill="none" />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            stroke={color}
            strokeWidth={stroke}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={score == null ? c : offset}
            style={{ transition: "stroke-dashoffset 0.6s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="font-bold"
            style={{ fontFamily: "var(--t-display)", fontSize: size * 0.28, color: score != null ? color : "var(--t-faint)" }}
          >
            {score ?? "-"}
          </span>
          <span style={{ color: "var(--t-faint)", fontSize: size * 0.09 }}>/100</span>
        </div>
      </div>
      {showLabel && (
        <p className="text-sm font-medium mt-2" style={{ color }}>
          {scoreLabel(score)}
        </p>
      )}
    </div>
  );
}
