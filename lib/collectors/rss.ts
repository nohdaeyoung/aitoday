import { RawItem } from "@/lib/schema";

interface RSSFeed {
  name: string;
  url: string;
  category: "major" | "ai-specialized" | "research";
}

const AI_NEWS_FEEDS: RSSFeed[] = [
  // 대형 언론 AI 섹션
  { name: "TechCrunch AI", url: "https://techcrunch.com/category/artificial-intelligence/feed/", category: "major" },
  { name: "The Verge AI", url: "https://www.theverge.com/rss/ai-artificial-intelligence/index.xml", category: "major" },
  { name: "Ars Technica", url: "https://feeds.arstechnica.com/arstechnica/technology-lab", category: "major" },
  { name: "VentureBeat AI", url: "https://venturebeat.com/category/ai/feed/", category: "major" },
  { name: "Wired AI", url: "https://www.wired.com/feed/tag/ai/latest/rss", category: "major" },

  // AI 전문 매체
  { name: "MIT Tech Review", url: "https://www.technologyreview.com/feed/", category: "ai-specialized" },
  { name: "Hugging Face", url: "https://huggingface.co/blog/feed.xml", category: "ai-specialized" },
  { name: "AI News", url: "https://www.artificialintelligence-news.com/feed/", category: "ai-specialized" },
  { name: "Towards AI", url: "https://pub.towardsai.net/feed", category: "ai-specialized" },
  { name: "The Batch", url: "https://www.deeplearning.ai/the-batch/feed/", category: "ai-specialized" },
  { name: "Import AI", url: "https://importai.substack.com/feed", category: "ai-specialized" },

  // AI 기업 공식 블로그
  { name: "OpenAI", url: "https://openai.com/news/rss.xml", category: "research" },
  { name: "Anthropic", url: "https://www.anthropic.com/rss.xml", category: "research" },
  { name: "Google DeepMind", url: "https://deepmind.google/blog/rss.xml", category: "research" },
  { name: "Google AI Blog", url: "https://blog.google/technology/ai/rss/", category: "research" },
  { name: "Meta AI", url: "https://ai.meta.com/blog/rss/", category: "research" },
  { name: "Microsoft AI", url: "https://blogs.microsoft.com/ai/feed/", category: "research" },
  { name: "NVIDIA AI", url: "https://blogs.nvidia.com/feed/", category: "research" },

  // 연구/논문
  { name: "Papers With Code", url: "https://paperswithcode.com/latest/feed", category: "research" },
  { name: "ArXiv cs.AI", url: "https://rss.arxiv.org/rss/cs.AI", category: "research" },
  { name: "ArXiv cs.CL", url: "https://rss.arxiv.org/rss/cs.CL", category: "research" },

  // VC/인사이트
  { name: "a16z AI", url: "https://a16z.com/feed/", category: "ai-specialized" },
];

const AI_KEYWORDS = [
  "ai", "artificial intelligence", "llm", "gpt", "claude", "gemini",
  "machine learning", "deep learning", "neural", "transformer",
  "openai", "anthropic", "mistral", "meta ai", "google ai", "deepmind",
  "diffusion", "stable diffusion", "midjourney", "dall-e", "sora",
  "langchain", "rag", "vector", "embedding", "fine-tun",
  "agent", "autonomous", "reasoning", "multimodal", "copilot",
  "model", "parameter", "benchmark", "inference", "training",
  "gpt-4", "gpt-5", "llama", "phi-",
  "open source ai", "foundation model", "frontier model",
  "chatbot", "prompt", "token", "context window",
  "computer vision", "nlp", "natural language",
  "robotics", "self-driving", "autonomous vehicle",
  "regulation", "ai safety", "alignment", "hallucination",
];

function isAIRelated(text: string): boolean {
  const lower = text.toLowerCase();
  return AI_KEYWORDS.some((kw) => lower.includes(kw));
}

function extractFromXML(xml: string): { title: string; link: string; pubDate: string; description: string }[] {
  const items: { title: string; link: string; pubDate: string; description: string }[] = [];

  const itemRegex = /<(?:item|entry)[\s>]([\s\S]*?)<\/(?:item|entry)>/gi;
  let match;

  while ((match = itemRegex.exec(xml)) !== null) {
    const block = match[1];

    const title = block.match(/<title[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/i)?.[1]?.trim() || "";
    const link =
      block.match(/<link[^>]*href="([^"]+)"/i)?.[1] ||
      block.match(/<link[^>]*>([\s\S]*?)<\/link>/i)?.[1]?.trim() ||
      block.match(/<guid[^>]*>(https?[^<]+)<\/guid>/i)?.[1] || "";
    const pubDate =
      block.match(/<pubDate[^>]*>([\s\S]*?)<\/pubDate>/i)?.[1]?.trim() ||
      block.match(/<published[^>]*>([\s\S]*?)<\/published>/i)?.[1]?.trim() ||
      block.match(/<updated[^>]*>([\s\S]*?)<\/updated>/i)?.[1]?.trim() || "";
    const description =
      block.match(/<description[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/i)?.[1]?.trim() ||
      block.match(/<summary[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/summary>/i)?.[1]?.trim() || "";

    if (title && link) {
      items.push({ title, link, pubDate, description: description.replace(/<[^>]+>/g, "").slice(0, 200) });
    }
  }

  return items;
}

function isWithin24h(dateStr: string): boolean {
  if (!dateStr) return true;
  try {
    return Date.now() - new Date(dateStr).getTime() < 24 * 3_600_000;
  } catch {
    return true;
  }
}

async function fetchFeed(feed: RSSFeed): Promise<RawItem[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);

  try {
    const res = await fetch(feed.url, {
      headers: { "User-Agent": "aitoday-bot/1.0", Accept: "application/rss+xml, application/xml, text/xml" },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) return [];

    const xml = await res.text();
    const entries = extractFromXML(xml);

    return entries
      .filter((e) => isWithin24h(e.pubDate))
      .filter((e) => isAIRelated(`${e.title} ${e.description}`))
      .slice(0, 5)
      .map((e) => ({
        title: e.title,
        url: e.link,
        score: feed.category === "ai-specialized" ? 80 : feed.category === "research" ? 70 : 60,
        source: feed.name as any,
        metadata: {
          description: e.description,
          category: feed.category,
          pubDate: e.pubDate,
        },
      }));
  } catch {
    clearTimeout(timeout);
    return [];
  }
}

export async function collectRSS(): Promise<RawItem[]> {
  const results = await Promise.allSettled(AI_NEWS_FEEDS.map(fetchFeed));

  const allItems: RawItem[] = [];
  for (const r of results) {
    if (r.status === "fulfilled") allItems.push(...r.value);
  }

  // URL 기반 중복 제거
  const seen = new Set<string>();
  const unique = allItems.filter((item) => {
    const norm = item.url.replace(/\/+$/, "").toLowerCase();
    if (seen.has(norm)) return false;
    seen.add(norm);
    return true;
  });

  return unique.sort((a, b) => b.score - a.score).slice(0, 15);
}
