import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Get AI usage stats
    const [leadsScored, clashesClassified, chatMessages] = await Promise.all([
      prisma.lead.count({ where: { aiScore: { not: null } } }),
      prisma.clashDetection.count({ where: { aiSeverity: { not: null } } }),
      prisma.aIChatMessage.count(),
    ]);

    const hasApiKey = !!(process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.startsWith('sk-'));

    // Get feature toggle settings from SystemSettings
    const settings = await prisma.systemSettings.findMany({
      where: { key: { in: ['ai_lead_scoring', 'ai_clash_classify', 'ai_chat_widget', 'ai_model'] } },
    });

    const settingsMap = {};
    settings.forEach(s => { settingsMap[s.key] = s.value; });

    return NextResponse.json({
      hasApiKey,
      apiKeyMasked: hasApiKey ? `sk-...${process.env.OPENAI_API_KEY.slice(-4)}` : null,
      model: settingsMap.ai_model || 'gpt-4o-mini',
      features: {
        leadScoring: settingsMap.ai_lead_scoring !== 'false',
        clashClassify: settingsMap.ai_clash_classify !== 'false',
        chatWidget: settingsMap.ai_chat_widget !== 'false',
      },
      stats: { leadsScored, clashesClassified, chatMessages },
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { action, feature, enabled, model } = body;

    if (action === 'test') {
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey || !apiKey.startsWith('sk-')) {
        return NextResponse.json({ success: false, message: 'No API key configured. Using rule-based fallback mode.' });
      }
      try {
        const res = await fetch('https://api.openai.com/v1/models', {
          headers: { 'Authorization': `Bearer ${apiKey}` },
        });
        if (res.ok) {
          return NextResponse.json({ success: true, message: 'OpenAI connection successful! AI features are fully active.' });
        } else {
          return NextResponse.json({ success: false, message: `OpenAI returned ${res.status}. Check your API key.` });
        }
      } catch (e) {
        return NextResponse.json({ success: false, message: `Connection failed: ${e.message}` });
      }
    }

    if (action === 'toggle' && feature) {
      const keyMap = { leadScoring: 'ai_lead_scoring', clashClassify: 'ai_clash_classify', chatWidget: 'ai_chat_widget' };
      const key = keyMap[feature];
      if (key) {
        await prisma.systemSettings.upsert({
          where: { key },
          update: { value: String(enabled) },
          create: { key, value: String(enabled), category: 'AI' },
        });
      }
      return NextResponse.json({ success: true });
    }

    if (action === 'setModel' && model) {
      await prisma.systemSettings.upsert({
        where: { key: 'ai_model' },
        update: { value: model },
        create: { key: 'ai_model', value: model, category: 'AI' },
      });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}