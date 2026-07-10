import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// ─── Rule-based fallback classification ────────────────────────────────────
function fallbackClassify(clash) {
  const text = `${clash.title || ''} ${clash.description || ''} ${clash.discipline1 || ''} ${clash.discipline2 || ''}`.toLowerCase();

  let severity, category, recommendation;

  // CRITICAL keywords
  if (/structural|foundation|load.bearing|fire.escape|egress|shear.wall|column|beam|slab/.test(text)) {
    severity = 'CRITICAL';
    category = 'Structural Integrity';
    recommendation = 'IMMEDIATE ACTION REQUIRED: Halt affected construction activities. Convene emergency coordination meeting with structural engineer and BIM coordinator within 24 hours. Issue RFI and document resolution in BIM execution plan.';
  }
  // MAJOR keywords
  else if (/mep|duct|pipe|plumbing|electrical|hvac|sprinkler|conduit|cable.tray|mechanical/.test(text)) {
    severity = 'MAJOR';
    category = 'MEP Coordination';
    recommendation = 'Schedule MEP coordination meeting within 48 hours. Reroute conflicting services per priority hierarchy (gravity drainage > pressurized > electrical). Update federated model and rerun clash detection after resolution.';
  }
  // MINOR keywords
  else if (/architectural|finish|ceiling|cladding|facade|partition|door|window|furniture/.test(text)) {
    severity = 'MINOR';
    category = 'Architectural Coordination';
    recommendation = 'Coordinate with architect and contractor to adjust finish elements. Document agreed resolution in clash register. Verify clearances meet minimum code requirements before closing.';
  }
  // INFO / default
  else {
    severity = 'INFO';
    category = 'General Coordination';
    recommendation = 'Review clash in federated model with relevant discipline leads. Determine if clash is a true conflict or acceptable tolerance. Update clash status after review meeting.';
  }

  return { severity, category, recommendation };
}

// ─── OpenAI classification ─────────────────────────────────────────────────
async function openAIClassify(clash, apiKey) {
  const prompt = `You are a BIM coordination specialist. Classify this clash detected in a BIM model.

Clash Data:
- Title: ${clash.title}
- Description: ${clash.description || 'N/A'}
- Discipline 1: ${clash.discipline1 || 'Unknown'}
- Discipline 2: ${clash.discipline2 || 'Unknown'}
- Current Severity: ${clash.severity || 'MEDIUM'}
- Notes: ${clash.notes || 'None'}

Respond ONLY with valid JSON: {"severity": "<CRITICAL|MAJOR|MINOR|INFO>", "category": "<category name>", "recommendation": "<2-3 sentence actionable recommendation>"}`;

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2,
      max_tokens: 250,
    }),
  });

  if (!res.ok) throw new Error(`OpenAI error: ${res.status}`);
  const data = await res.json();
  const text = data.choices[0].message.content.trim();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('No JSON in OpenAI response');
  return JSON.parse(jsonMatch[0]);
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { clashId, title, description, discipline1, discipline2, severity, notes } = body;

    const clash = { title, description, discipline1, discipline2, severity, notes };
    const apiKey = process.env.OPENAI_API_KEY;

    let result;
    let usedAI = false;

    if (apiKey && apiKey.startsWith('sk-')) {
      try {
        result = await openAIClassify(clash, apiKey);
        usedAI = true;
      } catch (e) {
        console.warn('OpenAI failed, using fallback:', e.message);
        result = fallbackClassify(clash);
      }
    } else {
      result = fallbackClassify(clash);
    }

    // Persist to DB if clashId provided
    if (clashId) {
      await prisma.clashDetection.update({
        where: { id: clashId },
        data: {
          aiSeverity: result.severity,
          aiCategory: result.category,
          aiRecommendation: result.recommendation,
        },
      });
    }

    return NextResponse.json({ ...result, usedAI }, { status: 200 });
  } catch (err) {
    console.error('clash-classify error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ endpoint: 'POST /api/ai/clash-classify', params: ['clashId?', 'title', 'description', 'discipline1', 'discipline2', 'severity', 'notes'] });
}
