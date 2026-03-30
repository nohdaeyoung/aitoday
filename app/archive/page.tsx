import { getArchiveDates } from "@/lib/getDigest";
import Link from "next/link";

export const revalidate = 3600;

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  const days = ["일", "월", "화", "수", "목", "금", "토"];
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 (${days[d.getDay()]})`;
}

function isToday(dateStr: string): boolean {
  const kstNow = new Date(Date.now() + 9 * 60 * 60 * 1000);
  return kstNow.toISOString().split("T")[0] === dateStr;
}

export default async function ArchivePage() {
  let dates: string[] = [];

  try {
    dates = await getArchiveDates();
  } catch {
    // Firestore 연결 실패 시 빈 목록
  }

  return (
    <main className="max-w-[640px] mx-auto px-5 py-8">
      <nav className="flex items-center gap-3 py-3 text-[13px]">
        <Link href="/" className="text-[var(--color-accent)] hover:underline">오늘</Link>
        <span className="text-[var(--color-border)]">/</span>
        <span className="text-[var(--color-foreground)] font-medium">아카이브</span>
      </nav>

      <header className="mb-8 pt-2">
        <h1 className="text-[22px] font-bold tracking-tight text-[var(--color-foreground)]">
          아카이브
        </h1>
        <p className="text-[13px] text-[var(--color-muted)] mt-1">
          지난 AI 다이제스트 모아보기
        </p>
      </header>

      {dates.length === 0 ? (
        <div className="py-20">
          <p className="text-[var(--color-muted)]">아직 아카이브된 다이제스트가 없습니다.</p>
        </div>
      ) : (
        <div>
          {dates.map((date) => (
            <Link
              key={date}
              href={isToday(date) ? "/" : `/${date}`}
              className="flex items-center justify-between py-4 border-b border-[var(--color-border)] last:border-b-0 group"
            >
              <div>
                <p className="text-[15px] font-medium text-[var(--color-foreground)] group-hover:text-[var(--color-accent)] transition-colors">
                  {formatDate(date)}
                </p>
                <p className="text-[12px] text-[var(--color-muted)] mt-0.5">
                  {date}
                </p>
              </div>
              {isToday(date) && (
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-[var(--color-accent)] text-white font-medium">
                  오늘
                </span>
              )}
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
