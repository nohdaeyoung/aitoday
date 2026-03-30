import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore, Firestore } from "firebase-admin/firestore";

let _db: Firestore | null = null;

export function getDb(): Firestore {
  if (_db) return _db;

  if (getApps().length === 0) {
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    if (!serviceAccount) {
      throw new Error("FIREBASE_SERVICE_ACCOUNT_KEY is not set");
    }
    // Vercel 환경변수에서 따옴표 이중 인코딩 처리
    const cleaned = serviceAccount.replace(/^"+|"+$/g, "");
    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      // 이스케이프된 줄바꿈 처리
      parsed = JSON.parse(cleaned.replace(/\\n/g, "\n"));
    }
    if (typeof parsed === "string") parsed = JSON.parse(parsed);
    initializeApp({ credential: cert(parsed as any) });
  }

  _db = getFirestore();
  return _db;
}
