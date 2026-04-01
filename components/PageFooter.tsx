import Link from "next/link";

interface PageFooterProps {
  date: string;
  period: string;
  showArchiveLink?: boolean;
}

export function PageFooter({ date, period, showArchiveLink = false }: PageFooterProps) {
  return (
    <footer className="pt-8 pb-12 border-t border-[var(--color-border)]">
      <p className="text-[12px] text-[var(--color-muted)]">
        AI Today / {date} {period === "morning" ? "오전" : "오후"} 에디션
      </p>
      {showArchiveLink ? (
        <Link href="/archive" className="text-[12px] text-[var(--color-accent)] hover:underline mt-2 inline-block">
          ← 아카이브 전체 보기
        </Link>
      ) : (
        <p className="text-[11px] text-[var(--color-muted)] mt-1">
          매일 오전 7시 · 오후 7시 자동 업데이트
        </p>
      )}
    </footer>
  );
}
