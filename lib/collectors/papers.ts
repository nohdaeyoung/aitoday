import { RawItem } from "@/lib/schema";

interface PaperFeed {
  name: string;
  url: string;
}

const PAPER_FEEDS: PaperFeed[] = [
  { name: "ArXiv cs.AI", url: "https://rss.arxiv.org/rss/cs.AI" },
  { name: "ArXiv cs.CL", url: "https://rss.arxiv.org/rss/cs.CL" },
  { name: "ArXiv cs.LG", url: "https://rss.arxiv.org/rss/cs.LG" },
  { name: "ArXiv cs.CV", url: "https://rss.arxiv.org/rss/cs.CV" },
  { name: "HuggingFace Papers", url: "https://huggingface.co/papers/rss" },
];

const AI_PAPER_KEYWORDS = [
  "llm", "large language model", "transformer", "attention",
  "diffusion", "generative", "reinforcement learning",
  "fine-tun", "pretraining", "alignment", "rlhf", "dpo",
  "multimodal", "vision-language", "text-to-image",
  "reasoning", "chain-of-thought", "agent",
  "retrieval", "rag", "embedding", "vector",
  "benchmark", "evaluation", "scaling",
  "efficient", "quantization", "pruning", "distillation",
  "safety", "hallucination", "robustness",
  "code generation", "instruction tuning",
  "gpt", "claude", "gemini", "llama", "mistral",
];

function isRelevant(text: string): boolean {
  const lower = text.toLowerCase();
  return AI_PAPER_KEYWORDS.some((kw) => lower.includes(kw));
}

function extractFromXML(xml: string): { title: string; link: string; description: string; authors: string }[] {
  const items: { title: string; link: string; description: string; authors: string }[] = [];
  const itemRegex = /<(?:item|entry)[\s>]([\s\S]*?)<\/(?:item|entry)>/gi;
  let match;

  while ((match = itemRegex.exec(xml)) !== null) {
    const block = match[1];
    const title = block.match(/<title[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/i)?.[1]?.trim() || "";
    const link =
      block.match(/<link[^>]*href="([^"]+)"/i)?.[1] ||
      block.match(/<link[^>]*>([\s\S]*?)<\/link>/i)?.[1]?.trim() ||
      block.match(/<guid[^>]*>(https?[^<]+)<\/guid>/i)?.[1] || "";
    const description =
      block.match(/<description[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/i)?.[1]?.trim() ||
      block.match(/<summary[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/summary>/i)?.[1]?.trim() || "";
    const authors =
      block.match(/<(?:dc:creator|author)[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/(?:dc:creator|author)>/i)?.[1]?.trim() || "";

    if (title && link) {
      items.push({
        title: title.replace(/<[^>]+>/g, ""),
        link,
        description: description.replace(/<[^>]+>/g, "").slice(0, 300),
        authors,
      });
    }
  }

  return items;
}

async function fetchPaperFeed(feed: PaperFeed): Promise<RawItem[]> {
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
      .filter((e) => isRelevant(`${e.title} ${e.description}`))
      .slice(0, 10)
      .map((e) => ({
        title: e.title,
        url: e.link,
        score: 50,
        source: feed.name as any,
        metadata: {
          description: e.description,
          authors: e.authors,
          type: "paper",
        },
      }));
  } catch {
    clearTimeout(timeout);
    return [];
  }
}

export async function collectPapers(): Promise<RawItem[]> {
  const results = await Promise.allSettled(PAPER_FEEDS.map(fetchPaperFeed));

  const allItems: RawItem[] = [];
  for (const r of results) {
    if (r.status === "fulfilled") allItems.push(...r.value);
  }

  const seen = new Set<string>();
  const unique = allItems.filter((item) => {
    const norm = item.url.replace(/\/+$/, "").toLowerCase();
    if (seen.has(norm)) return false;
    seen.add(norm);
    return true;
  });

  return unique.slice(0, 15);
}
