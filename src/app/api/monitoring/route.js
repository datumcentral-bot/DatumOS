import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [projects, tasks, activity, team] = await Promise.all([
      prisma.project.findMany({
        orderBy: { createdAt: "desc" },
        select: {
          id: true, code: true, name: true, status: true,
          health: true, progressPct: true, actualHrs: true,
          client: { select: { companyName: true } },
        },
      }),
      prisma.task.findMany({
        select: {
          id: true, title: true, status: true, priority: true,
          assigneeId: true, dueDate: true, projectId: true,
          project: { select: { code: true } },
          assignee: { select: { name: true } },
        },
      }),
      prisma.activityLog.findMany({
        orderBy: { createdAt: "desc" },
        take: 30,
      }),
      prisma.user.findMany({
        where: { active: true },
        select: { id: true, name: true, role: true, capacityHrs: true },
      }),
    ]);

    return NextResponse.json({ projects, tasks, activity, team });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
