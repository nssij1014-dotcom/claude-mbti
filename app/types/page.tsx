import type { Metadata } from "next";
import Link from "next/link";
import { MBTI_TYPES } from "@/lib/data/mbtiTypes";

export const metadata: Metadata = {
  title: "16유형 도감",
  description: "16가지 MBTI 유형을 한눈에 살펴보세요",
};

export default function TypesPage() {
  return (
    <main className="mx-auto min-h-screen max-w-2xl bg-paper px-4 py-14">
      <h1 className="reveal mb-2 text-4xl font-black tracking-tight text-ink">16유형 도감</h1>
      <p className="reveal mb-10 text-sm font-semibold text-ink-soft">
        궁금한 유형을 눌러서 자세히 살펴보세요
      </p>

      <div className="grid grid-cols-2 gap-px border border-line bg-line sm:grid-cols-4">
        {MBTI_TYPES.map((type) => (
          <Link
            key={type.code}
            href={`/types/${type.code.toLowerCase()}`}
            className="group flex flex-col items-center gap-2 bg-paper px-3 py-8 text-center transition-colors hover:bg-ink"
          >
            <span
              className="h-2 w-2 rounded-full"
              style={{ background: type.themeColor }}
              aria-hidden
            />
            <span className="text-lg font-black text-ink group-hover:text-paper">{type.code}</span>
            <span className="text-xs font-semibold text-ink-soft group-hover:text-paper/70">
              {type.nickname}
            </span>
          </Link>
        ))}
      </div>

      <div className="mt-14 text-center">
        <Link
          href="/test"
          className="inline-block bg-ink px-6 py-3 text-sm font-bold text-paper transition-colors hover:bg-accent hover:text-ink"
        >
          나도 테스트 해보기
        </Link>
      </div>
    </main>
  );
}
