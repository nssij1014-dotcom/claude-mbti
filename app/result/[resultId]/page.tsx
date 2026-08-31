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
    <div className="flex min-h-screen flex-col bg-neutral-50">
      <main className="flex-1 pb-6">
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
          <h2 className="text-lg font-bold">나의 성향 비율</h2>
          <RatioChart ratios={ratios} themeColor={type.themeColor} />
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

        <section className="mx-auto max-w-md space-y-3 px-6 py-8">
          <h2 className="text-lg font-bold">궁합</h2>
          <div className="flex flex-col gap-2">
            <p className="text-sm text-neutral-600">
              베스트 궁합{" "}
              {type.bestMatches.map((code, i) => (
                <span key={code}>
                  {i > 0 && ", "}
                  <Link
                    href={`/compatibility/${[type.code, code].sort().join("-").toLowerCase()}`}
                    className="font-semibold underline"
                  >
                    {code}
                  </Link>
                </span>
              ))}
            </p>
            <p className="text-sm text-neutral-600">
              상성이 아쉬운 유형{" "}
              {type.challengingMatches.map((code, i) => (
                <span key={code}>
                  {i > 0 && ", "}
                  <Link
                    href={`/compatibility/${[type.code, code].sort().join("-").toLowerCase()}`}
                    className="font-semibold underline"
                  >
                    {code}
                  </Link>
                </span>
              ))}
            </p>
          </div>
          <Link
            href="/compatibility"
            className="inline-block text-sm font-semibold text-neutral-900 underline"
          >
            궁합 자세히 보기 →
          </Link>
        </section>

        <section className="mx-auto max-w-md px-6 py-8 text-center">
          <Link
            href="/types"
            className="inline-block rounded-full border border-neutral-300 px-6 py-3 text-sm font-semibold"
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
