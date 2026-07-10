import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ─── Rule-based lead scoring (same as API route) ───────────────────────────
function scoreLeadFallback(lead) {
  let score = 20;
  const { estValue = 0, source = '', stage = '', company = '', notes = '' } = lead;

  if (estValue >= 500000) score += 30;
  else if (estValue >= 200000) score += 20;
  else if (estValue >= 100000) score += 10;
  else if (estValue >= 50000) score += 5;

  const src = (source || '').toUpperCase();
  if (src === 'REFERRAL') score += 20;
  else if (src === 'WEBSITE') score += 10;
  else if (src === 'LINKEDIN') score += 12;
  else if (src === 'CONFERENCE') score += 8;
  else if (src === 'COLD_CALL') score += 5;

  const stg = (stage || '').toUpperCase();
  if (stg === 'NEGOTIATION') score += 30;
  else if (stg === 'PROPOSAL_SENT') score += 25;
  else if (stg === 'QUALIFIED') score += 15;
  else if (stg === 'CONTACTED') score += 8;

  const compLen = (company || '').length;
  if (compLen > 30) score += 10;
  else if (compLen > 20) score += 7;
  else if (compLen > 10) score += 4;

  if (notes && notes.length > 100) score += 5;

  score = Math.min(100, Math.max(0, score));

  let label, insight;
  if (score >= 70) {
    label = 'HOT';
    insight = `High-value prospect (AED ${(estValue/1000).toFixed(0)}K) with strong engagement signals. Prioritize immediate outreach and proposal preparation.`;
  } else if (score >= 45) {
    label = 'WARM';
    insight = `Moderate opportunity with ${stg.replace('_', ' ')} status. ${estValue > 100000 ? 'Deal value justifies dedicated attention.' : 'Nurture with targeted BIM capability content.'}`;
  } else if (score >= 25) {
    label = 'COLD';
    insight = `Early-stage lead requiring nurturing. Add to drip campaign sequence and monitor engagement. Re-evaluate in 30 days.`;
  } else {
    label = 'DEAD';
    insight = `Low engagement signals detected. Consider archiving or moving to long-term nurture sequence.`;
  }

  return { score, label, insight };
}

// ─── Rule-based clash classification ──────────────────────────────────────
function classifyClashFallback(clash) {
  const text = `${clash.title || ''} ${clash.description || ''} ${clash.discipline1 || ''} ${clash.discipline2 || ''}`.toLowerCase();

  if (/structural|foundation|load.bearing|fire.escape|egress|shear.wall|column|beam|slab/.test(text)) {
    return {
      aiSeverity: 'CRITICAL',
      aiCategory: 'Structural Integrity',
      aiRecommendation: 'IMMEDIATE ACTION REQUIRED: Halt affected construction activities. Convene emergency coordination meeting with structural engineer within 24 hours.',
    };
  }
  if (/mep|duct|pipe|plumbing|electrical|hvac|sprinkler|conduit|mechanical/.test(text)) {
    return {
      aiSeverity: 'MAJOR',
      aiCategory: 'MEP Coordination',
      aiRecommendation: 'Schedule MEP coordination meeting within 48 hours. Reroute conflicting services per priority hierarchy. Update federated model after resolution.',
    };
  }
  if (/architectural|finish|ceiling|cladding|facade|partition|door|window/.test(text)) {
    return {
      aiSeverity: 'MINOR',
      aiCategory: 'Architectural Coordination',
      aiRecommendation: 'Coordinate with architect to adjust finish elements. Verify clearances meet minimum code requirements before closing.',
    };
  }
  return {
    aiSeverity: 'INFO',
    aiCategory: 'General Coordination',
    aiRecommendation: 'Review clash in federated model with relevant discipline leads. Determine if clash is a true conflict or acceptable tolerance.',
  };
}

async function main() {
  console.log('🤖 DatumOS v30 AI Seed Starting...');

  // ── Score all existing leads ──────────────────────────────────────────────
  const leads = await prisma.lead.findMany();
  console.log(`📊 Scoring ${leads.length} leads...`);
  for (const lead of leads) {
    const { score, label, insight } = scoreLeadFallback(lead);
    await prisma.lead.update({
      where: { id: lead.id },
      data: { aiScore: score, aiScoreLabel: label, aiInsight: insight },
    });
    console.log(`  ✓ ${lead.company}: ${score}/100 [${label}]`);
  }

  // ── Classify all existing clashes ─────────────────────────────────────────
  const clashes = await prisma.clashDetection.findMany();
  console.log(`\n⚡ Classifying ${clashes.length} clashes...`);
  for (const clash of clashes) {
    const classification = classifyClashFallback(clash);
    await prisma.clashDetection.update({
      where: { id: clash.id },
      data: classification,
    });
    console.log(`  ✓ ${clash.title}: [${classification.aiSeverity}] ${classification.aiCategory}`);
  }

  // ── Seed sample AI chat session ───────────────────────────────────────────
  const sessionId = 'demo-session-v30';
  const existingChat = await prisma.aIChatMessage.count({ where: { sessionId } });
  if (existingChat === 0) {
    console.log('\n💬 Seeding sample AI chat session...');
    await prisma.aIChatMessage.createMany({
      data: [
        { sessionId, role: 'USER', content: 'Hello, can you give me an update on my project?' },
        { sessionId, role: 'ASSISTANT', content: "Hello! I'm DATUM AI, your intelligent project assistant. Your projects are progressing according to the BIM Execution Plan. Check the **Projects** tab for detailed status including BIM coordination milestones and delivery schedule." },
        { sessionId, role: 'USER', content: 'What about the clash detection status?' },
        { sessionId, role: 'ASSISTANT', content: 'BIM clash detection is running continuously on your federated model. Our coordination team reviews all clashes weekly and prioritizes by severity. Critical clashes are resolved within 48 hours. You can view the clash register in your Documents section.' },
        { sessionId, role: 'USER', content: 'When is the next milestone delivery?' },
        { sessionId, role: 'ASSISTANT', content: 'Project timelines are managed through our ISO 19650-compliant delivery schedule. Check the **Deliverables** section for upcoming milestones and submission dates. For specific deadline queries, I can connect you with your project manager.' },
        { sessionId, role: 'USER', content: 'Thank you!' },
        { sessionId, role: 'ASSISTANT', content: "You're welcome! Is there anything else I can help you with? For urgent matters, don't hesitate to contact your project manager directly." },
      ],
    });
    console.log('  ✓ Sample chat session seeded (8 messages)');
  } else {
    console.log('  ℹ Chat session already exists, skipping');
  }

  // ── Add AI settings to SystemSettings ────────────────────────────────────
  const aiSettings = [
    { key: 'ai_lead_scoring', value: 'true', category: 'AI' },
    { key: 'ai_clash_classify', value: 'true', category: 'AI' },
    { key: 'ai_chat_widget', value: 'true', category: 'AI' },
    { key: 'ai_model', value: 'gpt-4o-mini', category: 'AI' },
  ];

  for (const setting of aiSettings) {
    await prisma.systemSettings.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    });
  }
  console.log('\n⚙️  AI settings initialized');

  console.log('\n✅ DatumOS v30 AI Seed Complete!');
  console.log(`   Leads scored: ${leads.length}`);
  console.log(`   Clashes classified: ${clashes.length}`);
  console.log(`   Chat messages seeded: 8`);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
