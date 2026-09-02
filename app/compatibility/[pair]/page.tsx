import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCompatibility, type RelationType } from "@/lib/compatibility";
import { Disclaimer } from "@/features/result/Disclaimer";
import { MBTI_TYPES } from "@/lib/data/mbtiTypes";

interface CompatibilityDetailPageProps {
  params: Promise<{ pair: string }>;
}

// 16유형 조합은 유한(136가지)하므로 전부 미리 생성합니다. GitHub Pages static export가
// 이 라우트를 지원하려면 필수이며, 빌드 시점에 미리 렌더링해 응답 속도도 높여줍니다.
export function generateStaticParams() {
  const pairs: { pair: string }[] = [];
  for (const typeA of MBTI_TYPES) {
    for (const typeB of MBTI_TYPES) {
      if (typeA.code > typeB.code) continue;
      pairs.push({ pair: [typeA.code, typeB.code].sort().join("-").toLowerCase() });
    }
  }
  return pairs;
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
    <main className="min-h-screen bg-paper pb-16">
      <section className="reveal flex flex-col items-center gap-4 bg-ink px-6 pt-14 pb-10 text-center text-paper">
        <div className="flex items-center gap-4">
          <TypeBadge code={typeA.code} color={typeA.themeColor} />
          <span className="text-2xl text-paper/50">×</span>
          <TypeBadge code={typeB.code} color={typeB.themeColor} />
        </div>
        <p className="text-sm text-paper/70">
          {typeA.nickname} · {typeB.nickname}
        </p>
        <p className="text-5xl font-black tracking-tight">{score}점</p>
        <span className="bg-accent px-4 py-1 text-sm font-bold text-ink">
          {RELATION_LABEL[relationType]}
        </span>
      </section>

      <section className="mx-auto max-w-md space-y-3 px-6 py-10">
        <h2 className="text-xl font-black tracking-tight text-ink">이런 점이 궁금해요</h2>
        <ul className="space-y-2 text-sm leading-relaxed text-ink-soft">
          {highlights.map((h) => (
            <li key={h} className="border border-line px-4 py-3">
              {h}
            </li>
          ))}
        </ul>
      </section>

      <section className="mx-auto max-w-md space-y-2 border-t border-line px-6 py-10">
        <h2 className="text-xl font-black tracking-tight text-ink">관계 팁</h2>
        <p className="border border-line px-4 py-3 text-sm leading-relaxed text-ink-soft">{tip}</p>
      </section>

      <section className="mx-auto max-w-md border-t border-line px-6 py-10 text-center">
        <Link
          href="/compatibility"
          className="inline-block text-sm font-bold text-ink underline decoration-line underline-offset-4 hover:decoration-ink"
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
    <div className="flex h-16 w-16 flex-col items-center justify-center gap-1 border border-paper/30 text-sm font-black">
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} aria-hidden />
      {code}
    </div>
  );
}
