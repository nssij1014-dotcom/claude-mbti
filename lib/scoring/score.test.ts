import { describe, expect, it } from "vitest";
import { computeScore } from "@/lib/scoring/score";
import { QUESTIONS } from "@/lib/data/questions";
import type { Answer, Question } from "@/lib/types";

/**
 * 채점 알고리즘만 독립적으로 검증하기 위한 고정 픽스처입니다. 실제 문항 문구가 바뀌어도
 * 이 테스트는 영향받지 않습니다. 지표당 positive 2문항 + negative 1문항 구성입니다.
 */
const FIXTURE_QUESTIONS: Question[] = [
  { id: "ei-p1", order: 1, dimension: "EI", direction: "positive", content: "" },
  { id: "ei-p2", order: 2, dimension: "EI", direction: "positive", content: "" },
  { id: "ei-n1", order: 3, dimension: "EI", direction: "negative", content: "" },
  { id: "sn-p1", order: 4, dimension: "SN", direction: "positive", content: "" },
  { id: "sn-p2", order: 5, dimension: "SN", direction: "positive", content: "" },
  { id: "sn-n1", order: 6, dimension: "SN", direction: "negative", content: "" },
  { id: "tf-p1", order: 7, dimension: "TF", direction: "positive", content: "" },
  { id: "tf-p2", order: 8, dimension: "TF", direction: "positive", content: "" },
  { id: "tf-n1", order: 9, dimension: "TF", direction: "negative", content: "" },
  { id: "jp-p1", order: 10, dimension: "JP", direction: "positive", content: "" },
  { id: "jp-p2", order: 11, dimension: "JP", direction: "positive", content: "" },
  { id: "jp-n1", order: 12, dimension: "JP", direction: "negative", content: "" },
];

function answerAll(value: 1 | 2 | 3 | 4 | 5): Answer[] {
  return FIXTURE_QUESTIONS.map((q) => ({ questionId: q.id, value }));
}

describe("computeScore", () => {
  it("모든 문항에 '보통이다'(3)로 답하면 모든 지표가 정확히 50%가 된다", () => {
    const result = computeScore(answerAll(3), FIXTURE_QUESTIONS);
    expect(result.ratios).toEqual({ EI: 50, SN: 50, TF: 50, JP: 50 });
  });

  it("동점(정확히 50%)일 때는 각 지표의 두 번째 문자(I/N/F/P)를 채택한다", () => {
    const result = computeScore(answerAll(3), FIXTURE_QUESTIONS);
    expect(result.resultTypeCode).toBe("INFP");
  });

  it("모든 문항에서 양수 쪽 극단으로 답하면(양수문항=5, 음수문항=1) 해당 지표는 100%가 된다", () => {
    const answers: Answer[] = FIXTURE_QUESTIONS.map((q) => ({
      questionId: q.id,
      value: q.direction === "positive" ? 5 : 1,
    }));
    const result = computeScore(answers, FIXTURE_QUESTIONS);
    expect(result.ratios).toEqual({ EI: 100, SN: 100, TF: 100, JP: 100 });
    expect(result.resultTypeCode).toBe("ESTJ");
  });

  it("모든 문항에서 음수 쪽 극단으로 답하면(양수문항=1, 음수문항=5) 해당 지표는 0%가 된다", () => {
    const answers: Answer[] = FIXTURE_QUESTIONS.map((q) => ({
      questionId: q.id,
      value: q.direction === "positive" ? 1 : 5,
    }));
    const result = computeScore(answers, FIXTURE_QUESTIONS);
    expect(result.ratios).toEqual({ EI: 0, SN: 0, TF: 0, JP: 0 });
    expect(result.resultTypeCode).toBe("INFP");
  });

  it("일부 지표만 응답해도 정확한 비율을 계산한다 (부분 극단값 검증)", () => {
    // EI: positive 2문항=5(+2*2=+4), negative 1문항=3(0) → 합 +4, 최대 6 → (4+6)/12*100 = 83.33 → round 83
    const answers: Answer[] = [
      { questionId: "ei-p1", value: 5 },
      { questionId: "ei-p2", value: 5 },
      { questionId: "ei-n1", value: 3 },
    ];
    const result = computeScore(answers, FIXTURE_QUESTIONS);
    expect(result.ratios.EI).toBe(83);
  });

  it("존재하지 않는 questionId는 무시한다", () => {
    const result = computeScore([{ questionId: "unknown", value: 5 }], FIXTURE_QUESTIONS);
    expect(result.ratios).toEqual({ EI: 50, SN: 50, TF: 50, JP: 50 });
  });

  it("실제 서비스 문항 24개로 응답해도 유효한 4자리 코드를 산출한다 (스모크 테스트)", () => {
    const answers: Answer[] = QUESTIONS.map((q) => ({ questionId: q.id, value: 4 }));
    const result = computeScore(answers, QUESTIONS);

    expect(result.resultTypeCode).toMatch(/^[EI][SN][TF][JP]$/);
    for (const dimension of ["EI", "SN", "TF", "JP"] as const) {
      expect(result.ratios[dimension]).toBeGreaterThanOrEqual(0);
      expect(result.ratios[dimension]).toBeLessThanOrEqual(100);
    }
  });
});
