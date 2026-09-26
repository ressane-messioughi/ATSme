const TONE_COLOR = { good: "var(--good)", warn: "var(--warn)", danger: "var(--danger)" } as const;

function defaultTone(score: number | null): keyof typeof TONE_COLOR {
  if (score == null) return "warn";
  if (score < 60) return "danger";
  if (score < 80) return "warn";
  return "good";
}

export type ScoreGaugeProps = {
  /** Score sur 100, ou `null` tant qu'il n'est pas encore calculé. */
  score: number | null;
  size?: number;
  stroke?: number;
  /** Couleur sémantique de l'anneau. Déduite du score si omise. */
  tone?: keyof typeof TONE_COLOR;
  /** Texte affiché sous le score (ex. "Bon", "Excellent"). */
  label?: string;
};

/**
 * Jauge circulaire de score sur 100, avec anneau de progression animé.
 *
 * @example
 * <ScoreGauge score={78} label="Bon" />
 * <ScoreGauge score={32} size={72} showLabel={false} />
 */
export function ScoreGauge({ score, size = 96, stroke = 8, tone, label }: ScoreGaugeProps) {
  const resolvedTone = tone ?? defaultTone(score);
  const color = TONE_COLOR[resolvedTone];
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, score ?? 0)) / 100;
  const offset = c * (1 - pct);

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={r} stroke="var(--surface-2)" strokeWidth={stroke} fill="none" />
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
          <span className="font-[var(--ff-display)] font-bold" style={{ fontSize: size * 0.28, color: score != null ? color : "var(--text-faint)" }}>
            {score ?? "—"}
          </span>
          <span className="text-[var(--text-faint)]" style={{ fontSize: size * 0.09 }}>
            /100
          </span>
        </div>
      </div>
      {label && (
        <p className="text-sm font-medium mt-2" style={{ color }}>
          {label}
        </p>
      )}
    </div>
  );
}
