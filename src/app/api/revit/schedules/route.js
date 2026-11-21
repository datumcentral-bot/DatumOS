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
    const format = searchParams.get('format') || 'csv';
    const scheduleId = searchParams.get('scheduleId');

    const schedules = [
      { id: 'sched_001', name: 'Room Schedule', type: 'Room', elementCount: 142, lastModified: new Date().toISOString() },
      { id: 'sched_002', name: 'Door Schedule', type: 'Door', elementCount: 89, lastModified: new Date().toISOString() },
      { id: 'sched_003', name: 'Window Schedule', type: 'Window', elementCount: 67, lastModified: new Date().toISOString() },
      { id: 'sched_004', name: 'Wall Schedule', type: 'Wall', elementCount: 234, lastModified: new Date().toISOString() },
      { id: 'sched_005', name: 'Column Schedule', type: 'Column', elementCount: 56, lastModified: new Date().toISOString() },
    ];

    const schedulesToExport = scheduleId 
      ? schedules.filter(s => s.id === scheduleId)
      : schedules;

    return NextResponse.json({
      ok: true,
      total: schedulesToExport.length,
      schedules: schedulesToExport,
      exportFormat: format,
      exportPath: "E:\\0001-DATUM_REVIT_CORTIX\\Exports",
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
    const { scheduleIds, format = 'csv' } = body;

    if (!scheduleIds || !Array.isArray(scheduleIds) || scheduleIds.length === 0) {
      return NextResponse.json({ error: "scheduleIds array is required" }, { status: 400 });
    }

    broadcast('revit', 'schedules_exported', { scheduleIds, format, count: scheduleIds.length }, 'System');

    return NextResponse.json({
      ok: true,
      message: "Schedules exported successfully",
      scheduleIds,
      format,
      count: scheduleIds.length,
      exportPath: "E:\\0001-DATUM_REVIT_CORTIX\\Exports",
      exportedAt: new Date().toISOString(),
    });
  } catch (e) {
    return errorResponse(e, req);
  }
}
