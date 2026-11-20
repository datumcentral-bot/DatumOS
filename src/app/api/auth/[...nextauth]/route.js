import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

// DN038: the hardcoded fallback secret is removed. Previously the auth handler
// silently fell back to a value published in source when NEXTAUTH_SECRET was
// unset, which meant any deployment missing the variable still ran with a
// publicly known signing key - forgeable session and CSRF cookies, including
// role: DIRECTOR. With no fallback, NextAuth receives undefined and fails
// closed instead. No replacement value is introduced and the secret is never
// rotated by this change.
if (!process.env.NEXTAUTH_SECRET) {
  throw new Error(
    "NEXTAUTH_SECRET is not set. DatumBIM OS refuses to start its auth handler " +
      "without it; supply it through the deployment environment. There is no " +
      "built-in default."
  );
}

export const authOptions = {
  secret: process.env.NEXTAUTH_SECRET,
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
    // Keep post-login redirects on the application origin (RR-11). Only
    // single-slash app-relative paths are passed through: "//host" and
    // "/\host" are protocol-relative in browsers and would be an open
    // redirect, so they fall through to the checks below. Absolute URLs are
    // accepted only when they match the configured app origin AND normalise
    // to a safe app path; anything external or malformed is rejected by
    // returning the app root — credentials auth has no legitimate external
    // callback target, and a rejection must never leave the app origin.
    async redirect({ url, baseUrl }) {
      try {
        // Simple app-relative target (single leading slash, no tricks) → keep.
        if (url.startsWith("/") && !url.startsWith("//") && !url.startsWith("/\\")) return url;
        const u = new URL(url, baseUrl);
        const b = new URL(baseUrl);
        const path = u.pathname + u.search;
        const appPath =
          path.startsWith("/") && !path.startsWith("//") && !path.includes("\\");
        if (u.origin === b.origin && appPath) return path;
        return "/"; // external or malformed → reject (stays on this origin)
      } catch {
        return "/";
      }
    },
  },
};

// ── RR-11: keep every auth redirect on the origin that served the request ────
// next-auth resolves its redirects against NEXTAUTH_URL, which can differ from
// the origin this process is actually serving (local preview, tunneled
// deploys). Failed logins and some post-login hops were landing on the
// NEXTAUTH_URL origin instead of the origin the user is on. `rebaseAuthTarget`
// rewrites absolute / protocol-relative targets onto the request origin —
// the validated, intended application origin — and drops anything that is not
// http(s). App-relative targets (single leading slash) are already correct:
// browsers resolve them against the current origin.
function rebaseAuthTarget(target, origin) {
  if (typeof target !== "string" || target === "") return null;
  if (target.startsWith("/") && !target.startsWith("//") && !target.startsWith("/\\")) {
    return null; // safe app-relative path — nothing to rebase
  }
  let u;
  try {
    u = new URL(target, origin); // base argument parses protocol-relative "//host"
  } catch {
    return null; // malformed → leave alone (stays relative → same origin)
  }
  if (u.protocol !== "http:" && u.protocol !== "https:") return `${origin}/login`;
  const path = "/" + (u.pathname || "/").replace(/^[/\\]+/, "");
  const abs = origin + path + u.search + u.hash;
  return abs === target ? null : abs;
}

// Rebuild a response with a mutated body/headers while preserving every
// header exactly (including multiple Set-Cookie entries, which a plain
// `new Headers(res.headers)` copy can collapse).
function rebuild(res, body, mutate) {
  const headers = new Headers(res.headers);
  if (typeof res.headers.getSetCookie === "function") {
    const cookies = res.headers.getSetCookie();
    headers.delete("set-cookie");
    for (const c of cookies) headers.append("set-cookie", c);
  }
  mutate(headers);
  return new Response(body, { status: res.status, statusText: res.statusText, headers });
}

const handler = NextAuth(authOptions);

// The validated, intended application origin = the authority the client
// actually used to reach this request. Taken from the Host header (wire
// truth) rather than from the derived request URL: for loopback requests
// Next's `req.url` reported the `localhost` alias even when the client
// connected to `127.0.0.1`, which swapped hostnames mid-error-chain (RR-11
// observation). x-forwarded-host is honoured only when Host is absent, so a
// client cannot override the authority it connected with.
function servingOrigin(req) {
  try {
    const host = req.headers.get("host");
    if (host) {
      const proto = req.headers.get("x-forwarded-proto") || "http";
      return `${proto.split(",")[0].trim()}://${host}`;
    }
    return new URL(req.url).origin;
  } catch {
    return null;
  }
}

async function guardedHandler(req, ...rest) {
  // Capture the origin BEFORE handing the request to next-auth; forward
  // every argument (the App Router passes catch-all route context as the
  // second argument — dropping it breaks next-auth's `nextauth` lookup).
  const origin = servingOrigin(req);
  const res = await handler(req, ...rest);
  if (!origin) return res;

  // 1) Location header (server-side redirects: error hops, signin/signout)
  const loc = res.headers.get("location");
  if (loc !== null) {
    const fixed = rebaseAuthTarget(loc, origin);
    if (!fixed) return res;
    return rebuild(res, res.body, (h) => h.set("location", fixed));
  }

  // 2) JSON {url} body — next-auth/react `signIn({ redirect: true })` reads
  //    this and assigns it to window.location.href on the client.
  const ct = res.headers.get("content-type") || "";
  if (!ct.includes("application/json")) return res;
  const text = await res.clone().text(); // clone → original body stays usable
  let payload;
  try {
    payload = JSON.parse(text);
  } catch {
    return res;
  }
  if (!payload || typeof payload.url !== "string") return res;
  const fixed = rebaseAuthTarget(payload.url, origin);
  if (!fixed) return res;
  payload.url = fixed;
  return rebuild(res, JSON.stringify(payload), (h) => h.delete("content-length"));
}

export { guardedHandler as GET, guardedHandler as POST };
