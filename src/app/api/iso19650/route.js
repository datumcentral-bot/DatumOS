import { NextResponse } from 'next/server'
import { guard } from '@/lib/auth';
import { errorResponse } from "@/lib/api-errors";

const ISO_19650_STAGES = {
  "WIP": "Work in Progress",
  "Shared": "Shared (Coordination)",
  "Published": "Published (For Approval)",
  "Archived": "Archived"
};

const ISO_19650_ROLES = {
  "Author": "Originates content",
  "Checker": "Checks validity",
  "Approver": "Approves for sharing",
  "Custodian": "Manages container"
};

// In-memory store for ISO 19650 containers (persisted in memory during server runtime)
let containers = {};
let auditTrail = [];

const audit = (action, user, details) => {
  auditTrail.push({
    timestamp: new Date().toISOString(),
    action,
    user,
    details,
  });
};

export const dynamic = "force-dynamic";

export async function GET(req, { params }) {
  const denied = await guard('DIRECTOR');
  if (denied) return denied;

  try {
    const { searchParams } = new URL(req.url);
    const containerId = searchParams.get('containerId');
    const stage = searchParams.get('stage');
    const projectCode = searchParams.get('projectCode');

    let list = Object.values(containers);
    if (stage) list = list.filter(c => c.stage === stage);
    if (projectCode) list = list.filter(c => c.projectCode === projectCode);

    if (containerId) {
      return NextResponse.json(containers[containerId] || { error: "Container not found" });
    }

    return NextResponse.json({ containers: list, audit: auditTrail });
  } catch (e) {
    return errorResponse(e, req);
  }
}

export async function POST(req) {
  const denied = await guard('DIRECTOR');
  if (denied) return denied;

  try {
    const body = await req.json();
    const { containerId, name, stage, projectCode, author, description } = body;

    if (!containerId || !name || !stage || !projectCode || !author) {
      return NextResponse.json({ error: "containerId, name, stage, projectCode, author are required" }, { status: 400 });
    }

    if (!ISO_19650_STAGES[stage]) {
      return NextResponse.json({ error: `Invalid stage. Must be one of: ${Object.keys(ISO_19650_STAGES).join(", ")}` }, { status: 400 });
    }

    if (containers[containerId]) {
      return NextResponse.json({ error: "Container already exists" }, { status: 409 });
    }

    const container = {
      id: containerId,
      name,
      stage,
      stageDescription: ISO_19650_STAGES[stage],
      projectCode,
      author,
      description: description || "",
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
      status: "active",
      roles: { Author: [], Checker: [], Approver: [], Custodian: [] },
      revision: 1,
      files: [],
    };

    containers[containerId] = container;
    audit("create_container", author, `Container ${containerId} created at stage ${stage}`);

    return NextResponse.json(container, { status: 201 });
  } catch (e) {
    return errorResponse(e, req);
  }
}

export async function PUT(req) {
  const denied = await guard('DIRECTOR');
  if (denied) return denied;

  try {
    const body = await req.json();
    const { containerId, newStage, user, reason } = body;

    if (!containerId || !newStage || !user) {
      return NextResponse.json({ error: "containerId, newStage, user are required" }, { status: 400 });
    }

    if (!ISO_19650_STAGES[newStage]) {
      return NextResponse.json({ error: `Invalid stage. Must be one of: ${Object.keys(ISO_19650_STAGES).join(", ")}` }, { status: 400 });
    }

    if (!containers[containerId]) {
      return NextResponse.json({ error: "Container not found" }, { status: 404 });
    }

    const oldStage = containers[containerId].stage;
    containers[containerId].stage = newStage;
    containers[containerId].updated = new Date().toISOString();
    containers[containerId].revision += 1;

    audit("transition", user, `Container ${containerId} moved from ${oldStage} to ${newStage}. Reason: ${reason || ""}`);

    return NextResponse.json(containers[containerId]);
  } catch (e) {
    return errorResponse(e, req);
  }
}

export async function DELETE(req) {
  const denied = await guard('DIRECTOR');
  if (denied) return denied;

  try {
    const { searchParams } = new URL(req.url);
    const containerId = searchParams.get('containerId');

    if (!containerId) {
      return NextResponse.json({ error: "containerId is required" }, { status: 400 });
    }

    if (!containers[containerId]) {
      return NextResponse.json({ error: "Container not found" }, { status: 404 });
    }

    delete containers[containerId];
    audit("delete_container", "system", `Container ${containerId} deleted`);

    return NextResponse.json({ ok: true });
  } catch (e) {
    return errorResponse(e, req);
  }
}
