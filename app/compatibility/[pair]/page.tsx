import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCompatibility, type RelationType } from "@/lib/compatibility";
import { Disclaimer } from "@/features/result/Disclaimer";

interface CompatibilityDetailPageProps {
  params: Promise<{ pair: string }>;
}

const RELATION_LABEL: Record<RelationType, string> = {
  best: "베스트 궁합",
  good: "좋은 궁합",
  normal: "무난한 궁합",
  challenging: "노력이 필요한 궁합",
};

function parsePair(pair: string): [string, string] | null {
  const parts = pair.split("-");
  if (parts.length !== 2) return null;
  if (!/^[a-z]{4}$/.test(parts[0]) || !/^[a-z]{4}$/.test(parts[1])) return null;
  return [parts[0], parts[1]];
}

export async function generateMetadata({
  params,
}: CompatibilityDetailPageProps): Promise<Metadata> {
  const { pair } = await params;
  const codes = parsePair(pair);
  if (!codes) return { title: "궁합을 찾을 수 없어요" };
  const result = getCompatibility(codes[0], codes[1]);
  if (!result) return { title: "궁합을 찾을 수 없어요" };
  return {
    title: `${result.typeA.code} × ${result.typeB.code} 궁합`,
    description: `${result.typeA.nickname}와(과) ${result.typeB.nickname}의 궁합 점수는 ${result.score}점`,
  };
}

export default async function CompatibilityDetailPage({ params }: CompatibilityDetailPageProps) {
  const { pair } = await params;
  const codes = parsePair(pair);
  const result = codes ? getCompatibility(codes[0], codes[1]) : undefined;
  if (!result) notFound();

  const { typeA, typeB, score, relationType, highlights, tip } = result;

  return (
    <main className="min-h-screen bg-neutral-50 pb-16">
      <section className="flex flex-col items-center gap-3 px-6 pb-10 pt-14 text-center">
        <div className="flex items-center gap-4">
          <TypeBadge code={typeA.code} color={typeA.themeColor} />
          <span className="text-2xl">×</span>
          <TypeBadge code={typeB.code} color={typeB.themeColor} />
        </div>
        <p className="text-sm text-neutral-500">
          {typeA.nickname} · {typeB.nickname}
        </p>
        <p className="text-4xl font-extrabold text-neutral-900">{score}점</p>
        <span className="rounded-full bg-neutral-900 px-4 py-1 text-sm font-semibold text-white">
          {RELATION_LABEL[relationType]}
        </span>
      </section>

      <section className="mx-auto max-w-md space-y-3 px-6 py-6">
        <h2 className="text-lg font-bold">이런 점이 궁금해요</h2>
        <ul className="space-y-2 text-sm leading-relaxed text-neutral-700">
          {highlights.map((h) => (
            <li key={h} className="rounded-xl bg-white px-4 py-3 shadow-sm">
              {h}
            </li>
          ))}
        </ul>
      </section>

      <section className="mx-auto max-w-md space-y-2 px-6 py-6">
        <h2 className="text-lg font-bold">관계 팁</h2>
        <p className="rounded-xl bg-white px-4 py-3 text-sm leading-relaxed text-neutral-700 shadow-sm">
          {tip}
        </p>
      </section>

      <section className="mx-auto max-w-md px-6 py-6 text-center">
        <Link
          href="/compatibility"
          className="inline-block text-sm font-semibold text-neutral-900 underline"
        >
          다른 유형과 궁합 보기
        </Link>
      </section>

      <Disclaimer />
    </main>
  );
}

function TypeBadge({ code, color }: { code: string; color: string }) {
  return (
    <div
      className="flex h-16 w-16 items-center justify-center rounded-full text-sm font-extrabold text-white"
      style={{ background: color }}
    >
      {code}
    </div>
  );
}
