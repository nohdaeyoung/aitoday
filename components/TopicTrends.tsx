const TOPIC_LABELS: Record<string, string> = {
  LLM: "LLM",
  Vision: "비전",
  Agent: "에이전트",
  OpenSource: "오픈소스",
  Regulation: "규제",
  Hardware: "하드웨어",
};

interface TopicTrendsProps {
  trends: Record<string, number>;
}

export function TopicTrends({ trends }: TopicTrendsProps) {
  const entries = Object.entries(trends)
    .map(([key, value]) => ({ key, label: TOPIC_LABELS[key] || key, value }))
    .sort((a, b) => b.value - a.value);

  if (entries.length === 0) return null;

  return (
    <div className="grid grid-cols-2 gap-x-6 gap-y-2">
      {entries.map(({ key, label, value }) => (
        <div key={key} className="flex items-center gap-2">
          <span className="text-[11px] text-[var(--color-muted)] w-14 shrink-0 text-right">
            {label}
          </span>
          <div className="flex-1 h-1.5 bg-[var(--color-surface)] rounded-full overflow-hidden">
            <div
              className="h-full bg-[var(--color-accent)] rounded-full transition-all"
              style={{ width: `${value * 10}%`, opacity: 0.4 + value * 0.06 }}
            />
          </div>
          <span className="text-[10px] text-[var(--color-muted)] w-4 shrink-0">{value}</span>
        </div>
      ))}
    </div>
  );
}
