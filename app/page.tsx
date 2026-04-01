import { DigestTabs } from "@/components/DigestTabs";
import { WeatherSection } from "@/components/WeatherSection";
import { PageFooter } from "@/components/PageFooter";
import Link from "next/link";

export const revalidate = 21600;

async function getDigestData() {
  if (process.env.NODE_ENV === "development") {
    const { mockDigest } = await import("@/lib/mock-digest");
    return {
      digest: mockDigest as any,
      date: new Date().toISOString().split("T")[0],
      period: "morning",
    };
  }
  try {
    const { getLatestDigest } = await import("@/lib/getDigest");
    return await getLatestDigest();
  } catch {
    return {
      digest: null,
      date: new Date().toISOString().split("T")[0],
      period: "morning",
    };
  }
}

export default async function Home() {
  const { digest, date, period } = await getDigestData();

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
        <WeatherSection weather={digest.weather} topicTrends={digest.topicTrends} />
      )}

      <DigestTabs
        news={digest.news}
        community={digest.community}
        github={digest.github}
        papers={digest.papers}
      />

      <PageFooter date={date} period={period} />
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
        <div className="flex items-center gap-3">
          <Link
            href="/search"
            className="text-[12px] text-[var(--color-muted)] hover:text-[var(--color-accent)] transition-colors py-2"
          >
            검색
          </Link>
          <Link
            href="/community"
            className="text-[12px] text-[var(--color-muted)] hover:text-[var(--color-accent)] transition-colors py-2"
          >
            커뮤니티
          </Link>
          <Link
            href="/archive"
            className="text-[12px] text-[var(--color-muted)] hover:text-[var(--color-accent)] transition-colors py-2"
          >
            아카이브
          </Link>
        </div>
      </div>
      <p className="text-[13px] text-[var(--color-muted)] mt-1">
        글로벌 AI 뉴스를 한국어로
      </p>
    </header>
  );
}

