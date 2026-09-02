import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/features/auth/AuthProvider";
import { AuthButton } from "@/features/auth/AuthButton";

// 한글 가독성이 좋은 시스템 폰트 스택을 우선 사용합니다(PRD 5.3은 Pretendard를 예시로
// 들었지만, 웹폰트 도입은 배포 환경에서 next/font로 교체 가능합니다).
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "오늘의 나 - MBTI 성격유형 테스트",
    template: "%s | 오늘의 나",
  },
  description: "3분 만에 알아보는 진짜 나의 성격, MBTI 테스트",
};

// GitHub Pages 정적 배포는 app/api/** 를 통째로 제거합니다(scripts/prepare-pages-export.mjs
// 참고). 로그인은 API 라우트(NextAuth)에 의존하므로 이 빌드에서는 헤더 자체를 노출하지
// 않습니다 — 로그인은 선택 기능이라 핵심 플로우에는 영향이 없습니다(CLAUDE.md 5장).
const isGithubPagesBuild = process.env.GITHUB_PAGES === "true";

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="flex min-h-full flex-col bg-paper text-ink">
        {isGithubPagesBuild ? (
          children
        ) : (
          <AuthProvider>
            <header className="flex h-12 shrink-0 items-center justify-end border-b border-line px-4">
              <AuthButton />
            </header>
            {children}
          </AuthProvider>
        )}
      </body>
    </html>
  );
}
