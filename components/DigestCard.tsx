interface DigestCardProps {
  title: string;
  summary: string;
  url: string;
  source: string;
  stats?: { label: string; value: string | number }[];
  variant?: "news" | "community";
}

export function DigestCard({ title, summary, url, source, stats, variant = "news" }: DigestCardProps) {
  if (variant === "community") {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-start gap-3 py-3 group"
      >
        <div className="shrink-0 mt-1 w-1 h-8 rounded-full bg-[var(--color-accent)] opacity-40 group-hover:opacity-100 transition-opacity" />
        <div className="min-w-0">
          <h3 className="text-[17px] font-medium text-[var(--color-foreground)] leading-snug group-hover:text-[var(--color-accent)] transition-colors">
            {title}
          </h3>
          <p className="text-[14px] text-[var(--color-muted)] leading-relaxed mt-1 line-clamp-2">{summary}</p>
          <div className="flex items-center gap-3 mt-1.5">
            <span className="text-[11px] text-[var(--color-muted)]">{source}</span>
            {stats?.map((s) => (
              <span key={s.label} className="text-[11px] text-[var(--color-muted)]">
                {s.label} {s.value}
              </span>
            ))}
          </div>
        </div>
      </a>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="block py-5 border-b border-[var(--color-border)] last:border-b-0 group"
    >
      <div className="flex items-start justify-between gap-3 mb-1.5">
        <h3 className="text-[17px] font-semibold text-[var(--color-foreground)] leading-snug group-hover:text-[var(--color-accent)] transition-colors">
          {title}
        </h3>
        <span className="shrink-0 text-[12px] px-2 py-0.5 rounded bg-[var(--color-surface)] text-[var(--color-muted)] font-medium">
          {source}
        </span>
      </div>
      <p className="text-[14px] text-[var(--color-muted)] leading-relaxed mt-1">{summary}</p>
    </a>
  );
}

interface GithubCardProps {
  name: string;
  description: string;
  url: string;
  stars: number;
  todayStars?: number;
  language?: string;
}

export function GithubCard({ name, description, url, stars, todayStars, language }: GithubCardProps) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-start justify-between gap-4 py-4 border-b border-[var(--color-border)] last:border-b-0 group"
    >
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="text-[15px] font-mono font-medium text-[var(--color-foreground)] group-hover:text-[var(--color-accent)] transition-colors truncate">
            {name}
          </h3>
          {language && (
            <span className="shrink-0 text-[10px] px-1.5 py-0.5 rounded bg-[var(--color-surface)] text-[var(--color-muted)]">
              {language}
            </span>
          )}
        </div>
        <p className="text-[12px] text-[var(--color-muted)] leading-relaxed mt-0.5 line-clamp-1">{description}</p>
      </div>
      <div className="shrink-0 text-right">
        <span className="text-[12px] text-[var(--color-foreground)]">★ {stars.toLocaleString()}</span>
        {todayStars !== undefined && todayStars > 0 && (
          <p className="text-[11px] text-[var(--color-accent)]">+{todayStars.toLocaleString()}</p>
        )}
      </div>
    </a>
  );
}
