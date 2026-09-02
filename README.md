# 오늘의 나 — MBTI 성격유형 테스트

로그인 없이 3분 안에 끝나는 MBTI 성격유형 테스트 웹 서비스입니다. 24문항에 응답하면 16유형 중
하나의 결과와 강점/약점·연애/직장 스타일·궁합을 보여주고, 카카오톡/인스타그램/X/링크복사로
결과를 공유할 수 있습니다.

> 제품 배경·타깃 사용자·KPI 등 기획 내용은 [`MBTI_PRD.md`](MBTI_PRD.md)를, 코드 작성 시
> 지켜야 할 개발 규칙은 [`CLAUDE.md`](CLAUDE.md)를 참고하세요. 이 문서는 두 문서를 반복하지
> 않고 "이 저장소를 처음 받은 사람이 실행·이해·연동하는 데 필요한 정보"만 다룹니다.

## 목차

- [주요 기능](#주요-기능)
- [기술 스택](#기술-스택)
- [프로젝트 구조](#프로젝트-구조)
- [시작하기](#시작하기)
- [사용 가능한 스크립트](#사용-가능한-스크립트)
- [핵심 로직: 채점 알고리즘](#핵심-로직-채점-알고리즘)
- [API 문서](#api-문서)
- [배포](#배포)
- [현재 알려진 제한사항](#현재-알려진-제한사항)
- [라이선스 및 면책](#라이선스-및-면책)

## 주요 기능

- **비회원 테스트**: 회원가입/로그인 없이 즉시 시작. 문항 1개 + 5점 리커트 응답 UI만 화면에
  노출하며, 응답은 자동으로 저장되어 새로고침해도 이어서 진행할 수 있습니다.
- **결과 페이지**: 지표별(외향-내향/감각-직관/사고-감정/판단-인식) 성향 비율 차트, 강점/약점,
  연애·직장 스타일, 추천 직업, 궁합 요약을 제공합니다.
- **16유형 도감**: 유형별 상세 페이지가 빌드 타임에 정적 생성(SSG)되어 테스트를 하지 않아도
  둘러볼 수 있습니다.
- **궁합 보기**: 두 유형을 선택하면 궁합 점수·설명·관계 팁을 확인할 수 있습니다(136가지 조합
  모두 정적 생성).
- **SNS 공유**: 카카오톡 공유, Web Share API(인스타그램 등), X 인텐트, 링크 복사, OG 이미지
  다운로드를 지원하며, 각 채널은 성공 여부와 무관하게 이벤트로 로깅됩니다. 카카오/Web Share가
  막힌 환경(인앱 브라우저 등)에서는 자동으로 링크복사로 폴백합니다.
- **동적 OG 이미지**: 결과 링크를 카카오톡/X 등에 공유하면 서버에서 사전 렌더링한 1200×630
  카드 이미지가 미리보기로 뜹니다.
- **실시간 참여자 수**: 랜딩 페이지에 지금까지 테스트를 완료한 누적 인원이 표시됩니다.

## 기술 스택

| 영역             | 선택                        |
| ---------------- | --------------------------- |
| 프레임워크       | Next.js 16 (App Router)     |
| 언어             | TypeScript 5 (`strict`)     |
| 스타일           | Tailwind CSS 4              |
| 상태관리         | Zustand 5                   |
| 애니메이션       | Framer Motion 13            |
| 차트             | Recharts 3                  |
| 공유 카드 이미지 | Next.js 내장 `next/og`      |
| ORM/DB           | Prisma 6 + SQLite(로컬 개발)|
| 테스트           | Vitest + Testing Library    |
| 배포             | GitHub Pages(정적 미러만 지원, 운영 배포처는 아직 없음) |

버전/도입 배경에 대한 더 자세한 설명(예: 왜 SQLite인지, 왜 `@vercel/og`가 아닌지)은
[`CLAUDE.md`의 1장](CLAUDE.md)을 참고하세요.

## 프로젝트 구조

```
app/
├── page.tsx                       # 랜딩 (실시간 참여자 수)
├── test/page.tsx                  # 테스트 진행 화면
├── result/[resultId]/page.tsx     # 결과 페이지 (SSR, OG 메타 동적 생성)
├── types/page.tsx                 # 16유형 도감
├── types/[typeCode]/page.tsx      # 유형 상세 (SSG)
├── compatibility/page.tsx         # 유형 2개 선택
├── compatibility/[pair]/page.tsx  # 궁합 상세 (SSG, 136가지 조합)
└── api/
    ├── test-sessions/route.ts     # 세션 생성 + 서버 재채점 (POST)
    ├── og/[resultId]/route.tsx    # OG 이미지 생성
    └── share-events/route.ts      # 공유 로그 (POST)

features/
├── test/       # useTestStore(zustand), TestRunner
├── result/     # RatioChart(recharts), Disclaimer
└── share/      # share.ts(카카오/Web Share/링크복사), ShareBar

lib/
├── scoring/    # score.ts — 채점 로직 단일 소스 + score.test.ts
├── data/       # questions.ts, mbtiTypes.ts (정적 콘텐츠, CMS 대체)
├── compatibility.ts
├── prisma.ts
└── types.ts    # 공용 타입

prisma/schema.prisma   # TestSession, ShareEvent (SQLite)
scripts/prepare-pages-export.mjs  # GitHub Pages 빌드 전용 전처리
```

## 시작하기

### 요구 사항

- Node.js 20 이상
- npm

### 설치

```bash
npm install
cp .env.example .env
npm run db:push   # prisma/dev.db 생성 (SQLite)
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 을 열면 됩니다.

### 환경 변수 (`.env`)

| 변수 | 필수 | 설명 |
| --- | --- | --- |
| `DATABASE_URL` | ✅ | SQLite 파일 경로. 기본값 `file:./dev.db` 그대로 사용하면 됩니다. |
| `NEXT_PUBLIC_KAKAO_JS_KEY` | ❌ | Kakao Developers에서 발급받는 JS 키. 비워두면 카카오톡 공유 버튼이 자동으로 Web Share API → 링크복사로 폴백합니다. |
| `AUTH_SECRET`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET` | ❌ | 소셜 로그인용으로 예약된 변수입니다. **현재 로그인 기능 자체가 구현되어 있지 않아** 비워둬도 핵심 플로우(테스트→결과→공유)에는 영향이 없습니다. |

## 사용 가능한 스크립트

| 명령어 | 설명 |
| --- | --- |
| `npm run dev` | 개발 서버 실행 |
| `npm run build` | 프로덕션 빌드 (타입 체크 포함) |
| `npm run start` | 빌드 결과 로컬 실행 |
| `npm run typecheck` | 타입 체크만 실행 |
| `npm run lint` | ESLint 검사 |
| `npm run format` / `format:check` | Prettier 포맷팅 / 검사 |
| `npm run test` / `test:watch` | Vitest 실행 |
| `npm run db:generate` | Prisma Client 재생성 |
| `npm run db:push` | SQLite 개발 DB에 스키마 반영 |
| `npm run db:studio` | Prisma Studio로 로컬 DB 확인 |

## 핵심 로직: 채점 알고리즘

채점은 [`lib/scoring/score.ts`](lib/scoring/score.ts) 한 곳에서만 계산합니다(클라이언트 임시
계산과 서버 최종 계산이 동일 함수를 공유).

1. 각 문항은 `dimension`(EI/SN/TF/JP)과 `direction`(positive/negative)을 가집니다.
2. 5점 리커트 응답(1~5)을 `value - 3`으로 환산해 -2~+2 점수로 만들고, `direction`이
   negative인 문항은 부호를 반전합니다.
3. 지표별로 합산한 뒤 0~100% 비율로 정규화합니다.
4. 각 지표에서 비율이 50%를 초과하면 양수 쪽 문자(E/S/T/J), 미달하면 음수 쪽 문자(I/N/F/P)를
   채택해 4자리 코드(예: `INFP`)를 만듭니다.
5. **정확히 50%로 동점인 경우** 항상 음수 쪽 문자(I/N/F/P)를 채택합니다. 이미 발급된 결과 URL의
   재현성에 영향을 주는 규칙이라 임의로 바꾸지 않습니다.

서버(`POST /api/test-sessions`)는 클라이언트가 보낸 점수를 신뢰하지 않고, 제출된 원본 응답으로
동일한 함수를 다시 실행해 저장합니다.

## API 문서

### `POST /api/test-sessions`

테스트 완료 시 응답을 제출하고 서버에서 재채점 후 세션을 생성합니다.

**Request body**

```json
{
  "answers": [{ "questionId": "ei-1", "value": 4 }, "... 24개"],
  "deviceType": "mobile",
  "referrer": "https://..."
}
```

- `answers`: `lib/data/questions.ts`의 24문항과 1:1로 대응해야 하며(개수 불일치 시 400),
  `value`는 1~5 정수여야 합니다.
- `deviceType`: `"mobile" | "tablet" | "desktop"` (생략 가능)

**Response `200`**

```json
{ "id": "3fa2b1c4-...", "resultTypeCode": "INFP", "ratios": { "EI": 35, "SN": 62, "TF": 40, "JP": 58 } }
```

`id`가 결과 페이지 URL(`/result/{id}`)로 쓰이는 UUID입니다.

**Response `400`**: `answers`가 없거나 개수/형식이 유효하지 않은 경우.

---

### `GET /api/og/[resultId]`

해당 결과의 1200×630 공유 카드 이미지를 `next/og`로 서버에서 렌더링해 반환합니다
(`Content-Type: image/png`). `resultId`에 대응하는 세션이 없거나 결과 코드가 없으면 빈
배경 이미지를 반환합니다(요청 자체는 200). 결과 페이지의 OG 메타태그(`og:image`)와
공유 바의 "이미지 저장" 버튼이 이 엔드포인트를 사용합니다.

---

### `POST /api/share-events`

공유 버튼 클릭을 채널별로 로깅합니다(바이럴 계수 측정용).

**Request body**

```json
{ "testSessionId": "3fa2b1c4-...", "channel": "kakao" }
```

- `channel`: `"kakao" | "instagram" | "x" | "link_copy" | "image_download"` 중 하나.

**Response `200`**: `{ "ok": true }`
**Response `400`**: `testSessionId`가 없거나 `channel`이 허용된 값이 아닌 경우.

## 배포

`main` 브랜치 푸시마다 GitHub Actions가 GitHub Pages에 정적 미러를 배포합니다.

- **[`.github/workflows/deploy-pages.yml`](.github/workflows/deploy-pages.yml)** — 빌드 전
  [`scripts/prepare-pages-export.mjs`](scripts/prepare-pages-export.mjs)가 `app/api/**`,
  `app/result/[resultId]`, 랜딩의 실시간 참여자 수 코드를 제거한 뒤 static export합니다.
  **이 배포본에서는 결과 저장/공유 OG/구글 로그인 등 핵심 기능이 동작하지 않습니다** —
  데모/미러 용도로 의도된 트레이드오프입니다.
- **Vercel 자동배포는 제거했습니다.** 원래 `deploy.yml`로 Vercel에 실서비스를 배포할
  계획이었지만 배포가 계속 실패해 걷어냈습니다(2026-09-02). 현재는 테스트→결과→공유
  핵심 루프가 실제로 동작하는 라이브 배포처가 없고, `npm run dev` 로컬 실행 또는
  `npm run build && npm run start`로만 전체 기능을 확인할 수 있습니다.

## 현재 알려진 제한사항

- **관리자 CMS 없음**: 문항과 16유형 콘텐츠는 정적 TypeScript 데이터(`lib/data/`)입니다.
- **구글 로그인만 구현, 마이페이지 없음**: 로그인은 항상 선택 사항이며 핵심 플로우의 필수 조건이 아닙니다.
- **DB가 PostgreSQL이 아니라 SQLite**: 로컬 실행을 쉽게 하기 위한 임시 대체이며, 운영 배포
  전 Postgres로 교체가 필요합니다.
- **카카오 JS 키 미설정**: 값을 채우기 전까지 카카오톡 공유는 Web Share API/링크복사로
  자동 폴백됩니다.

더 자세한 배경과 향후 계획은 [`CLAUDE.md`의 0장](CLAUDE.md)을 참고하세요.

## 라이선스 및 면책

본 서비스는 재미를 위한 자가진단 콘텐츠이며 공식 심리검사를 대체하지 않습니다. 공식
MBTI(Myers-Briggs Type Indicator®)와는 무관한 자체 제작 콘텐츠입니다.
