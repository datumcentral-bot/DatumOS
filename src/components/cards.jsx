// Reusable card components adapted from TSX originals (ServiceCard, ProjectCard, ResourceCard)
// Styled to match the DatumOS military olive-green + sand HUD theme.

import Link from "next/link";
import { ArrowRight, Calendar, Tag, Layers, Globe2 } from "lucide-react";
import { cn } from "../lib/cn";

// ─── ServiceCard ─────────────────────────────────────────────────────────────
// Props: { service: { id, code, name, description, colorHex, isFlagship } }
export function ServiceCard({ service, href }) {
  const target = href || `/services#${service.code?.toLowerCase() || service.id}`;
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-hud-line/50 bg-hud-900 transition hover:-translate-y-0.5 hover:border-sand-500/40 hover:shadow-lg hover:shadow-sand-500/5">
      {/* colour accent bar */}
      <div
        className="h-1 w-full"
        style={{ background: service.colorHex || "#8B7355" }}
      />
      {service.isFlagship && (
        <span className="absolute right-3 top-3 rounded-full bg-sand-500/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-sand-300">
          Flagship
        </span>
      )}
      <div className="flex flex-1 flex-col p-5">
        <p className="text-[10px] font-bold uppercase tracking-widest text-sand-400">{service.code}</p>
        <h3 className="mt-1.5 text-base font-extrabold text-sand-50">{service.name}</h3>
        {service.description && (
          <p className="mt-2 flex-1 text-sm leading-6 text-sand-200/60 line-clamp-3">{service.description}</p>
        )}
        <Link
          href={target}
          className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-sand-400 transition hover:text-sand-200"
        >
          Learn more <ArrowRight size={14} />
        </Link>
      </div>
    </article>
  );
}

// ─── ProjectCard ─────────────────────────────────────────────────────────────
// Props: { project: Prisma Project (with client relation) }
export function ProjectCard({ project, href }) {
  const target = href || `/projects`;
  const statusColor = {
    ACTIVE: "text-health-green bg-health-green/10 border-health-green/30",
    ON_HOLD: "text-amber-400 bg-amber-400/10 border-amber-400/30",
    COMPLETED: "text-sand-400 bg-sand-400/10 border-sand-400/30",
    ARCHIVED: "text-sand-300/50 bg-sand-300/5 border-sand-300/20",
  }[project.status] || "text-sand-400 bg-sand-400/10 border-sand-400/30";

  const healthDot = {
    GREEN: "bg-health-green",
    AMBER: "bg-amber-400",
    RED: "bg-red-400",
  }[project.health] || "bg-sand-400";

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-hud-line/50 bg-hud-900 transition hover:-translate-y-0.5 hover:border-sand-500/40 hover:shadow-lg hover:shadow-sand-500/5">
      {/* progress bar */}
      <div className="h-1 w-full bg-hud-800">
        <div
          className="h-full bg-sand-500 transition-all"
          style={{ width: `${project.progress || 0}%` }}
        />
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-sand-400">{project.code}</p>
            <h3 className="mt-0.5 text-base font-extrabold text-sand-50 leading-tight">{project.name}</h3>
          </div>
          <span className={cn("shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide", statusColor)}>
            {project.status}
          </span>
        </div>

        {project.client && (
          <p className="mt-2 flex items-center gap-1.5 text-xs text-sand-300/60">
            <Globe2 size={12} /> {project.client.companyName} · {project.client.country}
          </p>
        )}

        {project.description && (
          <p className="mt-2 flex-1 text-sm leading-6 text-sand-200/60 line-clamp-2">{project.description}</p>
        )}

        <div className="mt-4 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-xs text-sand-300/60">
            <span className={cn("h-2 w-2 rounded-full", healthDot)} />
            {project.progress || 0}% complete
          </div>
          {project.stage && (
            <span className="rounded-full bg-hud-800 px-2 py-0.5 text-[10px] font-semibold text-sand-300/70">
              {project.stage}
            </span>
          )}
        </div>

        <Link
          href={target}
          className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-sand-400 transition hover:text-sand-200"
        >
          View project <ArrowRight size={14} />
        </Link>
      </div>
    </article>
  );
}

// ─── ResourceCard ─────────────────────────────────────────────────────────────
// Props: { resource: { id, title, type, summary, publishedAt, href } }
export function ResourceCard({ resource }) {
  const target = resource.href || `/resources`;
  const typeColor = {
    "Case Study": "text-sand-300 bg-sand-500/15 border-sand-500/30",
    "White Paper": "text-olive-300 bg-olive-500/15 border-olive-500/30",
    Guide: "text-health-green bg-health-green/10 border-health-green/30",
    Webinar: "text-amber-300 bg-amber-500/10 border-amber-500/30",
    Blog: "text-sand-400 bg-sand-400/10 border-sand-400/20",
  }[resource.type] || "text-sand-400 bg-sand-400/10 border-sand-400/20";

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-hud-line/50 bg-hud-900 transition hover:-translate-y-0.5 hover:border-sand-500/40 hover:shadow-lg hover:shadow-sand-500/5">
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center justify-between gap-2">
          <span className={cn("rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide", typeColor)}>
            {resource.type}
          </span>
          {resource.publishedAt && (
            <span className="flex items-center gap-1 text-[11px] text-sand-300/50">
              <Calendar size={11} />
              {new Date(resource.publishedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
            </span>
          )}
        </div>
        <h3 className="mt-3 text-base font-extrabold text-sand-50 leading-snug">{resource.title}</h3>
        {resource.summary && (
          <p className="mt-2 flex-1 text-sm leading-6 text-sand-200/60 line-clamp-3">{resource.summary}</p>
        )}
        <Link
          href={target}
          className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-sand-400 transition hover:text-sand-200"
        >
          Read more <ArrowRight size={14} />
        </Link>
      </div>
    </article>
  );
}

// ─── LeadCard (for admin panel quick view) ───────────────────────────────────
export function LeadCard({ lead, onEdit, onDelete }) {
  const stageColor = {
    TO_CONTACT: "text-sand-300 bg-sand-500/10 border-sand-500/20",
    CONTACTED: "text-amber-300 bg-amber-500/10 border-amber-500/20",
    MEETING_BOOKED: "text-blue-300 bg-blue-500/10 border-blue-500/20",
    PROPOSAL_SENT: "text-purple-300 bg-purple-500/10 border-purple-500/20",
    WON: "text-health-green bg-health-green/10 border-health-green/30",
    LOST: "text-red-400 bg-red-500/10 border-red-500/20",
  }[lead.stage] || "text-sand-400 bg-sand-400/10 border-sand-400/20";

  return (
    <div className="flex items-start justify-between gap-3 rounded-xl border border-hud-line/50 bg-hud-900 p-4">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-bold text-sand-100 truncate">{lead.contactName}</p>
          <span className={cn("rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide", stageColor)}>
            {lead.stage.replace(/_/g, " ")}
          </span>
        </div>
        <p className="mt-0.5 text-xs text-sand-300/60">{lead.company} · {lead.country || "—"}</p>
        {lead.serviceInterest && (
          <p className="mt-1 flex items-center gap-1 text-xs text-sand-300/50">
            <Tag size={11} /> {lead.serviceInterest}
          </p>
        )}
        {lead.notes && <p className="mt-1 text-xs text-sand-300/50 line-clamp-1">{lead.notes}</p>}
      </div>
      <div className="flex shrink-0 gap-1">
        {onEdit && (
          <button onClick={() => onEdit(lead)} className="rounded-lg border border-hud-line/50 px-2 py-1 text-xs text-sand-300 hover:bg-hud-800">
            Edit
          </button>
        )}
        {onDelete && (
          <button onClick={() => onDelete(lead.id)} className="rounded-lg border border-red-500/30 px-2 py-1 text-xs text-red-400 hover:bg-red-500/10">
            Del
          </button>
        )}
      </div>
    </div>
  );
}
