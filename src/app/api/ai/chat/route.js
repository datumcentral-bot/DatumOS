import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const SYSTEM_PROMPT = `You are DATUM AI, the intelligent assistant for Datum Studios Engineering Consultancy — a leading BIM engineering firm specializing in ISO 19650 compliance, digital twin delivery, MEP coordination, and construction project management.

You help clients:
- Check project status and milestones
- Understand BIM deliverables and ISO 19650 requirements
- Get answers about timelines, schedules, and deadlines
- Understand invoices and payment processes
- Learn about clash detection and coordination
- Contact the right team members

Be professional, concise, and helpful. Use technical BIM terminology appropriately. Keep responses under 150 words. Always offer to connect them with their project manager for complex queries.`;

// ─── Pattern-matching fallback chatbot ─────────────────────────────────────
function fallbackChat(message) {
  const msg = message.toLowerCase();

  if (/project status|how is my project|project progress|update on/.test(msg)) {
    return "Your projects are progressing according to the BIM Execution Plan. Check the **Projects** tab for detailed status including BIM coordination milestones, clash resolution progress, and delivery schedule. For a specific project update, please contact your assigned BIM coordinator.";
  }
  if (/invoice|payment|billing|cost|fee/.test(msg)) {
    return "You can view all invoices in the **Invoices** section of your portal. For payment queries or to request a payment schedule, please contact our accounts team at accounts@datum-bim.com or call +971 4 XXX XXXX.";
  }
  if (/clash|coordination|conflict|interference/.test(msg)) {
    return "BIM clash detection is running continuously on your federated model. Our coordination team reviews all clashes weekly and prioritizes by severity (Critical → Major → Minor). You can view the clash register in your **Documents** section. Critical clashes are resolved within 48 hours.";
  }
  if (/timeline|schedule|deadline|milestone|delivery|when/.test(msg)) {
    return "Project timelines are managed through our ISO 19650-compliant delivery schedule. Check the **Deliverables** section for upcoming milestones and submission dates. If you need a timeline extension or have concerns about a deadline, please contact your project manager immediately.";
  }
  if (/team|who|contact|manager|coordinator|engineer/.test(msg)) {
    return "Your project team includes a dedicated BIM Manager, BIM Coordinators for each discipline (Structural, MEP, Architectural), and a Client Success Manager. Contact your project manager directly or use the **Support** section to raise a query. We respond within 4 business hours.";
  }
  if (/document|drawing|model|file|download|bim|revit/.test(msg)) {
    return "All project documents, BIM models, and drawings are available in the **Documents** section. Files are organized by discipline and revision. For the latest federated model or specific drawing revisions, contact your BIM coordinator. Models are updated after each coordination meeting.";
  }
  if (/iso|19650|compliance|standard|protocol/.test(msg)) {
    return "Datum Studios operates fully in compliance with ISO 19650 — the international standard for BIM information management. Your project follows the BIM Execution Plan (BEP) and all deliverables meet the Employer's Information Requirements (EIR). Compliance reports are available in your portal.";
  }
  if (/hello|hi|hey|good morning|good afternoon|greetings/.test(msg)) {
    return "Hello! I'm **DATUM AI**, your intelligent project assistant. I can help you with project status, BIM deliverables, invoices, timelines, clash coordination, and team contacts. What would you like to know today?";
  }
  if (/thank|thanks|appreciate/.test(msg)) {
    return "You're welcome! Is there anything else I can help you with? For urgent matters, don't hesitate to contact your project manager directly.";
  }

  return "I can help you with **project status**, **invoices**, **BIM coordination**, **timelines**, **team contacts**, and **document access**. Could you provide more details about your query? For complex or urgent matters, I'll connect you with your project manager.";
}

// ─── OpenAI chat ───────────────────────────────────────────────────────────
async function openAIChat(messages, apiKey) {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages.slice(-10), // last 10 messages for context
      ],
      temperature: 0.5,
      max_tokens: 200,
    }),
  });

  if (!res.ok) throw new Error(`OpenAI error: ${res.status}`);
  const data = await res.json();
  return data.choices[0].message.content.trim();
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { message, sessionId, history = [] } = body;

    if (!message || !sessionId) {
      return NextResponse.json({ error: 'message and sessionId required' }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    let reply;
    let usedAI = false;

    if (apiKey && apiKey.startsWith('sk-')) {
      try {
        const msgs = history.map(m => ({ role: m.role.toLowerCase(), content: m.content }));
        msgs.push({ role: 'user', content: message });
        reply = await openAIChat(msgs, apiKey);
        usedAI = true;
      } catch (e) {
        console.warn('OpenAI chat failed, using fallback:', e.message);
        reply = fallbackChat(message);
      }
    } else {
      reply = fallbackChat(message);
    }

    // Persist messages
    await prisma.aIChatMessage.createMany({
      data: [
        { sessionId, role: 'USER', content: message },
        { sessionId, role: 'ASSISTANT', content: reply },
      ],
    });

    return NextResponse.json({ reply, usedAI }, { status: 200 });
  } catch (err) {
    console.error('ai/chat error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get('sessionId');
  if (!sessionId) return NextResponse.json({ error: 'sessionId required' }, { status: 400 });

  const messages = await prisma.aIChatMessage.findMany({
    where: { sessionId },
    orderBy: { createdAt: 'asc' },
  });
  return NextResponse.json(messages);
}
