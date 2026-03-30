import { RawItem } from "@/lib/schema";

const SUBREDDITS = ["MachineLearning", "artificial", "LocalLLaMA", "singularity"];
const TOKEN_URL = "https://www.reddit.com/api/v1/access_token";

async function getAccessToken(): Promise<string> {
  const clientId = process.env.REDDIT_CLIENT_ID;
  const clientSecret = process.env.REDDIT_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("REDDIT_CLIENT_ID or REDDIT_CLIENT_SECRET is not set");
  }

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": "aitoday:v1.0.0 (by /u/aitoday_bot)",
    },
    body: "grant_type=client_credentials",
  });

  if (!res.ok) throw new Error(`Reddit auth failed: ${res.status}`);
  const data = await res.json();
  return data.access_token;
}

export async function collectReddit(): Promise<RawItem[]> {
  const token = await getAccessToken();
  const multi = SUBREDDITS.join("+");
  const res = await fetch(
    `https://oauth.reddit.com/r/${multi}/hot?limit=25`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "User-Agent": "aitoday:v1.0.0 (by /u/aitoday_bot)",
      },
    }
  );

  if (!res.ok) throw new Error(`Reddit API failed: ${res.status}`);
  const data = await res.json();
  const posts = data?.data?.children || [];

  return posts
    .filter((p: any) => !p.data.stickied && p.data.score > 50)
    .sort((a: any, b: any) => b.data.score - a.data.score)
    .slice(0, 10)
    .map((p: any) => ({
      title: p.data.title,
      url: p.data.url || `https://reddit.com${p.data.permalink}`,
      score: p.data.score,
      source: "reddit" as const,
      metadata: {
        subreddit: p.data.subreddit,
        comments: p.data.num_comments,
        upvoteRatio: p.data.upvote_ratio,
      },
    }));
}
