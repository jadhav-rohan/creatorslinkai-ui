import { useEffect, useState } from "react";

export function formatNumber(num) {
  const value = Number(num ?? 0);
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
  return value.toLocaleString();
}

export function MetricItem({ label, value }) {
  return (
    <div className="rounded-lg border border-gray-700 bg-[#16161d] p-4">
      <p className="text-xs uppercase tracking-wide text-gray-400">{label}</p>
      <p className="mt-2 text-xl font-semibold text-white">{value}</p>
    </div>
  );
}

function formatGrowth(value) {
  const numericValue = Number(value || 0);
  if (numericValue > 0) return `+${formatNumber(numericValue)}`;
  return formatNumber(numericValue);
}

function formatGrowthPercentage(value) {
  const numericValue = Number(value || 0);
  const prefix = numericValue > 0 ? "+" : "";
  return `${prefix}${numericValue.toFixed(2)}%`;
}

export function GrowthCard({
  label,
  currentValue,
  growth,
  growthPercentage,
  description,
}) {
  const numericGrowth = Number(growth || 0);
  const trendClass =
    numericGrowth > 0
      ? "text-emerald-400"
      : numericGrowth < 0
      ? "text-red-400"
      : "text-text-secondary";

  return (
    <div className="p-5 rounded-2xl bg-bg-deep/40 border border-panel-border">
      <p className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">
        {label}
      </p>
      <div className="mt-3 flex items-end justify-between gap-3">
        <p className="text-2xl font-extrabold text-text-primary">
          {formatNumber(Number(currentValue || 0))}
        </p>
        <div className={`text-right ${trendClass}`}>
          <p className="text-sm font-bold">
            {formatGrowthPercentage(growthPercentage)}
          </p>
          <p className="text-[10px] font-semibold">
            {formatGrowth(numericGrowth)}
          </p>
        </div>
      </div>
      <p className="mt-2 text-[10px] text-text-secondary">{description}</p>
    </div>
  );
}

function getAudienceScoreColor(score) {
  if (score >= 75) return "#22c55e";
  if (score >= 50) return "#eab308";
  return "#ef4444";
}

export function AudienceScoreCircle({ score }) {
  const safeScore = Math.min(100, Math.max(0, Number(score) || 0));
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    let current = 0;
    const duration = 900;
    const interval = 20;
    const increment = safeScore / (duration / interval);
    const timer = setInterval(() => {
      current += increment;
      if (current >= safeScore) {
        current = safeScore;
        clearInterval(timer);
      }
      setDisplayScore(Math.round(current));
    }, interval);
    return () => clearInterval(timer);
  }, [safeScore]);

  const radius = 75;
  const circumference = 2 * Math.PI * radius;
  const progress = circumference - (displayScore / 100) * circumference;
  const color = getAudienceScoreColor(displayScore);

  return (
    <div className="relative w-[180px] h-[180px]">
      <svg width="180" height="180" aria-label={`Audience score ${displayScore}`}>
        <defs>
          <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor={color} />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3.5" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <circle
          cx="90"
          cy="90"
          r={radius}
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="12"
          fill="transparent"
        />
        <circle
          cx="90"
          cy="90"
          r={radius}
          filter="url(#glow)"
          stroke="url(#scoreGradient)"
          strokeWidth="12"
          fill="transparent"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={progress}
          style={{ transition: "stroke-dashoffset .25s linear, stroke .3s" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-5xl font-extrabold transition-all duration-300" style={{ color }}>
          {displayScore}
        </div>
        <div className="text-xs mt-2 text-text-secondary">Audience Score</div>
      </div>
    </div>
  );
}
