import { getPortalProject } from "@/lib/queries";
import { DEMO_CLIENT } from "@/lib/portalConfig";
import { notFound } from "next/navigation";
import { Card, CardBody, CardHeader, HealthPill, Progress, DivisionChip, Badge } from "@/components/ui";
import { CommHub } from "./CommHub";
import { DIVISION_COLORS, fmtDate } from "@/lib/format";
import { CheckCircle2, Circle, Clock, MessagesSquare, FileCheck2, Milestone, ClipboardList, Download } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

const MS_ICON = { DONE: CheckCircle2, IN_PROGRESS: Clock, PENDING: Circle };

export default async function ClientProjectDetail({ params }) {
  const p = await getPortalProject(DEMO_CLIENT, params.code);
  if (!p) notFound();

  return (
    <div>
      <div className="mb-6">
        <Link href="/client" className="text-xs text-slate-400 hover:text-brand-700">← My projects</Link>
        <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm text-slate-400">{p.code}</span>
              <HealthPill health={p.health} />
            </div>
            <h1 className="mt-1 text-2xl font-bold text-brand-900">{p.name}</h1>
            <p className="text-sm text-slate-500">{p.stage} · due {fmtDate(p.dueDate)}</p>
          </div>
          <div className="flex flex-wrap gap-1">
            {p.divisions.map((pd) => (
              <DivisionChip key={pd.id} code={pd.division.code} color={DIVISION_COLORS[pd.division.code]} />
            ))}
          </div>
        </div>
        <div className="mt-4 flex items-center gap-3">
          <Progress value={p.progress} tone={p.health === "RED" ? "red" : p.health === "AMBER" ? "amber" : "accent"} className="max-w-md" />
          <span className="text-sm font-semibold text-brand-900">{p.progress}%</span>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Milestones + reports */}
        <div className="space-y-4 lg:col-span-2">
          <Card>
            <CardHeader title="Milestones" subtitle="Project delivery roadmap" icon={Milestone} />
            <CardBody className="pt-2">
              <div className="space-y-2">
                {p.milestones.map((m) => {
                  const Icon = MS_ICON[m.status] || Circle;
                  const tone = m.status === "DONE" ? "text-health-green" : m.status === "IN_PROGRESS" ? "text-accent-600" : "text-slate-300";
                  return (
                    <div key={m.id} className="flex items-center justify-between rounded-lg border border-line px-3 py-2.5">
                      <div className="flex items-center gap-2.5">
                        <Icon size={17} className={tone} />
                        <span className="text-sm font-medium text-brand-900">{m.title}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400">{fmtDate(m.dueDate)}</span>
                        <Badge tone={m.status === "DONE" ? "green" : m.status === "IN_PROGRESS" ? "accent" : "slate"}>
                          {m.status.replace("_", " ")}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Weekly Status Reports" subtitle="Progress, risks & next steps" icon={ClipboardList} />
            <CardBody className="space-y-3 pt-2">
              {p.statusReports.map((r) => (
                <div key={r.id} className="rounded-xl border border-line p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-brand-900">{r.headline}</p>
                    <span className="text-[10px] text-slate-400">Week of {fmtDate(r.weekOf)}</span>
                  </div>
                  <p className="mt-1 text-xs text-slate-600">{r.summary}</p>
                  <div className="mt-2 grid gap-2 sm:grid-cols-2">
                    <div className="rounded-lg bg-amber-50 px-2.5 py-1.5">
                      <p className="text-[10px] font-semibold uppercase text-amber-700">Risks</p>
                      <p className="text-xs text-amber-800">{r.risks}</p>
                    </div>
                    <div className="rounded-lg bg-accent-50 px-2.5 py-1.5">
                      <p className="text-[10px] font-semibold uppercase text-accent-700">Next steps</p>
                      <p className="text-xs text-accent-800">{r.nextSteps}</p>
                    </div>
                  </div>
                </div>
              ))}
              {p.statusReports.length === 0 && <p className="py-4 text-center text-xs text-slate-400">No reports yet.</p>}
            </CardBody>
          </Card>

          {/* Approved deliverables */}
          <Card>
            <CardHeader title="Approved Deliverables" subtitle="Released to your vault" icon={FileCheck2} right={<Link href="/client/vault" className="pr-5 pt-5 text-xs text-brand-700 hover:underline">Open vault →</Link>} />
            <CardBody className="pt-2">
              <div className="grid gap-2 sm:grid-cols-2">
                {p.documents.map((d) => (
                  <div key={d.id} className="flex items-center justify-between rounded-lg border border-line px-3 py-2">
                    <div>
                      <p className="font-mono text-xs text-brand-900">{d.fileName}</p>
                      <p className="text-[10px] text-slate-400">Rev {d.revision} · {(d.fileSizeKb / 1024).toFixed(1)} MB</p>
                    </div>
                    <button className="grid h-8 w-8 place-items-center rounded-lg border border-line text-brand-600 hover:bg-brand-50"><Download size={13} /></button>
                  </div>
                ))}
                {p.documents.length === 0 && <p className="col-span-2 py-3 text-center text-xs text-slate-400">No approved documents yet.</p>}
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Communication hub */}
        <Card className="lg:sticky lg:top-20 lg:self-start">
          <CardHeader title="Communication Hub" subtitle="Talk directly to the delivery team" icon={MessagesSquare} />
          <CardBody className="pt-2">
            <CommHub projectId={p.id} code={p.code} messages={p.messages} />
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
