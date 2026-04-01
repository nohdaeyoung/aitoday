import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/firebase";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.toLowerCase().trim();
  if (!query) {
    return NextResponse.json({ results: [] });
  }

  const db = getDb();
  const snapshot = await db.collection("digests").get();

  interface SearchResult {
    title: string;
    summary: string;
    url: string;
    source: string;
    tags?: string[];
    date: string;
    type: "news" | "community" | "github" | "papers";
  }

  const results: SearchResult[] = [];

  for (const doc of snapshot.docs) {
    const date = doc.id;
    const data = doc.data();

    for (const period of ["morning", "evening"] as const) {
      const digest = data[period];
      if (!digest) continue;

      // news 검색
      for (const item of digest.news || []) {
        if (matches(item, query)) {
          results.push({ ...pick(item), date, type: "news" });
        }
      }

      // community 검색
      for (const item of digest.community || []) {
        if (matches(item, query)) {
          results.push({ ...pick(item), date, type: "community" });
        }
      }

      // github 검색
      for (const item of digest.github || []) {
        const title = item.name || item.title || "";
        const summary = item.description || item.summary || "";
        if (matchText(`${title} ${summary} ${(item.tags || []).join(" ")}`, query)) {
          results.push({
            title,
            summary,
            url: item.url,
            source: item.language || "GitHub",
            tags: item.tags,
            date,
            type: "github",
          });
        }
      }

      // papers 검색
      for (const item of digest.papers || []) {
        if (matches(item, query)) {
          results.push({ ...pick(item), date, type: "papers" });
        }
      }
    }
  }

  // 최신순 정렬
  results.sort((a, b) => b.date.localeCompare(a.date));

  return NextResponse.json({ results: results.slice(0, 50) });
}

function matchText(text: string, query: string): boolean {
  const lower = text.toLowerCase();
  return query.split(/\s+/).every((word) => lower.includes(word));
}

function matches(item: any, query: string): boolean {
  const text = `${item.title || ""} ${item.summary || ""} ${(item.tags || []).join(" ")} ${item.source || ""}`;
  return matchText(text, query);
}

function pick(item: any) {
  return {
    title: item.title || "",
    summary: item.summary || "",
    url: item.url || "",
    source: item.source || "",
    tags: item.tags,
  };
}
