import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { computeScore } from "@/lib/scoring/score";
import { QUESTIONS } from "@/lib/data/questions";
import type { Answer, DeviceType } from "@/lib/types";

const DEVICE_TYPES: DeviceType[] = ["mobile", "tablet", "desktop"];

/**
 * 클라이언트가 계산한 점수를 신뢰하지 않고, 제출된 원 응답(answers)으로 서버에서 다시
 * computeScore를 실행해 저장합니다. 채점 로직 단일 소스 원칙(CLAUDE.md 2장)에 따라
 * 클라이언트와 동일한 lib/scoring/score.ts를 사용합니다.
 */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    answers?: Answer[];
    deviceType?: string;
    referrer?: string;
  } | null;

  if (!body || !Array.isArray(body.answers) || body.answers.length !== QUESTIONS.length) {
    return NextResponse.json({ error: "invalid answers" }, { status: 400 });
  }

  const validQuestionIds = new Set(QUESTIONS.map((q) => q.id));
  const isValid = body.answers.every(
    (a) =>
      typeof a?.questionId === "string" &&
      validQuestionIds.has(a.questionId) &&
      Number.isInteger(a.value) &&
      a.value >= 1 &&
      a.value <= 5,
  );
  if (!isValid) {
    return NextResponse.json({ error: "invalid answers" }, { status: 400 });
  }

  const { resultTypeCode, scores, ratios } = computeScore(body.answers, QUESTIONS);
  const deviceType = DEVICE_TYPES.includes(body.deviceType as DeviceType)
    ? (body.deviceType as DeviceType)
    : null;

  const session = await prisma.testSession.create({
    data: {
      status: "completed",
      resultTypeCode,
      eiScore: scores.EI,
      snScore: scores.SN,
      tfScore: scores.TF,
      jpScore: scores.JP,
      eiRatio: ratios.EI,
      snRatio: ratios.SN,
      tfRatio: ratios.TF,
      jpRatio: ratios.JP,
      deviceType,
      referrer: body.referrer ?? null,
      completedAt: new Date(),
    },
  });

  return NextResponse.json({ id: session.id, resultTypeCode, ratios });
}
