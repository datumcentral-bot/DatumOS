"use client";
import { useState, useEffect } from "react";
import { C, PageHeader, KpiRow, Panel, Chip, statusColor, Table, Modal, Field, Input, Select, Textarea, Btn, FormRow, FormActions, ConfirmDialog, useToast, EmptyState } from "@/components/mil";

const ROLES = ["DIRECTOR","BIM_MANAGER","COORDINATOR","MODELER","QA_ENGINEER","DRAFTER","ANALYST","ADMIN"];
const SENIORITIES = ["JUNIOR","MID","SENIOR","LEAD","PRINCIPAL"];
const DIVISIONS = ["BIM","COORDINATION","MODELING","QA","MANAGEMENT","ADMIN"];

export default function TeamPage() {
  const toast = useToast();
  const [members, setMembers] = useState([]);
  const [subs, setSubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [confirm, setConfirm] = useState(null);

  const load = async () => {
    setLoading(true);
    const [m, s] = await Promise.all([
      fetch("/api/team").then(r => r.json()),
      fetch("/api/subcontractors").then(r => r.json()),
    ]);
    setMembers(Array.isArray(m) ? m : []);
    setSubs(Array.isArray(s) ? s : []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const filtered = members.filter(m => JSON.stringify(m).toLowerCase().includes(search.toLowerCase()));

  const openNew = () => { setForm({ role: "MODELER", seniority: "MID", active: true }); setShowForm(true); };
  const openEdit = (m) => { setForm({ ...m }); setShowForm(true); };

  const save = async (e) => {
    e?.preventDefault();
    if (!form.name) { toast("Name required", "error"); return; }
    setSaving(true);
    try {
      const url = form.id ? `/api/team/${form.id}` : "/api/team";
      const method = form.id ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (!res.ok) throw new Error((await res.json()).error);
      toast(form.id ? "Member updated" : "Member added", "success");
      setShowForm(false); setForm({}); load();
    } catch (err) { toast(err.message, "error"); }
    finally { setSaving(false); }
  };

  const del = (m) => setConfirm({ msg: `Remove ${m.name} from team?`, onConfirm: async () => {
    await fetch(`/api/team/${m.id}`, { method: "DELETE" });
    toast("Member removed", "success"); setConfirm(null); load();
  }});

  const active = members.filter(m => m.active).length;
  const avgRate = members.length ? (members.reduce((s, m) => s + (m.ratePerHr || 0), 0) / members.length).toFixed(0) : 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <PageHeader icon="👥" title="Team Management" subtitle="Internal team members and subcontractor staff"
        search={search} setSearch={setSearch} onNew={openNew} newLabel="+ MEMBER" />
      <KpiRow items={[
        { label: "Total Members", value: members.length, color: C.olive },
        { label: "Active", value: active, color: C.ok },
        { label: "Avg Rate/Hr", value: `$${avgRate}`, color: C.gold },
        { label: "Assignments", value: members.reduce((s, m) => s + (m.subAssignments?.length || 0), 0), color: C.info },
      ]} />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "1rem" }}>
        {filtered.length === 0 && <EmptyState icon="👥" title="No team members" subtitle="Click + MEMBER to add" />}
        {filtered.map(m => (
          <div key={m.id} style={{ background: C.panel, border: `1px solid ${C.olive}22`, borderRadius: 6, padding: "1rem", position: "relative" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${m.avatarHue || C.olive}, transparent)` }} />
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}>
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: `${m.avatarHue || C.olive}22`, border: `2px solid ${m.avatarHue || C.olive}44`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: C.orbit, fontSize: "0.9rem", color: m.avatarHue || C.olive, fontWeight: 700 }}>{m.name.charAt(0)}</div>
              <div>
                <p style={{ fontFamily: C.orbit, fontSize: "0.7rem", color: "#fff", letterSpacing: "1px" }}>{m.name}</p>
                <p style={{ fontFamily: C.rajd, fontSize: "0.75rem", color: C.dim }}>{m.email}</p>
              </div>
            </div>
            <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginBottom: "0.5rem" }}>
              <Chip label={m.role} color={C.olive} />
              <Chip label={m.seniority} color={C.info} />
              {!m.active && <Chip label="INACTIVE" color={C.dim} />}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.4rem", marginBottom: "0.75rem" }}>
              <div style={{ background: `${C.gold}0d`, border: `1px solid ${C.gold}22`, borderRadius: 3, padding: "0.3rem", textAlign: "center" }}>
                <div style={{ fontFamily: C.orbit, fontSize: "0.7rem", color: C.gold }}>${m.ratePerHr}/hr</div>
              </div>
              <div style={{ background: `${C.info}0d`, border: `1px solid ${C.info}22`, borderRadius: 3, padding: "0.3rem", textAlign: "center" }}>
                <div style={{ fontFamily: C.orbit, fontSize: "0.7rem", color: C.info }}>{m.subAssignments?.length || 0} projects</div>
              </div>
            </div>
            {m.skills && <p style={{ fontFamily: C.rajd, fontSize: "0.75rem", color: C.dim, marginBottom: "0.5rem" }}>{m.skills}</p>}
            <div style={{ display: "flex", gap: "0.4rem" }}>
              <Btn onClick={() => openEdit(m)} variant="ghost" style={{ flex: 1, fontSize: "0.5rem", padding: "0.3rem" }}>EDIT</Btn>
              <Btn onClick={() => del(m)} variant="danger" style={{ flex: 1, fontSize: "0.5rem", padding: "0.3rem" }}>REMOVE</Btn>
            </div>
          </div>
        ))}
      </div>

      <Modal open={showForm} onClose={() => { setShowForm(false); setForm({}); }} title={form.id ? "Edit Member" : "Add Team Member"} width={580}>
        <form onSubmit={save}>
          <FormRow>
            <Field label="Full Name *"><Input value={form.name||""} onChange={e => setForm(p => ({...p, name: e.target.value}))} placeholder="Ahmed Hassan" /></Field>
            <Field label="Email"><Input type="email" value={form.email||""} onChange={e => setForm(p => ({...p, email: e.target.value}))} /></Field>
          </FormRow>
          <FormRow>
            <Field label="Role"><Select value={form.role||"MODELER"} onChange={e => setForm(p => ({...p, role: e.target.value}))}>{ROLES.map(r => <option key={r}>{r}</option>)}</Select></Field>
            <Field label="Seniority"><Select value={form.seniority||"MID"} onChange={e => setForm(p => ({...p, seniority: e.target.value}))}>{SENIORITIES.map(s => <option key={s}>{s}</option>)}</Select></Field>
          </FormRow>
          <FormRow>
            <Field label="Division"><Select value={form.division||""} onChange={e => setForm(p => ({...p, division: e.target.value}))}><option value="">Select...</option>{DIVISIONS.map(d => <option key={d}>{d}</option>)}</Select></Field>
            <Field label="Rate/Hr (USD)"><Input type="number" value={form.ratePerHr||""} onChange={e => setForm(p => ({...p, ratePerHr: e.target.value}))} placeholder="75" /></Field>
          </FormRow>
          <Field label="Skills"><Input value={form.skills||""} onChange={e => setForm(p => ({...p, skills: e.target.value}))} placeholder="Revit, Navisworks, AutoCAD, BIM 360" /></Field>
          <Field label="Subcontractor (if external)"><Select value={form.subcontractorId||""} onChange={e => setForm(p => ({...p, subcontractorId: e.target.value || null}))}><option value="">Internal staff</option>{subs.map(s => <option key={s.id} value={s.id}>{s.companyName}</option>)}</Select></Field>
          <Field label="Active"><Select value={form.active !== false ? "true" : "false"} onChange={e => setForm(p => ({...p, active: e.target.value === "true"}))}><option value="true">Active</option><option value="false">Inactive</option></Select></Field>
          <FormActions onCancel={() => { setShowForm(false); setForm({}); }} saving={saving} submitLabel={form.id ? "UPDATE" : "ADD MEMBER"} />
        </form>
      </Modal>
      <ConfirmDialog open={!!confirm} message={confirm?.msg} onConfirm={confirm?.onConfirm} onCancel={() => setConfirm(null)} />
    </div>
  );
}
