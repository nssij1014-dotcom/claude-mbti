import type { Metadata } from "next";
import "./globals.css";

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

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-neutral-50 text-neutral-900">{children}</body>
    </html>
  );
}
