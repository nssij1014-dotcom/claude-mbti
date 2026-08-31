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
    <main className="flex min-h-screen flex-col bg-neutral-50">
      <section className="flex flex-1 flex-col items-center justify-between px-6 py-16 text-center">
        <div className="flex flex-col items-center gap-3">
          <span className="rounded-full bg-neutral-900 px-4 py-1 text-xs font-semibold text-white">
            약 3분 소요
          </span>
          <h1 className="max-w-xs text-3xl font-extrabold leading-tight text-neutral-900">
            3분 만에 알아보는
            <br />
            진짜 나의 성격
          </h1>
          <p className="max-w-xs text-neutral-500">
            로그인 없이 바로 시작하는 MBTI 성격유형 테스트. 결과는 카카오톡으로 바로 공유할 수
            있어요.
          </p>
        </div>

        <div className="my-10 grid w-full max-w-sm grid-cols-4 gap-2">
          {previewTypes.map((type) => (
            <Link
              key={type.code}
              href={`/types/${type.code.toLowerCase()}`}
              className="flex aspect-square flex-col items-center justify-center rounded-xl text-[11px] font-bold text-white"
              style={{ background: type.themeColor }}
            >
              {type.code}
            </Link>
          ))}
        </div>

        <div className="flex w-full max-w-sm flex-col items-center gap-4">
          <Link
            href="/test"
            className="flex min-h-11 w-full items-center justify-center rounded-full bg-neutral-900 px-6 py-4 text-base font-bold text-white active:opacity-80"
          >
            테스트 시작하기
          </Link>
          <div className="flex gap-4 text-sm text-neutral-500">
            <Link href="/types" className="underline">
              16유형 도감 보기
            </Link>
            <Link href="/compatibility" className="underline">
              궁합 보기
            </Link>
          </div>
          {participantCount > 0 && (
            <p className="text-xs text-neutral-400">
              지금까지 {participantCount.toLocaleString()}명이 참여했어요
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
