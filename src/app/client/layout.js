"use client";

import PortalShell from "@/components/PortalShell";
import AIChatWidget from "@/components/AIChatWidget";

const NAV = [
  {
    label: "OVERVIEW",
    items: [
      { href: "/client",           icon: "⬡", label: "Dashboard" },
      { href: "/client/profile",   icon: "◑", label: "My Profile" },
    ],
  },
  {
    label: "PROJECTS",
    items: [
      { href: "/client/projects",  icon: "◆", label: "My Projects" },
      { href: "/client/documents", icon: "◎", label: "Documents" },
      { href: "/client/approvals", icon: "◈", label: "Approvals" },
      { href: "/client/vault",     icon: "◇", label: "Document Vault" },
    ],
  },
  {
    label: "FINANCE",
    items: [
      { href: "/client/invoices",  icon: "◇", label: "Invoices" },
      { href: "/client/billing",   icon: "◈", label: "Billing" },
    ],
  },
  {
    label: "SUPPORT",
    items: [
      { href: "/client/meetings",  icon: "◐", label: "Meetings" },
      { href: "/client/support",    icon: "◈", label: "Support" },
      { href: "/client/knowledge",  icon: "📚", label: "Knowledge Base" },
    ],
  },
];

export default function ClientLayout({ children }) {
  return (
    <PortalShell navSections={NAV} portalLabel="CLIENT PORTAL" portalColor="#4cc9f0">
      {children}
      <AIChatWidget />
    </PortalShell>
  );
}