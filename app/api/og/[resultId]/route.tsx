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
      <div style={{ display: "flex", width: "100%", height: "100%", background: "#171717" }} />,
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
        background: type.themeColor,
        color: "#ffffff",
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ display: "flex", fontSize: 40, opacity: 0.85 }}>{type.group}</div>
      <div style={{ display: "flex", fontSize: 140, fontWeight: 700, marginTop: 8 }}>
        {type.code}
      </div>
      <div style={{ display: "flex", fontSize: 52, fontWeight: 600, marginTop: 12 }}>
        {type.nickname}
      </div>
      <div style={{ display: "flex", fontSize: 32, marginTop: 24, opacity: 0.9, maxWidth: 900 }}>
        {type.summary}
      </div>
    </div>,
    { width: 1200, height: 630 },
  );
}
