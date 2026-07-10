import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// ─── Rule-based fallback scoring ───────────────────────────────────────────
function fallbackScore(lead) {
  let score = 20; // base
  const { estValue = 0, source = '', stage = '', company = '', notes = '' } = lead;

  // Value scoring
  if (estValue >= 500000) score += 30;
  else if (estValue >= 200000) score += 20;
  else if (estValue >= 100000) score += 10;
  else if (estValue >= 50000) score += 5;

  // Source bonus
  const src = (source || '').toUpperCase();
  if (src === 'REFERRAL') score += 20;
  else if (src === 'WEBSITE') score += 10;
  else if (src === 'LINKEDIN') score += 12;
  else if (src === 'CONFERENCE') score += 8;
  else if (src === 'COLD_CALL') score += 5;

  // Stage bonus
  const stg = (stage || '').toUpperCase();
  if (stg === 'NEGOTIATION') score += 30;
  else if (stg === 'PROPOSAL_SENT') score += 25;
  else if (stg === 'QUALIFIED') score += 15;
  else if (stg === 'CONTACTED') score += 8;
  else if (stg === 'TO_CONTACT') score += 2;

  // Company complexity (proxy for enterprise size)
  const compLen = (company || '').length;
  if (compLen > 30) score += 10;
  else if (compLen > 20) score += 7;
  else if (compLen > 10) score += 4;

  // Notes engagement signal
  if (notes && notes.length > 100) score += 5;
  if (notes && notes.toLowerCase().includes('urgent')) score += 8;
  if (notes && notes.toLowerCase().includes('budget approved')) score += 10;

  score = Math.min(100, Math.max(0, score));

  let label, insight;
  if (score >= 70) {
    label = 'HOT';
    insight = `High-value prospect (AED ${(estValue/1000).toFixed(0)}K) with strong engagement signals. Prioritize immediate outreach and proposal preparation. ${src === 'REFERRAL' ? 'Referral source increases conversion probability significantly.' : 'Consider scheduling a discovery call this week.'}`;
  } else if (score >= 45) {
    label = 'WARM';
    insight = `Moderate opportunity with ${stg.replace('_', ' ')} status. ${estValue > 100000 ? 'Deal value justifies dedicated attention.' : 'Nurture with targeted BIM capability content.'} Follow up within 5 business days.`;
  } else if (score >= 25) {
    label = 'COLD';
    insight = `Early-stage lead requiring nurturing. Add to drip campaign sequence and monitor engagement. Re-evaluate in 30 days based on response rate.`;
  } else {
    label = 'DEAD';
    insight = `Low engagement signals detected. Consider archiving or moving to long-term nurture sequence. Focus resources on higher-probability opportunities.`;
  }

  return { score, label, insight };
}

// ─── OpenAI scoring ────────────────────────────────────────────────────────
async function openAIScore(lead, apiKey) {
  const prompt = `You are a BIM engineering consultancy sales analyst. Score this lead from 0-100 and classify as HOT/WARM/COLD/DEAD.

Lead Data:
- Company: ${lead.company}
- Contact: ${lead.contactName}
- Estimated Value: AED ${lead.estValue?.toLocaleString() || 0}
- Source: ${lead.source || 'Unknown'}
- Stage: ${lead.stage || 'TO_CONTACT'}
- Service Interest: ${lead.serviceInterest || 'General BIM'}
- Notes: ${lead.notes || 'None'}

Respond ONLY with valid JSON: {"score": <0-100>, "label": "<HOT|WARM|COLD|DEAD>", "insight": "<2-3 sentence actionable insight>"}`;

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 200,
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
    const { leadId, company, estValue, source, stage, notes, serviceInterest, contactName } = body;

    const lead = { company, estValue, source, stage, notes, serviceInterest, contactName };
    const apiKey = process.env.OPENAI_API_KEY;

    let result;
    let usedAI = false;

    if (apiKey && apiKey.startsWith('sk-')) {
      try {
        result = await openAIScore(lead, apiKey);
        usedAI = true;
      } catch (e) {
        console.warn('OpenAI failed, using fallback:', e.message);
        result = fallbackScore(lead);
      }
    } else {
      result = fallbackScore(lead);
    }

    // Persist to DB if leadId provided
    if (leadId) {
      await prisma.lead.update({
        where: { id: leadId },
        data: {
          aiScore: result.score,
          aiScoreLabel: result.label,
          aiInsight: result.insight,
        },
      });
    }

    return NextResponse.json({ ...result, usedAI }, { status: 200 });
  } catch (err) {
    console.error('lead-score error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ endpoint: 'POST /api/ai/lead-score', params: ['leadId?', 'company', 'estValue', 'source', 'stage', 'notes'] });
}
