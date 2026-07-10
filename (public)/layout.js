import { PublicHeader, PublicFooter } from "@/components/public";

export default function PublicLayout({ children }) {
  return (
    <div className="flex min-h-screen flex-col bg-hud-950">
      <PublicHeader />
      <main className="flex-1">{children}</main>
      <PublicFooter />
    </div>
  );
}
