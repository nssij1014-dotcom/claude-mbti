import { getMbtiType } from "@/lib/data/mbtiTypes";
import type { MbtiTypeContent } from "@/lib/types";

export type RelationType = "best" | "good" | "normal" | "challenging";

export interface CompatibilityResult {
  typeA: MbtiTypeContent;
  typeB: MbtiTypeContent;
  score: number;
  relationType: RelationType;
  highlights: string[];
  tip: string;
}

const LETTER_TRAIT: Record<string, string> = {
  E: "사람들과 어울리며 에너지를 얻는",
  I: "혼자만의 시간에서 에너지를 회복하는",
  S: "현실적이고 구체적인 것을 중시하는",
  N: "가능성과 아이디어에 끌리는",
  T: "논리와 원칙을 우선하는",
  F: "관계와 감정을 먼저 살피는",
  J: "계획적이고 체계적인",
  P: "즉흥적이고 유연한",
};

/**
 * 16×16(사실상 136가지) 궁합 콘텐츠를 전부 손으로 작성하는 대신, 두 유형 코드의 지표 겹침
 * 정도와 lib/data/mbtiTypes.ts의 curated best/challengingMatches를 조합해 궁합 점수와
 * 설명을 생성합니다. PRD 7.3 TypeCompatibility 모델(score/relationType/description/tips)에
 * 대응하는 값을 반환하며, 관리자 CMS가 생기면 이 생성 결과를 초안으로 두고 직접 다듬을 수
 * 있습니다.
 */
export function getCompatibility(codeA: string, codeB: string): CompatibilityResult | undefined {
  const typeA = getMbtiType(codeA);
  const typeB = getMbtiType(codeB);
  if (!typeA || !typeB) return undefined;

  const isSameType = typeA.code === typeB.code;
  const matchingDimensions = [0, 1, 2, 3].filter((i) => typeA.code[i] === typeB.code[i]).length;

  let score = 40 + matchingDimensions * 10;
  if (typeA.bestMatches.includes(typeB.code) || typeB.bestMatches.includes(typeA.code)) score += 15;
  if (
    typeA.challengingMatches.includes(typeB.code) ||
    typeB.challengingMatches.includes(typeA.code)
  )
    score -= 15;
  if (isSameType) score = 70;
  score = Math.max(0, Math.min(100, score));

  const relationType: RelationType =
    score >= 80 ? "best" : score >= 60 ? "good" : score >= 40 ? "normal" : "challenging";

  const highlights = [0, 1, 2, 3].map((i) => {
    const letterA = typeA.code[i];
    const letterB = typeB.code[i];
    if (letterA === letterB) {
      return `둘 다 ${LETTER_TRAIT[letterA]} 편이라 이 부분에서는 죽이 잘 맞아요.`;
    }
    return `${typeA.code}는 ${LETTER_TRAIT[letterA]} 편이고, ${typeB.code}는 ${LETTER_TRAIT[letterB]} 편이라 서로 다른 매력으로 채워줄 수 있어요.`;
  });

  const tipByRelationType: Record<RelationType, string> = {
    best: "지금도 잘 맞는 사이지만, 서로 다른 부분을 존중하는 대화를 이어가면 오래도록 좋은 궁합을 유지할 수 있어요.",
    good: "잘 맞는 부분이 많아요. 다만 서로 다른 지표에서는 상대의 방식을 먼저 이해하려는 노력이 필요해요.",
    normal:
      "생각보다 다른 점이 많은 조합이에요. 다름을 문제로 보지 않고 서로의 방식으로 받아들이면 좋은 시너지가 날 수 있어요.",
    challenging:
      "서로 반대되는 지표가 많아 처음엔 부딪힐 수 있어요. 그만큼 상대에게서 배울 점도 많다는 뜻이니, 조급해하지 않는 게 중요해요.",
  };
  const tip = tipByRelationType[relationType];

  return { typeA, typeB, score, relationType, highlights, tip };
}
