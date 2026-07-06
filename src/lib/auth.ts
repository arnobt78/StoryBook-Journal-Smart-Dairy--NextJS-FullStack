/**
 * @file lib/auth.ts
 *
 * WALKTHROUGH — NextAuth v5 (Auth.js) central configuration
 * ─────────────────────────────────────────────────────────
 * Used by: `src/app/api/auth/[...nextauth]/route.ts`, every `auth()` call in
 * Server Components + Route Handlers, and `SessionProvider` on the client.
 *
 * Flow:
 *  1. Providers — Google OAuth (optional via env) + Credentials (email/password).
 *  2. `authorize` — bcrypt compare against Prisma `User.passwordHash`; updates `lastLoginAt`.
 *  3. `signIn` callback — Google users upserted via `provisionOAuthUser` so JWT carries Prisma cuid.
 *  4. `jwt` / `session` callbacks — copy `user.id` + avatar into the client session.
 *  5. Export `auth()`, `signIn`, `signOut`, `handlers` for App Router integration.
 *
 * Session strategy: JWT (no DB session table). `session.user.id` is the ownership key for all APIs.
 */
/**
 * NextAuth v5 configuration — session/JWT strategy for the whole app.
 *
 * Walkthrough:
 * 1. Providers: Google (optional via env) + Credentials (email/password + bcrypt).
 * 2. `signIn` callback: Google users are upserted via `provisionOAuthUser` so JWT carries Prisma cuid.
 * 3. `jwt` / `session` callbacks: copy `user.id` + avatar into the client session.
 * 4. Export `auth()` for Server Components, Route Handlers, and `src/proxy.ts`.
 */
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { prisma } from "@/lib/db";
import { getGoogleOAuthEnv } from "@/lib/auth/google-oauth-env";
import { provisionOAuthUser } from "@/lib/auth/provision-oauth-user";
import bcrypt from "bcryptjs";
import type { NextAuthConfig } from "next-auth";

const googleOAuth = getGoogleOAuthEnv();

export const authConfig: NextAuthConfig = {
  providers: [
    ...(googleOAuth.enabled && googleOAuth.clientId && googleOAuth.clientSecret
      ? [
          Google({
            clientId: googleOAuth.clientId,
            clientSecret: googleOAuth.clientSecret,
          }),
        ]
      : []),
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        /* Credentials flow: lookup User → bcrypt compare → touch lastLoginAt */
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user?.passwordHash) return null;

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash
        );

        if (!isValid) return null;

        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        });

        return {
          id: user.id,
          email: user.email,
          name: user.displayName ?? user.email.split("@")[0],
          image: user.avatarUrl ?? null,
        };
      },
    }),
  ],
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  callbacks: {
    async signIn({ user, account, profile }) {
      /* Google OAuth: persist/link Prisma user before JWT is minted */
      if (account?.provider !== "google" || !user.email) {
        return true;
      }

      try {
        const googleProfile = profile as
          | { name?: string; picture?: string; email_verified?: boolean }
          | undefined;

        const dbUser = await provisionOAuthUser({
          email: user.email,
          displayName: user.name ?? googleProfile?.name ?? null,
          avatarUrl: user.image ?? googleProfile?.picture ?? null,
        });

        user.id = dbUser.id;
        user.name = dbUser.displayName ?? user.name;
        user.image = dbUser.avatarUrl ?? user.image;
        return true;
      } catch {
        return false;
      }
    },
    jwt({ token, user }) {
      /* First sign-in only: embed DB user id + picture on the JWT */
      if (user?.id) token.id = user.id;
      if (user?.image) token.picture = user.image;
      return token;
    },
    session({ session, token }) {
      if (token.id) session.user.id = token.id as string;
      if (token.picture && session.user) {
        session.user.image = token.picture as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  trustHost: true,
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
