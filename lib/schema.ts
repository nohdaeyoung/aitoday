import { z } from "zod";

// 수집기 공통 출력 타입
export const RawItemSchema = z.object({
  title: z.string(),
  url: z.string().url(),
  score: z.number(), // upvotes, points, stars 등
  source: z.enum(["hn", "reddit", "github", "lobsters", "devto", "community"]),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export type RawItem = z.infer<typeof RawItemSchema>;

// Claude API 응답 — 개별 다이제스트 아이템
export const DigestItemSchema = z.object({
  title: z.string(),
  summary: z.string(),
  url: z.string().url(),
  source: z.string(),
  tags: z.array(z.string()).optional(),
});

// Claude API 응답 — 커뮤니티 아이템
export const CommunityItemSchema = DigestItemSchema.extend({
  upvotes: z.number().optional(),
  comments: z.number().optional(),
});

// Claude API 응답 — GitHub 아이템
export const GithubItemSchema = z.object({
  name: z.string(),
  description: z.string(),
  url: z.string().url(),
  stars: z.number(),
  todayStars: z.number().optional(),
  language: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

// Claude API 응답 — 논문 아이템
export const PaperItemSchema = z.object({
  title: z.string(),
  summary: z.string(),
  url: z.string().url(),
  authors: z.string().optional(),
  source: z.string(),
  tags: z.array(z.string()).optional(),
});

// Claude API 전체 응답
export const DigestOutputSchema = z.object({
  weather: z.string().optional(), // Phase 3
  topicTrends: z
    .record(z.string(), z.number())
    .optional(), // Phase 3
  news: z.array(DigestItemSchema),
  community: z.array(CommunityItemSchema),
  github: z.array(GithubItemSchema),
  papers: z.array(PaperItemSchema).optional(),
});
export type DigestOutput = z.infer<typeof DigestOutputSchema>;

// Firestore 저장 형태
export const DigestDocSchema = DigestOutputSchema.extend({
  generatedAt: z.string(), // ISO timestamp
  sourceStatus: z.record(z.string(), z.enum(["ok", "failed"])),
});
export type DigestDoc = z.infer<typeof DigestDocSchema>;
