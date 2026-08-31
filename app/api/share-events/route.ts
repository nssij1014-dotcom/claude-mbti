import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { ShareChannel } from "@/lib/types";

const CHANNELS: ShareChannel[] = ["kakao", "instagram", "x", "link_copy", "image_download"];

/** 공유 이벤트 로깅. 새 공유 채널을 추가할 때는 여기 CHANNELS에도 반드시 추가합니다 (CLAUDE.md 5장). */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    testSessionId?: string;
    channel?: string;
  } | null;

  if (!body?.testSessionId || !CHANNELS.includes(body.channel as ShareChannel)) {
    return NextResponse.json({ error: "invalid payload" }, { status: 400 });
  }

  await prisma.shareEvent.create({
    data: {
      testSessionId: body.testSessionId,
      channel: body.channel as ShareChannel,
    },
  });

  return NextResponse.json({ ok: true });
}
