import { getLatestDigest } from "@/lib/getDigest";
import { DigestCard, GithubCard } from "@/components/DigestCard";

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

      {digest.news.length > 0 && (
        <section className="mb-10">
          <SectionHeader label="NEWS" title="AI 뉴스 다이제스트" />
          <div>
            {digest.news.map((item, i) => (
              <DigestCard
                key={i}
                title={item.title}
                summary={item.summary}
                url={item.url}
                source={item.source}
                variant="news"
              />
            ))}
          </div>
        </section>
      )}

      {digest.community.length > 0 && (
        <section className="mb-10">
          <SectionHeader label="COMMUNITY" title="커뮤니티 핫 아티클" />
          <div>
            {digest.community.map((item, i) => (
              <DigestCard
                key={i}
                title={item.title}
                summary={item.summary}
                url={item.url}
                source={item.source}
                variant="community"
                stats={[
                  ...(item.upvotes ? [{ label: "↑", value: item.upvotes }] : []),
                  ...(item.comments ? [{ label: "💬", value: item.comments }] : []),
                ]}
              />
            ))}
          </div>
        </section>
      )}

      {digest.github.length > 0 && (
        <section className="mb-10">
          <SectionHeader label="TRENDING" title="GitHub 트렌딩" />
          <div>
            {digest.github.map((item, i) => (
              <GithubCard
                key={i}
                name={item.name}
                description={item.description}
                url={item.url}
                stars={item.stars}
                todayStars={item.todayStars}
                language={item.language}
              />
            ))}
          </div>
        </section>
      )}

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
      <div className="flex items-baseline gap-3">
        <h1 className="text-[22px] font-bold tracking-tight text-[var(--color-foreground)]">
          AI Today
        </h1>
        <span className="text-[12px] text-[var(--color-accent)] font-medium">
          {date}
        </span>
      </div>
      <p className="text-[13px] text-[var(--color-muted)] mt-1">
        글로벌 AI 뉴스를 한국어로
      </p>
    </header>
  );
}

function SectionHeader({ label, title }: { label: string; title: string }) {
  return (
    <div className="mb-4">
      <p className="text-[10px] font-semibold tracking-[0.15em] text-[var(--color-accent)] uppercase">
        {label}
      </p>
      <h2 className="text-[17px] font-semibold text-[var(--color-foreground)] mt-0.5">
        {title}
      </h2>
    </div>
  );
}
