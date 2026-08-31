import { ImageResponse } from "next/og";
import { prisma } from "@/lib/prisma";
import { getMbtiType } from "@/lib/data/mbtiTypes";

export const runtime = "nodejs";

/**
 * 공유 카드(OG 이미지)를 서버사이드에서 사전 렌더링합니다. 카카오톡/X 등에 링크를 공유하는
 * 즉시 미리보기가 떠야 하므로(CLAUDE.md 5장) 클라이언트 canvas가 아니라 이 라우트가
 * 결과의 단일 이미지 소스입니다.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ resultId: string }> },
) {
  const { resultId } = await params;
  const session = await prisma.testSession.findUnique({ where: { id: resultId } });
  const type = session?.resultTypeCode ? getMbtiType(session.resultTypeCode) : undefined;

  if (!type) {
    return new ImageResponse(
      <div style={{ display: "flex", width: "100%", height: "100%", background: "#17150f" }} />,
      { width: 1200, height: 630 },
    );
  }

  return new ImageResponse(
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        width: "100%",
        height: "100%",
        padding: 80,
        background: "#17150f",
        color: "#f7f4ec",
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div
          style={{
            display: "flex",
            width: 16,
            height: 16,
            borderRadius: "50%",
            background: type.themeColor,
          }}
        />
        <div style={{ display: "flex", fontSize: 36, letterSpacing: 6, opacity: 0.6 }}>
          {type.group}
        </div>
      </div>
      <div style={{ display: "flex", fontSize: 160, fontWeight: 900, marginTop: 16 }}>
        {type.code}
      </div>
      <div
        style={{
          display: "flex",
          fontSize: 48,
          fontWeight: 700,
          marginTop: 16,
          padding: "4px 16px",
          background: "#f0de6a",
          color: "#17150f",
        }}
      >
        {type.nickname}
      </div>
      <div style={{ display: "flex", fontSize: 32, marginTop: 28, opacity: 0.75, maxWidth: 900 }}>
        {type.summary}
      </div>
    </div>,
    { width: 1200, height: 630 },
  );
}
