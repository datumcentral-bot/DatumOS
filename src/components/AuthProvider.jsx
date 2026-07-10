"use client";
/**
 * DatumOS — AuthProvider
 * Wraps the app in NextAuth SessionProvider so useSession() works everywhere.
 */
import { SessionProvider } from "next-auth/react";

export default function AuthProvider({ children, session }) {
  return <SessionProvider session={session}>{children}</SessionProvider>;
}
