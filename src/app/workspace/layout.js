"use client";

import PortalShell from "@/components/PortalShell";

const NAV = [
  {
    label: "OVERVIEW",
    items: [
      { href: "/workspace",            icon: "⬡", label: "Dashboard" },
      { href: "/workspace/profile",    icon: "◑", label: "My Profile" },
    ],
  },
  {
    label: "WORK",
    items: [
      { href: "/workspace/tasks",      icon: "◈", label: "My Tasks" },
      { href: "/workspace/board",      icon: "◉", label: "Task Board" },
      { href: "/workspace/projects",   icon: "◆", label: "My Projects" },
      { href: "/workspace/timesheets", icon: "◇", label: "Timesheets" },
    ],
  },
  {
    label: "RESOURCES",
    items: [
      { href: "/workspace/documents",  icon: "◎", label: "Documents" },
      { href: "/workspace/meetings",   icon: "◐", label: "Meetings" },
      { href: "/workspace/coordination", icon: "⊕", label: "Coordination" },
      { href: "/workspace/sops",       icon: "◈", label: "SOPs" },
      { href: "/workspace/knowledge",  icon: "📚", label: "Knowledge Base" },
      { href: "/workspace/knowledge-base", icon: "◈", label: "Knowledge Base" },
    ],
  },
];

export default function WorkspaceLayout({ children }) {
  return (
    <PortalShell navSections={NAV} portalLabel="WORKSPACE PORTAL" portalColor="#6b8e23">
      {children}
    </PortalShell>
  );
}