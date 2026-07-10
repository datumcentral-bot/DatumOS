"use client";

import { useState, useRef, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardBody, Badge } from "@/components/ui";
import { Modal, Field, useToast } from "@/components/forms";
import { Video, Circle, Square, Plus, ListTodo, Download, Radio, CheckSquare, MessageSquare, Play } from "lucide-react";
import * as A from "./actions";
import { fmtDate } from "@/lib/format";

export function MeetingsConsole({ meetings, projects }) {
  const [newModal, setNewModal] = useState(false);
  const [active, setActive] = useState(meetings[0]?.id || null);
  const router = useRouter();
  const toast = useToast();
  const [pending, start] = useTransition();

  const meeting = meetings.find((m) => m.id === active) || meetings[0];

  function createMeeting(e) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    start(async () => {
      const res = await A.createMeeting(fd);
      if (res.ok) { toast("Meeting scheduled."); setNewModal(false); setActive(res.id); router.refresh(); }
      else toast(res.message, "err");
    });
  }

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {/* list */}
      <div className="space-y-3">
        <button className="btn-primary w-full justify-center" onClick={() => setNewModal(true)}><Plus size={16} /> New meeting</button>
        {meetings.map((m) => (
          <button
            key={m.id}
            onClick={() => setActive(m.id)}
            className={`w-full rounded-xl border p-4 text-left transition-colors ${
              meeting?.id === m.id ? "border-olive-600 bg-olive-50" : "border-line bg-white hover:bg-surface-muted"
            }`}
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-olive-900">{m.title}</p>
              <StatusBadge status={m.status} />
            </div>
            <p className="mt-1 text-xs text-olive-500">{m.project ? m.project.code + " · " : ""}{fmtDate(m.scheduledAt)}</p>
            <p className="mt-1 text-[11px] text-olive-400">{m.notes.length} minutes · {m.recordingSecs > 0 ? Math.round(m.recordingSecs / 60) + "m recorded" : "no recording"}</p>
          </button>
        ))}
      </div>

      {/* detail */}
      <div className="lg:col-span-2">
        {meeting ? <MeetingDetail meeting={meeting} projects={projects} /> : <Card><CardBody>Select a meeting.</CardBody></Card>}
      </div>

      <Modal open={newModal} onClose={() => setNewModal(false)} title="Schedule a meeting">
        <form onSubmit={createMeeting} className="space-y-4">
          <Field label="Title *"><input name="title" required className="field" placeholder="Weekly BIM Coordination" /></Field>
          <Field label="Project (optional)">
            <select name="projectId" className="field" defaultValue="">
              <option value="">— none —</option>
              {projects.map((p) => <option key={p.id} value={p.id}>{p.code} · {p.name}</option>)}
            </select>
          </Field>
          <Field label="Attendees"><input name="attendees" className="field" placeholder="Comma-separated names" /></Field>
          <Field label="Agenda"><textarea name="agenda" rows={2} className="field" /></Field>
          <Field label="When"><input name="scheduledAt" type="datetime-local" className="field" /></Field>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="btn-ghost" onClick={() => setNewModal(false)}>Cancel</button>
            <button type="submit" disabled={pending} className="btn-primary disabled:opacity-60">{pending ? "Saving…" : "Schedule"}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function StatusBadge({ status }) {
  const map = { SCHEDULED: "slate", LIVE: "green", ENDED: "dark" };
  return <Badge tone={map[status] || "slate"}>{status === "LIVE" && <span className="h-1.5 w-1.5 rounded-full bg-health-green animate-pulse-dot" />}{status}</Badge>;
}

function MeetingDetail({ meeting, projects }) {
  const router = useRouter();
  const toast = useToast();
  const [pending, start] = useTransition();

  function addNote(e) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    start(async () => {
      const res = await A.addMeetingNote(fd);
      if (res.ok) { toast("Minute added."); e.target.reset(); router.refresh(); }
      else toast(res.message, "err");
    });
  }
  function toTask(noteId, projectId) {
    start(async () => {
      const res = await A.noteToTask(noteId, projectId);
      if (res.ok) toast("Task created & added to the Kanban.");
      else toast(res.message, "err");
      router.refresh();
    });
  }
  function setStatus(s) {
    start(async () => { await A.setMeetingStatus(meeting.id, s); router.refresh(); });
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardBody>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-olive-900">{meeting.title}</h3>
                <StatusBadge status={meeting.status} />
              </div>
              <p className="mt-1 text-sm text-olive-500">{meeting.project ? meeting.project.name : "Studio-wide"} · {fmtDate(meeting.scheduledAt)}</p>
              {meeting.attendees && <p className="mt-1 text-xs text-olive-400">Attendees: {meeting.attendees}</p>}
              {meeting.agenda && <p className="mt-2 text-sm text-olive-700">{meeting.agenda}</p>}
            </div>
            <div className="flex gap-2">
              {meeting.status !== "LIVE" && <button className="btn-accent" onClick={() => setStatus("LIVE")}><Radio size={15} /> Go live</button>}
              {meeting.status === "LIVE" && <button className="btn-outline" onClick={() => setStatus("ENDED")}><Square size={14} /> End</button>}
            </div>
          </div>
        </CardBody>
      </Card>

      <Recorder meetingId={meeting.id} existingSecs={meeting.recordingSecs} />

      <Card>
        <div className="px-5 pt-5"><h3 className="text-sm font-bold text-olive-900 flex items-center gap-2"><MessageSquare size={16} /> Minutes & action items</h3></div>
        <CardBody className="space-y-3">
          <form onSubmit={addNote} className="flex flex-wrap gap-2">
            <input type="hidden" name="meetingId" value={meeting.id} />
            <select name="kind" className="field w-32" defaultValue="ACTION">
              <option value="NOTE">Note</option>
              <option value="ACTION">Action</option>
              <option value="DECISION">Decision</option>
            </select>
            <input name="body" required className="field flex-1" placeholder="Capture a minute or action item…" />
            <button type="submit" disabled={pending} className="btn-primary disabled:opacity-60"><Plus size={15} /> Add</button>
          </form>

          <div className="space-y-2">
            {meeting.notes.length === 0 && <p className="py-4 text-center text-sm text-olive-400">No minutes yet.</p>}
            {meeting.notes.map((n) => (
              <div key={n.id} className="flex items-start justify-between gap-3 rounded-lg border border-line bg-surface-muted px-3 py-2">
                <div className="flex items-start gap-2">
                  <NoteKind kind={n.kind} />
                  <p className="text-sm text-olive-800">{n.body}</p>
                </div>
                {n.kind === "ACTION" && !n.linkedTaskId && (
                  <NoteToTask projects={projects} defaultProject={meeting.projectId} onCreate={(pid) => toTask(n.id, pid)} pending={pending} />
                )}
                {n.linkedTaskId && <Badge tone="green"><CheckSquare size={12} /> Task created</Badge>}
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

function NoteKind({ kind }) {
  const map = { NOTE: "slate", ACTION: "amber", DECISION: "olive" };
  return <Badge tone={map[kind] || "slate"}>{kind}</Badge>;
}

function NoteToTask({ projects, defaultProject, onCreate, pending }) {
  const [pid, setPid] = useState(defaultProject || "");
  return (
    <div className="flex shrink-0 items-center gap-1.5">
      {!defaultProject && (
        <select value={pid} onChange={(e) => setPid(e.target.value)} className="rounded-md border border-line px-2 py-1 text-xs">
          <option value="">Pick project…</option>
          {projects.map((p) => <option key={p.id} value={p.id}>{p.code}</option>)}
        </select>
      )}
      <button className="btn-ghost px-2 py-1 text-xs" disabled={pending} onClick={() => onCreate(pid)}>
        <ListTodo size={14} /> → Task
      </button>
    </div>
  );
}

// ── MediaRecorder-based meeting recorder (screen + mic) ───────────────────────
function Recorder({ meetingId, existingSecs }) {
  const router = useRouter();
  const toast = useToast();
  const [recording, setRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [url, setUrl] = useState(null);
  const mediaRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const streamRef = useRef(null);
  const elapsedRef = useRef(0);

  useEffect(() => () => { clearInterval(timerRef.current); streamRef.current?.getTracks().forEach((t) => t.stop()); }, []);

  async function startRec() {
    try {
      const display = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
      let stream = display;
      try {
        const mic = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream = new MediaStream([...display.getVideoTracks(), ...display.getAudioTracks(), ...mic.getAudioTracks()]);
      } catch {}
      streamRef.current = stream;
      chunksRef.current = [];
      const mr = new MediaRecorder(stream, { mimeType: MediaRecorder.isTypeSupported("video/webm;codecs=vp9") ? "video/webm;codecs=vp9" : "video/webm" });
      mr.ondataavailable = (e) => { if (e.data.size) chunksRef.current.push(e.data); };
      mr.onstop = async () => {
        clearInterval(timerRef.current);
        const blob = new Blob(chunksRef.current, { type: "video/webm" });
        setUrl(URL.createObjectURL(blob));
        streamRef.current?.getTracks().forEach((t) => t.stop());
        setRecording(false);
        await A.saveRecording(meetingId, elapsedRef.current);
        toast("Recording saved. Download it below.");
        router.refresh();
      };
      // stop if user ends screen share from browser UI
      display.getVideoTracks()[0].addEventListener("ended", () => { if (mr.state !== "inactive") mr.stop(); });
      mediaRef.current = mr;
      mr.start(1000);
      setRecording(true);
      setElapsed(0);
      elapsedRef.current = 0;
      timerRef.current = setInterval(() => { elapsedRef.current += 1; setElapsed((s) => s + 1); }, 1000);
    } catch (err) {
      toast("Screen capture was blocked or cancelled.", "warn");
    }
  }

  function stopRec() {
    if (mediaRef.current && mediaRef.current.state !== "inactive") mediaRef.current.stop();
  }

  const mm = String(Math.floor(elapsed / 60)).padStart(2, "0");
  const ss = String(elapsed % 60).padStart(2, "0");

  return (
    <Card>
      <CardBody>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`grid h-11 w-11 place-items-center rounded-xl ${recording ? "bg-health-red/15 text-health-red" : "bg-olive-100 text-olive-700"}`}>
              <Video size={20} />
            </div>
            <div>
              <p className="text-sm font-bold text-olive-900">Meeting recorder</p>
              <p className="text-xs text-olive-500">
                {recording ? <span className="font-semibold text-health-red">● REC {mm}:{ss}</span> : existingSecs > 0 ? `Previously recorded ${Math.round(existingSecs / 60)}m` : "Records your screen + mic (browser MediaRecorder)"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!recording ? (
              <button className="btn-primary" onClick={startRec}><Circle size={13} className="fill-current" /> Start recording</button>
            ) : (
              <button className="btn-accent" onClick={stopRec}><Square size={14} /> Stop</button>
            )}
            {url && (
              <a href={url} download={`meeting-${meetingId}.webm`} className="btn-outline"><Download size={15} /> Download clip</a>
            )}
          </div>
        </div>
        {url && (
          <video src={url} controls className="mt-4 w-full rounded-xl border border-line" />
        )}
      </CardBody>
    </Card>
  );
}
