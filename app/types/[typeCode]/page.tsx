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
    <main className="min-h-screen bg-paper">
      <section className="reveal flex flex-col items-center gap-3 bg-ink px-6 pt-14 pb-10 text-center text-paper">
        <span className="flex items-center gap-2 text-xs font-semibold tracking-[0.3em] text-paper/60 uppercase">
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ background: type.themeColor }}
            aria-hidden
          />
          {type.group}
        </span>
        <h1 className="text-6xl font-black tracking-tight">{type.code}</h1>
        <p className="bg-accent px-2 py-0.5 text-lg font-bold text-ink">{type.nickname}</p>
        <p className="mt-2 max-w-xs text-sm text-paper/80">{type.summary}</p>
      </section>

      <section className="mx-auto max-w-md space-y-3 px-6 py-10">
        <h2 className="text-xl font-black tracking-tight text-ink">이런 사람이에요</h2>
        <p className="leading-relaxed text-ink-soft">{type.description}</p>
      </section>

      <section className="mx-auto grid max-w-md grid-cols-1 gap-8 border-t border-line px-6 py-10 sm:grid-cols-2">
        <div>
          <h3 className="mb-3 text-sm font-bold tracking-[0.2em] text-ink uppercase">강점</h3>
          <ul className="space-y-1.5 text-sm text-ink-soft">
            {type.strengths.map((s) => (
              <li key={s}>+ {s}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="mb-3 text-sm font-bold tracking-[0.2em] text-ink uppercase">약점</h3>
          <ul className="space-y-1.5 text-sm text-ink-soft">
            {type.weaknesses.map((w) => (
              <li key={w}>- {w}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-md space-y-6 border-t border-line px-6 py-10">
        <div>
          <h3 className="mb-1 text-sm font-bold tracking-[0.2em] text-ink uppercase">
            연애 스타일
          </h3>
          <p className="text-sm leading-relaxed text-ink-soft">{type.loveStyle}</p>
        </div>
        <div>
          <h3 className="mb-1 text-sm font-bold tracking-[0.2em] text-ink uppercase">
            직장/학업 스타일
          </h3>
          <p className="text-sm leading-relaxed text-ink-soft">{type.workStyle}</p>
        </div>
        <div>
          <h3 className="mb-2 text-sm font-bold tracking-[0.2em] text-ink uppercase">추천 직업</h3>
          <div className="flex flex-wrap gap-2">
            {type.recommendedJobs.map((job) => (
              <span key={job} className="border border-line px-3 py-1 text-xs text-ink-soft">
                {job}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-md border-t border-line px-6 py-10 text-center">
        <Link
          href="/test"
          className="inline-block bg-ink px-6 py-3 text-sm font-bold text-paper transition-colors hover:bg-accent hover:text-ink"
        >
          나도 테스트 해보기
        </Link>
      </section>

      <Disclaimer />
    </main>
  );
}
