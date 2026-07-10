import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const authOptions = {
  secret: process.env.NEXTAUTH_SECRET || "datumos-secret-key-2026-military-grade",
  session: { strategy: "jwt", maxAge: 8 * 60 * 60 }, // 8-hour sessions
  // Force PLAIN (non-secure) cookie names on BOTH the auth handler and the edge
  // middleware. Behind a Cloudflare tunnel the browser is on https but the
  // origin sees http, so next-auth's auto __Secure- prefixing desyncs the two
  // sides and causes a post-login redirect loop. Pinning non-secure names +
  // useSecureCookies:false keeps the handler, middleware getToken(), and the
  // browser cookie all in agreement. (Use secure cookies on a real HTTPS origin.)
  useSecureCookies: false,
  cookies: {
    sessionToken: {
      name: "next-auth.session-token",
      options: { httpOnly: true, sameSite: "lax", path: "/", secure: false },
    },
    callbackUrl: {
      name: "next-auth.callback-url",
      options: { sameSite: "lax", path: "/", secure: false },
    },
    csrfToken: {
      name: "next-auth.csrf-token",
      options: { httpOnly: true, sameSite: "lax", path: "/", secure: false },
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "DatumOS Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.authUser.findUnique({
          where: { email: credentials.email.toLowerCase().trim() },
        });

        if (!user || !user.active) return null;

        const valid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          linkedEntityId: user.linkedEntityId,
          linkedEntityType: user.linkedEntityType,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.linkedEntityId = user.linkedEntityId;
        token.linkedEntityType = user.linkedEntityType;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub;
        session.user.role = token.role;
        session.user.linkedEntityId = token.linkedEntityId;
        session.user.linkedEntityType = token.linkedEntityType;
      }
      return session;
    },
    // Keep post-login redirects relative to whatever host served the request
    // (fixes tunnel deploys where NEXTAUTH_URL points at localhost).
    async redirect({ url, baseUrl }) {
      try {
        // Relative callback → keep as-is under the current origin
        if (url.startsWith("/")) return url;
        const u = new URL(url);
        const b = new URL(baseUrl);
        // Same host → allow; otherwise rewrite path onto the real request origin
        if (u.host === b.host) return url;
        return b.origin + u.pathname + u.search;
      } catch {
        return baseUrl;
      }
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
