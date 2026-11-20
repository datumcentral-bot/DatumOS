"use client";

import { useState, useTransition, useEffect } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  useDraggable,
  useDroppable,
  closestCorners,
} from "@dnd-kit/core";
import { toggleChecklistItem, advanceTaskStatus, moveTaskToStatus } from "./actions";
import { TASK_STATUS, PRIORITY } from "@/lib/format";
import { CheckCircle2, Circle, ShieldCheck, ChevronRight, Lock, AlertTriangle, FileText, User, GripVertical } from "lucide-react";

const COLUMNS = [
  { key: "TODO", label: "To Do" },
  { key: "IN_PROGRESS", label: "In Progress" },
  { key: "QA_REVIEW", label: "QA Review" },
  { key: "DONE", label: "Done" },
];

export function TaskBoard({ tasks: initialTasks, code }) {
  const [tasks, setTasks] = useState(initialTasks);
  const [open, setOpen] = useState(null);
  const [activeId, setActiveId] = useState(null);
  const [toast, setToast] = useState("");

  // Keep local state in sync when server data revalidates (e.g. after modal edits)
  useEffect(() => {
    setTasks(initialTasks);
  }, [initialTasks]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 6 } })
  );

  const byStatus = {};
  COLUMNS.forEach((c) => (byStatus[c.key] = []));
  tasks.forEach((t) => {
    const key = t.status === "BLOCKED" ? "IN_PROGRESS" : t.status;
    (byStatus[key] || byStatus.TODO).push(t);
  });

  const activeTask = tasks.find((t) => t.id === activeId) || null;

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(""), 4200);
  }

  function handleDragEnd(event) {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;

    let target = over.id;
    if (!COLUMNS.some((c) => c.key === target)) {
      const overTask = tasks.find((t) => t.id === over.id);
      target = overTask ? (overTask.status === "BLOCKED" ? "IN_PROGRESS" : overTask.status) : null;
    }
    if (!target) return;

    const task = tasks.find((t) => t.id === active.id);
    if (!task) return;
    const curCol = task.status === "BLOCKED" ? "IN_PROGRESS" : task.status;
    if (curCol === target) return;

    // Client-side QA gate pre-check for instant feedback (server re-enforces it too)
    if (target === "DONE") {
      const incomplete = task.checklist.filter((c) => !c.checked).length;
      if (incomplete > 0) {
        showToast(`QA gate locked — ${incomplete} checklist item(s) open on “${task.title}”. Open the task to complete the QA/QC checklist first.`);
        return;
      }
    }

    const prev = tasks;
    setTasks((cur) => cur.map((t) => (t.id === active.id ? { ...t, status: target } : t)));

    moveTaskToStatus(active.id, target, code).then((res) => {
      if (res && !res.ok) {
        setTasks(prev); // rollback
        showToast(res.message);
      }
    });
  }

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={(e) => setActiveId(e.active.id)}
        onDragEnd={handleDragEnd}
        onDragCancel={() => setActiveId(null)}
      >
        <div className="scroll-thin overflow-x-auto pb-2">
          <div className="grid min-w-[840px] grid-cols-4 gap-3">
            {COLUMNS.map((col) => (
              <Column
                key={col.key}
                col={col}
                items={byStatus[col.key]}
                activeTask={activeTask}
                activeId={activeId}
                onOpen={setOpen}
              />
            ))}
          </div>
        </div>

        <DragOverlay dropAnimation={{ duration: 180, easing: "cubic-bezier(0.2, 0, 0, 1)" }}>
          {activeTask ? <TaskCardInner task={activeTask} overlay /> : null}
        </DragOverlay>
      </DndContext>

      {toast && (
        <div className="fixed bottom-6 left-1/2 z-[60] flex max-w-md -translate-x-1/2 items-start gap-2 rounded-xl bg-amber-600 px-4 py-3 text-sm text-white shadow-panel">
          <Lock size={16} className="mt-0.5 shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      {open && (
        <TaskModal
          task={open}
          code={code}
          onClose={() => setOpen(null)}
        />
      )}
    </>
  );
}

function Column({ col, items, activeTask, activeId, onOpen }) {
  const { setNodeRef, isOver } = useDroppable({ id: col.key });

  // Highlight red when hovering DONE with an incomplete checklist (QA gate warning)
  const blockedDrop =
    isOver &&
    col.key === "DONE" &&
    activeTask &&
    activeTask.checklist.filter((c) => !c.checked).length > 0;

  return (
    <div
      ref={setNodeRef}
      className={`rounded-2xl p-2 transition-colors ${
        blockedDrop
          ? "bg-red-50 ring-2 ring-red-300"
          : isOver
          ? "bg-brand-50 ring-2 ring-brand-300"
          : "bg-surface-muted"
      }`}
    >
      <div className="flex items-center justify-between px-2 py-2">
        <span className="flex items-center gap-1.5 text-sm font-semibold text-brand-900">
          {col.key === "DONE" && <ShieldCheck size={13} className="text-accent-600" />}
          {col.label}
        </span>
        <span className="rounded-full bg-white px-2 py-0.5 text-xs font-medium text-slate-500">{items.length}</span>
      </div>
      <div className="min-h-[80px] space-y-2">
        {items.map((t) => (
          <DraggableTask key={t.id} task={t} dimmed={activeId === t.id} onOpen={() => onOpen(t)} />
        ))}
        {items.length === 0 && (
          <div
            className={`rounded-xl border border-dashed py-6 text-center text-[11px] transition-colors ${
              blockedDrop ? "border-red-300 text-red-400" : isOver ? "border-brand-300 text-brand-400" : "border-line text-slate-300"
            }`}
          >
            {blockedDrop ? "QA gate locked" : "Drop here"}
          </div>
        )}
      </div>
    </div>
  );
}

function DraggableTask({ task, dimmed, onOpen }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: task.id });
  return (
    <div ref={setNodeRef} {...attributes} className={dimmed || isDragging ? "opacity-30" : ""}>
      <TaskCardInner task={task} onOpen={onOpen} dragHandleProps={listeners} />
    </div>
  );
}

function TaskCardInner({ task, onOpen, dragHandleProps, overlay }) {
  const done = task.checklist.filter((c) => c.checked).length;
  const total = task.checklist.length;
  return (
    <div
      className={`w-full rounded-xl border border-line bg-white p-3 text-left shadow-sm ${
        overlay ? "rotate-2 cursor-grabbing shadow-panel ring-2 ring-brand-300" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <button onClick={onOpen} className="flex-1 text-left text-sm font-medium text-brand-900 hover:text-accent-700">
          {task.title}
        </button>
        <div className="flex shrink-0 items-center gap-1">
          {task.status === "BLOCKED" && <AlertTriangle size={14} className="text-red-500" />}
          <span
            {...(dragHandleProps || {})}
            className="grid h-6 w-6 cursor-grab touch-none place-items-center rounded-md text-slate-300 hover:bg-slate-50 hover:text-slate-500 active:cursor-grabbing"
            title="Drag to move status"
          >
            <GripVertical size={14} />
          </span>
        </div>
      </div>
      <button onClick={onOpen} className="block w-full text-left">
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[10px]">
          {task.divisionCode && <span className="rounded bg-slate-100 px-1.5 py-0.5 font-semibold text-slate-600">{task.divisionCode}</span>}
          <span className={`font-semibold ${PRIORITY[task.priority]}`}>{task.priority}</span>
          {task.sop && (
            <span className="inline-flex items-center gap-0.5 rounded bg-accent-50 px-1.5 py-0.5 text-accent-700">
              <FileText size={9} /> {task.sop.code}
            </span>
          )}
        </div>
        {total > 0 && (
          <div className="mt-2">
            <div className="flex items-center justify-between text-[10px] text-slate-400">
              <span className="inline-flex items-center gap-1">
                <ShieldCheck size={11} /> QA checklist
              </span>
              <span className={done === total ? "font-semibold text-health-green" : ""}>
                {done}/{total}
              </span>
            </div>
            <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
              <div className={`h-full ${done === total ? "bg-health-green" : "bg-accent-500"}`} style={{ width: `${(done / total) * 100}%` }} />
            </div>
          </div>
        )}
        <div className="mt-2 flex items-center gap-1.5 text-[10px] text-slate-400">
          <User size={10} /> {task.assignee?.name || "Unassigned"} · {Math.round(task.actualHrs)}h / {Math.round(task.estimatedHrs)}h
        </div>
      </button>
    </div>
  );
}

function TaskModal({ task, code, onClose }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [items, setItems] = useState(task.checklist);
  const [status, setStatus] = useState(task.status);

  const doneCount = items.filter((c) => c.checked).length;
  const allDone = items.length > 0 && doneCount === items.length;

  const toggle = (item) => {
    const newChecked = !item.checked;
    setItems((prev) => prev.map((c) => (c.id === item.id ? { ...c, checked: newChecked } : c)));
    setError("");
    startTransition(async () => {
      await toggleChecklistItem(item.id, newChecked, code);
    });
  };

  const advance = () => {
    setError("");
    startTransition(async () => {
      const res = await advanceTaskStatus(task.id, code);
      if (res && !res.ok) {
        setError(res.message);
      } else {
        const order = ["TODO", "IN_PROGRESS", "QA_REVIEW", "DONE"];
        setStatus(order[Math.min(order.length - 1, order.indexOf(status) + 1)]);
      }
    });
  };

  const nextLabel = { TODO: "Start work → In Progress", IN_PROGRESS: "Submit for QA Review", QA_REVIEW: "Close task (QA sign-off)", DONE: "Completed", BLOCKED: "Resume work" }[status];
  const isDone = status === "DONE";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-950/50 p-4" onClick={onClose}>
      <div className="max-h-[88vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-panel" onClick={(e) => e.stopPropagation()}>
        <div className="border-b border-line px-5 py-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className={`badge ${TASK_STATUS[status].cls}`}>{TASK_STATUS[status].label}</span>
              <h3 className="mt-2 text-base font-semibold text-brand-900">{task.title}</h3>
              <p className="text-xs text-slate-500">{task.description}</p>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600">✕</button>
          </div>
          <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
            {task.divisionCode && <span className="rounded bg-slate-100 px-2 py-0.5 font-medium text-slate-600">Discipline: {task.divisionCode}</span>}
            <span className={`rounded bg-slate-100 px-2 py-0.5 font-medium ${PRIORITY[task.priority]}`}>Priority: {task.priority}</span>
            <span className="rounded bg-slate-100 px-2 py-0.5 font-medium text-slate-600">{task.assignee?.name || "Unassigned"}</span>
          </div>
        </div>

        {/* SOP link */}
        {task.sop && (
          <div className="border-b border-line bg-accent-50/40 px-5 py-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-accent-700">
              <FileText size={13} /> Linked SOP · {task.sop.code}
            </div>
            <p className="mt-0.5 text-xs text-slate-600">{task.sop.title}</p>
          </div>
        )}

        {/* Mandatory QA/QC checklist */}
        <div className="px-5 py-4">
          <div className="mb-2 flex items-center justify-between">
            <h4 className="flex items-center gap-1.5 text-sm font-semibold text-brand-900">
              <ShieldCheck size={15} className="text-accent-600" /> Mandatory QA/QC Checklist
            </h4>
            <span className={`text-xs font-medium ${allDone ? "text-health-green" : "text-slate-500"}`}>{doneCount}/{items.length} complete</span>
          </div>
          <div className="space-y-1.5">
            {items.map((item) => (
              <button
                key={item.id}
                onClick={() => toggle(item)}
                disabled={isDone}
                className="flex w-full items-start gap-2.5 rounded-lg border border-line px-3 py-2 text-left text-sm hover:bg-slate-50 disabled:opacity-70"
              >
                {item.checked ? (
                  <CheckCircle2 size={17} className="mt-0.5 shrink-0 text-health-green" />
                ) : (
                  <Circle size={17} className="mt-0.5 shrink-0 text-slate-300" />
                )}
                <span className={item.checked ? "text-slate-400 line-through" : "text-slate-700"}>{item.label}</span>
              </button>
            ))}
            {items.length === 0 && <p className="text-xs text-slate-400">No checklist attached to this task.</p>}
          </div>

          {!allDone && !isDone && (
            <div className="mt-3 flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
              <Lock size={13} /> The QA gate is locked. Complete every checklist item to close this task — a task cannot be dragged into “Done” until then.
            </div>
          )}
          {error && (
            <div className="mt-3 flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
              <AlertTriangle size={13} /> {error}
            </div>
          )}
        </div>

        {/* Footer action */}
        <div className="flex items-center justify-between border-t border-line px-5 py-4">
          <span className="text-xs text-slate-400">Est {Math.round(task.estimatedHrs)}h · Actual {Math.round(task.actualHrs)}h</span>
          <button
            onClick={advance}
            disabled={isPending || isDone || (status === "QA_REVIEW" && !allDone)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-brand-700 px-4 py-2 text-sm font-medium text-white hover:bg-brand-800 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isDone ? <CheckCircle2 size={15} /> : <ChevronRight size={15} />} {nextLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
