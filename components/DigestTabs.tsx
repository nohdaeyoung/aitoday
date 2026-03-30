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

interface DigestTabsProps {
  news: NewsItem[];
  community: CommunityItem[];
  github: GithubItem[];
}

const TABS = [
  { id: "news", label: "뉴스", count: 0 },
  { id: "community", label: "커뮤니티", count: 0 },
  { id: "trending", label: "트렌딩", count: 0 },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function DigestTabs({ news, community, github }: DigestTabsProps) {
  const [active, setActive] = useState<TabId>("news");

  const counts: Record<TabId, number> = {
    news: news.length,
    community: community.length,
    trending: github.length,
  };

  return (
    <div>
      <div className="flex gap-1 border-b border-[var(--color-border)] mb-6">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActive(tab.id)}
            className={`
              px-4 py-2.5 text-[14px] font-medium transition-colors relative
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
    </div>
  );
}
