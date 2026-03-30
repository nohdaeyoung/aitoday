import * as cheerio from "cheerio";
import { RawItem } from "@/lib/schema";

const AI_KEYWORDS = [
  "ai", "llm", "gpt", "machine-learning", "deep-learning",
  "neural", "transformer", "diffusion", "agent", "rag",
  "embedding", "fine-tune", "inference", "nlp", "vision",
  "multimodal", "langchain", "openai", "anthropic",
];

function isAIRelated(name: string, description: string): boolean {
  const text = `${name} ${description}`.toLowerCase();
  return AI_KEYWORDS.some((kw) => text.includes(kw));
}

async function collectFromTrending(): Promise<RawItem[]> {
  const res = await fetch("https://github.com/trending?since=daily", {
    headers: {
      "User-Agent": "aitoday-bot/1.0",
      Accept: "text/html",
    },
  });

  if (!res.ok) throw new Error(`GitHub Trending fetch failed: ${res.status}`);

  const html = await res.text();
  const $ = cheerio.load(html);
  const items: RawItem[] = [];

  $("article.Box-row").each((_, el) => {
    const nameEl = $(el).find("h2 a");
    const fullName = nameEl.text().trim().replace(/\s+/g, "");
    const description = $(el).find("p").first().text().trim();
    const starsText = $(el).find("[href$='/stargazers']").text().trim().replace(/,/g, "");
    const todayStarsText = $(el).find("span.d-inline-block.float-sm-right").text().trim();
    const language = $(el).find("[itemprop='programmingLanguage']").text().trim();

    if (!fullName) return;

    const stars = parseInt(starsText) || 0;
    const todayMatch = todayStarsText.match(/([\d,]+)\s*stars?\s*today/i);
    const todayStars = todayMatch ? parseInt(todayMatch[1].replace(/,/g, "")) : 0;

    items.push({
      title: fullName,
      url: `https://github.com/${fullName}`,
      score: todayStars || stars,
      source: "github" as const,
      metadata: { description, stars, todayStars, language },
    });
  });

  const aiItems = items.filter((item) =>
    isAIRelated(item.title, (item.metadata as any)?.description || "")
  );

  return (aiItems.length > 0 ? aiItems : items).slice(0, 10);
}

async function collectFromSearchAPI(): Promise<RawItem[]> {
  const pat = process.env.GITHUB_PAT;
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  const q = encodeURIComponent(
    `created:>${since} (topic:ai OR topic:llm OR topic:machine-learning OR topic:deep-learning) stars:>10`
  );

  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "aitoday-bot/1.0",
  };
  if (pat) headers.Authorization = `Bearer ${pat}`;

  const res = await fetch(
    `https://api.github.com/search/repositories?q=${q}&sort=stars&order=desc&per_page=10`,
    { headers }
  );

  if (!res.ok) throw new Error(`GitHub Search API failed: ${res.status}`);
  const data = await res.json();

  return (data.items || []).map((repo: any) => ({
    title: repo.full_name,
    url: repo.html_url,
    score: repo.stargazers_count,
    source: "github" as const,
    metadata: {
      description: repo.description || "",
      stars: repo.stargazers_count,
      language: repo.language,
    },
  }));
}

export async function collectGithub(): Promise<RawItem[]> {
  try {
    const items = await collectFromTrending();
    if (items.length > 0) return items;
  } catch {
    // HTML 파싱 실패 시 Search API fallback
  }

  return collectFromSearchAPI();
}
