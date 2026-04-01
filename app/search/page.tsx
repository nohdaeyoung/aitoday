"use client";

import { useState } from "react";
import Link from "next/link";

interface SearchResult {
  title: string;
  summary: string;
  url: string;
  source: string;
  tags?: string[];
  date: string;
  type: "news" | "community" | "github" | "papers";
}

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`);
      const data = await res.json();
      setResults(data.results || []);
    } catch {
      setResults([]);
    }
    setLoading(false);
  }

  return (
    <main className="max-w-[640px] mx-auto px-5 py-8">
      <nav className="flex items-center gap-3 py-3 text-[13px]">
        <Link href="/" className="text-[var(--color-accent)] hover:underline">오늘</Link>
        <span className="text-[var(--color-border)]">/</span>
        <span className="text-[var(--color-foreground)] font-medium">검색</span>
      </nav>

      <header className="mb-6 pt-2">
        <h1 className="text-[22px] font-bold tracking-tight text-[var(--color-foreground)]">
          검색
        </h1>
      </header>

      <form onSubmit={handleSearch} className="flex gap-2 mb-8">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="키워드로 검색 (예: LLM, Claude, Agent)"
          className="flex-1 px-4 py-2.5 text-[14px] rounded-lg border border-[var(--color-border)] bg-white focus:outline-none focus:border-[var(--color-accent)] transition-colors"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-5 py-2.5 text-[14px] font-medium rounded-lg bg-[var(--color-accent)] text-white hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {loading ? "검색 중..." : "검색"}
        </button>
      </form>

      {loading && (
        <p className="text-center text-[var(--color-muted)] py-10">검색 중...</p>
      )}

      {searched && !loading && results.length === 0 && (
        <p className="text-center text-[var(--color-muted)] py-10">
          &ldquo;{query}&rdquo;에 대한 결과가 없습니다.
        </p>
      )}

      {results.length > 0 && (
        <div>
          <p className="text-[12px] text-[var(--color-muted)] mb-4">
            {results.length}개 결과
          </p>
          {results.map((item, i) => (
            <a
              key={i}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block py-4 border-b border-[var(--color-border)] last:border-b-0 group"
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--color-surface)] text-[var(--color-muted)]">
                  {item.type}
                </span>
                <span className="text-[11px] text-[var(--color-muted)]">{item.date}</span>
                <span className="text-[11px] text-[var(--color-muted)]">{item.source}</span>
              </div>
              <h3 className="text-[15px] font-semibold text-[var(--color-foreground)] leading-snug group-hover:text-[var(--color-accent)] transition-colors">
                {item.title}
              </h3>
              <p className="text-[13px] text-[var(--color-muted)] leading-relaxed mt-1 line-clamp-2">
                {item.summary}
              </p>
              {item.tags && item.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {item.tags.map((tag) => (
                    <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--color-surface)] text-[var(--color-muted)]">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </a>
          ))}
        </div>
      )}
    </main>
  );
}
