"use client";

import { useState } from "react";
import {
  DndContext, DragOverlay, PointerSensor, TouchSensor,
  useSensor, useSensors, useDraggable, useDroppable, closestCorners,
} from "@dnd-kit/core";
import { setLeadStage } from "./actions";

const PIPELINE_STAGES = [
  { key: "TO_CONTACT",    label: "TO CONTACT",    color: "#5f6733" },
  { key: "CONTACTED",     label: "CONTACTED",     color: "#7c8340" },
  { key: "MEETING_BOOKED",label: "MEETING BOOKED",color: "#a67d3c" },
  { key: "PROPOSAL_SENT", label: "PROPOSAL SENT", color: "#c19749" },
  { key: "WON",           label: "WON",           color: "#7bbf4f" },
];
const PROB_MAP = { TO_CONTACT: 10, CONTACTED: 25, MEETING_BOOKED: 45, PROPOSAL_SENT: 70, WON: 100 };

const AI_COLORS = { HOT: "#ff3b30", WARM: "#c19749", COLD: "#4a9eff", DEAD: "#8a9bb0" };

function fmt(n) { return "AED " + Number(n || 0).toLocaleString(); }

export function KanbanBoard({ leads: initialLeads, onEdit, onDelete, onReload }) {
  const [leads, setLeads] = useState(initialLeads);
  const [activeId, setActiveId] = useState(null);

  // Sync when parent reloads
  if (JSON.stringify(leads.map(l => l.id + l.stage)) !== JSON.stringify(initialLeads.map(l => l.id + l.stage))) {
    setLeads(initialLeads);
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 6 } })
  );

  const byStage = {};
  PIPELINE_STAGES.forEach(s => (byStage[s.key] = []));
  leads.forEach(l => { if (byStage[l.stage]) byStage[l.stage].push(l); });

  const activeLead = leads.find(l => l.id === activeId) || null;

  function handleDragStart(event) { setActiveId(event.active.id); }

  function handleDragEnd(event) {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;
    const leadId = active.id;
    let targetStage = over.id;
    if (!PIPELINE_STAGES.some(s => s.key === targetStage)) {
      const overLead = leads.find(l => l.id === over.id);
      targetStage = overLead ? overLead.stage : null;
    }
    if (!targetStage) return;
    const lead = leads.find(l => l.id === leadId);
    if (!lead || lead.stage === targetStage) return;
    const prev = leads;
    setLeads(cur => cur.map(l => l.id === leadId ? { ...l, stage: targetStage, probability: PROB_MAP[targetStage] ?? l.probability } : l));
    setLeadStage(leadId, targetStage).then(res => {
      if (res && !res.ok) setLeads(prev);
      else if (onReload) onReload();
    });
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd} onDragCancel={() => setActiveId(null)}>
      <div style={{ overflowX: "auto", paddingBottom: 12 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, minmax(200px, 1fr))", gap: 12, minWidth: 1000 }}>
          {PIPELINE_STAGES.map(stage => (
            <Column key={stage.key} stage={stage} items={byStage[stage.key] || []} activeId={activeId} onEdit={onEdit} onDelete={onDelete} />
          ))}
        </div>
      </div>
      <DragOverlay dropAnimation={{ duration: 180, easing: "cubic-bezier(0.2,0,0,1)" }}>
        {activeLead ? <LeadCard lead={activeLead} overlay /> : null}
      </DragOverlay>
    </DndContext>
  );
}

function Column({ stage, items, activeId, onEdit, onDelete }) {
  const { setNodeRef, isOver } = useDroppable({ id: stage.key });
  const total = items.reduce((s, l) => s + (l.estValue || 0), 0);

  return (
    <div ref={setNodeRef} style={{
      background: isOver ? "rgba(107,142,35,0.08)" : "#1a1f14",
      border: `1px solid ${isOver ? stage.color : "#2a3020"}`,
      borderRadius: 6, padding: 10, minHeight: 400,
      transition: "border-color 0.2s, background 0.2s",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8, paddingBottom: 8, borderBottom: `1px solid #2a3020` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: stage.color, display: "inline-block" }} />
          <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: "0.6rem", color: "#a8c060", letterSpacing: 1 }}>{stage.label}</span>
        </div>
        <span style={{ background: "#2a3020", color: "#6b7a5a", borderRadius: 10, padding: "2px 8px", fontSize: "0.7rem" }}>{items.length}</span>
      </div>
      <p style={{ color: "#6b7a5a", fontSize: "0.65rem", marginBottom: 10 }}>{fmt(total)}</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {items.map(l => <DraggableLead key={l.id} lead={l} dimmed={activeId === l.id} onEdit={onEdit} onDelete={onDelete} />)}
        {items.length === 0 && (
          <div style={{ border: "1px dashed #2a3020", borderRadius: 4, padding: "24px 12px", textAlign: "center", color: "#3a4a30", fontSize: "0.7rem" }}>
            Drop here
          </div>
        )}
      </div>
    </div>
  );
}

function DraggableLead({ lead, dimmed, onEdit, onDelete }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: lead.id });
  return (
    <div ref={setNodeRef} style={{ opacity: dimmed || isDragging ? 0.3 : 1 }} {...attributes}>
      <LeadCard lead={lead} dragHandleProps={listeners} onEdit={onEdit} onDelete={onDelete} />
    </div>
  );
}

function LeadCard({ lead, dragHandleProps, overlay, onEdit, onDelete }) {
  return (
    <div style={{
      background: overlay ? "#2a3020" : "#0d1108",
      border: "1px solid #2a3020",
      borderRadius: 4, padding: "10px 12px",
      transform: overlay ? "rotate(2deg)" : "none",
      boxShadow: overlay ? "0 8px 24px rgba(0,0,0,0.5)" : "none",
      cursor: overlay ? "grabbing" : "default",
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
        <p style={{ color: "#c8d8a0", fontSize: "0.85rem", fontWeight: 600, margin: 0, lineHeight: 1.3 }}>{lead.company}</p>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 3 }}>
          <span style={{ background: "rgba(107,142,35,0.15)", color: "#7bbf4f", borderRadius: 3, padding: "2px 6px", fontSize: "0.65rem", whiteSpace: "nowrap", flexShrink: 0 }}>
            {fmt(lead.estValue)}
          </span>
          {lead.aiScore != null && (
            <span style={{ background: `${AI_COLORS[lead.aiScoreLabel] || "#8a9bb0"}20`, color: AI_COLORS[lead.aiScoreLabel] || "#8a9bb0", borderRadius: 3, padding: "1px 5px", fontSize: "0.55rem", fontFamily: "'Orbitron', sans-serif", letterSpacing: 0.5, whiteSpace: "nowrap" }}>
              🤖 {lead.aiScore} · {lead.aiScoreLabel}
            </span>
          )}
        </div>
      </div>
      <p style={{ color: "#6b7a5a", fontSize: "0.75rem", margin: "4px 0 0" }}>{lead.contactName}</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 8 }}>
        {lead.country && <span style={{ background: "#1a2510", color: "#8a9a70", borderRadius: 3, padding: "2px 6px", fontSize: "0.6rem" }}>{lead.country}</span>}
        {lead.source && <span style={{ background: "#1a2510", color: "#8a9a70", borderRadius: 3, padding: "2px 6px", fontSize: "0.6rem" }}>{lead.source}</span>}
        {lead.serviceInterest && <span style={{ background: "#1a2510", color: "#8a9a70", borderRadius: 3, padding: "2px 6px", fontSize: "0.6rem" }}>{lead.serviceInterest}</span>}
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 10 }}>
        <span style={{ color: "#5a6a40", fontSize: "0.65rem" }}>{lead.probability || PROB_MAP[lead.stage] || 10}% likely</span>
        <div style={{ display: "flex", gap: 4 }}>
          {onEdit && <button onClick={() => onEdit(lead)} style={{ background: "transparent", border: "none", color: "#6b7a5a", cursor: "pointer", fontSize: "0.7rem", padding: "2px 6px" }}>✏</button>}
          {onDelete && <button onClick={() => onDelete(lead.id)} style={{ background: "transparent", border: "none", color: "#6b3a3a", cursor: "pointer", fontSize: "0.7rem", padding: "2px 6px" }}>✕</button>}
          <span {...(dragHandleProps || {})} style={{ color: "#3a4a30", cursor: "grab", padding: "2px 4px", fontSize: "0.8rem" }} title="Drag to move">⠿</span>
        </div>
      </div>
    </div>
  );
}