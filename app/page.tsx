import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { MBTI_TYPES } from "@/lib/data/mbtiTypes";

// 참여자 수(PRD 5.3 A "실시간 누적 참여자 수")는 매 요청마다 최신값이어야 하므로 정적
// 프리렌더링을 끄고 항상 서버에서 다시 계산합니다.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const participantCount = await prisma.testSession.count({ where: { status: "completed" } });
  const previewTypes = MBTI_TYPES.slice(0, 8);

  return (
    <main className="flex min-h-screen flex-col bg-paper">
      <section className="flex flex-1 flex-col items-center justify-between px-6 py-16 text-center">
        <div className="reveal flex flex-col items-center gap-5">
          <span className="flex items-center gap-2 text-xs font-semibold tracking-[0.3em] text-ink-soft uppercase">
            <span className="h-px w-6 bg-ink" aria-hidden />약 3분 소요
          </span>
          <h1 className="max-w-xs text-4xl leading-[1.15] font-black tracking-tight text-ink">
            3분 만에 알아보는
            <br />
            진짜 나의{" "}
            <span className="bg-accent px-1.5 py-0.5" style={{ boxDecorationBreak: "clone" }}>
              성격
            </span>
          </h1>
          <p className="max-w-xs text-ink-soft">
            로그인 없이 바로 시작하는 MBTI 성격유형 테스트. 결과는 카카오톡으로 바로 공유할 수
            있어요.
          </p>
        </div>

        <div className="my-12 grid w-full max-w-sm grid-cols-4 gap-2">
          {previewTypes.map((type) => (
            <Link
              key={type.code}
              href={`/types/${type.code.toLowerCase()}`}
              className="group relative flex aspect-square flex-col items-center justify-center gap-1.5 border border-line text-[11px] font-bold text-ink transition-colors hover:border-ink hover:bg-ink hover:text-paper"
            >
              <span
                className="h-1.5 w-1.5 shrink-0 rounded-full"
                style={{ background: type.themeColor }}
                aria-hidden
              />
              {type.code}
            </Link>
          ))}
        </div>

        <div className="flex w-full max-w-sm flex-col items-center gap-5">
          <Link
            href="/test"
            className="flex min-h-11 w-full items-center justify-center bg-ink px-6 py-4 text-base font-bold tracking-tight text-paper transition-colors hover:bg-accent hover:text-ink"
          >
            테스트 시작하기
          </Link>
          <div className="flex gap-6 text-sm font-semibold text-ink">
            <Link
              href="/types"
              className="underline decoration-line underline-offset-4 transition-colors hover:decoration-ink"
            >
              16유형 도감 보기
            </Link>
            <Link
              href="/compatibility"
              className="underline decoration-line underline-offset-4 transition-colors hover:decoration-ink"
            >
              궁합 보기
            </Link>
          </div>
          {participantCount > 0 && (
            <p className="text-xs text-ink-soft">
              지금까지 {participantCount.toLocaleString()}명이 참여했어요
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
