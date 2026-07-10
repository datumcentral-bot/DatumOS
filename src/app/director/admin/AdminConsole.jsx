"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardBody, Badge, HealthPill, Avatar, Progress, DivisionChip } from "@/components/ui";
import { Modal, Field, useToast } from "@/components/forms";
import {
  Building2, FolderKanban, ListChecks, Users2, Layers, Plus, Pencil, Trash2, UserPlus, X,
  Inbox, Mail, Code2, Tag, Globe2, CheckCircle2, AlertCircle, RefreshCw,
} from "lucide-react";
import * as A from "./actions";
import { money } from "@/lib/format";

const TABS = [
  { key: "clients", label: "Clients", icon: Building2 },
  { key: "projects", label: "Projects", icon: FolderKanban },
  { key: "scope", label: "Scope & Tasks", icon: ListChecks },
  { key: "team", label: "Team & Assignments", icon: Users2 },
  { key: "leads", label: "Leads & Quotes", icon: Inbox },
  { key: "newsletter", label: "Newsletter", icon: Mail },
  { key: "cms", label: "CMS Editor", icon: Code2 },
];

export function AdminConsole({ clients, projects, members, divisions }) {
  const [tab, setTab] = useState("clients");
  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-2">
        {TABS.map((t) => {
          const Icon = t.icon;
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`inline-flex items-center gap-2 rounded-lg border px-3.5 py-2 text-sm font-semibold transition-colors ${
                active ? "border-olive-700 bg-olive-700 text-sand-50" : "border-line bg-white text-olive-700 hover:bg-olive-50"
              }`}
            >
              <Icon size={16} /> {t.label}
            </button>
          );
        })}
      </div>

      {tab === "clients" && <ClientsTab clients={clients} />}
      {tab === "projects" && <ProjectsTab projects={projects} clients={clients} divisions={divisions} />}
      {tab === "scope" && <ScopeTab projects={projects} members={members} divisions={divisions} />}
      {tab === "team" && <TeamTab members={members} projects={projects} />}
      {tab === "leads" && <LeadsTab />}
      {tab === "newsletter" && <NewsletterTab />}
      {tab === "cms" && <CmsEditorTab />}
    </div>
  );
}

// helper to run an action from a form and toast the result
function useAction() {
  const router = useRouter();
  const toast = useToast();
  const [pending, start] = useTransition();
  const run = (fn, onOk) =>
    start(async () => {
      const res = await fn();
      if (res?.ok === false) toast(res.message || "Something went wrong.", "err");
      else {
        toast("Saved.", "ok");
        onOk?.();
        router.refresh();
      }
    });
  return { pending, run };
}

// ── CLIENTS ───────────────────────────────────────────────────────────────────
function ClientsTab({ clients }) {
  const [modal, setModal] = useState(null); // {mode, client}
  const { pending, run } = useAction();

  function submit(e) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    run(() => (modal.mode === "edit" ? A.updateClient(fd) : A.createClient(fd)), () => setModal(null));
  }
  function del(id) {
    if (!confirm("Delete this client? (only allowed if they have no projects)")) return;
    run(() => A.deleteClient(id));
  }

  return (
    <Card>
      <div className="flex items-center justify-between px-5 pt-5">
        <h3 className="text-sm font-bold text-olive-900">Clients ({clients.length})</h3>
        <button className="btn-primary" onClick={() => setModal({ mode: "create", client: {} })}>
          <Plus size={16} /> New client
        </button>
      </div>
      <CardBody>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="table-th">Company</th>
                <th className="table-th">Country</th>
                <th className="table-th">Contact</th>
                <th className="table-th">Projects</th>
                <th className="table-th text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((c) => (
                <tr key={c.id}>
                  <td className="table-td font-semibold text-olive-900">
                    <div className="flex items-center gap-2">
                      <Avatar name={c.companyName} hue={c.logoHue || "#7c8340"} size={28} />
                      {c.companyName}
                    </div>
                  </td>
                  <td className="table-td">{c.country}{c.city ? ` · ${c.city}` : ""}</td>
                  <td className="table-td">{c.contactName}<br /><span className="text-xs text-olive-400">{c.contactEmail}</span></td>
                  <td className="table-td"><Badge tone="olive">{c._count.projects}</Badge></td>
                  <td className="table-td">
                    <div className="flex justify-end gap-1.5">
                      <button className="btn-ghost px-2 py-1" onClick={() => setModal({ mode: "edit", client: c })}><Pencil size={15} /></button>
                      <button className="btn-ghost px-2 py-1 text-health-red" onClick={() => del(c.id)}><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardBody>

      <Modal open={!!modal} onClose={() => setModal(null)} title={modal?.mode === "edit" ? "Edit client" : "New client"}>
        {modal && (
          <form onSubmit={submit} className="space-y-4">
            {modal.mode === "edit" && <input type="hidden" name="id" defaultValue={modal.client.id} />}
            <Field label="Company name *"><input name="companyName" required defaultValue={modal.client.companyName} className="field" /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Country"><input name="country" defaultValue={modal.client.country} className="field" /></Field>
              <Field label="City"><input name="city" defaultValue={modal.client.city || ""} className="field" /></Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Contact name"><input name="contactName" defaultValue={modal.client.contactName} className="field" /></Field>
              <Field label="Contact email"><input name="contactEmail" type="email" defaultValue={modal.client.contactEmail} className="field" /></Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Phone"><input name="contactPhone" defaultValue={modal.client.contactPhone || ""} className="field" /></Field>
              <Field label="Timezone"><input name="timezone" defaultValue={modal.client.timezone || ""} className="field" placeholder="GMT / GST / EST" /></Field>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" className="btn-ghost" onClick={() => setModal(null)}>Cancel</button>
              <button type="submit" disabled={pending} className="btn-primary disabled:opacity-60">{pending ? "Saving…" : "Save client"}</button>
            </div>
          </form>
        )}
      </Modal>
    </Card>
  );
}

// ── PROJECTS ──────────────────────────────────────────────────────────────────
function ProjectsTab({ projects, clients, divisions }) {
  const [modal, setModal] = useState(null);
  const { pending, run } = useAction();

  function submit(e) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    run(() => (modal.mode === "edit" ? A.updateProject(fd) : A.createProject(fd)), () => setModal(null));
  }
  function del(id) {
    if (!confirm("Delete this project and ALL its tasks, docs, invoices, etc.? This cannot be undone.")) return;
    run(() => A.deleteProject(id));
  }

  return (
    <Card>
      <div className="flex items-center justify-between px-5 pt-5">
        <h3 className="text-sm font-bold text-olive-900">Projects ({projects.length})</h3>
        <button className="btn-primary" onClick={() => setModal({ mode: "create", project: {}, divs: [] })}>
          <Plus size={16} /> New project
        </button>
      </div>
      <CardBody>
        <div className="grid gap-3">
          {projects.map((p) => (
            <div key={p.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-surface-muted px-4 py-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="stencil rounded bg-olive-800 px-1.5 py-0.5 text-[11px] font-bold text-sand-100">{p.code}</span>
                  <span className="truncate font-semibold text-olive-900">{p.name}</span>
                  <HealthPill health={p.health} />
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-olive-500">
                  <span>{p.client.companyName}</span>·<span>{p.stage}</span>·<span>{money(p.contractValue)}</span>
                  <span className="flex gap-1">{p.divisions.map((d) => <DivisionChip key={d.id} code={d.division.code} color={d.division.colorHex} />)}</span>
                </div>
                <div className="mt-2 w-56"><Progress value={p.progress} /></div>
              </div>
              <div className="flex gap-1.5">
                <button className="btn-ghost px-2 py-1" onClick={() => setModal({ mode: "edit", project: p })}><Pencil size={15} /></button>
                <button className="btn-ghost px-2 py-1 text-health-red" onClick={() => del(p.id)}><Trash2 size={15} /></button>
              </div>
            </div>
          ))}
        </div>
      </CardBody>

      <Modal open={!!modal} onClose={() => setModal(null)} title={modal?.mode === "edit" ? "Edit project" : "New project"} width="max-w-2xl">
        {modal && (
          <form onSubmit={submit} className="space-y-4">
            {modal.mode === "edit" && <input type="hidden" name="id" defaultValue={modal.project.id} />}
            <div className="grid grid-cols-2 gap-3">
              <Field label="Project name *"><input name="name" required defaultValue={modal.project.name} className="field" /></Field>
              {modal.mode === "create" ? (
                <Field label="Code" hint="leave blank to auto-generate"><input name="code" className="field" placeholder="DS-2407" /></Field>
              ) : (
                <Field label="Stage"><input name="stage" defaultValue={modal.project.stage || ""} className="field" /></Field>
              )}
            </div>
            {modal.mode === "create" && (
              <Field label="Client *">
                <select name="clientId" required className="field" defaultValue="">
                  <option value="" disabled>Select client…</option>
                  {clients.map((c) => <option key={c.id} value={c.id}>{c.companyName}</option>)}
                </select>
              </Field>
            )}
            <div className="grid grid-cols-3 gap-3">
              <Field label="Health">
                <select name="health" defaultValue={modal.project.health || "GREEN"} className="field">
                  <option value="GREEN">Green · On track</option>
                  <option value="AMBER">Amber · At risk</option>
                  <option value="RED">Red · Critical</option>
                </select>
              </Field>
              <Field label="Status">
                <select name="status" defaultValue={modal.project.status || "ACTIVE"} className="field">
                  <option value="ACTIVE">Active</option>
                  <option value="ON_HOLD">On hold</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="ARCHIVED">Archived</option>
                </select>
              </Field>
              <Field label="Progress %"><input name="progress" type="number" min="0" max="100" defaultValue={modal.project.progress ?? 0} className="field" /></Field>
            </div>
            {modal.mode === "edit" && (
              <Field label="Stage"><input name="stage" defaultValue={modal.project.stage || ""} className="field" /></Field>
            )}
            <div className="grid grid-cols-2 gap-3">
              <Field label="Contract value (USD)"><input name="contractValue" type="number" defaultValue={modal.project.contractValue ?? 0} className="field" /></Field>
              <Field label="Estimated hours"><input name="estimatedHrs" type="number" defaultValue={modal.project.estimatedHrs ?? 0} className="field" /></Field>
            </div>
            <Field label="Health note"><input name="healthNote" defaultValue={modal.project.healthNote || ""} className="field" /></Field>
            {modal.mode === "create" && (
              <Field label="Divisions / scope" hint="creates a scope package per division">
                <div className="flex flex-wrap gap-2">
                  {divisions.map((d) => (
                    <label key={d.id} className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-line px-2.5 py-1.5 text-sm has-[:checked]:border-olive-600 has-[:checked]:bg-olive-50">
                      <input type="checkbox" name="divisions" value={d.code} className="accent-olive-700" />
                      <DivisionChip code={d.code} color={d.colorHex} /> {d.name}
                    </label>
                  ))}
                </div>
              </Field>
            )}
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" className="btn-ghost" onClick={() => setModal(null)}>Cancel</button>
              <button type="submit" disabled={pending} className="btn-primary disabled:opacity-60">{pending ? "Saving…" : "Save project"}</button>
            </div>
          </form>
        )}
      </Modal>
    </Card>
  );
}

// ── SCOPE & TASKS ─────────────────────────────────────────────────────────────
function ScopeTab({ projects, members, divisions }) {
  const [sel, setSel] = useState(projects[0]?.id || "");
  const project = projects.find((p) => p.id === sel);
  const [scopeModal, setScopeModal] = useState(false);
  const [taskModal, setTaskModal] = useState(null);
  const { pending, run } = useAction();

  function addScope(e) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.set("projectId", sel);
    run(() => A.createScope(fd), () => setScopeModal(false));
  }
  function saveTask(e) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.set("projectId", sel);
    run(() => (taskModal.mode === "edit" ? A.updateTask(fd) : A.createTask(fd)), () => setTaskModal(null));
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardBody className="flex flex-wrap items-center gap-3">
          <span className="text-sm font-semibold text-olive-700">Project:</span>
          <select value={sel} onChange={(e) => setSel(e.target.value)} className="field max-w-md">
            {projects.map((p) => <option key={p.id} value={p.id}>{p.code} · {p.name}</option>)}
          </select>
          <div className="ml-auto flex gap-2">
            <button className="btn-outline" onClick={() => setScopeModal(true)}><Plus size={15} /> Scope</button>
            <button className="btn-primary" onClick={() => setTaskModal({ mode: "create", task: {} })}><Plus size={15} /> Task</button>
          </div>
        </CardBody>
      </Card>

      {project && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <div className="px-5 pt-5"><h3 className="text-sm font-bold text-olive-900">Scope of Work ({project.scopes.length})</h3></div>
            <CardBody className="space-y-2">
              {project.scopes.length === 0 && <p className="py-6 text-center text-sm text-olive-400">No scope packages yet.</p>}
              {project.scopes.map((s) => (
                <div key={s.id} className="flex items-center justify-between rounded-lg border border-line bg-surface-muted px-3 py-2">
                  <div>
                    <div className="flex items-center gap-2 text-sm font-semibold text-olive-900">
                      {s.divisionCode && <DivisionChip code={s.divisionCode} color={divisions.find((d) => d.code === s.divisionCode)?.colorHex} />}
                      {s.title}
                    </div>
                    <p className="text-xs text-olive-400">{s.budgetHrs}h budget</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      defaultValue={s.status}
                      onChange={(e) => run(() => A.updateScopeStatus(s.id, e.target.value))}
                      className="rounded-md border border-line px-2 py-1 text-xs"
                    >
                      <option value="PLANNED">Planned</option>
                      <option value="IN_PROGRESS">In progress</option>
                      <option value="DELIVERED">Delivered</option>
                    </select>
                    <button className="text-health-red hover:opacity-70" onClick={() => { if (confirm("Delete scope?")) run(() => A.deleteScope(s.id)); }}><Trash2 size={15} /></button>
                  </div>
                </div>
              ))}
            </CardBody>
          </Card>

          <Card>
            <div className="px-5 pt-5"><h3 className="text-sm font-bold text-olive-900">Tasks ({project.tasks.length})</h3></div>
            <CardBody className="space-y-2">
              {project.tasks.length === 0 && <p className="py-6 text-center text-sm text-olive-400">No tasks yet.</p>}
              {project.tasks.map((t) => {
                const done = t.checklist.filter((c) => c.checked).length;
                return (
                  <div key={t.id} className="flex items-center justify-between rounded-lg border border-line bg-surface-muted px-3 py-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-olive-900">{t.title}</p>
                      <div className="mt-0.5 flex items-center gap-2 text-xs text-olive-400">
                        <Badge tone="dark">{t.status.replace("_", " ")}</Badge>
                        <span>QA {done}/{t.checklist.length}</span>
                        {t.assignee && <span className="flex items-center gap-1"><Avatar name={t.assignee.name} hue={t.assignee.avatarHue} size={16} /> {t.assignee.name.split(" ")[0]}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <select
                        defaultValue={t.assigneeId || ""}
                        onChange={(e) => run(() => A.assignTask(t.id, e.target.value))}
                        className="rounded-md border border-line px-2 py-1 text-xs"
                        title="Assign"
                      >
                        <option value="">Unassigned</option>
                        {members.filter((m) => m.active && m.role !== "DIRECTOR").map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                      </select>
                      <button className="btn-ghost px-1.5 py-1" onClick={() => setTaskModal({ mode: "edit", task: t })}><Pencil size={14} /></button>
                      <button className="text-health-red hover:opacity-70" onClick={() => { if (confirm("Delete task?")) run(() => A.deleteTask(t.id)); }}><Trash2 size={14} /></button>
                    </div>
                  </div>
                );
              })}
            </CardBody>
          </Card>
        </div>
      )}

      <Modal open={scopeModal} onClose={() => setScopeModal(false)} title="New scope package">
        <form onSubmit={addScope} className="space-y-4">
          <Field label="Title *"><input name="title" required className="field" placeholder="Structural Modeling & Detailing" /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Division">
              <select name="divisionCode" className="field" defaultValue="">
                <option value="">—</option>
                {divisions.map((d) => <option key={d.id} value={d.code}>{d.code} · {d.name}</option>)}
              </select>
            </Field>
            <Field label="Budget hours"><input name="budgetHrs" type="number" defaultValue={120} className="field" /></Field>
          </div>
          <Field label="Description"><textarea name="description" rows={2} className="field" /></Field>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="btn-ghost" onClick={() => setScopeModal(false)}>Cancel</button>
            <button type="submit" disabled={pending} className="btn-primary disabled:opacity-60">{pending ? "Saving…" : "Add scope"}</button>
          </div>
        </form>
      </Modal>

      <Modal open={!!taskModal} onClose={() => setTaskModal(null)} title={taskModal?.mode === "edit" ? "Edit task" : "New task"} width="max-w-xl">
        {taskModal && (
          <form onSubmit={saveTask} className="space-y-4">
            {taskModal.mode === "edit" && <input type="hidden" name="id" defaultValue={taskModal.task.id} />}
            <Field label="Title *"><input name="title" required defaultValue={taskModal.task.title} className="field" /></Field>
            <Field label="Description"><textarea name="description" rows={2} defaultValue={taskModal.task.description || ""} className="field" /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Assignee">
                <select name="assigneeId" defaultValue={taskModal.task.assigneeId || ""} className="field">
                  <option value="">Unassigned</option>
                  {members.filter((m) => m.active && m.role !== "DIRECTOR").map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </Field>
              <Field label="Priority">
                <select name="priority" defaultValue={taskModal.task.priority || "MEDIUM"} className="field">
                  {["LOW", "MEDIUM", "HIGH", "URGENT"].map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </Field>
            </div>
            {taskModal.mode === "create" && (
              <div className="grid grid-cols-2 gap-3">
                <Field label="Division">
                  <select name="divisionCode" className="field" defaultValue="">
                    <option value="">—</option>
                    {divisions.map((d) => <option key={d.id} value={d.code}>{d.code}</option>)}
                  </select>
                </Field>
                <Field label="Scope">
                  <select name="scopeId" className="field" defaultValue="">
                    <option value="">—</option>
                    {(project?.scopes || []).map((s) => <option key={s.id} value={s.id}>{s.title}</option>)}
                  </select>
                </Field>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <Field label="Estimated hours"><input name="estimatedHrs" type="number" defaultValue={taskModal.task.estimatedHrs ?? 8} className="field" /></Field>
              <Field label="Due date"><input name="dueDate" type="date" className="field" /></Field>
            </div>
            {taskModal.mode === "create" && <p className="text-xs text-olive-400">A mandatory QA/QC checklist is attached automatically — the task can&apos;t reach Done until it&apos;s complete.</p>}
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" className="btn-ghost" onClick={() => setTaskModal(null)}>Cancel</button>
              <button type="submit" disabled={pending} className="btn-primary disabled:opacity-60">{pending ? "Saving…" : "Save task"}</button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}

// ── TEAM & ASSIGNMENTS ────────────────────────────────────────────────────────
function TeamTab({ members, projects }) {
  const [modal, setModal] = useState(null);
  const [assignModal, setAssignModal] = useState(false);
  const { pending, run } = useAction();

  function saveMember(e) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    run(() => (modal.mode === "edit" ? A.updateMember(fd) : A.createMember(fd)), () => setModal(null));
  }
  function saveAssign(e) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    run(() => A.addAssignment(fd), () => setAssignModal(false));
  }

  const ROLES = ["DIRECTOR", "BIM_COORDINATOR", "MODELER", "QA_QC", "ENGINEER"];

  return (
    <Card>
      <div className="flex items-center justify-between px-5 pt-5">
        <h3 className="text-sm font-bold text-olive-900">Team ({members.filter((m) => m.active).length} active)</h3>
        <div className="flex gap-2">
          <button className="btn-outline" onClick={() => setAssignModal(true)}><UserPlus size={15} /> Assign to project</button>
          <button className="btn-primary" onClick={() => setModal({ mode: "create", member: {} })}><Plus size={16} /> New member</button>
        </div>
      </div>
      <CardBody>
        <div className="grid gap-3 sm:grid-cols-2">
          {members.map((m) => (
            <div key={m.id} className={`flex items-center justify-between rounded-xl border px-4 py-3 ${m.active ? "border-line bg-surface-muted" : "border-line bg-surface-sunken opacity-60"}`}>
              <div className="flex items-center gap-3">
                <Avatar name={m.name} hue={m.avatarHue || "#7c8340"} size={38} />
                <div>
                  <p className="text-sm font-semibold text-olive-900">{m.name}</p>
                  <p className="text-xs text-olive-500">{m.title || m.role} · {m._count.tasks} tasks · {m.assignments.length} projects</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <button className="btn-ghost px-2 py-1" onClick={() => setModal({ mode: "edit", member: m })}><Pencil size={15} /></button>
                <button className="btn-ghost px-2 py-1" onClick={() => run(() => A.setMemberActive(m.id, !m.active))} title={m.active ? "Deactivate" : "Activate"}>
                  {m.active ? <X size={15} /> : <Plus size={15} />}
                </button>
              </div>
            </div>
          ))}
        </div>
      </CardBody>

      <Modal open={!!modal} onClose={() => setModal(null)} title={modal?.mode === "edit" ? "Edit member" : "New team member"}>
        {modal && (
          <form onSubmit={saveMember} className="space-y-4">
            {modal.mode === "edit" && <input type="hidden" name="id" defaultValue={modal.member.id} />}
            <div className="grid grid-cols-2 gap-3">
              <Field label="Name *"><input name="name" required defaultValue={modal.member.name} className="field" /></Field>
              <Field label="Email *"><input name="email" type="email" required defaultValue={modal.member.email} className="field" disabled={modal.mode === "edit"} /></Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Role">
                <select name="role" defaultValue={modal.member.role || "MODELER"} className="field">
                  {ROLES.map((r) => <option key={r} value={r}>{r.replace("_", " ")}</option>)}
                </select>
              </Field>
              <Field label="Division"><input name="division" defaultValue={modal.member.division || ""} className="field" placeholder="BIM / ST / AR…" /></Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Title"><input name="title" defaultValue={modal.member.title || ""} className="field" /></Field>
              <Field label="Weekly capacity (h)"><input name="capacityHrs" type="number" defaultValue={modal.member.capacityHrs ?? 40} className="field" /></Field>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" className="btn-ghost" onClick={() => setModal(null)}>Cancel</button>
              <button type="submit" disabled={pending} className="btn-primary disabled:opacity-60">{pending ? "Saving…" : "Save member"}</button>
            </div>
          </form>
        )}
      </Modal>

      <Modal open={assignModal} onClose={() => setAssignModal(false)} title="Assign member to project">
        <form onSubmit={saveAssign} className="space-y-4">
          <Field label="Project">
            <select name="projectId" required className="field" defaultValue="">
              <option value="" disabled>Select project…</option>
              {projects.map((p) => <option key={p.id} value={p.id}>{p.code} · {p.name}</option>)}
            </select>
          </Field>
          <Field label="Team member">
            <select name="userId" required className="field" defaultValue="">
              <option value="" disabled>Select member…</option>
              {members.filter((m) => m.active).map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Role on project"><input name="roleOnProject" className="field" placeholder="Lead Coordinator" /></Field>
            <Field label="Allocation %"><input name="allocationPct" type="number" defaultValue={50} className="field" /></Field>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="btn-ghost" onClick={() => setAssignModal(false)}>Cancel</button>
            <button type="submit" disabled={pending} className="btn-primary disabled:opacity-60">{pending ? "Saving…" : "Assign"}</button>
          </div>
        </form>
      </Modal>
    </Card>
  );
}
// ── LEADS & QUOTES TAB ────────────────────────────────────────────────────────
function LeadsTab() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState("leads"); // leads | quotes

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/data");
      const json = await res.json();
      setData(json);
    } catch {}
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const STAGE_COLOR = {
    TO_CONTACT: "bg-sand-500/10 text-sand-300 border-sand-500/20",
    CONTACTED: "bg-amber-500/10 text-amber-300 border-amber-500/20",
    MEETING_BOOKED: "bg-blue-500/10 text-blue-300 border-blue-500/20",
    PROPOSAL_SENT: "bg-purple-500/10 text-purple-300 border-purple-500/20",
    WON: "bg-health-green/10 text-health-green border-health-green/30",
    LOST: "bg-red-500/10 text-red-400 border-red-500/20",
  };

  return (
    <Card>
      <div className="flex items-center justify-between px-5 pt-5">
        <div className="flex gap-2">
          <button onClick={() => setActiveSection("leads")} className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors ${activeSection === "leads" ? "bg-olive-700 text-sand-50" : "text-olive-700 hover:bg-olive-50"}`}>
            CRM Leads ({data?.leads?.length ?? "…"})
          </button>
          <button onClick={() => setActiveSection("quotes")} className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors ${activeSection === "quotes" ? "bg-olive-700 text-sand-50" : "text-olive-700 hover:bg-olive-50"}`}>
            Quote Requests ({data?.quoteRequests?.length ?? "…"})
          </button>
        </div>
        <button onClick={load} className="inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-sm text-olive-700 hover:bg-olive-50">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>
      <CardBody>
        {loading ? (
          <p className="py-8 text-center text-sm text-olive-600">Loading…</p>
        ) : activeSection === "leads" ? (
          <div className="space-y-3">
            {(data?.leads || []).map((lead) => (
              <div key={lead.id} className="flex items-start justify-between gap-3 rounded-xl border border-line bg-sand-50/30 p-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-bold text-olive-900 truncate">{lead.contactName}</p>
                    <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${STAGE_COLOR[lead.stage] || ""}`}>
                      {lead.stage?.replace(/_/g, " ")}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-olive-600">{lead.company} · {lead.country || "—"}</p>
                  {lead.serviceInterest && (
                    <p className="mt-1 flex items-center gap-1 text-xs text-olive-500">
                      <Tag size={11} /> {lead.serviceInterest}
                    </p>
                  )}
                  {lead.contactEmail && (
                    <p className="mt-1 flex items-center gap-1 text-xs text-olive-500">
                      <Mail size={11} /> {lead.contactEmail}
                    </p>
                  )}
                  {lead.notes && <p className="mt-1 text-xs text-olive-500 line-clamp-2">{lead.notes}</p>}
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-xs font-bold text-olive-700">{lead.estValue > 0 ? `$${lead.estValue.toLocaleString()}` : "—"}</p>
                  <p className="text-[10px] text-olive-500">{lead.probability}% prob.</p>
                </div>
              </div>
            ))}
            {(!data?.leads || data.leads.length === 0) && (
              <p className="py-8 text-center text-sm text-olive-500">No leads yet. Quote form submissions will appear here.</p>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {(data?.quoteRequests || []).map((q) => (
              <div key={q.id} className="rounded-xl border border-line bg-sand-50/30 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-bold text-olive-900">{q.name}</p>
                    <p className="text-xs text-olive-600">{q.email}{q.phone ? ` · ${q.phone}` : ""}</p>
                  </div>
                  <span className="rounded-full bg-olive-100 px-2 py-0.5 text-[10px] font-bold text-olive-700">
                    {q.service || "General"}
                  </span>
                </div>
                {q.company && <p className="mt-1 text-xs text-olive-600">{q.company} · {q.projectType || "—"}</p>}
                {q.message && <p className="mt-2 text-sm text-olive-700 line-clamp-3">{q.message}</p>}
                <p className="mt-2 text-[10px] text-olive-400">{new Date(q.createdAt).toLocaleString()}</p>
              </div>
            ))}
            {(!data?.quoteRequests || data.quoteRequests.length === 0) && (
              <p className="py-8 text-center text-sm text-olive-500">No quote requests yet.</p>
            )}
          </div>
        )}
      </CardBody>
    </Card>
  );
}

// ── NEWSLETTER TAB ────────────────────────────────────────────────────────────
function NewsletterTab() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/newsletter");
      const json = await res.json();
      setData(json);
    } catch {}
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  return (
    <Card>
      <div className="flex items-center justify-between px-5 pt-5">
        <h3 className="text-sm font-bold text-olive-900">
          Newsletter Subscribers ({data?.total ?? "…"})
        </h3>
        <button onClick={load} className="inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-sm text-olive-700 hover:bg-olive-50">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>
      <CardBody>
        {loading ? (
          <p className="py-8 text-center text-sm text-olive-600">Loading…</p>
        ) : (
          <>
            <div className="mb-4 grid grid-cols-3 gap-4">
              <div className="rounded-xl border border-line bg-sand-50/30 p-4 text-center">
                <p className="text-2xl font-extrabold text-olive-900">{data?.total ?? 0}</p>
                <p className="text-xs text-olive-600">Total subscribers</p>
              </div>
              <div className="rounded-xl border border-line bg-sand-50/30 p-4 text-center">
                <p className="text-2xl font-extrabold text-olive-900">
                  {data?.subscribers?.filter((s) => s.active).length ?? 0}
                </p>
                <p className="text-xs text-olive-600">Active</p>
              </div>
              <div className="rounded-xl border border-line bg-sand-50/30 p-4 text-center">
                <p className="text-2xl font-extrabold text-olive-900">
                  {data?.subscribers?.filter((s) => s.source === "footer").length ?? 0}
                </p>
                <p className="text-xs text-olive-600">From footer</p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="table-th">Email</th>
                    <th className="table-th">Source</th>
                    <th className="table-th">Status</th>
                    <th className="table-th">Subscribed</th>
                  </tr>
                </thead>
                <tbody>
                  {(data?.subscribers || []).map((s) => (
                    <tr key={s.id} className="table-row">
                      <td className="table-td font-medium text-olive-900">{s.email}</td>
                      <td className="table-td">
                        <span className="rounded-full bg-olive-100 px-2 py-0.5 text-xs font-semibold text-olive-700">{s.source}</span>
                      </td>
                      <td className="table-td">
                        {s.active ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-health-green"><CheckCircle2 size={12} /> Active</span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-400"><AlertCircle size={12} /> Unsubscribed</span>
                        )}
                      </td>
                      <td className="table-td text-xs text-olive-500">{new Date(s.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {(!data?.subscribers || data.subscribers.length === 0) && (
                <p className="py-8 text-center text-sm text-olive-500">No subscribers yet.</p>
              )}
            </div>
          </>
        )}
      </CardBody>
    </Card>
  );
}

// ── CMS EDITOR TAB (from AdminPanel.tsx) ─────────────────────────────────────
const CMS_COLLECTIONS = ["leads", "newsletter", "clients", "members", "divisions"];

function CmsEditorTab() {
  const [allData, setAllData] = useState(null);
  const [selected, setSelected] = useState("leads");
  const [json, setJson] = useState("");
  const [message, setMessage] = useState({ text: "", ok: true });
  const [saving, setSaving] = useState(false);

  async function load() {
    const res = await fetch("/api/admin/data");
    const data = await res.json();
    setAllData(data);
    setJson(JSON.stringify(data[selected] || [], null, 2));
  }

  useEffect(() => { load(); }, []);
  useEffect(() => {
    if (allData) setJson(JSON.stringify(allData[selected] || [], null, 2));
  }, [selected, allData]);

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    setMessage({ text: "", ok: true });
    try {
      const parsed = JSON.parse(json);
      if (!Array.isArray(parsed)) throw new Error("Collection must be an array.");
      const res = await fetch(`/api/admin/data/${selected}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: parsed }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.message || "Save failed");
      setMessage({ text: `Saved ${data.updated} records.`, ok: true });
      await load();
    } catch (err) {
      setMessage({ text: err.message || "Invalid JSON.", ok: false });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <div className="px-5 pt-5">
        <h3 className="text-sm font-bold text-olive-900">CMS Data Editor</h3>
        <p className="mt-1 text-xs text-olive-600">Edit collection data as JSON. Changes persist to the database immediately.</p>
      </div>
      <CardBody>
        <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
          <aside className="space-y-1.5">
            {CMS_COLLECTIONS.map((col) => (
              <button
                key={col}
                onClick={() => setSelected(col)}
                className={`w-full rounded-lg px-3 py-2.5 text-left text-sm font-semibold capitalize transition-colors ${
                  selected === col ? "bg-olive-700 text-sand-50" : "text-olive-700 hover:bg-olive-50"
                }`}
              >
                {col}
              </button>
            ))}
            <div className="mt-4 rounded-xl border border-line bg-sand-50/30 p-3 text-xs text-olive-600">
              <p className="font-bold text-olive-800">Leads</p>
              <p>{allData?.leads?.length ?? "…"} records</p>
              <p className="mt-2 font-bold text-olive-800">Newsletter</p>
              <p>{allData?.newsletter?.length ?? "…"} subscribers</p>
              <p className="mt-2 font-bold text-olive-800">Quote Requests</p>
              <p>{allData?.quoteRequests?.length ?? "…"} requests</p>
            </div>
          </aside>
          <section>
            <form onSubmit={save} className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <h4 className="text-base font-bold capitalize text-olive-900">{selected}</h4>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary disabled:opacity-60"
                >
                  {saving ? "Saving…" : "Save JSON"}
                </button>
              </div>
              <textarea
                value={json}
                onChange={(e) => setJson(e.target.value)}
                rows={20}
                className="w-full rounded-xl border border-line bg-olive-950 p-4 font-mono text-sm leading-6 text-sand-100 outline-none focus:border-olive-500"
              />
              {message.text && (
                <p className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold ${
                  message.ok
                    ? "border-health-green/30 bg-health-green/10 text-health-green"
                    : "border-red-500/30 bg-red-500/10 text-red-400"
                }`}>
                  {message.ok ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
                  {message.text}
                </p>
              )}
            </form>
          </section>
        </div>
      </CardBody>
    </Card>
  );
}
