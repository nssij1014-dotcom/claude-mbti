# CLAUDE.md

이 파일은 `MBTI` 저장소에서 코드를 작성/수정할 때 Claude Code가 따라야 하는 **개발 가이드**입니다.
서비스 배경, 페르소나, KPI, 화면별 상세 요구사항 등 제품 설명은 [`MBTI_PRD.md`](MBTI_PRD.md)를 참고하세요.
이 문서는 PRD 내용을 반복하지 않고, "구현할 때 반드시 지켜야 할 규칙"만 다룹니다.

## 0. 현재 상태

PRD의 "테스트 → 결과 → 공유" 핵심 루프(P0)까지 MVP로 구현되어 있습니다: 랜딩, 테스트 진행,
결과 페이지(지표 비율/강점·약점/궁합 요약), 유형 도감, 궁합 페이지, 카카오톡/Web Share/링크복사
공유, OG 이미지 자동 생성. 아래는 의도적으로 **아직 없는** 부분입니다.

- **관리자 CMS 없음**: 문항(`lib/data/questions.ts`)과 16유형 콘텐츠(`lib/data/mbtiTypes.ts`)는
  정적 TypeScript 데이터입니다. CMS를 만들 때 이 데이터를 DB로 이관하세요.
  `prisma/schema.prisma`에는 CMS용 테이블(Question, MbtiType 등)이 아직 없습니다.
- **구글 로그인만 구현, 마이페이지/정밀판은 여전히 없음**: Auth.js(NextAuth) v5 +
  Google Provider로 선택적 소셜 로그인을 붙였습니다(`lib/auth.ts`, `features/auth/`).
  로그인 상태면 `TestSession.userId`가 채워지지만(`prisma/schema.prisma`의 `User` 모델,
  PRD 7.3), 히스토리 조회 UI(`/my`, PRD 3.4의 P2)는 아직 만들지 않았습니다 — 지금은
  로그인이 계정에 세션을 연결하기만 할 뿐, 그 데이터를 보여줄 화면이 없습니다. 카카오
  로그인은 PRD가 언급하지만 아직 미구현(Google Provider만 있음).
- **DB는 PostgreSQL이 아니라 SQLite**: 아래 1장 참고. 운영 배포 전에 반드시 Postgres로 교체.
- **카카오 JS 키 미설정**: `.env`의 `NEXT_PUBLIC_KAKAO_JS_KEY`가 비어 있어 카카오톡 공유는
  자동으로 Web Share API → 링크복사 폴백으로 동작합니다. 실제 키가 생기면 채워 넣으세요.
- **구글 OAuth 자격 증명 미설정**: `.env`의 `AUTH_SECRET`/`AUTH_GOOGLE_ID`/`AUTH_GOOGLE_SECRET`이
  비어 있으면 로그인 버튼은 보이지만 클릭 시 인증이 실패합니다. `.env.example` 주석대로
  Google Cloud Console에서 OAuth 클라이언트를 발급받아 채우세요. 로그인은 항상 선택
  사항이므로 이 값이 없어도 테스트~결과~공유 핵심 플로우에는 영향이 없습니다.

배포는 `main` 푸시마다 GitHub Actions 두 개가 병렬로 돕니다.

- `.github/workflows/deploy.yml` — Vercel에 실제 서비스 배포(API 라우트/동적 OG/DB 전부 동작).
- `.github/workflows/deploy-pages.yml` — GitHub Pages용 별도 정적 배포. 빌드 전
  `scripts/prepare-pages-export.mjs`가 `app/api/**`, `app/result/[resultId]`를 제거하고
  `app/page.tsx`의 실시간 참여자 수(DB 조회)를 걷어낸 뒤 `next.config.ts`의
  `GITHUB_PAGES=true` 플래그로 static export합니다. **결과 저장/공유 OG 등 핵심 기능이
  이 배포본에서는 동작하지 않습니다** — 요청에 따라 의도적으로 받아들인 트레이드오프이니,
  이 워크플로를 건드릴 때 핵심 기능을 되살리려 하지 마세요.

새 기능을 추가하며 이 문서와 실제 코드가 어긋나면(특히 기술 스택 버전, 프로젝트 구조) 이 문서를 갱신하세요.

## 1. 기술 스택 — 임의 변경 금지

PRD 6장에서 확정한 스택입니다. 더 나은 대안이 떠오르더라도 사용자와 합의 없이 바꾸지 마세요.
버전은 2026-08-30 기준 실제 설치 버전이며, 정확한 값은 `npm ls --depth=0`으로 재확인하세요.

| 영역             | 선택                          | 비고                                                                                                                 |
| ---------------- | ----------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| 프레임워크       | Next.js 16.3.3 (App Router)   | 결과 페이지 OG 메타태그를 SSR로 동적 생성                                                                              |
| 언어             | TypeScript 5.x (`strict`)     |                                                                                                                        |
| 스타일           | Tailwind CSS 4                | shadcn/ui는 아직 미도입 — 필요해지면 추가                                                                              |
| 상태관리         | Zustand 5                     | 테스트 진행 상태(현재 문항/응답)만 관리 — Redux 등 무겁게 가지 않기                                                    |
| 애니메이션       | Framer Motion 13              | 문항 전환/결과 페이지 마이크로 인터랙션                                                                                |
| 차트             | Recharts 3                    | 지표 비율 바 차트(`features/result/RatioChart.tsx`)                                                                    |
| 공유 카드 이미지 | Next.js 내장 `next/og`        | PRD는 `@vercel/og`를 명시했지만 동일 엔진이 Next.js App Router에 내장되어 있어 별도 패키지 설치 없이 사용(`app/api/og`) |
| 인증             | Auth.js(NextAuth) 5 + Google Provider | JWT 세션 전략. PRD 7.3의 User 테이블(provider/providerId만으로 식별, 이메일 미수집)에 맞춰 기본 Prisma 어댑터 대신 `lib/auth.ts`의 signIn/jwt 콜백에서 직접 upsert. 카카오 Provider는 PRD에 있으나 아직 미구현 |
| DB               | SQLite + Prisma 6.19.3        | **PRD/원래 계획은 PostgreSQL.** 로컬에 별도 Postgres 서버가 없어 인프라 없이 바로 실행되도록 SQLite로 대체. 운영 배포 전 `prisma/schema.prisma`의 `datasource`를 `postgresql`로, `DATABASE_URL`을 Postgres 연결 문자열로 교체할 것. Prisma는 8.x가 `latest` 태그이지만 스키마 설정 방식이 크게 바뀐 RC라 6.x 안정판에 고정함 |
| 캐시/세션        | 미구현                        | Redis는 트래픽이 실제로 문제가 될 때 도입 — 현재는 SQLite/localStorage로 충분                                         |
| 배포             | 미구현                        | Vercel 단일 배포가 원래 계획                                                                                          |

- 새 라이브러리는 "실제로 필요해졌을 때"만 추가합니다. 특히 상태관리·데이터페칭 라이브러리를 중복으로 얹지 않기(Zustand 하나로 충분).
- Prisma를 8.x로 올릴 때는 `datasource url` 방식이 아니라 `prisma.config.ts` + driver adapter 방식으로 바뀌므로 마이그레이션 가이드를 먼저 확인하세요.

## 2. 핵심 비즈니스 로직 — 반드시 정확히 구현

서비스 신뢰도는 채점 로직의 정확성에 달려 있습니다. PRD 7.4의 규칙을 그대로 따르세요.

- 문항(`Question`)은 `dimension`(EI/SN/TF/JP)과 `direction`(positive/negative) 두 값으로 어느 지표에 가산되는지 결정됩니다. 이 매핑을 화면 곳곳의 if문으로 흩어놓지 말고 채점 전용 모듈 하나에 모으세요.
- 흐름: 응답마다 지표별 원점수 누적 → 응답 완료 시 0~100% 비율로 정규화 → 각 지표에서 50% 초과인 극을 채택해 4자리 코드(예: INFP) 산출.
- 동점(50:50) 타이브레이커는 반드시 명시적 규칙으로 구현하고, 어떤 규칙을 적용했는지 코드 주석으로 남기세요. 이미 발급된 결과 URL의 재현성에 영향을 주므로 규칙을 임의로 바꾸지 않습니다.
- 채점 로직은 단일 소스(Single Source of Truth)로 유지합니다. 로컬(자동저장/이어하기용) 임시 계산과 서버 최종 계산이 따로 필요하더라도 같은 함수/모듈을 공유하세요.

## 3. 데이터·식별자 규칙

- 결과 URL(`TestSession.id`)은 추측 불가능한 UUID v4로 발급합니다(PRD 7.5). 순번 ID나 예측 가능한 슬러그는 사용하지 않습니다.
- 이름·연락처 등 개인정보는 어떤 필드로도 수집하지 않습니다. 새 필드를 추가하기 전에 이 원칙부터 점검하세요.
- 비회원 세션은 `user_id = NULL`을 허용합니다. 로그인 여부로 테스트~~결과~~공유 핵심 플로우를 막는 코드를 작성하지 않습니다.
- DB 컬럼명은 PRD 7.3 그대로 snake_case를 쓰고, Prisma/TypeScript 쪽은 camelCase로 매핑합니다(Prisma `@map`/`@@map` 활용).

## 4. UI/UX 하드 제약 (타협 불가)

"나중에 다듬기" 대상이 아니라 처음 구현할 때부터 지켜야 하는 제약입니다.

- **모바일 퍼스트**: 모든 화면은 375px 기준으로 먼저 만들고 768/1024/1280px로 확장합니다. 데스크톱을 먼저 만들고 축소하는 방식으로 작업하지 않습니다.
- **카카오톡/인스타그램 인앱 브라우저 호환**: 클립보드 API, 팝업, Web Share API를 쓰는 기능은 반드시 인앱 웹뷰에서 동작을 확인합니다. 안 되면 폴백 UX(예: 길게 눌러 복사 안내)를 함께 구현합니다.
- **테스트 진행 화면은 문항 1개 + 응답 UI만 노출**합니다. 여러 문항을 한 화면에 몰아넣지 않습니다.
- **결과 페이지 공유 바는 항상 sticky**로 노출합니다. 스크롤 중에도 공유 버튼에 접근 가능해야 합니다.
- 접근성: 터치 타겟 44x44px 이상, 명도 대비 WCAG AA 이상, 의미 있는 이미지에는 `alt`/`aria-label`을 반드시 지정합니다.
- 성능 예산: LCP < 2.5s, CLS < 0.1, INP < 200ms. 새 기능이 이 예산을 깨뜨리면 지연 로딩/이미지 최적화로 맞추거나, 안 될 경우 트레이드오프를 명시적으로 알립니다.

## 5. 공유(바이럴 루프) 기능 — 최우선으로 취급

PRD 8.2에 따라 "테스트 → 결과 → 공유 → 재유입" 루프가 서비스 성패를 좌우합니다.

- 카카오톡 SDK, OG 이미지, 링크 복사 등 공유 관련 변경은 결과 콘텐츠 품질과 동급으로 취급합니다. "나중에 고치는" P2로 미루지 않습니다.
- OG 이미지는 서버사이드 사전 렌더링이 원칙입니다. 클라이언트 canvas로만 그려서 SNS 미리보기(카톡/인스타 링크 미리보기)가 깨지는 구현은 금지합니다.
- 공유 이벤트(`ShareEvent`)는 채널별로 반드시 로깅합니다. 새 공유 채널을 추가할 때는 로깅도 함께 추가하세요(바이럴 계수 측정에 사용).

## 6. 신뢰·법적 요건

- 결과 페이지 하단에는 "공식 심리검사를 대체하지 않는다"는 면책 문구가 항상 렌더링되어야 합니다(PRD 1.6). 이 컴포넌트를 조건부로 숨기는 코드를 작성하지 마세요.
- 공식 MBTI(Myers-Briggs) 상표·라이선스와 제휴하는 것처럼 오인될 수 있는 문구나 로고를 넣지 않습니다.

## 7. 우선순위 판단 기준 (구현 순서가 애매할 때)

1. 바이럴 루프(테스트 → 결과 → 공유) 관련 기능이 그 외 모든 것보다 우선합니다.
2. 모바일 완성도가 데스크톱 대응보다 우선합니다.
3. 회원/로그인 기능은 항상 선택 사항입니다 — 핵심 플로우의 필수 진입 조건으로 만들지 않습니다.
4. PRD 3장 표의 P0를 먼저 구현하고, P1~P3는 MVP 이후로 미룹니다.

## 8. 프로젝트 구조 (현재 상태)

```
MBTI/
├── app/
│   ├── page.tsx                       # 랜딩
│   ├── test/page.tsx                  # 테스트 진행(간단판)
│   ├── result/[resultId]/page.tsx     # 결과 페이지 (SSR, OG 메타 동적 생성)
│   ├── types/page.tsx                 # 유형 도감
│   ├── types/[typeCode]/page.tsx      # 유형 상세 (SSG, generateStaticParams)
│   ├── compatibility/page.tsx         # 유형 2개 선택
│   ├── compatibility/[pair]/page.tsx  # 궁합 상세
│   └── api/
│       ├── test-sessions/route.ts     # 세션 생성 + 서버 재채점(POST)
│       ├── og/[resultId]/route.tsx    # OG 이미지 생성(next/og)
│       ├── share-events/route.ts      # 공유 로그(POST)
│       └── auth/[...nextauth]/route.ts # NextAuth 핸들러(GET/POST)
├── features/
│   ├── test/                          # useTestStore(zustand), TestRunner
│   ├── result/                        # RatioChart(recharts), Disclaimer
│   ├── share/                         # share.ts(카카오/Web Share/링크복사), ShareBar
│   └── auth/                          # AuthProvider(SessionProvider), AuthButton
├── lib/
│   ├── scoring/                       # score.ts(채점 단일 소스) + score.test.ts
│   ├── data/                          # questions.ts, mbtiTypes.ts (정적 콘텐츠, CMS 대체)
│   ├── compatibility.ts               # 궁합 점수/설명 생성
│   ├── auth.ts                        # Auth.js(NextAuth) 설정 — Google Provider, JWT 세션
│   ├── prisma.ts
│   └── types.ts                       # 공용 타입(Dimension, Answer, MbtiTypeContent 등)
├── types/
│   └── next-auth.d.ts                 # next-auth Session/JWT 타입 보강
├── prisma/
│   └── schema.prisma                  # User, TestSession, ShareEvent (SQLite)
├── scripts/
│   └── prepare-pages-export.mjs       # GitHub Pages 빌드 전용(5장 참고), Vercel/로컬에는 미사용
├── test/setup.ts                      # Vitest + Testing Library 전역 설정
├── .github/workflows/
│   ├── deploy.yml                     # Vercel 배포(main 푸시마다)
│   └── deploy-pages.yml               # GitHub Pages 정적 배포(main 푸시마다)
├── public/
├── MBTI_PRD.md
└── CLAUDE.md
```

아직 없음: `app/admin/**`(관리자 CMS), `app/my/page.tsx`(마이페이지 — 로그인은 구현됐지만
히스토리 조회 화면은 아직 없음), `features/admin/`. 이 기능들을 만들 때 이 구조 표를 함께
갱신하세요.

`components/`, `utils/` 같은 범용 디렉터리는 실제로 여러 feature가 공유하는 코드가 생기기 전까지 만들지 않습니다.

## 9. 개발 명령어

```bash
npm install          # 의존성 설치
npm run dev           # 개발 서버 실행 (http://localhost:3000)
npm run build         # 프로덕션 빌드 (타입 체크 포함)
npm run start         # 빌드 결과 로컬 실행
npm run typecheck     # 타입 체크만 실행 (빌드 없이)
npm run lint          # ESLint 검사
npm run format        # Prettier로 전체 파일 포맷팅 (*.md 제외 — .prettierignore 참고)
npm run format:check  # 포맷팅 여부만 검사
npm run test          # Vitest 1회 실행
npm run test:watch    # Vitest watch 모드
npm run db:generate   # Prisma Client 재생성 (schema.prisma 수정 후)
npm run db:push       # SQLite 개발 DB에 스키마 반영 (마이그레이션 파일 없이)
npm run db:studio     # Prisma Studio로 로컬 DB 데이터 확인
```

로컬에서 처음 실행할 때는 `.env.example`을 `.env`로 복사한 뒤 `npm run db:push`로 `prisma/dev.db`를
생성해야 합니다. 작업을 마치기 전 최소 `npm run lint`, `npm run typecheck`, `npm run test`,
`npm run build`가 모두 통과해야 합니다.

## 10. 커밋 컨벤션

- 커밋 메시지는 **한글**로 작성합니다.
- **Conventional Commits** 형식을 따릅니다: `<type>(<scope>): <description>` (scope는 선택 사항)
- 예시: `feat(test): 문항 응답 시 자동 다음 문항 전환`, `fix(share): 인스타 인앱 브라우저에서 링크복사 실패 수정`
- 타입: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`

## 11. 코드 컨벤션

- TypeScript는 `strict: true` 기준으로 작성하고 `any`를 사용하지 않습니다. 타입을 모를 때는 `unknown` + 타입 가드로 좁혀갑니다.
- 컴포넌트는 함수형 컴포넌트 + Hooks로 작성합니다. `app/**/page.tsx`, `layout.tsx`, `route.ts`는 Next.js 규약상 `export default`/명명된 함수(`GET`, `POST` 등)를 그대로 따르고, 그 외 컴포넌트·훅·유틸은 named export를 사용합니다.
- Props, 도메인 모델처럼 객체 형태는 `interface`, 유니온/유틸리티 조합은 `type`을 기본으로 사용합니다.
- 배럴 파일(`index.ts`)은 실제로 여러 곳에서 import될 때만 추가합니다.
- Prisma 스키마: 현재는 `prisma db push`로 SQLite 개발 DB에 바로 반영하고 있어 `prisma/migrations/`가 아직 없습니다. 스키마가 안정되고 실제 Postgres로 옮길 시점부터는 `prisma migrate dev`로 전환해 마이그레이션 이력을 남기세요. 그 전환 이후에는 `schema.prisma`만 고치고 마이그레이션 생성을 누락하지 않습니다.

## 12. 테스트

- 단위 테스트(Vitest): 채점 로직(2장)은 지표별 경계값(정확히 50%, 동점 등)을 포함해 반드시 테스트합니다(`lib/scoring/score.test.ts` 참고).
- E2E(Playwright): 아직 설치되어 있지 않습니다. 도입 시 모바일 뷰포트를 기본으로 테스트하고, 공유 플로우는 가능한 범위에서 인앱 브라우저(웹뷰) 시나리오를 함께 검증합니다.

## 13. 절대 건드리면 안 되는 것

- **`.env`, `.env.local`** — 커밋 금지. `.gitignore`에 이미 등록되어 있습니다. 새 환경 변수를 추가하면 `.env.example`에도 키 이름(값은 비워서)을 함께 추가하세요.
- **`prisma/dev.db`** — SQLite 로컬 개발 DB 파일입니다. 손으로 편집하지 말고 `npm run db:push`/`npm run db:studio`로만 다룹니다(`.gitignore` 처리됨).
- **`prisma/migrations/`(생성되면)** — 직접 수정하지 않습니다. 스키마 변경은 `prisma migrate`로만 반영합니다.
- **`node_modules/`, `package-lock.json`** — 수동으로 편집하지 않습니다. 패키지 매니저 명령으로만 변경합니다.
- **`MBTI_PRD.md`** — 기획 확정 문서입니다. 코드 작업 중 임의로 내용을 바꾸지 않습니다(기획 변경은 별도로 논의 후 반영). Prettier 포맷팅 대상에서도 제외되어 있습니다(`.prettierignore`).

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
