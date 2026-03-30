import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getDb } from "@/lib/firebase";
import { collectHN } from "@/lib/collectors/hn";
import { collectCommunity } from "@/lib/collectors/community";
import { collectGithub } from "@/lib/collectors/github";
import { collectRSS } from "@/lib/collectors/rss";
import { generateDigest } from "@/lib/claude";
import type { RawItem, DigestDoc } from "@/lib/schema";

export const maxDuration = 300;

function dedup(items: RawItem[]): RawItem[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    const normalized = item.url.replace(/\/+$/, "").toLowerCase();
    if (seen.has(normalized)) return false;
    seen.add(normalized);
    return true;
  });
}

export async function GET(request: NextRequest) {
  // CRON_SECRET 검증
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);

  // ?diag=1 진단 모드 — Claude 호출 없이 수집 결과만 확인 (f1 패턴)
  if (url.searchParams.get("diag") === "1") {
    const results = await Promise.allSettled([
      collectHN(),
      collectCommunity(),
      collectGithub(),
      collectRSS(),
    ]);
    const sourceNames = ["hn", "community", "github", "rss"] as const;
    const diag = sourceNames.map((name, i) => {
      const r = results[i];
      return {
        source: name,
        status: r.status,
        count: r.status === "fulfilled" ? r.value.length : 0,
        error: r.status === "rejected" ? String(r.reason) : undefined,
        sample: r.status === "fulfilled" ? r.value.slice(0, 3).map((item) => item.title) : [],
      };
    });
    return NextResponse.json({ diag, hasApiKey: !!process.env.ANTHROPIC_API_KEY });
  }

  const sourceStatus: Record<string, "ok" | "failed"> = {};
  const allItems: RawItem[] = [];
  const deadline = Date.now() + 200_000; // 200초 워치독

  // 4개 소스 병렬 수집
  const results = await Promise.allSettled([
    collectHN(),
    collectCommunity(),
    collectGithub(),
    collectRSS(),
  ]);

  const sourceNames = ["hn", "community", "github", "rss"] as const;
  results.forEach((result, i) => {
    const name = sourceNames[i];
    if (result.status === "fulfilled") {
      sourceStatus[name] = "ok";
      allItems.push(...result.value);
    } else {
      sourceStatus[name] = "failed";
      console.error(`[${name}] collection failed:`, result.reason);
    }
  });

  const successCount = Object.values(sourceStatus).filter((s) => s === "ok").length;
  if (successCount === 0) {
    return NextResponse.json(
      { error: "All sources failed", sourceStatus },
      { status: 500 }
    );
  }

  // URL 중복 제거
  const uniqueItems = dedup(allItems);

  // 최소 아이템 확인
  if (uniqueItems.length < 5) {
    return NextResponse.json(
      { error: "Not enough items collected", count: uniqueItems.length, sourceStatus },
      { status: 500 }
    );
  }

  // 워치독 체크 — 시간 부족하면 Claude 스킵
  if (Date.now() > deadline) {
    console.error("Deadline exceeded before Claude call");
    return NextResponse.json(
      { error: "Timeout before AI processing", sourceStatus },
      { status: 500 }
    );
  }

  // Claude API 배치 호출
  let digest;
  try {
    digest = await generateDigest(uniqueItems);
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("Claude API failed:", msg);
    return NextResponse.json(
      { error: "AI processing failed", detail: msg, sourceStatus, itemCount: uniqueItems.length },
      { status: 500 }
    );
  }

  // Firestore 저장
  const now = new Date();
  const dateKey = now.toISOString().split("T")[0]; // YYYY-MM-DD
  const period = now.getHours() < 15 ? "morning" : "evening"; // KST 기준 (UTC+9)

  const doc: DigestDoc = {
    ...digest,
    generatedAt: now.toISOString(),
    sourceStatus,
  };

  try {
    await getDb().collection("digests").doc(dateKey).set(
      { [period]: doc },
      { merge: true }
    );
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("Firestore write failed:", msg);
    return NextResponse.json(
      { error: "Database write failed", detail: msg, sourceStatus },
      { status: 500 }
    );
  }

  // On-demand revalidation
  revalidatePath("/");

  return NextResponse.json({
    success: true,
    date: dateKey,
    period,
    sourceStatus,
    itemsCollected: uniqueItems.length,
    newsCount: digest.news.length,
    communityCount: digest.community.length,
    githubCount: digest.github.length,
  });
}
