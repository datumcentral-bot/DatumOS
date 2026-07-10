"use client";
import { useState, useEffect } from "react";
import { C, PageHeader, KpiRow, Panel, Chip, statusColor, Table, Modal, Field, Input, Select, Textarea, Btn, FormRow, FormActions, ConfirmDialog, useToast, Tabs, EmptyState } from "@/components/mil";

const SPECIALTIES = ["BIM Coordination","Structural Modeling","MEP Modeling","Architectural Modeling","Point Cloud","Clash Detection","Navisworks","GIS","Other"];

export default function SubcontractorsPage() {
  const toast = useToast();
  const [subs, setSubs] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [sel, setSel] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [confirm, setConfirm] = useState(null);
  const [tab, setTab] = useState("overview");
  const [memberForm, setMemberForm] = useState({});

  const load = async () => {
    setLoading(true);
    const [s, p] = await Promise.all([
      fetch("/api/subcontractors").then(r => r.json()),
      fetch("/api/pm-projects").then(r => r.json()),
    ]);
    setSubs(Array.isArray(s) ? s : []);
    setProjects(Array.isArray(p?.projects) ? p.projects : []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const filtered = subs.filter(s => JSON.stringify(s).toLowerCase().includes(search.toLowerCase()));

  const openNew = () => { setForm({ active: true }); setShowForm(true); };
  const openEdit = (s) => { setForm({ ...s }); setShowForm(true); };

  const save = async (e) => {
    e?.preventDefault();
    if (!form.companyName) { toast("Company name required", "error"); return; }
    setSaving(true);
    try {
      const url = form.id ? `/api/subcontractors/${form.id}` : "/api/subcontractors";
      const method = form.id ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (!res.ok) throw new Error((await res.json()).error);
      toast(form.id ? "Subcontractor updated" : "Subcontractor added", "success");
      setShowForm(false); setForm({}); load();
    } catch (err) { toast(err.message, "error"); }
    finally { setSaving(false); }
  };

  const del = (s) => setConfirm({ msg: `Delete ${s.companyName} and all their team members?`, onConfirm: async () => {
    await fetch(`/api/subcontractors/${s.id}`, { method: "DELETE" });
    toast("Subcontractor deleted", "success"); setConfirm(null); setSel(null); load();
  }});

  const addMember = async (e) => {
    e?.preventDefault();
    if (!memberForm.name) { toast("Name required", "error"); return; }
    await fetch("/api/team", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...memberForm, subcontractorId: sel.id }) });
    toast("Team member added", "success"); setMemberForm({});
    const d = await (await fetch("/api/subcontractors")).json(); setSubs(d); setSel(d.find(x => x.id === sel.id));
  };

  const totalMembers = subs.reduce((s, sub) => s + (sub.teamMembers?.length || 0), 0);
  const active = subs.filter(s => s.active).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <PageHeader icon="🔧" title="Subcontractors" subtitle="External partners — teams, assignments, performance"
        search={search} setSearch={setSearch} onNew={openNew} newLabel="+ SUBCONTRACTOR" />
      <KpiRow items={[
        { label: "Total Subcontractors", value: subs.length, color: C.olive },
        { label: "Active", value: active, color: C.ok },
        { label: "Team Members", value: totalMembers, color: C.info },
        { label: "Assignments", value: subs.reduce((s, sub) => s + (sub.teamMembers?.reduce((a, m) => a + (m.subAssignments?.length || 0), 0) || 0), 0), color: C.gold },
      ]} />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1rem" }}>
        {filtered.length === 0 && <EmptyState icon="🔧" title="No subcontractors" subtitle="Click + SUBCONTRACTOR to add" />}
        {filtered.map(s => (
          <div key={s.id} onClick={() => { setSel(s); setTab("overview"); }} style={{ background: C.panel, border: `1px solid ${C.olive}22`, borderRadius: 6, padding: "1rem", cursor: "pointer", position: "relative" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${C.gold}, transparent)` }} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
              <div>
                <h3 style={{ fontFamily: C.orbit, fontSize: "0.7rem", color: "#fff", letterSpacing: "1px", marginBottom: 2 }}>{s.companyName}</h3>
                <p style={{ fontFamily: C.rajd, fontSize: "0.8rem", color: C.dim }}>{s.specialty} · {s.country}</p>
              </div>
              <Chip label={s.active ? "ACTIVE" : "INACTIVE"} color={s.active ? C.ok : C.dim} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.4rem", marginBottom: "0.75rem" }}>
              <div style={{ background: `${C.info}0d`, border: `1px solid ${C.info}22`, borderRadius: 3, padding: "0.3rem", textAlign: "center" }}>
                <div style={{ fontFamily: C.orbit, fontSize: "0.8rem", color: C.info }}>{s.teamMembers?.length || 0}</div>
                <div style={{ fontFamily: C.orbit, fontSize: "0.45rem", color: C.dim }}>MEMBERS</div>
              </div>
              <div style={{ background: `${C.gold}0d`, border: `1px solid ${C.gold}22`, borderRadius: 3, padding: "0.3rem", textAlign: "center" }}>
                <div style={{ fontFamily: C.orbit, fontSize: "0.8rem", color: C.gold }}>{s.teamMembers?.reduce((a, m) => a + (m.subAssignments?.length || 0), 0) || 0}</div>
                <div style={{ fontFamily: C.orbit, fontSize: "0.45rem", color: C.dim }}>ASSIGNMENTS</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: "0.4rem" }}>
              <Btn onClick={e => { e.stopPropagation(); openEdit(s); }} variant="ghost" style={{ flex: 1, fontSize: "0.5rem", padding: "0.3rem" }}>EDIT</Btn>
              <Btn onClick={e => { e.stopPropagation(); del(s); }} variant="danger" style={{ flex: 1, fontSize: "0.5rem", padding: "0.3rem" }}>DELETE</Btn>
            </div>
          </div>
        ))}
      </div>

      {/* Detail Modal */}
      {sel && (
        <Modal open={!!sel} onClose={() => setSel(null)} title={sel.companyName} width={700}>
          <Tabs tabs={[{id:"overview",label:"Overview"},{id:"team",label:`Team (${sel.teamMembers?.length||0})`},{id:"screen",label:"Live Feeds"}]} active={tab} setActive={setTab} />
          {tab === "overview" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem 1.5rem" }}>
              {[["Specialty", sel.specialty], ["Country", sel.country], ["Contact", sel.contactName], ["Email", sel.contactEmail], ["Phone", sel.contactPhone]].map(([l, v]) => v ? (
                <div key={l}><p style={{ fontFamily: C.orbit, fontSize: "0.5rem", color: C.dim, letterSpacing: "1px", marginBottom: 2 }}>{l}</p><p style={{ fontFamily: C.rajd, fontSize: "0.9rem", color: C.text }}>{v}</p></div>
              ) : null)}
            </div>
          )}
          {tab === "team" && (
            <div>
              <form onSubmit={addMember} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: "0.5rem", marginBottom: "1rem", alignItems: "end" }}>
                <Field label="Name *"><Input value={memberForm.name||""} onChange={e => setMemberForm(p => ({...p, name: e.target.value}))} placeholder="Team member name" /></Field>
                <Field label="Role"><Select value={memberForm.role||"MODELER"} onChange={e => setMemberForm(p => ({...p, role: e.target.value}))}>{["MODELER","COORDINATOR","QA_ENGINEER","DRAFTER"].map(r => <option key={r}>{r}</option>)}</Select></Field>
                <Field label="Email"><Input value={memberForm.email||""} onChange={e => setMemberForm(p => ({...p, email: e.target.value}))} /></Field>
                <Btn type="submit">+ ADD</Btn>
              </form>
              <Table columns={[
                { key: "name", label: "Name" },
                { key: "role", label: "Role", render: r => <Chip label={r.role} color={C.olive} /> },
                { key: "email", label: "Email" },
                { key: "subAssignments", label: "Assignments", render: r => r.subAssignments?.length || 0 },
              ]} rows={sel.teamMembers || []} />
            </div>
          )}
          {tab === "screen" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              {(sel.teamMembers || []).slice(0, 4).map(m => (
                <div key={m.id} style={{ background: "rgba(0,0,0,0.4)", border: `1px solid ${C.olive}33`, borderRadius: 6, padding: "1rem", textAlign: "center" }}>
                  <div style={{ width: "100%", height: 120, background: "rgba(0,0,0,0.6)", borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "0.5rem", border: `1px solid ${C.olive}22` }}>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: "2rem", marginBottom: "0.25rem" }}>📹</div>
                      <p style={{ fontFamily: C.orbit, fontSize: "0.5rem", color: C.dim, letterSpacing: "1px" }}>CAMERA FEED</p>
                      <p style={{ fontFamily: C.rajd, fontSize: "0.7rem", color: C.faint }}>WebRTC — Awaiting connection</p>
                    </div>
                  </div>
                  <p style={{ fontFamily: C.orbit, fontSize: "0.6rem", color: "#fff", letterSpacing: "1px" }}>{m.name}</p>
                  <p style={{ fontFamily: C.rajd, fontSize: "0.7rem", color: C.dim }}>{m.role}</p>
                  <Btn style={{ marginTop: "0.5rem", width: "100%", fontSize: "0.5rem" }}>REQUEST FEED</Btn>
                </div>
              ))}
              {(sel.teamMembers || []).length === 0 && <EmptyState icon="📹" title="No team members" subtitle="Add team members to enable live feeds" />}
            </div>
          )}
        </Modal>
      )}

      <Modal open={showForm} onClose={() => { setShowForm(false); setForm({}); }} title={form.id ? "Edit Subcontractor" : "New Subcontractor"} width={560}>
        <form onSubmit={save}>
          <Field label="Company Name *"><Input value={form.companyName||""} onChange={e => setForm(p => ({...p, companyName: e.target.value}))} placeholder="BIM Solutions LLC" /></Field>
          <FormRow>
            <Field label="Specialty"><Select value={form.specialty||""} onChange={e => setForm(p => ({...p, specialty: e.target.value}))}><option value="">Select...</option>{SPECIALTIES.map(s => <option key={s}>{s}</option>)}</Select></Field>
            <Field label="Country"><Input value={form.country||""} onChange={e => setForm(p => ({...p, country: e.target.value}))} placeholder="UAE" /></Field>
          </FormRow>
          <FormRow>
            <Field label="Contact Name"><Input value={form.contactName||""} onChange={e => setForm(p => ({...p, contactName: e.target.value}))} /></Field>
            <Field label="Contact Email"><Input type="email" value={form.contactEmail||""} onChange={e => setForm(p => ({...p, contactEmail: e.target.value}))} /></Field>
          </FormRow>
          <Field label="Contact Phone"><Input value={form.contactPhone||""} onChange={e => setForm(p => ({...p, contactPhone: e.target.value}))} /></Field>
          <Field label="Active"><Select value={form.active !== false ? "true" : "false"} onChange={e => setForm(p => ({...p, active: e.target.value === "true"}))}><option value="true">Active</option><option value="false">Inactive</option></Select></Field>
          <FormActions onCancel={() => { setShowForm(false); setForm({}); }} saving={saving} submitLabel={form.id ? "UPDATE" : "ADD SUBCONTRACTOR"} />
        </form>
      </Modal>
      <ConfirmDialog open={!!confirm} message={confirm?.msg} onConfirm={confirm?.onConfirm} onCancel={() => setConfirm(null)} />
    </div>
  );
}
