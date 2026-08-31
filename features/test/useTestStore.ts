import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { LikertValue } from "@/lib/types";

interface TestState {
  answers: Record<string, LikertValue>;
  currentIndex: number;
  setAnswer: (questionId: string, value: LikertValue) => void;
  goToPrevious: () => void;
  reset: () => void;
}

/**
 * 테스트 진행 상태(현재 문항 인덱스, 지금까지의 응답)만 관리하는 가벼운 store입니다
 * (CLAUDE.md 1장 — Redux 등 무거운 상태관리 도입 금지).
 *
 * localStorage에 자동 저장되어 새로고침/브라우저 종료 후에도 이어서 진행할 수 있습니다
 * (PRD 3.1 "응답 자동 저장").
 */
export const useTestStore = create<TestState>()(
  persist(
    (set) => ({
      answers: {},
      currentIndex: 0,
      setAnswer: (questionId, value) =>
        set((state) => ({
          answers: { ...state.answers, [questionId]: value },
          currentIndex: state.currentIndex + 1,
        })),
      goToPrevious: () => set((state) => ({ currentIndex: Math.max(0, state.currentIndex - 1) })),
      reset: () => set({ answers: {}, currentIndex: 0 }),
    }),
    { name: "mbti-test-progress" },
  ),
);
