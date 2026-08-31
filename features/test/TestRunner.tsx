"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { QUESTIONS, LIKERT_LABELS } from "@/lib/data/questions";
import { useTestStore } from "@/features/test/useTestStore";
import type { Answer, LikertValue } from "@/lib/types";

const TOTAL = QUESTIONS.length;
const AUTO_ADVANCE_DELAY_MS = 400;

function detectDeviceType(): "mobile" | "tablet" | "desktop" {
  if (typeof window === "undefined") return "desktop";
  const width = window.innerWidth;
  if (width < 768) return "mobile";
  if (width < 1024) return "tablet";
  return "desktop";
}

export function TestRunner() {
  const router = useRouter();
  const { answers, currentIndex, setAnswer, goToPrevious } = useTestStore();
  const [pendingValue, setPendingValue] = useState<LikertValue | null>(null);
  const [error, setError] = useState<string | null>(null);
  const submittedRef = useRef(false);

  const isComplete = currentIndex >= TOTAL;
  const question = !isComplete ? QUESTIONS[currentIndex] : null;
  const progress = Math.round((Math.min(currentIndex, TOTAL) / TOTAL) * 100);

  async function submitAnswers() {
    setError(null);
    try {
      const payload: Answer[] = QUESTIONS.map((q) => ({
        questionId: q.id,
        value: answers[q.id],
      }));

      const res = await fetch("/api/test-sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: payload, deviceType: detectDeviceType() }),
      });

      if (!res.ok) throw new Error("결과 저장에 실패했습니다");
      const data = (await res.json()) as { id: string };

      // 결과 계산 중 로딩 애니메이션(기대감 조성)을 위한 최소 대기 (PRD 4.1)
      await new Promise((resolve) => setTimeout(resolve, 900));
      router.push(`/result/${data.id}`);
    } catch {
      submittedRef.current = false;
      setError("결과를 저장하지 못했어요. 다시 시도해 주세요.");
    }
  }

  function handleSelect(value: LikertValue) {
    if (!question || pendingValue !== null) return;
    setPendingValue(value);
    setTimeout(() => {
      setAnswer(question.id, value);
      setPendingValue(null);
    }, AUTO_ADVANCE_DELAY_MS);
  }

  useEffect(() => {
    if (isComplete && !submittedRef.current) {
      submittedRef.current = true;
      void submitAnswers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isComplete]);

  if (isComplete) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-5 px-6 py-24 text-center">
        {error ? (
          <>
            <p className="text-ink-soft">{error}</p>
            <button
              onClick={() => {
                submittedRef.current = true;
                void submitAnswers();
              }}
              className="min-h-11 bg-ink px-6 font-bold text-paper transition-colors hover:bg-accent hover:text-ink"
            >
              다시 시도하기
            </button>
          </>
        ) : (
          <>
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-line border-t-ink" />
            <p className="text-lg font-bold tracking-tight">결과를 계산하고 있어요…</p>
          </>
        )}
      </div>
    );
  }

  if (!question) return null;

  return (
    <div className="flex flex-1 flex-col">
      <div className="sticky top-0 z-10 flex items-center gap-4 bg-paper/95 px-5 py-4 backdrop-blur">
        <button
          onClick={goToPrevious}
          disabled={currentIndex === 0}
          aria-label="이전 문항으로"
          className="flex h-11 w-11 shrink-0 items-center justify-center text-xl text-ink disabled:opacity-25"
        >
          ←
        </button>
        <div className="h-[3px] flex-1 overflow-hidden bg-line">
          <div
            className="h-full bg-accent transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="w-14 shrink-0 text-right text-sm font-semibold text-ink-soft">
          {currentIndex + 1}/{TOTAL}
        </span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={question.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="flex flex-1 flex-col justify-center gap-10 px-6 py-10"
        >
          <p className="text-center text-2xl leading-snug font-black tracking-tight text-ink sm:text-3xl">
            {question.content}
          </p>

          <div className="flex flex-col">
            {([1, 2, 3, 4, 5] as LikertValue[]).map((value) => {
              const selected = pendingValue === value;
              return (
                <button
                  key={value}
                  onClick={() => handleSelect(value)}
                  disabled={pendingValue !== null}
                  className={`flex min-h-11 items-center gap-4 border-b border-line px-2 py-4 text-left text-base font-semibold transition-colors ${
                    selected
                      ? "bg-ink text-paper"
                      : "text-ink hover:bg-accent/40 disabled:hover:bg-transparent"
                  }`}
                >
                  <span
                    className={`text-xs font-bold ${selected ? "text-paper/60" : "text-ink-soft"}`}
                  >
                    0{value}
                  </span>
                  {LIKERT_LABELS[value]}
                </button>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
