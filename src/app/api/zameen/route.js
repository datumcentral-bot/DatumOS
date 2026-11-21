import { NextResponse } from 'next/server';
import { guard } from '@/lib/auth';
import { errorResponse } from "@/lib/api-errors";
import { broadcast } from '@/lib/broadcast';

export const dynamic = "force-dynamic";

export async function GET(req) {
  const denied = await guard('DIRECTOR');
  if (denied) return denied;

  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action');

    if (action === 'work_routine') {
      return NextResponse.json({
        workRoutine: {
          name: "DAILY WORK ROUTINE",
          location: "ZAMEEN DEVELOPMENT BIM WORKS",
          description: "Daily BIM work routine for Zameen Development projects",
          tasks: [
            { id: 'zw_001', name: 'Morning BIM Sync', time: '09:00', duration: '30min', status: 'COMPLETED' },
            { id: 'zw_002', name: 'Model Review', time: '09:30', duration: '60min', status: 'PENDING' },
            { id: 'zw_003', name: 'Clash Detection', time: '11:00', duration: '45min', status: 'PENDING' },
            { id: 'zw_004', name: 'Issue Tracking', time: '12:00', duration: '30min', status: 'PENDING' },
            { id: 'zw_005', name: 'Document Control', time: '14:00', duration: '60min', status: 'PENDING' },
            { id: 'zw_006', name: 'Progress Reporting', time: '16:00', duration: '45min', status: 'PENDING' },
          ],
        },
      });
    }

    if (action === 'projects') {
      return NextResponse.json({
        projects: [
          { id: 'zm_proj_001', name: 'DATUM Tower', type: 'Commercial', status: 'Design Development', location: 'Karachi', progress: 45 },
          { id: 'zm_proj_002', name: 'DATUM Mall', type: 'Retail', status: 'Schematic Design', location: 'Lahore', progress: 25 },
          { id: 'zm_proj_003', name: 'DATUM Residency', type: 'Residential', status: 'Construction Documents', location: 'Islamabad', progress: 65 },
        ],
      });
    }

    return NextResponse.json({
      name: 'ZAMEEN DEVELOPMENT BIM WORKS',
      description: 'BIM works for Zameen Development projects',
      locations: ['Karachi', 'Lahore', 'Islamabad'],
      projectTypes: ['Commercial', 'Retail', 'Residential', 'Mixed Use'],
    });
  } catch (e) {
    return errorResponse(e, req);
  }
}

export async function POST(req) {
  const denied = await guard('DIRECTOR');
  if (denied) return denied;

  try {
    const body = await req.json();
    const { projectId, taskId, status, assignee } = body;

    if (!projectId || !taskId) {
      return NextResponse.json({ error: "projectId and taskId are required" }, { status: 400 });
    }

    broadcast('zameen', 'task_updated', { projectId, taskId, status, assignee }, 'System');

    return NextResponse.json({
      ok: true,
      message: "Zameen BIM work updated successfully",
      projectId,
      taskId,
      status,
      assignee,
      updatedAt: new Date().toISOString(),
    });
  } catch (e) {
    return errorResponse(e, req);
  }
}
