import { RawItem } from "@/lib/schema";

const HN_API = "https://hacker-news.firebaseio.com/v0";
const AI_KEYWORDS = [
  "ai", "artificial intelligence", "llm", "gpt", "claude", "gemini",
  "machine learning", "deep learning", "neural", "transformer",
  "openai", "anthropic", "mistral", "meta ai", "google ai", "deepmind",
  "diffusion", "stable diffusion", "midjourney", "dall-e", "sora", "copilot",
  "langchain", "rag", "vector", "embedding", "fine-tun",
  "agent", "autonomous", "reasoning", "multimodal",
  "llama", "phi-", "qwen", "deepseek", "command r",
  "foundation model", "frontier model", "open source model",
  "chatbot", "prompt", "token", "context window", "benchmark",
  "computer vision", "nlp", "natural language", "speech",
  "robotics", "self-driving", "ai safety", "alignment", "hallucination",
  "ai regulation", "ai act", "ai policy",
  "inference", "training", "gpu", "tpu", "nvidia", "cuda",
];

function isAIRelated(title: string): boolean {
  const lower = title.toLowerCase();
  return AI_KEYWORDS.some((kw) => lower.includes(kw));
}

async function fetchItem(id: number): Promise<{ title: string; url: string; score: number } | null> {
  const res = await fetch(`${HN_API}/item/${id}.json`);
  if (!res.ok) return null;
  const item = await res.json();
  if (!item || item.dead || item.deleted) return null;
  return {
    title: item.title || "",
    url: item.url || `https://news.ycombinator.com/item?id=${id}`,
    score: item.score || 0,
  };
}

export async function collectHN(): Promise<RawItem[]> {
  const res = await fetch(`${HN_API}/topstories.json`);
  if (!res.ok) throw new Error(`HN API failed: ${res.status}`);

  const ids: number[] = await res.json();
  const top50 = ids.slice(0, 50);

  const items = await Promise.all(top50.map(fetchItem));
  const valid = items.filter((item): item is NonNullable<typeof item> => item !== null);

  return valid
    .filter((item) => isAIRelated(item.title))
    .sort((a, b) => b.score - a.score)
    .slice(0, 10)
    .map((item) => ({
      title: item.title,
      url: item.url,
      score: item.score,
      source: "hn" as const,
      metadata: {},
    }));
}
