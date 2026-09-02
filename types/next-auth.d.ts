import type { DefaultSession } from "next-auth";

// lib/auth.ts의 session/jwt 콜백이 채워 넣는 필드에 대한 타입 보강.
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}

// next-auth/jwt.d.ts는 @auth/core/jwt를 그대로 re-export할 뿐이라, 콜백 시그니처가
// 실제로 참조하는 원본 모듈(@auth/core/jwt)을 직접 보강해야 선언 병합이 적용됩니다.
declare module "@auth/core/jwt" {
  interface JWT {
    userId?: string;
    nickname?: string;
    profileImageUrl?: string | null;
  }
}
