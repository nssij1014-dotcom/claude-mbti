import {
  type Answer,
  type Dimension,
  type Question,
  type ScoreResult,
  DIMENSIONS,
  NEGATIVE_LETTER,
  POSITIVE_LETTER,
} from "@/lib/types";

/**
 * 채점 로직 단일 소스입니다 (CLAUDE.md 2장). 프론트(로컬 임시 계산/이어하기 미리보기)와
 * 서버(최종 결과 저장) 양쪽 모두 반드시 이 함수를 통해서만 점수를 계산해야 합니다.
 *
 * 지표별로 응답을 (value - 3) 값으로 환산해 합산합니다: 1(전혀 아니다)=-2, 3(보통)=0,
 * 5(매우 그렇다)=+2. direction이 'negative'인 문항은 부호를 반전해 항상 "양수 쪽 문자
 * (E/S/T/J)로 향하는 정도"로 합산되도록 만듭니다.
 *
 * 동점(비율이 정확히 50%) 처리 규칙: 지표의 두 번째 문자(I/N/F/P)를 채택합니다. 이미 발급된
 * 결과 URL의 재현성에 영향을 주므로 이 규칙은 임의로 변경하지 않습니다.
 */
export function computeScore(answers: Answer[], questions: Question[]): ScoreResult {
  const questionById = new Map(questions.map((q) => [q.id, q]));

  const scores: Record<Dimension, number> = { EI: 0, SN: 0, TF: 0, JP: 0 };
  const countByDimension: Record<Dimension, number> = { EI: 0, SN: 0, TF: 0, JP: 0 };

  for (const answer of answers) {
    const question = questionById.get(answer.questionId);
    if (!question) continue;

    const magnitude = answer.value - 3; // -2 ~ +2
    const signedContribution = question.direction === "positive" ? magnitude : -magnitude;

    scores[question.dimension] += signedContribution;
    countByDimension[question.dimension] += 1;
  }

  const ratios: Record<Dimension, number> = { EI: 50, SN: 50, TF: 50, JP: 50 };
  let resultTypeCode = "";

  for (const dimension of DIMENSIONS) {
    const n = countByDimension[dimension];
    const maxAbs = n * 2;
    const ratio =
      maxAbs === 0 ? 50 : Math.round(((scores[dimension] + maxAbs) / (2 * maxAbs)) * 100);
    ratios[dimension] = ratio;

    const letter =
      ratio > 50
        ? POSITIVE_LETTER[dimension]
        : ratio < 50
          ? NEGATIVE_LETTER[dimension]
          : NEGATIVE_LETTER[dimension]; // 동점 타이브레이커: 두 번째 문자(I/N/F/P) 채택

    resultTypeCode += letter;
  }

  return { resultTypeCode, scores, ratios };
}
