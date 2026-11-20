"use client";
import { useState, useEffect } from "react";
import { C, PageHeader, KpiRow, Panel, Chip, statusColor, Table, Modal, Field, Input, Select, Textarea, Btn, FormRow, FormActions, ConfirmDialog, useToast } from "@/components/mil";

const CHANNELS = ["general","bim","coordination","qa","management","client","urgent"];

export default function CommunicationPage() {
  const toast = useToast();
  const [data, setData] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [confirm, setConfirm] = useState(null);
  const [activeChannel, setActiveChannel] = useState("all");

  const load = async () => {
    setLoading(true);
    const [m, p] = await Promise.all([
      fetch("/api/communication").then(r => r.json()),
      fetch("/api/pm-projects").then(r => r.json()),
    ]);
    setData(Array.isArray(m) ? m : []);
    setProjects(Array.isArray(p?.projects) ? p.projects : []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const filtered = data.filter(item => {
    const matchSearch = JSON.stringify(item).toLowerCase().includes(search.toLowerCase());
    const matchChannel = activeChannel === "all" || item.channel === activeChannel;
    return matchSearch && matchChannel;
  });

  const openNew = () => { setForm({ channel: "general" }); setShowForm(true); };

  const save = async (e) => {
    e?.preventDefault();
    if (!form.body) { toast("Message body required", "error"); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/communication", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (!res.ok) throw new Error((await res.json()).error);
      toast("Message sent", "success");
      setShowForm(false); setForm({}); load();
    } catch (err) { toast(err.message, "error"); }
    finally { setSaving(false); }
  };

  const del = (item) => setConfirm({ msg: "Delete this message?", onConfirm: async () => {
    await fetch(`/api/communication?id=${item.id}`, { method: "DELETE" });
    toast("Deleted", "success"); setConfirm(null); load();
  }});

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <PageHeader icon="💬" title="Tactical Communication" subtitle="Internal messaging and project communication hub"
        search={search} setSearch={setSearch} onNew={openNew} newLabel="+ MESSAGE" />
      <KpiRow items={[
        { label: "Total Messages", value: data.length, color: C.olive },
        { label: "Channels", value: new Set(data.map(d => d.channel)).size, color: C.info },
        { label: "Today", value: data.filter(d => new Date(d.createdAt).toDateString() === new Date().toDateString()).length, color: C.gold },
        { label: "Projects", value: new Set(data.filter(d => d.projectId).map(d => d.projectId)).size, color: C.ok },
      ]} />

      {/* Channel filter */}
      <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
        {["all", ...CHANNELS].map(ch => (
          <button key={ch} onClick={() => setActiveChannel(ch)} style={{ background: activeChannel===ch?`${C.olive}22`:"transparent", border:`1px solid ${activeChannel===ch?C.olive+"66":C.olive+"22"}`, color: activeChannel===ch?"#fff":C.dim, padding:"0.35rem 0.75rem", fontFamily:C.orbit, fontSize:"0.55rem", letterSpacing:"1px", cursor:"pointer", borderRadius:2, textTransform:"uppercase" }}>{ch}</button>
        ))}
      </div>

      <Panel title="Messages">
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", maxHeight: 500, overflowY: "auto" }}>
          {filtered.length === 0 && <p style={{ color: C.dim, fontFamily: C.rajd, padding: "1rem" }}>No messages in this channel.</p>}
          {filtered.map(m => (
            <div key={m.id} style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${C.olive}14`, borderRadius: 4, padding: "0.75rem 1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem" }}>
                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                  <span style={{ fontFamily: C.orbit, fontSize: "0.6rem", color: C.oliveBright, letterSpacing: "1px" }}>{m.author?.name || "System"}</span>
                  <Chip label={m.channel} color={C.info} />
                  {m.project && <Chip label={m.project.code} color={C.gold} />}
                </div>
                <div style={{ display: "flex", gap: "0.4rem", alignItems: "center" }}>
                  <span style={{ fontFamily: C.rajd, fontSize: "0.65rem", color: C.faint }}>{new Date(m.createdAt).toLocaleString()}</span>
                  <button onClick={() => del(m)} style={{ background: `${C.danger}12`, border: `1px solid ${C.danger}33`, borderRadius: 2, color: C.danger, padding: "2px 8px", fontFamily: C.orbit, fontSize: "0.45rem", cursor: "pointer" }}>DEL</button>
                </div>
              </div>
              <p style={{ fontFamily: C.rajd, fontSize: "0.9rem", color: C.text }}>{m.body}</p>
            </div>
          ))}
        </div>
      </Panel>

      <Modal open={showForm} onClose={() => { setShowForm(false); setForm({}); }} title="New Message" width={500}>
        <form onSubmit={save}>
          <FormRow>
            <Field label="Channel"><Select value={form.channel||"general"} onChange={e => setForm(p => ({...p, channel: e.target.value}))}>{CHANNELS.map(c => <option key={c}>{c}</option>)}</Select></Field>
            <Field label="Project"><Select value={form.projectId||""} onChange={e => setForm(p => ({...p, projectId: e.target.value || null}))}><option value="">No project</option>{projects.map(p => <option key={p.id} value={p.id}>{p.code}</option>)}</Select></Field>
          </FormRow>
          <Field label="Message *"><Textarea value={form.body||""} onChange={e => setForm(p => ({...p, body: e.target.value}))} placeholder="Type your message..." style={{ minHeight: 100 }} /></Field>
          <FormActions onCancel={() => { setShowForm(false); setForm({}); }} saving={saving} submitLabel="SEND MESSAGE" />
        </form>
      </Modal>
      <ConfirmDialog open={!!confirm} message={confirm?.msg} onConfirm={confirm?.onConfirm} onCancel={() => setConfirm(null)} />
    </div>
  );
}
