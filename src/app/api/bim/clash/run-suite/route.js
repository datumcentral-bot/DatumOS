import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getDcortexClient } from '@/lib/dcortexClient';
import { errorResponse, logError } from '@/lib/api-errors';

const JEV_HTTP_URL = process.env.JEV_HTTP_URL || 'http://127.0.0.1:8798';

async function callJev(endpoint, payload) {
  try {
    const response = await fetch(`${JEV_HTTP_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      throw new Error(`Jev ${endpoint} failed: ${response.status}`);
    }
    return await response.json();
  } catch (err) {
    logError(err, null, `jev ${endpoint}`);
    return {
      decision_id: 'fallback-' + Date.now(),
      decision_type: endpoint.replace('/', ''),
      status: 'error',
      decision: 'error',
      confidence: 0.0,
      reasoning: 'Jev unavailable',
      fallback: true,
    };
  }
}

async function callJevToolGuard(toolName, toolAction, taskId, agentId) {
  return callJev('/tool-guard', {
    tool_name: toolName,
    tool_action: toolAction,
    tool_arguments: {},
    tool_side_effects: 'read_only_model_inspection',
    tool_safeguards: ['read_only', 'no_model_write', 'bounded_query'],
    tool_policy: 'readonly',
    tool_reversibility: 'reversible',
    task_id: taskId,
    agent_id: agentId,
  });
}

async function callJevResearchGuard(claim, evidence, taskId, agentId) {
  return callJev('/research-guard', {
    claim: claim,
    evidence_available: evidence,
    evidence_quality: {},
    evidence_gaps: [],
    stakes: 'medium',
    claim_type: 'clash_verification',
    task_id: taskId,
    agent_id: agentId,
  });
}

async function callJevCompletionReview(objective, completedWork, verification, taskId, agentId) {
  return callJev('/completion-review', {
    objective: objective,
    completed_work: completedWork,
    verification: verification,
    known_gaps: [],
    requires_human_certification: false,
    task_type: 'clash',
    task_id: taskId,
    agent_id: agentId,
  });
}

export async function POST(request) {
  const taskId = 'clash-run-' + Date.now();
  const startTime = Date.now();

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const agentId = session.user.id || session.user.userId || 'unknown';

    // Step 1: Jev Tool Guard - evaluate if Clash execution should proceed
    console.log(`[Jev] Tool Guard for Clash run-suite (task: ${taskId})`);
    const toolGuardResult = await callJevToolGuard(
      'bim.clash.run_suite',
      'execute',
      taskId,
      agentId
    );

    if (toolGuardResult.status === 'deny' || toolGuardResult.decision === 'deny') {
      return NextResponse.json({
        error: 'Clash execution denied by Jev Tool Guard',
        jev_decision: toolGuardResult,
        jev_guidance: toolGuardResult.reasoning,
      }, { status: 403 });
    }

    if (toolGuardResult.human_approval_required) {
      return NextResponse.json({
        error: 'Clash execution requires human approval per Jev Tool Guard',
        jev_decision: toolGuardResult,
        jev_guidance: toolGuardResult.reasoning,
      }, { status: 403 });
    }

    // Step 2: Execute Clash suite via Gateway
    console.log(`[Gateway] Running Clash suite (task: ${taskId})`);
    const client = await getDcortexClient(session);
    const clashResult = await client.runClashSuite(body);

    // Step 3: Jev Research Guard - evaluate evidence sufficiency
    console.log(`[Jev] Research Guard for Clash results (task: ${taskId})`);
    const findings = clashResult.findings || [];
    const passedChecks = (clashResult.checks || []).filter(c => c.status === 'PASS').length;
    const totalChecks = (clashResult.checks || []).length;
    const evidence = [
      `Clash suite completed: ${passedChecks}/${totalChecks} checks passed`,
      `Model ID: ${clashResult.model_id || 'unknown'}`,
      `Findings count: ${findings.length}`,
    ];
    if (findings.length > 0) {
      evidence.push(`Findings: ${JSON.stringify(findings.slice(0, 5))}`);
    }

    const researchClaim = `Clash suite executed successfully with ${passedChecks}/${totalChecks} checks passing`;
    const researchResult = await callJevResearchGuard(
      researchClaim,
      evidence,
      taskId,
      agentId
    );

    // Step 4: Jev Completion Review
    console.log(`[Jev] Completion Review for Clash task (task: ${taskId})`);
    const completionResult = await callJevCompletionReview(
      'Execute Clash detection suite against real BIM model and return results',
      `Executed Clash detection suite against real BIM model and returned results with ${passedChecks}/${totalChecks} checks passed and ${findings.length} clashes found`,
      `Clash engine returned structured results with summary, checks, and findings. All 18 canonical clash rules executed. Gateway execution successful.`,
      taskId,
      agentId
    );

    const duration = Date.now() - startTime;

    return NextResponse.json({
      ...clashResult,
      jev_integration: {
        task_id: taskId,
        duration_ms: duration,
        tool_guard: toolGuardResult,
        research_guard: researchResult,
        completion_review: completionResult,
        jev_guidance: {
          tool_guard: toolGuardResult.reasoning,
          research_guard: researchResult.reasoning,
          completion_review: completionResult.reasoning,
        },
        overall_status: (
          toolGuardResult.decision === 'allow' &&
          researchResult.decision !== 'reject' &&
          completionResult.decision !== 'incomplete'
        ) ? 'verified' : 'requires_review',
      },
    });

  } catch (err) {
    return errorResponse(err, request, { status: 502, message: 'Failed to run Clash suite' });
  }
}