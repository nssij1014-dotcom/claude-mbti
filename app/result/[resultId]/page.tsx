import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getMbtiType } from "@/lib/data/mbtiTypes";
import { RatioChart } from "@/features/result/RatioChart";
import { Disclaimer } from "@/features/result/Disclaimer";
import { ShareBar } from "@/features/share/ShareBar";
import type { Dimension } from "@/lib/types";

interface ResultPageProps {
  params: Promise<{ resultId: string }>;
}

async function getSession(resultId: string) {
  return prisma.testSession.findUnique({ where: { id: resultId } });
}

export async function generateMetadata({ params }: ResultPageProps): Promise<Metadata> {
  const { resultId } = await params;
  const session = await getSession(resultId);
  const type = session?.resultTypeCode ? getMbtiType(session.resultTypeCode) : undefined;
  if (!type) return { title: "결과를 찾을 수 없어요" };

  const title = `나는 ${type.code} · ${type.nickname}`;
  const description = type.summary;
  const ogImage = `/api/og/${resultId}`;

  return {
    title,
    description,
    openGraph: { title, description, images: [ogImage] },
    twitter: { card: "summary_large_image", title, description, images: [ogImage] },
  };
}

export default async function ResultPage({ params }: ResultPageProps) {
  const { resultId } = await params;
  const session = await getSession(resultId);
  const type = session?.resultTypeCode ? getMbtiType(session.resultTypeCode) : undefined;

  if (!session || !type) notFound();

  const ratios: Record<Dimension, number> = {
    EI: session.eiRatio,
    SN: session.snRatio,
    TF: session.tfRatio,
    JP: session.jpRatio,
  };

  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <main className="flex-1 pb-6">
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

        <section className="mx-auto max-w-md space-y-4 px-6 py-10">
          <h2 className="text-xl font-black tracking-tight text-ink">나의 성향 비율</h2>
          <RatioChart ratios={ratios} />
        </section>

        <section className="mx-auto max-w-md space-y-3 border-t border-line px-6 py-10">
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
            <h3 className="mb-2 text-sm font-bold tracking-[0.2em] text-ink uppercase">
              추천 직업
            </h3>
            <div className="flex flex-wrap gap-2">
              {type.recommendedJobs.map((job) => (
                <span key={job} className="border border-line px-3 py-1 text-xs text-ink-soft">
                  {job}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-md space-y-3 border-t border-line px-6 py-10">
          <h2 className="text-xl font-black tracking-tight text-ink">궁합</h2>
          <div className="flex flex-col gap-2">
            <p className="text-sm text-ink-soft">
              베스트 궁합{" "}
              {type.bestMatches.map((code, i) => (
                <span key={code}>
                  {i > 0 && ", "}
                  <Link
                    href={`/compatibility/${[type.code, code].sort().join("-").toLowerCase()}`}
                    className="font-bold text-ink underline decoration-line underline-offset-4 hover:decoration-ink"
                  >
                    {code}
                  </Link>
                </span>
              ))}
            </p>
            <p className="text-sm text-ink-soft">
              상성이 아쉬운 유형{" "}
              {type.challengingMatches.map((code, i) => (
                <span key={code}>
                  {i > 0 && ", "}
                  <Link
                    href={`/compatibility/${[type.code, code].sort().join("-").toLowerCase()}`}
                    className="font-bold text-ink underline decoration-line underline-offset-4 hover:decoration-ink"
                  >
                    {code}
                  </Link>
                </span>
              ))}
            </p>
          </div>
          <Link
            href="/compatibility"
            className="inline-block text-sm font-bold text-ink underline decoration-line underline-offset-4 hover:decoration-ink"
          >
            궁합 자세히 보기 →
          </Link>
        </section>

        <section className="mx-auto max-w-md border-t border-line px-6 py-10 text-center">
          <Link
            href="/types"
            className="inline-block border border-ink px-6 py-3 text-sm font-bold text-ink transition-colors hover:bg-ink hover:text-paper"
          >
            16유형 전체 보기
          </Link>
        </section>

        <Disclaimer />
      </main>

      <ShareBar
        testSessionId={session.id}
        title={`나는 ${type.code} · ${type.nickname}`}
        description={type.summary}
      />
    </div>
  );
}
