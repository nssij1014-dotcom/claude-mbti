/** 4개 MBTI 지표. CLAUDE.md 2장 채점 규칙에서 사용하는 기준 값입니다. */
export type Dimension = "EI" | "SN" | "TF" | "JP";

/** 각 지표의 두 극 중 "양수(positive)" 쪽 문자. 응답 척도가 이 방향으로 갈수록 +점수가 쌓입니다. */
export const POSITIVE_LETTER: Record<Dimension, string> = {
  EI: "E",
  SN: "S",
  TF: "T",
  JP: "J",
};

/** 각 지표의 "음수(negative)" 쪽 문자. */
export const NEGATIVE_LETTER: Record<Dimension, string> = {
  EI: "I",
  SN: "N",
  TF: "F",
  JP: "P",
};

export const DIMENSIONS: Dimension[] = ["EI", "SN", "TF", "JP"];

/** 문항이 응답 방향에 따라 어느 극에 가산되는지. positive = POSITIVE_LETTER 쪽, negative = NEGATIVE_LETTER 쪽. */
export type Direction = "positive" | "negative";

export interface Question {
  id: string;
  order: number;
  dimension: Dimension;
  direction: Direction;
  content: string;
}

/** 5점 리커트 응답. 1=전혀 아니다 ~ 5=매우 그렇다. */
export type LikertValue = 1 | 2 | 3 | 4 | 5;

export interface Answer {
  questionId: string;
  value: LikertValue;
}

export type MbtiGroup = "분석가" | "외교관" | "관리자" | "탐험가";

export interface MbtiTypeContent {
  code: string;
  nickname: string;
  group: MbtiGroup;
  themeColor: string;
  summary: string;
  description: string;
  strengths: string[];
  weaknesses: string[];
  loveStyle: string;
  workStyle: string;
  recommendedJobs: string[];
  /** 베스트 궁합 유형 코드 1~2개 */
  bestMatches: string[];
  /** 상성이 아쉬운 유형 코드 1~2개 */
  challengingMatches: string[];
}

export interface ScoreResult {
  resultTypeCode: string;
  scores: Record<Dimension, number>;
  ratios: Record<Dimension, number>;
}

/** 소셜 로그인 제공자. 현재는 'google'만 실제 연동되어 있습니다(PRD 7.3). */
export type AuthProvider = "google" | "kakao";

export type TestSessionStatus = "in_progress" | "completed" | "abandoned";
export type DeviceType = "mobile" | "tablet" | "desktop";
export type ShareChannel = "kakao" | "instagram" | "x" | "link_copy" | "image_download";

export interface TestSessionResult {
  id: string;
  resultTypeCode: string;
  eiRatio: number;
  snRatio: number;
  tfRatio: number;
  jpRatio: number;
  completedAt: string;
}
