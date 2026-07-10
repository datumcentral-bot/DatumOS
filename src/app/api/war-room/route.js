import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const [projects, tasks, leads, kpis, financials] = await Promise.all([
      prisma.project.findMany({ select: { id: true, name: true, status: true, progressPct: true, contractValue: true } }),
      prisma.task.findMany({ where: { status: { not: 'DONE' } }, select: { id: true, title: true, priority: true, status: true, dueDate: true }, take: 20 }),
      prisma.lead.findMany({ select: { id: true, company: true, stage: true, estValue: true } }),
      prisma.kpiMetric.findMany({ orderBy: { recordedAt: 'desc' }, take: 10 }),
      prisma.financialEntry.findMany({ select: { id: true, amount: true, type: true, projectId: true } }),
    ]);

    const totalRevenue = financials.filter(f => f.type === 'INCOME').reduce((s, f) => s + (f.amount || 0), 0);
    const wonLeads = leads.filter(l => l.stage === 'WON').length;
    const activeProjects = projects.filter(p => p.status === 'ACTIVE').length;
    const pendingTasks = tasks.filter(t => t.status !== 'DONE').length;

    return NextResponse.json({
      summary: { totalRevenue, wonLeads, activeProjects, pendingTasks, totalLeads: leads.length },
      tasks: tasks.slice(0, 8),
      goals: [
        { label: 'Revenue Target', current: totalRevenue, target: 500000, unit: 'AED' },
        { label: 'Active Projects', current: activeProjects, target: 6, unit: '' },
        { label: 'Won Deals', current: wonLeads, target: 5, unit: '' },
        { label: 'Pending Tasks', current: pendingTasks, target: 0, unit: '' },
      ],
      kpis,
    });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}