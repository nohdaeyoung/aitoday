import { getDigestByDate } from "@/lib/getDigest";
import { DigestTabs } from "@/components/DigestTabs";
import { WeatherSection } from "@/components/WeatherSection";
import { PageFooter } from "@/components/PageFooter";
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
        </p>
      </header>

      {digest.weather && (
        <WeatherSection weather={digest.weather} topicTrends={digest.topicTrends} />
      )}

      <DigestTabs
        news={digest.news}
        community={digest.community}
        github={digest.github}
        papers={digest.papers}
      />

      <PageFooter date={date} period={period} showArchiveLink />
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
