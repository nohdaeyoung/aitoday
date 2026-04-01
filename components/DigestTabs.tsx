"use client";

import { useState } from "react";
import { DigestCard, GithubCard } from "./DigestCard";

interface NewsItem {
  title: string;
  summary: string;
  url: string;
  source: string;
  tags?: string[];
}

interface CommunityItem extends NewsItem {
  upvotes?: number;
  comments?: number;
}

interface GithubItem {
  name: string;
  description: string;
  url: string;
  stars: number;
  todayStars?: number;
  language?: string;
  tags?: string[];
}

interface PaperItem {
  title: string;
  summary: string;
  url: string;
  authors?: string;
  source: string;
  tags?: string[];
}

interface DigestTabsProps {
  news: NewsItem[];
  community: CommunityItem[];
  github: GithubItem[];
  papers?: PaperItem[];
}

const TABS = [
  { id: "news", label: "뉴스" },
  { id: "community", label: "커뮤니티" },
  { id: "trending", label: "트렌딩" },
  { id: "papers", label: "논문" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function DigestTabs({ news, community, github, papers = [] }: DigestTabsProps) {
  const [active, setActive] = useState<TabId>("news");
  const [langFilter, setLangFilter] = useState<string>("all");

  const counts: Record<TabId, number> = {
    news: news.length,
    community: community.length,
    trending: github.length,
    papers: papers.length,
  };

  function handleKeyDown(e: React.KeyboardEvent) {
    const idx = TABS.findIndex((t) => t.id === active);
    if (e.key === "ArrowRight") {
      e.preventDefault();
      const next = TABS[(idx + 1) % TABS.length];
      setActive(next.id);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      const prev = TABS[(idx - 1 + TABS.length) % TABS.length];
      setActive(prev.id);
    }
  }

  return (
    <div>
      <div
        role="tablist"
        aria-label="콘텐츠 카테고리"
        className="flex gap-1 border-b border-[var(--color-border)] mb-6"
        onKeyDown={handleKeyDown}
      >
        {TABS.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            id={`tab-${tab.id}`}
            aria-selected={active === tab.id}
            aria-controls={`panel-${tab.id}`}
            tabIndex={active === tab.id ? 0 : -1}
            onClick={() => setActive(tab.id)}
            className={`
              px-4 py-3 text-[14px] font-medium transition-colors relative
              ${active === tab.id
                ? "text-[var(--color-accent)]"
                : "text-[var(--color-muted)] hover:text-[var(--color-foreground)]"
              }
            `}
          >
            {tab.label}
            <span className="ml-1 text-[11px] opacity-50 tabular-nums">{counts[tab.id]}</span>
            {active === tab.id && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[var(--color-accent)]" />
            )}
          </button>
        ))}
      </div>

      {active === "news" && (
        <div role="tabpanel" id="panel-news" aria-labelledby="tab-news">
          {news.map((item, i) => (
            <DigestCard
              key={i}
              title={item.title}
              summary={item.summary}
              url={item.url}
              source={item.source}
              tags={item.tags}
              variant="news"
            />
          ))}
        </div>
      )}

      {active === "community" && (
        <div role="tabpanel" id="panel-community" aria-labelledby="tab-community">
          {community.map((item, i) => (
            <DigestCard
              key={i}
              title={item.title}
              summary={item.summary}
              url={item.url}
              source={item.source}
              variant="community"
              tags={item.tags}
              stats={[
                ...(item.upvotes ? [{ label: "↑", value: item.upvotes }] : []),
                ...(item.comments ? [{ label: "💬", value: item.comments }] : []),
              ]}
            />
          ))}
        </div>
      )}

      {active === "trending" && (() => {
        const languages = [...new Set(github.map((g) => g.language).filter(Boolean))] as string[];
        const filtered = langFilter === "all" ? github : github.filter((g) => g.language === langFilter);
        return (
          <div role="tabpanel" id="panel-trending" aria-labelledby="tab-trending">
            {languages.length > 1 && (
              <div className="flex flex-wrap gap-1.5 mb-4">
                <button
                  onClick={() => setLangFilter("all")}
                  className={`text-[12px] px-2.5 py-1 rounded-full transition-colors ${
                    langFilter === "all"
                      ? "bg-[var(--color-accent)] text-white"
                      : "bg-[var(--color-surface)] text-[var(--color-muted)] hover:text-[var(--color-foreground)]"
                  }`}
                >
                  전체 {github.length}
                </button>
                {languages.map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setLangFilter(lang)}
                    className={`text-[12px] px-2.5 py-1 rounded-full transition-colors ${
                      langFilter === lang
                        ? "bg-[var(--color-accent)] text-white"
                        : "bg-[var(--color-surface)] text-[var(--color-muted)] hover:text-[var(--color-foreground)]"
                    }`}
                  >
                    {lang} {github.filter((g) => g.language === lang).length}
                  </button>
                ))}
              </div>
            )}
            {filtered.map((item, i) => (
              <GithubCard
                key={i}
                name={item.name}
                description={item.description}
                url={item.url}
                stars={item.stars}
                todayStars={item.todayStars}
                language={item.language}
              />
            ))}
          </div>
        );
      })()}

      {active === "papers" && (
        <div role="tabpanel" id="panel-papers" aria-labelledby="tab-papers">
          {papers.map((item, i) => (
            <a
              key={i}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block py-5 border-b border-[var(--color-border)] last:border-b-0 group"
            >
              <h3 className="text-[17px] font-semibold text-[var(--color-foreground)] leading-snug group-hover:text-[var(--color-accent)] transition-colors">
                {item.title}
              </h3>
              {item.authors && (
                <p className="text-[12px] text-[var(--color-muted)] mt-1">{item.authors}</p>
              )}
              <p className="text-[14px] text-[var(--color-muted)] leading-relaxed mt-1.5">{item.summary}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[11px] text-[var(--color-accent)] opacity-70">{item.source}</span>
                {item.tags && item.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {item.tags.map((tag) => (
                      <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--color-surface)] text-[var(--color-muted)]">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </a>
          ))}
          {papers.length === 0 && (
            <p className="py-10 text-center text-[var(--color-muted)] text-sm">
              아직 논문 데이터가 없습니다. 다음 업데이트에서 추가됩니다.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
