// GitHub Pages(static export) 빌드 전용 스크립트입니다. Vercel 빌드나 로컬 개발에는
// 사용하지 않습니다 — GitHub Actions의 Pages 워크플로가 체크아웃한 임시 작업 트리에서만
// 실행되므로, 실제 저장소 소스나 Vercel 배포에는 영향을 주지 않습니다.
//
// GitHub Pages는 정적 파일만 서빙할 수 있어 아래 기능은 지원할 수 없습니다:
//   - app/api/** (DB 기반 API 라우트, 구글 로그인 NextAuth 라우트 포함)
//   - app/result/[resultId] (런타임에 생성되는 UUID라 빌드 시점에 경로를 알 수 없음)
//   - app/page.tsx의 실시간 참여자 수(force-dynamic, DB 조회)
// 로그인 헤더 자체는 app/layout.tsx의 GITHUB_PAGES 분기에서 별도로 걷어냅니다.
// 이 라우트를 제거/치환한 뒤 next.config.ts의 GITHUB_PAGES=true 플래그로 static export
// 빌드를 실행합니다.

import { readFileSync, writeFileSync, rmSync, existsSync } from "node:fs";

const ROUTES_TO_REMOVE = [
  "app/api/test-sessions",
  "app/api/share-events",
  "app/api/og",
  "app/api/auth",
  "app/result",
];

for (const dir of ROUTES_TO_REMOVE) {
  if (existsSync(dir)) {
    rmSync(dir, { recursive: true, force: true });
    console.log(`[prepare-pages-export] removed ${dir}`);
  }
}

const PAGE_PATH = "app/page.tsx";
let content = readFileSync(PAGE_PATH, "utf8");

function replaceOrThrow(source, search, replacement) {
  if (!source.includes(search)) {
    throw new Error(
      `[prepare-pages-export] expected snippet not found in ${PAGE_PATH} — app/page.tsx changed shape, update this script:\n${search}`,
    );
  }
  return source.replace(search, replacement);
}

content = replaceOrThrow(content, 'import { prisma } from "@/lib/prisma";\n', "");
content = replaceOrThrow(
  content,
  '\n// 참여자 수(PRD 5.3 A "실시간 누적 참여자 수")는 매 요청마다 최신값이어야 하므로 정적\n// 프리렌더링을 끄고 항상 서버에서 다시 계산합니다.\nexport const dynamic = "force-dynamic";\n',
  "",
);
content = replaceOrThrow(
  content,
  '  const participantCount = await prisma.testSession.count({ where: { status: "completed" } });\n',
  "",
);
content = replaceOrThrow(
  content,
  "export default async function HomePage() {",
  "export default function HomePage() {",
);
content = replaceOrThrow(
  content,
  `          {participantCount > 0 && (
            <p className="text-xs text-ink-soft">
              지금까지 {participantCount.toLocaleString()}명이 참여했어요
            </p>
          )}
`,
  "",
);

writeFileSync(PAGE_PATH, content);
console.log("[prepare-pages-export] patched app/page.tsx for static export");
