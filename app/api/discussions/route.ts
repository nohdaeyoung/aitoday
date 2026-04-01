import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/firebase";

export async function GET() {
  const db = getDb();
  const snapshot = await db
    .collection("discussions")
    .orderBy("createdAt", "desc")
    .limit(50)
    .get();

  const discussions = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  return NextResponse.json({ discussions });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { nickname, title, content } = body;

  if (!nickname?.trim() || !title?.trim() || !content?.trim()) {
    return NextResponse.json({ error: "닉네임, 제목, 내용을 모두 입력해주세요." }, { status: 400 });
  }

  if (nickname.length > 20 || title.length > 100 || content.length > 2000) {
    return NextResponse.json({ error: "입력 길이를 초과했습니다." }, { status: 400 });
  }

  const db = getDb();
  const doc = await db.collection("discussions").add({
    nickname: nickname.trim(),
    title: title.trim(),
    content: content.trim(),
    createdAt: new Date().toISOString(),
    replies: 0,
  });

  return NextResponse.json({ id: doc.id });
}
