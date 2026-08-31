import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MBTI_TYPES, getMbtiType } from "@/lib/data/mbtiTypes";
import { Disclaimer } from "@/features/result/Disclaimer";

interface TypeDetailPageProps {
  params: Promise<{ typeCode: string }>;
}

export function generateStaticParams() {
  return MBTI_TYPES.map((type) => ({ typeCode: type.code.toLowerCase() }));
}

export async function generateMetadata({ params }: TypeDetailPageProps): Promise<Metadata> {
  const { typeCode } = await params;
  const type = getMbtiType(typeCode);
  if (!type) return { title: "유형을 찾을 수 없어요" };
  return { title: `${type.code} · ${type.nickname}`, description: type.summary };
}

/** 테스트 미실시자도 열람 가능한 유형 상세 페이지. "지표 비율" 섹션은 결과 페이지 전용이라 숨깁니다 (PRD 4.4). */
export default async function TypeDetailPage({ params }: TypeDetailPageProps) {
  const { typeCode } = await params;
  const type = getMbtiType(typeCode);
  if (!type) notFound();

  return (
    <main className="min-h-screen bg-neutral-50">
      <section
        className="flex flex-col items-center gap-2 px-6 pb-10 pt-14 text-center text-white"
        style={{ background: type.themeColor }}
      >
        <span className="text-sm opacity-80">{type.group}</span>
        <h1 className="text-5xl font-extrabold tracking-tight">{type.code}</h1>
        <p className="text-xl font-semibold">{type.nickname}</p>
        <p className="mt-2 max-w-xs text-sm opacity-90">{type.summary}</p>
      </section>

      <section className="mx-auto max-w-md space-y-3 px-6 py-8">
        <h2 className="text-lg font-bold">이런 사람이에요</h2>
        <p className="leading-relaxed text-neutral-700">{type.description}</p>
      </section>

      <section className="mx-auto grid max-w-md grid-cols-1 gap-4 px-6 py-8 sm:grid-cols-2">
        <div>
          <h3 className="mb-2 font-bold text-neutral-900">강점</h3>
          <ul className="space-y-1 text-sm text-neutral-700">
            {type.strengths.map((s) => (
              <li key={s}>+ {s}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="mb-2 font-bold text-neutral-900">약점</h3>
          <ul className="space-y-1 text-sm text-neutral-700">
            {type.weaknesses.map((w) => (
              <li key={w}>- {w}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-md space-y-4 px-6 py-8">
        <div>
          <h3 className="mb-1 font-bold text-neutral-900">연애 스타일</h3>
          <p className="text-sm leading-relaxed text-neutral-700">{type.loveStyle}</p>
        </div>
        <div>
          <h3 className="mb-1 font-bold text-neutral-900">직장/학업 스타일</h3>
          <p className="text-sm leading-relaxed text-neutral-700">{type.workStyle}</p>
        </div>
        <div>
          <h3 className="mb-1 font-bold text-neutral-900">추천 직업</h3>
          <div className="flex flex-wrap gap-2">
            {type.recommendedJobs.map((job) => (
              <span
                key={job}
                className="rounded-full bg-neutral-200 px-3 py-1 text-xs text-neutral-700"
              >
                {job}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-md px-6 py-8 text-center">
        <Link
          href="/test"
          className="inline-block rounded-full bg-neutral-900 px-6 py-3 text-sm font-semibold text-white"
        >
          나도 테스트 해보기
        </Link>
      </section>

      <Disclaimer />
    </main>
  );
}
