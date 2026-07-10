import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req) {
  try {
    const body = await req.json();
    const { name, company, email, phone, projectType, projectValue, message } = body;

    if (!name || !company || !email) {
      return NextResponse.json({ error: 'Name, company, and email are required' }, { status: 400 });
    }

    // Rule-based AI score for website leads
    let aiScore = 30;
    let aiScoreLabel = 'COLD';
    if (projectValue?.includes('1B') || projectValue?.includes('200M')) { aiScore += 30; }
    else if (projectValue?.includes('50M')) { aiScore += 20; }
    else if (projectValue?.includes('10M')) { aiScore += 10; }
    aiScore += 10; // WEBSITE source bonus
    if (projectType) aiScore += 10;
    if (phone) aiScore += 5;
    aiScore = Math.min(aiScore, 100);
    if (aiScore >= 70) aiScoreLabel = 'HOT';
    else if (aiScore >= 50) aiScoreLabel = 'WARM';
    else if (aiScore >= 30) aiScoreLabel = 'COLD';
    else aiScoreLabel = 'DEAD';

    const aiInsight = `Website inquiry from ${company}. ${projectType ? `Interested in ${projectType}.` : ''} ${projectValue ? `Project value: ${projectValue}.` : ''} Follow up within 24 hours.`;

    // Create lead in DB
    const lead = await prisma.lead.create({
      data: {
        name,
        company,
        email,
        phone: phone || '',
        source: 'WEBSITE',
        status: 'NEW',
        value: 0,
        notes: `${projectType ? `Project Type: ${projectType}\n` : ''}${projectValue ? `Project Value: ${projectValue}\n` : ''}${message ? `Message: ${message}` : ''}`,
        aiScore,
        aiScoreLabel,
        aiInsight,
      },
    });

    // Create notification for director
    try {
      await prisma.notification.create({
        data: {
          title: '🌐 New Website Lead',
          message: `${name} from ${company} submitted an inquiry via the website.`,
          type: 'LEAD',
          userId: 'director',
        },
      });
    } catch (_) {
      // Notification failure is non-critical
    }

    return NextResponse.json({ success: true, leadId: lead.id, score: aiScore, label: aiScoreLabel }, { status: 201 });
  } catch (error) {
    console.error('Public lead API error:', error);
    return NextResponse.json({ error: 'Failed to create lead' }, { status: 500 });
  }
}
