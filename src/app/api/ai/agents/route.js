import { NextResponse } from 'next/server';
import { guard } from '@/lib/auth';
import { errorResponse } from "@/lib/api-errors";
import { broadcast } from '@/lib/broadcast';

const AGENTS = [
  {
    id: 'system_agent',
    name: 'SystemAgent',
    role: 'System monitoring and control',
    status: 'ONLINE',
    capabilities: ['cpu_monitoring', 'ram_monitoring', 'disk_monitoring', 'ollama_check', 'system_health'],
    lastHeartbeat: new Date().toISOString(),
    tasksProcessed: 247,
    errorCount: 0,
  },
  {
    id: 'research_agent',
    name: 'ResearchAgent',
    role: 'Web search and information analysis',
    status: 'ONLINE',
    capabilities: ['web_search', 'information_retrieval', 'document_analysis'],
    lastHeartbeat: new Date().toISOString(),
    tasksProcessed: 156,
    errorCount: 1,
  },
];

const TASKS = [
  {
    id: 'task_001',
    agentId: 'system_agent',
    agentName: 'SystemAgent',
    task: 'Check CPU status',
    status: 'COMPLETED',
    result: 'CPU: 12%',
    createdAt: new Date(Date.now() - 300000).toISOString(),
    completedAt: new Date(Date.now() - 299000).toISOString(),
  },
  {
    id: 'task_002',
    agentId: 'system_agent',
    agentName: 'SystemAgent',
    task: 'Check RAM status',
    status: 'COMPLETED',
    result: 'Free RAM: 8.2 GB',
    createdAt: new Date(Date.now() - 200000).toISOString(),
    completedAt: new Date(Date.now() - 199000).toISOString(),
  },
  {
    id: 'task_003',
    agentId: 'research_agent',
    agentName: 'ResearchAgent',
    task: 'Search for ISO 19650 standards',
    status: 'PENDING',
    result: null,
    createdAt: new Date(Date.now() - 60000).toISOString(),
    completedAt: null,
  },
];

export const dynamic = "force-dynamic";

export async function GET(req) {
  const denied = await guard('DIRECTOR');
  if (denied) return denied;

  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action');

    if (action === 'agents') {
      return NextResponse.json({ agents: AGENTS });
    }

    if (action === 'tasks') {
      return NextResponse.json({ tasks: TASKS });
    }

    if (action === 'status') {
      return NextResponse.json({
        totalAgents: AGENTS.length,
        onlineAgents: AGENTS.filter(a => a.status === 'ONLINE').length,
        totalTasks: TASKS.length,
        completedTasks: TASKS.filter(t => t.status === 'COMPLETED').length,
        pendingTasks: TASKS.filter(t => t.status === 'PENDING').length,
      });
    }

    return NextResponse.json({
      agents: AGENTS,
      tasks: TASKS,
      stats: {
        totalAgents: AGENTS.length,
        onlineAgents: AGENTS.filter(a => a.status === 'ONLINE').length,
        totalTasks: TASKS.length,
        completedTasks: TASKS.filter(t => t.status === 'COMPLETED').length,
        pendingTasks: TASKS.filter(t => t.status === 'PENDING').length,
      },
    });
  } catch (e) {
    return errorResponse(e, req);
  }
}

export async function POST(req) {
  const denied = await guard('DIRECTOR');
  if (denied) return denied;

  try {
    const body = await req.json();
    const { agentId, task } = body;

    if (!agentId || !task) {
      return NextResponse.json({ error: "agentId and task are required" }, { status: 400 });
    }

    const agent = AGENTS.find(a => a.id === agentId);
    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    const newTask = {
      id: 'task_' + Date.now(),
      agentId,
      agentName: agent.name,
      task,
      status: 'PROCESSING',
      result: null,
      createdAt: new Date().toISOString(),
      completedAt: null,
    };

    TASKS.push(newTask);

    broadcast('ai_agents', 'task_created', newTask, 'System');

    return NextResponse.json({
      ok: true,
      message: "Task assigned to agent",
      task: newTask,
    });
  } catch (e) {
    return errorResponse(e, req);
  }
}
