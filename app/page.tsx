import { getLatestDigest } from "@/lib/getDigest";
import { DigestTabs } from "@/components/DigestTabs";
import Link from "next/link";

export const revalidate = 21600;

export default async function Home() {
  let digest, date, period;

  try {
    const result = await getLatestDigest();
    digest = result.digest;
    date = result.date;
    period = result.period;
  } catch {
    digest = null;
    date = new Date().toISOString().split("T")[0];
    period = "morning";
  }

  if (!digest) {
    return (
      <main className="max-w-[640px] mx-auto px-5 py-16">
        <Header date={date} />
        <div className="py-20">
          <p className="text-lg text-[var(--color-foreground)]">
            오늘의 다이제스트를 준비하고 있습니다.
          </p>
          <p className="text-sm text-[var(--color-muted)] mt-2">
            매일 오전 7시, 오후 7시에 새로운 AI 소식이 도착합니다.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-[640px] mx-auto px-5 py-8">
      <Header date={date} />

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
        <p className="text-[11px] text-[var(--color-muted)] mt-1">
          매일 오전 7시 · 오후 7시 자동 업데이트
        </p>
      </footer>
    </main>
  );
}

function Header({ date }: { date: string }) {
  return (
    <header className="mb-8 pt-6">
      <div className="flex items-center justify-between">
        <div className="flex items-baseline gap-3">
          <h1 className="text-[22px] font-bold tracking-tight text-[var(--color-foreground)]">
            AI Today
          </h1>
          <span className="text-[12px] text-[var(--color-accent)] font-medium">
            {date}
          </span>
        </div>
        <Link
          href="/archive"
          className="text-[12px] text-[var(--color-muted)] hover:text-[var(--color-accent)] transition-colors"
        >
          아카이브
        </Link>
      </div>
      <p className="text-[13px] text-[var(--color-muted)] mt-1">
        글로벌 AI 뉴스를 한국어로
      </p>
    </header>
  );
}

