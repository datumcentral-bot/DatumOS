import { getProjectByCode } from "@/lib/queries";
import { notFound } from "next/navigation";
import { Card, CardBody, CardHeader, HealthPill, Progress, DivisionChip, Avatar, Badge } from "@/components/ui";
import { TaskBoard } from "./TaskBoard";
import { DIVISION_COLORS, fmtDate, validateFileName } from "@/lib/format";
import { Folder, FileStack, GitCompareArrows, MessageSquareWarning, ListTodo, CheckCircle2, XCircle } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

const DOC_TONE = { APPROVED: "green", SHARED: "blue", FOR_REVIEW: "amber", WIP: "slate", SUPERSEDED: "red" };
const CLASH_TONE = { OPEN: "red", ASSIGNED: "amber", RESOLVED: "blue", CLOSED: "green" };
const RFI_TONE = { OPEN: "red", ANSWERED: "amber", CLOSED: "green" };

export default async function ProjectWorkspace({ params }) {
  const project = await getProjectByCode(params.code);
  if (!project) notFound();

  const doneTasks = project.tasks.filter((t) => t.status === "DONE").length;

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <Link href="/workspace" className="text-xs text-slate-400 hover:text-brand-700">← All projects</Link>
        <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm text-slate-400">{project.code}</span>
              <HealthPill health={project.health} />
            </div>
            <h1 className="mt-1 text-2xl font-bold text-brand-900">{project.name}</h1>
            <p className="text-sm text-slate-500">{project.client.companyName} · {project.client.country} · {project.stage}</p>
          </div>
          <div className="flex flex-wrap gap-1">
            {project.divisions.map((pd) => (
              <DivisionChip key={pd.id} code={pd.division.code} color={DIVISION_COLORS[pd.division.code]} />
            ))}
          </div>
        </div>
        <div className="mt-4 flex items-center gap-3">
          <Progress value={project.progress} tone="accent" className="max-w-md" />
          <span className="text-sm font-semibold text-brand-900">{project.progress}%</span>
          <span className="text-xs text-slate-400">Due {fmtDate(project.dueDate)}</span>
        </div>
      </div>

      {/* Delivery folder structure + team */}
      <div className="grid gap-4 lg:grid-cols-4">
        <Card className="lg:col-span-3">
          <CardHeader title="Delivery Folder Structure" subtitle="ISO-19650-style Common Data Environment (CDE)" icon={Folder} />
          <CardBody className="pt-2">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
              {project.folders.map((f) => {
                const count = project.documents.filter((d) => d.folder === f.name).length;
                return (
                  <div key={f.id} className="rounded-xl border border-line bg-surface-muted p-3">
                    <Folder size={18} className="text-brand-600" />
                    <p className="mt-2 text-xs font-semibold text-brand-900">{f.name}</p>
                    <p className="text-[10px] text-slate-400">{count} file{count !== 1 ? "s" : ""}</p>
                  </div>
                );
              })}
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Project Team" icon={ListTodo} />
          <CardBody className="pt-2">
            <div className="space-y-2">
              {project.assignments.map((a) => (
                <div key={a.id} className="flex items-center gap-2.5">
                  <Avatar name={a.user.name} hue={a.user.avatarHue} size={30} />
                  <div className="min-w-0">
                    <p className="truncate text-xs font-medium text-brand-900">{a.user.name}</p>
                    <p className="truncate text-[10px] text-slate-500">{a.roleOnProject} · {a.allocationPct}%</p>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Task & SOP engine */}
      <div className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-brand-900">Task &amp; SOP Engine</h2>
            <p className="text-xs text-slate-400">{doneTasks}/{project.tasks.length} tasks complete · every task enforces a mandatory QA/QC checklist before it can be closed.</p>
          </div>
        </div>
        <TaskBoard tasks={project.tasks} code={project.code} />
      </div>

      {/* Documents */}
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Document Control" subtitle="Naming standard enforced" icon={FileStack} right={<Link href="/workspace/documents" className="pr-5 pt-5 text-xs text-brand-700 hover:underline">All documents →</Link>} />
          <CardBody className="pt-2">
            <div className="space-y-1.5">
              {project.documents.slice(0, 6).map((d) => (
                <div key={d.id} className="flex items-center justify-between rounded-lg border border-line px-3 py-2">
                  <div className="min-w-0">
                    <p className="truncate font-mono text-xs text-brand-900">{d.fileName}</p>
                    <p className="text-[10px] text-slate-400">{d.folder} · {(d.fileSizeKb / 1024).toFixed(1)} MB</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {d.namingValid ? (
                      <span title="Naming valid"><CheckCircle2 size={14} className="text-health-green" /></span>
                    ) : (
                      <span title="Non-standard name"><XCircle size={14} className="text-red-500" /></span>
                    )}
                    <Badge tone={DOC_TONE[d.status]}>{d.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        {/* Clash & RFI */}
        <div className="space-y-4">
          <Card>
            <CardHeader title="Clash Detection" subtitle="Coordination issues" icon={GitCompareArrows} />
            <CardBody className="pt-2">
              <div className="space-y-1.5">
                {project.clashes.slice(0, 4).map((c) => (
                  <div key={c.id} className="flex items-center justify-between rounded-lg border border-line px-3 py-2">
                    <div>
                      <p className="text-xs font-medium text-brand-900">{c.ref} · {c.title}</p>
                      <p className="text-[10px] text-slate-400">{c.disciplines} · {c.zone}</p>
                    </div>
                    <Badge tone={CLASH_TONE[c.status]}>{c.status}</Badge>
                  </div>
                ))}
                {project.clashes.length === 0 && <p className="py-3 text-center text-xs text-slate-400">No clashes.</p>}
              </div>
            </CardBody>
          </Card>
          <Card>
            <CardHeader title="RFIs" subtitle="Requests for information" icon={MessageSquareWarning} />
            <CardBody className="pt-2">
              <div className="space-y-1.5">
                {project.rfis.slice(0, 4).map((r) => (
                  <div key={r.id} className="flex items-center justify-between rounded-lg border border-line px-3 py-2">
                    <div>
                      <p className="text-xs font-medium text-brand-900">{r.ref} · {r.subject}</p>
                      <p className="text-[10px] text-slate-400">{r.discipline} · {r.priority}</p>
                    </div>
                    <Badge tone={RFI_TONE[r.status]}>{r.status}</Badge>
                  </div>
                ))}
                {project.rfis.length === 0 && <p className="py-3 text-center text-xs text-slate-400">No RFIs.</p>}
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
