import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const weather = searchParams.get("weather") || "글로벌 AI 뉴스를 한국어로 매일 큐레이션합니다.";
  const date = searchParams.get("date") || new Date().toISOString().split("T")[0];

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "60px 80px",
          background: "#FAFAF8",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "32px" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "10px",
              background: "#E8590C",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: "22px",
              fontWeight: 700,
            }}
          >
            AI
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: "32px", fontWeight: 700, color: "#1a1a1a" }}>AI Today</span>
            <span style={{ fontSize: "16px", color: "#737373" }}>{date}</span>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            padding: "32px 40px",
            background: "#FFF4E6",
            borderRadius: "16px",
            borderLeft: "4px solid #E8590C",
          }}
        >
          <span style={{ fontSize: "14px", fontWeight: 600, color: "#E8590C", letterSpacing: "2px", marginBottom: "12px" }}>
            AI WEATHER
          </span>
          <span style={{ fontSize: "28px", fontWeight: 600, color: "#1a1a1a", lineHeight: 1.4 }}>
            {weather.length > 80 ? weather.slice(0, 80) + "..." : weather}
          </span>
        </div>

        <div style={{ display: "flex", gap: "24px", marginTop: "32px" }}>
          <span style={{ fontSize: "15px", color: "#737373" }}>뉴스 · 커뮤니티 · 트렌딩 · 논문</span>
          <span style={{ fontSize: "15px", color: "#E8590C" }}>aitoday.324.ing</span>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
