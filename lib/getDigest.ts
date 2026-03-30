import { getDb } from "@/lib/firebase";
import type { DigestDoc } from "@/lib/schema";

export async function getLatestDigest(): Promise<{
  digest: DigestDoc | null;
  date: string;
  period: string;
}> {
  const kstNow = new Date(Date.now() + 9 * 60 * 60 * 1000);
  const today = kstNow.toISOString().split("T")[0];
  const yesterday = new Date(kstNow.getTime() - 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  const db = getDb();
  const todayDoc = await db.collection("digests").doc(today).get();
  if (todayDoc.exists) {
    const data = todayDoc.data()!;
    if (data.evening) return { digest: data.evening as DigestDoc, date: today, period: "evening" };
    if (data.morning) return { digest: data.morning as DigestDoc, date: today, period: "morning" };
  }

  const yesterdayDoc = await db.collection("digests").doc(yesterday).get();
  if (yesterdayDoc.exists) {
    const data = yesterdayDoc.data()!;
    if (data.evening) return { digest: data.evening as DigestDoc, date: yesterday, period: "evening" };
    if (data.morning) return { digest: data.morning as DigestDoc, date: yesterday, period: "morning" };
  }

  return { digest: null, date: today, period: "morning" };
}

export async function getDigestByDate(date: string): Promise<{
  morning: DigestDoc | null;
  evening: DigestDoc | null;
}> {
  const db = getDb();
  const doc = await db.collection("digests").doc(date).get();
  if (!doc.exists) return { morning: null, evening: null };
  const data = doc.data()!;
  return {
    morning: (data.morning as DigestDoc) || null,
    evening: (data.evening as DigestDoc) || null,
  };
}

export async function getArchiveDates(): Promise<string[]> {
  const db = getDb();
  const snapshot = await db.collection("digests").get();
  const ids = snapshot.docs.map((doc) => doc.id);
  return ids.sort().reverse().slice(0, 90);
}
