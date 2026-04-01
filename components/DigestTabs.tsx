"use client";

import { useState } from "react";
import { DigestCard, GithubCard } from "./DigestCard";

interface NewsItem {
  title: string;
  summary: string;
  url: string;
  source: string;
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
}

interface PaperItem {
  title: string;
  summary: string;
  url: string;
  authors?: string;
  source: string;
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

  const counts: Record<TabId, number> = {
    news: news.length,
    community: community.length,
    trending: github.length,
    papers: papers.length,
  };

  return (
    <div>
      <div className="flex gap-1 border-b border-[var(--color-border)] mb-6">
        {TABS.map((tab) => (
          <button
            key={tab.id}
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
            <span className="ml-1.5 text-[11px] opacity-60">{counts[tab.id]}</span>
            {active === tab.id && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[var(--color-accent)]" />
            )}
          </button>
        ))}
      </div>

      {active === "news" && (
        <div>
          {news.map((item, i) => (
            <DigestCard
              key={i}
              title={item.title}
              summary={item.summary}
              url={item.url}
              source={item.source}
              variant="news"
            />
          ))}
        </div>
      )}

      {active === "community" && (
        <div>
          {community.map((item, i) => (
            <DigestCard
              key={i}
              title={item.title}
              summary={item.summary}
              url={item.url}
              source={item.source}
              variant="community"
              stats={[
                ...(item.upvotes ? [{ label: "↑", value: item.upvotes }] : []),
                ...(item.comments ? [{ label: "💬", value: item.comments }] : []),
              ]}
            />
          ))}
        </div>
      )}

      {active === "trending" && (
        <div>
          {github.map((item, i) => (
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
      )}

      {active === "papers" && (
        <div>
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
              <p className="text-[13px] text-[var(--color-muted)] leading-relaxed mt-1.5">{item.summary}</p>
              <span className="inline-block text-[11px] text-[var(--color-accent)] mt-2 opacity-70">{item.source}</span>
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
