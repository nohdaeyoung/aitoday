import { RawItem } from "@/lib/schema";

const AI_KEYWORDS = [
  "ai", "llm", "gpt", "claude", "gemini", "machine learning",
  "deep learning", "neural", "transformer", "openai", "anthropic",
  "diffusion", "langchain", "rag", "agent", "embedding",
  "fine-tun", "inference", "multimodal", "copilot",
];

function isAIRelated(text: string): boolean {
  const lower = text.toLowerCase();
  return AI_KEYWORDS.some((kw) => lower.includes(kw));
}

// Lobsters — HN과 비슷한 기술 커뮤니티, 인증 불필요
async function collectLobsters(): Promise<RawItem[]> {
  const res = await fetch("https://lobste.rs/hottest.json", {
    headers: { "User-Agent": "aitoday-bot/1.0" },
  });
  if (!res.ok) throw new Error(`Lobsters API failed: ${res.status}`);

  const posts: any[] = await res.json();

  return posts
    .filter((p) => isAIRelated(`${p.title} ${p.tags?.join(" ") || ""}`))
    .slice(0, 10)
    .map((p) => ({
      title: p.title,
      url: p.url || p.short_id_url,
      score: p.score || 0,
      source: "lobsters" as const,
      metadata: {
        tags: p.tags,
        comments: p.comment_count,
      },
    }));
}

// DEV.to — 개발자 블로그 플랫폼, 인증 불필요
async function collectDevTo(): Promise<RawItem[]> {
  const tags = ["ai", "machinelearning", "llm", "openai", "generativeai"];
  const allItems: RawItem[] = [];

  for (const tag of tags.slice(0, 3)) {
    try {
      const res = await fetch(
        `https://dev.to/api/articles?tag=${tag}&top=1&per_page=10`,
        { headers: { "User-Agent": "aitoday-bot/1.0" } }
      );
      if (!res.ok) continue;

      const articles: any[] = await res.json();
      for (const a of articles) {
        allItems.push({
          title: a.title,
          url: a.url,
          score: a.public_reactions_count || 0,
          source: "devto" as const,
          metadata: {
            tags: a.tag_list,
            comments: a.comments_count,
            readingTime: a.reading_time_minutes,
          },
        });
      }
    } catch {
      // 개별 태그 실패 무시
    }
  }

  // 중복 제거 + 점수순 정렬
  const seen = new Set<string>();
  return allItems
    .filter((item) => {
      if (seen.has(item.url)) return false;
      seen.add(item.url);
      return true;
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);
}

export async function collectCommunity(): Promise<RawItem[]> {
  const [lobsters, devto] = await Promise.allSettled([
    collectLobsters(),
    collectDevTo(),
  ]);

  const items: RawItem[] = [];
  if (lobsters.status === "fulfilled") items.push(...lobsters.value);
  if (devto.status === "fulfilled") items.push(...devto.value);

  return items
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);
}
