import { getDigestByDate } from "@/lib/getDigest";
import { DigestTabs } from "@/components/DigestTabs";
import Link from "next/link";

export const revalidate = 21600;

interface Props {
  params: Promise<{ date: string }>;
}

export default async function DatePage({ params }: Props) {
  const { date } = await params;

  // 날짜 형식 검증
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return (
      <main className="max-w-[640px] mx-auto px-5 py-16">
        <p className="text-[var(--color-muted)]">잘못된 날짜 형식입니다.</p>
        <Link href="/" className="text-[var(--color-accent)] text-sm mt-4 inline-block">
          ← 오늘의 다이제스트로
        </Link>
      </main>
    );
  }

  const { morning, evening } = await getDigestByDate(date);
  const digest = evening || morning;
  const period = evening ? "evening" : "morning";

  if (!digest) {
    return (
      <main className="max-w-[640px] mx-auto px-5 py-16">
        <Nav />
        <p className="text-lg text-[var(--color-foreground)]">{date}의 다이제스트가 없습니다.</p>
        <Link href="/archive" className="text-[var(--color-accent)] text-sm mt-4 inline-block">
          ← 아카이브 목록
        </Link>
      </main>
    );
  }

  return (
    <main className="max-w-[640px] mx-auto px-5 py-8">
      <Nav />
      <header className="mb-8 pt-2">
        <div className="flex items-baseline gap-3">
          <h1 className="text-[22px] font-bold tracking-tight text-[var(--color-foreground)]">
            AI Today
          </h1>
          <span className="text-[12px] text-[var(--color-accent)] font-medium">
            {date}
          </span>
        </div>
        <p className="text-[13px] text-[var(--color-muted)] mt-1">
          {period === "morning" ? "오전" : "오후"} 에디션
          {morning && evening && (
            <span className="ml-2">
              {period === "evening" ? (
                <button className="text-[var(--color-accent)] underline" />
              ) : null}
            </span>
          )}
        </p>
      </header>

      {digest.weather && (
        <section className="mb-10 py-5 px-5 -mx-5 bg-[var(--color-accent-light)] border-y border-[var(--color-accent)]/20">
          <p className="text-[11px] font-semibold tracking-widest uppercase text-[var(--color-accent)] mb-2">
            AI Weather
          </p>
          <p className="text-[17px] text-[var(--color-foreground)] leading-relaxed font-medium">
            {digest.weather}
          </p>
        </section>
      )}

      <DigestTabs
        news={digest.news}
        community={digest.community}
        github={digest.github}
        papers={digest.papers}
      />

      <footer className="pt-8 pb-12 border-t border-[var(--color-border)]">
        <p className="text-[12px] text-[var(--color-muted)]">
          AI Today / {date} {period === "morning" ? "오전" : "오후"} 에디션
        </p>
        <Link href="/archive" className="text-[12px] text-[var(--color-accent)] mt-2 inline-block">
          ← 아카이브 전체 보기
        </Link>
      </footer>
    </main>
  );
}

function Nav() {
  return (
    <nav className="flex items-center gap-3 py-3 text-[13px]">
      <Link href="/" className="text-[var(--color-accent)] hover:underline">오늘</Link>
      <span className="text-[var(--color-border)]">/</span>
      <Link href="/archive" className="text-[var(--color-muted)] hover:text-[var(--color-foreground)]">아카이브</Link>
    </nav>
  );
}
