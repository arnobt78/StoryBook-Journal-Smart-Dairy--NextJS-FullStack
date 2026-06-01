/**
 * NextAuth module augmentation — TypeScript walkthrough
 * -----------------------------------------------------
 * next-auth ships default Session/JWT types without our custom fields.
 * declare module merges our shapes into those interfaces app-wide.
 *
 * Session.user.id — set in auth.ts JWT/session callbacks from provisionOAuthUser
 *   or credentials login; used by getServerSession, DashboardNav, API ownership.
 *
 * JWT.id — persisted in the encrypted cookie between requests; session callback
 *   copies token.id → session.user.id on each getSession().
 *
 * JWT.picture — optional avatar URL from OAuth; session may expose as user.image.
 *
 * No runtime code here — types only. Import "next-auth" ensures module exists.
 */
import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    picture?: string;
  }
}
