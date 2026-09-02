"use client";

import Image from "next/image";
import { signIn, signOut, useSession } from "next-auth/react";

// 로그인은 항상 선택 사항입니다(CLAUDE.md 3장) — 이 버튼이 없어도 테스트~공유 핵심
// 플로우는 그대로 동작하며, 여기서는 로그인 상태 표시/전환만 담당합니다.
export function AuthButton() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <span className="block h-11 w-24" aria-hidden />;
  }

  if (session?.user) {
    return (
      <div className="flex items-center gap-2">
        {session.user.image && (
          <Image
            src={session.user.image}
            alt=""
            width={24}
            height={24}
            className="rounded-full"
            unoptimized
          />
        )}
        <span className="max-w-24 truncate text-xs font-semibold text-ink">
          {session.user.name}
        </span>
        <button
          type="button"
          onClick={() => signOut()}
          className="flex min-h-11 items-center px-2 text-xs font-semibold text-ink-soft underline decoration-line underline-offset-4 transition-colors hover:decoration-ink"
        >
          로그아웃
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => signIn("google")}
      className="flex min-h-11 items-center px-2 text-xs font-semibold text-ink underline decoration-line underline-offset-4 transition-colors hover:decoration-ink"
    >
      Google로 로그인
    </button>
  );
}
