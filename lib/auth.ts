import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";

// JWT 세션 전략을 사용합니다. PRD 7.3의 User 테이블은 provider+providerId만으로 식별되는
// 단일 소셜 계정 레코드라 NextAuth 기본 Prisma 어댑터(Account/Session 테이블 포함)를 쓰지
// 않고, 로그인 시 signIn/jwt 콜백에서 직접 users 테이블을 upsert합니다.
export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [Google],
  trustHost: true,
  session: { strategy: "jwt" },
  callbacks: {
    async signIn({ profile }) {
      if (!profile?.sub) return false;

      await prisma.user.upsert({
        where: { provider_providerId: { provider: "google", providerId: profile.sub } },
        update: {
          nickname: profile.name ?? "구글 사용자",
          profileImageUrl: typeof profile.picture === "string" ? profile.picture : null,
        },
        create: {
          provider: "google",
          providerId: profile.sub,
          nickname: profile.name ?? "구글 사용자",
          profileImageUrl: typeof profile.picture === "string" ? profile.picture : null,
        },
      });

      return true;
    },
    async jwt({ token, profile }) {
      if (profile?.sub) {
        const user = await prisma.user.findUnique({
          where: { provider_providerId: { provider: "google", providerId: profile.sub } },
        });
        if (user) {
          token.userId = user.id;
          token.nickname = user.nickname;
          token.profileImageUrl = user.profileImageUrl;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.userId) {
        session.user.id = token.userId;
        session.user.name = token.nickname ?? session.user.name;
        session.user.image = token.profileImageUrl ?? session.user.image;
      }
      return session;
    },
  },
});
