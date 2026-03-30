import { getDb } from "@/lib/firebase";
import type { DigestDoc } from "@/lib/schema";

export async function getLatestDigest(): Promise<{
  digest: DigestDoc | null;
  date: string;
  period: string;
}> {
  // 오늘 날짜 (KST)
  const kstNow = new Date(Date.now() + 9 * 60 * 60 * 1000);
  const today = kstNow.toISOString().split("T")[0];
  const yesterday = new Date(kstNow.getTime() - 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  // 오늘 문서 확인
  const db = getDb();
  const todayDoc = await db.collection("digests").doc(today).get();
  if (todayDoc.exists) {
    const data = todayDoc.data()!;
    if (data.evening) return { digest: data.evening as DigestDoc, date: today, period: "evening" };
    if (data.morning) return { digest: data.morning as DigestDoc, date: today, period: "morning" };
  }

  // 어제 문서 확인
  const yesterdayDoc = await db.collection("digests").doc(yesterday).get();
  if (yesterdayDoc.exists) {
    const data = yesterdayDoc.data()!;
    if (data.evening) return { digest: data.evening as DigestDoc, date: yesterday, period: "evening" };
    if (data.morning) return { digest: data.morning as DigestDoc, date: yesterday, period: "morning" };
  }

  return { digest: null, date: today, period: "morning" };
}
