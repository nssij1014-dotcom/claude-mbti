import type { NextConfig } from "next";

// GitHub Pages는 정적 파일만 서빙할 수 있어 API 라우트/DB 기반 동적 라우트를 지원하지
// 않습니다. scripts/prepare-pages-export.mjs가 해당 라우트를 제거한 뒤, 이 플래그로만
// static export 모드로 빌드합니다(Vercel 배포에는 영향 없음).
const isGithubPagesBuild = process.env.GITHUB_PAGES === "true";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.0.20"],
  ...(isGithubPagesBuild && {
    output: "export",
    basePath: "/claude-mbti",
    trailingSlash: true,
    images: { unoptimized: true },
  }),
};

export default nextConfig;
