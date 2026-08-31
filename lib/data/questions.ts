import type { Question } from "@/lib/types";

/**
 * 간단판 테스트 문항 24개(4개 지표 × 6문항). PRD 3.1의 "간단판 테스트(24~28문항)" 사양을
 * 충족합니다. 아직 관리자 CMS가 없으므로 정적 데이터로 관리하며, CMS가 만들어지면 이 배열을
 * DB(Question 테이블)로 옮깁니다.
 *
 * 지표별로 양수 문항(positive, 동의하면 E/S/T/J 방향)과 음수 문항(negative, 동의하면
 * I/N/F/P 방향)을 섞어 응답 편향(acquiescence bias)을 줄였습니다. 채점은 lib/scoring/score.ts
 * 하나만 사용합니다.
 */
export const QUESTIONS: Question[] = [
  {
    id: "ei-1",
    order: 1,
    dimension: "EI",
    direction: "positive",
    content: "새로운 사람들과 있는 자리에서 자연스럽게 대화를 시작하는 편이다",
  },
  {
    id: "sn-1",
    order: 2,
    dimension: "SN",
    direction: "positive",
    content: "이론보다 실제 경험과 사실에 더 믿음이 간다",
  },
  {
    id: "tf-1",
    order: 3,
    dimension: "TF",
    direction: "positive",
    content: "결정을 내릴 때 감정보다 논리와 원칙을 우선한다",
  },
  {
    id: "jp-1",
    order: 4,
    dimension: "JP",
    direction: "positive",
    content: "여행을 가기 전에 일정과 계획을 미리 세워두는 편이다",
  },

  {
    id: "ei-2",
    order: 5,
    dimension: "EI",
    direction: "positive",
    content: "주말에는 혼자 쉬기보다 사람들과 어울릴 때 에너지가 더 채워진다",
  },
  {
    id: "sn-2",
    order: 6,
    dimension: "SN",
    direction: "positive",
    content: "일을 할 때 구체적이고 단계적인 지침을 선호한다",
  },
  {
    id: "tf-2",
    order: 7,
    dimension: "TF",
    direction: "positive",
    content: "상대가 틀렸다면 관계가 불편해지더라도 솔직히 말하는 편이다",
  },
  {
    id: "jp-2",
    order: 8,
    dimension: "JP",
    direction: "positive",
    content: "마감 기한보다 미리 끝내둬야 마음이 편하다",
  },

  {
    id: "ei-3",
    order: 9,
    dimension: "EI",
    direction: "positive",
    content: "낯선 모임에 가도 금방 분위기에 섞여든다",
  },
  {
    id: "sn-3",
    order: 10,
    dimension: "SN",
    direction: "positive",
    content: "지금 눈앞의 현실적인 문제에 집중하는 편이다",
  },
  {
    id: "tf-3",
    order: 11,
    dimension: "TF",
    direction: "positive",
    content: "문제를 해결할 때 원인과 결과를 분석하는 것이 먼저다",
  },
  {
    id: "jp-3",
    order: 12,
    dimension: "JP",
    direction: "positive",
    content: "정리정돈이 되어 있지 않으면 신경이 쓰인다",
  },

  {
    id: "ei-4",
    order: 13,
    dimension: "EI",
    direction: "negative",
    content: "긴 하루를 보내고 나면 혼자만의 시간이 꼭 필요하다",
  },
  {
    id: "sn-4",
    order: 14,
    dimension: "SN",
    direction: "negative",
    content: "숨겨진 의미나 가능성을 상상하는 걸 좋아한다",
  },
  {
    id: "tf-4",
    order: 15,
    dimension: "TF",
    direction: "negative",
    content: "결정을 내릴 때 사람들의 감정과 관계에 미칠 영향을 먼저 고려한다",
  },
  {
    id: "jp-4",
    order: 16,
    dimension: "JP",
    direction: "negative",
    content: "계획이 바뀌어도 크게 개의치 않고 유연하게 대응한다",
  },

  {
    id: "ei-5",
    order: 17,
    dimension: "EI",
    direction: "negative",
    content: "말하기 전에 생각을 먼저 정리하는 편이다",
  },
  {
    id: "sn-5",
    order: 18,
    dimension: "SN",
    direction: "negative",
    content: "세부사항보다 전체 그림과 패턴이 먼저 눈에 들어온다",
  },
  {
    id: "tf-5",
    order: 19,
    dimension: "TF",
    direction: "negative",
    content: "누군가 힘들어하면 옳고 그름을 따지기보다 먼저 마음을 헤아리려 한다",
  },
  {
    id: "jp-5",
    order: 20,
    dimension: "JP",
    direction: "negative",
    content: "마감 직전에 몰아서 할 때 오히려 집중이 잘 된다",
  },

  {
    id: "ei-6",
    order: 21,
    dimension: "EI",
    direction: "negative",
    content: "여러 사람과 오래 있으면 에너지가 빨리 소진된다",
  },
  {
    id: "sn-6",
    order: 22,
    dimension: "SN",
    direction: "negative",
    content: "새로운 아이디어나 이론을 탐구하는 데 끌린다",
  },
  {
    id: "tf-6",
    order: 23,
    dimension: "TF",
    direction: "negative",
    content: "논리적으로 맞아도 사람 마음이 다치면 다른 방법을 찾는다",
  },
  {
    id: "jp-6",
    order: 24,
    dimension: "JP",
    direction: "negative",
    content: "일정을 딱 정해두기보다 즉흥적으로 움직이는 걸 좋아한다",
  },
];

export const LIKERT_LABELS: Record<1 | 2 | 3 | 4 | 5, string> = {
  1: "전혀 아니다",
  2: "아니다",
  3: "보통이다",
  4: "그렇다",
  5: "매우 그렇다",
};
