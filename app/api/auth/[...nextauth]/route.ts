import NextAuth from "next-auth";
import type { NextAuthConfig } from "next-auth";

const config: NextAuthConfig = {
  providers: [],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/auth/error",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.roles = (user as { roles?: string[] }).roles ?? ["operator"];
        token.orgId = (user as { orgId?: string }).orgId ?? "meridian";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { roles?: string[] }).roles = token.roles as string[];
        (session.user as { orgId?: string }).orgId = token.orgId as string;
      }
      return session;
    },
  },
};

const { handlers } = NextAuth(config);
export const { GET, POST } = handlers;
