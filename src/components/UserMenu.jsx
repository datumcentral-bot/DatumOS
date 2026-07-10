"use client";
/**
 * DatumOS — UserMenu
 * Shows the logged-in user's avatar, name, role badge, and a logout button.
 * Used in PortalShell sidebar and public header.
 */
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

const ROLE_COLORS = {
  DIRECTOR: { bg: "bg-olive-700", text: "text-olive-100", label: "DIRECTOR" },
  MEMBER: { bg: "bg-sand-700", text: "text-sand-100", label: "MEMBER" },
  CLIENT: { bg: "bg-amber-800", text: "text-amber-100", label: "CLIENT" },
};

function initials(name = "") {
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

export default function UserMenu({ compact = false }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  if (status === "loading") {
    return <div className="w-8 h-8 rounded-full bg-olive-800 animate-pulse" />;
  }

  if (!session?.user) {
    return (
      <button
        onClick={() => router.push("/login")}
        className="text-xs text-olive-400 hover:text-sand-200 border border-olive-700 hover:border-olive-500 px-3 py-1.5 rounded transition-colors uppercase tracking-widest"
      >
        Login
      </button>
    );
  }

  const { name, role } = session.user;
  const roleStyle = ROLE_COLORS[role] ?? ROLE_COLORS.MEMBER;

  async function handleLogout() {
    await signOut({ redirect: false });
    router.push("/login");
  }

  if (compact) {
    return (
      <div className="relative">
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          title={name}
        >
          <div className={`w-8 h-8 rounded-full ${roleStyle.bg} flex items-center justify-center text-xs font-bold ${roleStyle.text}`}>
            {initials(name)}
          </div>
        </button>
        {open && (
          <div className="absolute right-0 top-10 w-52 bg-hud-card border border-olive-700 rounded-lg shadow-2xl z-50 overflow-hidden">
            <div className="px-4 py-3 border-b border-olive-800">
              <p className="text-sand-100 text-sm font-semibold truncate">{name}</p>
              <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded ${roleStyle.bg} ${roleStyle.text} font-mono`}>
                {roleStyle.label}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-3 text-red-400 hover:bg-red-950/30 text-sm transition-colors flex items-center gap-2"
            >
              <span>⏻</span> Sign Out
            </button>
          </div>
        )}
      </div>
    );
  }

  // Full sidebar version
  return (
    <div className="border-t border-olive-800 pt-4 mt-4">
      <div className="flex items-center gap-3 px-2">
        <div className={`w-9 h-9 rounded-full ${roleStyle.bg} flex items-center justify-center text-sm font-bold ${roleStyle.text} flex-shrink-0`}>
          {initials(name)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sand-100 text-sm font-medium truncate">{name}</p>
          <span className={`text-xs font-mono ${roleStyle.text} opacity-80`}>{roleStyle.label}</span>
        </div>
        <button
          onClick={handleLogout}
          title="Sign out"
          className="text-olive-600 hover:text-red-400 transition-colors text-lg leading-none"
        >
          ⏻
        </button>
      </div>
    </div>
  );
}
