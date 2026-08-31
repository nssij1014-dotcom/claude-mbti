import type { Metadata } from "next";
import Link from "next/link";
import { MBTI_TYPES } from "@/lib/data/mbtiTypes";

export const metadata: Metadata = {
  title: "16유형 도감",
  description: "16가지 MBTI 유형을 한눈에 살펴보세요",
};

export default function TypesPage() {
  return (
    <main className="mx-auto min-h-screen max-w-2xl px-4 py-10">
      <h1 className="mb-1 text-2xl font-extrabold">16유형 도감</h1>
      <p className="mb-8 text-sm text-neutral-500">궁금한 유형을 눌러서 자세히 살펴보세요</p>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {MBTI_TYPES.map((type) => (
          <Link
            key={type.code}
            href={`/types/${type.code.toLowerCase()}`}
            className="flex flex-col items-center gap-1 rounded-2xl px-3 py-6 text-center text-white transition-transform active:scale-95"
            style={{ background: type.themeColor }}
          >
            <span className="text-lg font-extrabold">{type.code}</span>
            <span className="text-xs opacity-90">{type.nickname}</span>
          </Link>
        ))}
      </div>

      <div className="mt-10 text-center">
        <Link
          href="/test"
          className="inline-block rounded-full bg-neutral-900 px-6 py-3 text-sm font-semibold text-white"
        >
          나도 테스트 해보기
        </Link>
      </div>
    </main>
  );
}
