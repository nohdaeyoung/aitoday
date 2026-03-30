import Anthropic from "@anthropic-ai/sdk";
import { DigestOutputSchema, type DigestOutput, type RawItem } from "@/lib/schema";

const SYSTEM_PROMPT = `당신은 한국 최고의 AI 전문 뉴스 편집장입니다. 글로벌 AI 소식을 한국어로 큐레이션합니다.

핵심 원칙:
1. 다양한 출처에서 가장 중요하고 흥미로운 소식을 선별합니다.
2. 각 아이템에 자연스러운 한국어 제목과 2-3문장 요약을 작성합니다.
3. 요약에는 핵심 내용 + 왜 중요한지 + 업계에 미치는 영향을 포함합니다.
4. 번역투가 아닌, 한국 IT 매체 기자가 쓴 듯한 자연스러운 한국어를 사용합니다.
5. 반드시 지정된 JSON 형식으로만 응답합니다.

커버 범위 — AI 개발자에게 유용한 소식만 선별:
- AI 모델 릴리즈/업데이트 (GPT, Claude, Gemini, Llama, Mistral, DeepSeek 등)
- 새로운 AI API, SDK, 프레임워크 출시
- 오픈소스 AI 도구/라이브러리 (LangChain, LlamaIndex, vLLM 등)
- AI 연구 논문/브레이크스루 (새로운 아키텍처, 벤치마크, 학습 기법)
- AI 코딩 도구 (Copilot, Cursor, Claude Code, Codex 등)
- 프롬프트 엔지니어링, RAG, 파인튜닝 기법
- AI 인프라 (GPU, 추론 최적화, 배포, MLOps)
- AI Agent/자동화 도구 및 패턴

제외 — 다음은 포함하지 마세요:
- AI 관련 사건/사고/범죄 뉴스
- AI 윤리/철학 논쟁 (기술적 안전 연구는 OK)
- AI 관련 소송/법적 분쟁 (규제 정책 변화는 OK)
- AI로 생성한 콘텐츠 관련 논란
- 일반적인 빅테크 기업 뉴스 (AI 개발과 직접 관련 없는 것)`;

function buildUserPrompt(items: RawItem[]): string {
  const itemList = items
    .map(
      (item, i) =>
        `[${i + 1}] (${item.source}) ${item.title}\n    URL: ${item.url}\n    Score: ${item.score}${item.metadata ? `\n    Meta: ${JSON.stringify(item.metadata)}` : ""}`
    )
    .join("\n\n");

  return `아래 ${items.length}개 아이템을 분석하고, 다음 JSON 형식으로 응답하세요:

{
  "news": [10개 뉴스 — { "title": "한국어 제목", "summary": "2-3문장 한국어 요약", "url": "원문URL", "source": "출처명" }],
  "community": [10개 커뮤니티 핫 글 — { "title": "한국어 제목", "summary": "2-3문장 요약 + 왜 화제인지", "url": "원문URL", "source": "출처명", "upvotes": 숫자, "comments": 숫자 }],
  "github": [10개 GitHub 프로젝트 — { "name": "프로젝트명", "description": "한국어 설명 (이 프로젝트가 뭘 하는지, 왜 주목받는지)", "url": "GitHub URL", "stars": 총별수, "todayStars": 오늘별수, "language": "언어" }],
  "papers": [5-10개 AI 논문 — { "title": "한국어 제목", "summary": "이 논문의 핵심 기여와 왜 중요한지 2-3문장", "url": "논문URL", "authors": "주요 저자 1-3명", "source": "ArXiv/HuggingFace 등" }]
}

분류 기준:
- news: AI 모델 릴리즈, 기업 발표, 연구 돌파구, 규제/정책, 투자/인수, 제품 출시. 출처가 다양하도록 (같은 매체 3개 이상 금지).
- community: HN/Lobsters/DEV.to 등에서 토론이 활발하거나 반응이 좋은 글. 기술적 인사이트, 의견, 경험담 중심.
- github: 트렌딩 오픈소스 프로젝트. 설명에 "이 도구로 뭘 할 수 있는지"를 반드시 포함.
- papers: AI 연구 논문. 새로운 모델 아키텍처, 학습 기법, 벤치마크, 안전 연구 등. 제목은 원문 영어를 한국어로 자연스럽게 의역. 요약은 "이 논문이 왜 중요한지"를 반드시 포함.

중복 아이템은 하나만 선택하세요. 최대한 다양한 출처에서 골라주세요.

=== 아이템 목록 ===
${itemList}`;
}

export async function generateDigest(items: RawItem[]): Promise<DigestOutput> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not set");

  const client = new Anthropic({ apiKey });

  // f1 패턴: Promise.race로 90초 타임아웃
  const response = await Promise.race([
    client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 8192,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: buildUserPrompt(items),
        },
      ],
    }),
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Claude API timeout 180s")), 180_000)
    ),
  ]);

  const text =
    response.content[0].type === "text" ? response.content[0].text : "";

  // JSON 블록 추출 (```json ... ``` 또는 순수 JSON)
  const jsonMatch = text.match(/```json\s*([\s\S]*?)```/) || text.match(/(\{[\s\S]*\})/);
  if (!jsonMatch) {
    throw new Error("Claude response does not contain valid JSON");
  }

  const parsed = JSON.parse(jsonMatch[1]);
  return DigestOutputSchema.parse(parsed);
}
