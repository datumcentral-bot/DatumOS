import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
export async function GET() {
  const [projects, tasks, invoices, clashes, cdeDocs, risks, milestones, users, leads] = await Promise.all([
    prisma.project.findMany({ select: { id: true, name: true, status: true, progressPct: true, healthScore: true, budget: true, contractValue: true, startDate: true, endDate: true } }),
    prisma.task.groupBy({ by: ['status'], _count: { id: true } }),
    prisma.invoice.findMany({ select: { amount: true, status: true, currency: true, issueDate: true } }),
    prisma.clashDetection.groupBy({ by: ['status'], _count: { id: true } }),
    prisma.cdeDocument.groupBy({ by: ['status'], _count: { id: true } }),
    prisma.risk.groupBy({ by: ['status'], _count: { id: true } }),
    prisma.milestone.groupBy({ by: ['status'], _count: { id: true } }),
    prisma.user.findMany({ where: { active: true, role: { not: 'CLIENT' } }, include: { _count: { select: { tasks: true } }, resourceAllocations: { orderBy: { weekStart: 'desc' }, take: 4 } } }),
    prisma.lead.groupBy({ by: ['stage'], _count: { id: true } })
  ])
  const totalRevenue = invoices.filter(i => i.status === 'PAID').reduce((s, i) => s + i.amount, 0)
  const outstanding = invoices.filter(i => ['SENT', 'OVERDUE'].includes(i.status)).reduce((s, i) => s + i.amount, 0)
  return NextResponse.json({ projects, tasksByStatus: tasks, invoices, clashByStatus: clashes, cdeByStatus: cdeDocs, riskByStatus: risks, milestoneByStatus: milestones, users, leadsByStage: leads, summary: { totalRevenue, outstanding, activeProjects: projects.filter(p => p.status === 'ACTIVE').length, totalProjects: projects.length } })
}
