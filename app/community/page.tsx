"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Discussion {
  id: string;
  nickname: string;
  title: string;
  content: string;
  createdAt: string;
  replies: number;
}

export default function CommunityPage() {
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [nickname, setNickname] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch("/api/discussions")
      .then((r) => r.json())
      .then((data) => setDiscussions(data.discussions || []))
      .catch(() => setDiscussions([]))
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nickname.trim() || !title.trim() || !content.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/discussions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nickname, title, content }),
      });
      if (res.ok) {
        setTitle("");
        setContent("");
        setShowForm(false);
        // 목록 새로고침
        const data = await fetch("/api/discussions").then((r) => r.json());
        setDiscussions(data.discussions || []);
      }
    } catch {
      // 조용히 실패
    }
    setSubmitting(false);
  }

  function timeAgo(iso: string): string {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "방금";
    if (mins < 60) return `${mins}분 전`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}시간 전`;
    const days = Math.floor(hours / 24);
    return `${days}일 전`;
  }

  return (
    <main className="max-w-[640px] mx-auto px-5 py-8">
      <nav className="flex items-center gap-3 py-3 text-[13px]">
        <Link href="/" className="text-[var(--color-accent)] hover:underline">오늘</Link>
        <span className="text-[var(--color-border)]">/</span>
        <span className="text-[var(--color-foreground)] font-medium">커뮤니티</span>
      </nav>

      <header className="mb-6 pt-2 flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-bold tracking-tight text-[var(--color-foreground)]">
            커뮤니티
          </h1>
          <p className="text-[13px] text-[var(--color-muted)] mt-1">AI 관련 자유 토론</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="text-[13px] px-4 py-2 rounded-lg bg-[var(--color-accent)] text-white font-medium hover:opacity-90 transition-opacity"
        >
          {showForm ? "취소" : "글쓰기"}
        </button>
      </header>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-8 p-5 rounded-lg border border-[var(--color-border)] bg-white">
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="닉네임 (최대 20자)"
            maxLength={20}
            className="w-full px-3 py-2 text-[14px] rounded border border-[var(--color-border)] mb-3 focus:outline-none focus:border-[var(--color-accent)]"
          />
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="제목 (최대 100자)"
            maxLength={100}
            className="w-full px-3 py-2 text-[14px] rounded border border-[var(--color-border)] mb-3 focus:outline-none focus:border-[var(--color-accent)]"
          />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="내용 (최대 2000자)"
            maxLength={2000}
            rows={5}
            className="w-full px-3 py-2 text-[14px] rounded border border-[var(--color-border)] mb-3 resize-none focus:outline-none focus:border-[var(--color-accent)]"
          />
          <button
            type="submit"
            disabled={submitting || !nickname.trim() || !title.trim() || !content.trim()}
            className="px-5 py-2 text-[14px] font-medium rounded-lg bg-[var(--color-accent)] text-white hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {submitting ? "등록 중..." : "등록"}
          </button>
        </form>
      )}

      {loading && (
        <p className="text-center text-[var(--color-muted)] py-10">불러오는 중...</p>
      )}

      {!loading && discussions.length === 0 && (
        <div className="text-center py-16">
          <p className="text-[var(--color-muted)]">아직 글이 없습니다.</p>
          <p className="text-[13px] text-[var(--color-muted)] mt-1">첫 번째 토론을 시작해보세요!</p>
        </div>
      )}

      {discussions.map((d) => (
        <div
          key={d.id}
          className="py-4 border-b border-[var(--color-border)] last:border-b-0"
        >
          <h3 className="text-[15px] font-semibold text-[var(--color-foreground)] leading-snug">
            {d.title}
          </h3>
          <p className="text-[13px] text-[var(--color-muted)] leading-relaxed mt-1 line-clamp-3">
            {d.content}
          </p>
          <div className="flex items-center gap-3 mt-2 text-[11px] text-[var(--color-muted)]">
            <span>{d.nickname}</span>
            <span>{timeAgo(d.createdAt)}</span>
          </div>
        </div>
      ))}
    </main>
  );
}
