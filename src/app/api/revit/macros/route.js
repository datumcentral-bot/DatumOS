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
    const category = searchParams.get('category');
    const script = searchParams.get('script');

    const macros = [
      {
        id: 'macro_001',
        name: 'room_area_summary',
        category: 'architecture',
        description: 'Summarize room areas and identify anomalies.',
        dynamoFile: 'dynamo/architecture/room_area_summary.dyn',
        pyrevitFile: 'pyrevit/architecture/room_area_summary.py',
        macroFile: 'macros/architecture/room_area_summary.cs',
        pythonFile: 'python/architecture/room_area_summary.py',
        lastRun: new Date(Date.now() - 3600000).toISOString(),
        runs: 142,
      },
      {
        id: 'macro_002',
        name: 'facade_review',
        category: 'architecture',
        description: 'Review facade zones, glazing ratios, and massing logic.',
        dynamoFile: 'dynamo/architecture/facade_review.dyn',
        pyrevitFile: 'pyrevit/architecture/facade_review.py',
        macroFile: 'macros/architecture/facade_review.cs',
        pythonFile: 'python/architecture/facade_review.py',
        lastRun: new Date(Date.now() - 7200000).toISOString(),
        runs: 87,
      },
      {
        id: 'macro_003',
        name: 'wall_type_inventory',
        category: 'architecture',
        description: 'Inventory wall types and their usage across the project.',
        dynamoFile: 'dynamo/architecture/wall_type_inventory.dyn',
        pyrevitFile: 'pyrevit/architecture/wall_type_inventory.py',
        macroFile: 'macros/architecture/wall_type_inventory.cs',
        pythonFile: 'python/architecture/wall_type_inventory.py',
        lastRun: new Date(Date.now() - 10800000).toISOString(),
        runs: 234,
      },
      {
        id: 'macro_004',
        name: 'door_schedule_export',
        category: 'architecture',
        description: 'Export door schedule style and count data.',
        dynamoFile: 'dynamo/architecture/door_schedule_export.dyn',
        pyrevitFile: 'pyrevit/architecture/door_schedule_export.py',
        macroFile: 'macros/architecture/door_schedule_export.cs',
        pythonFile: 'python/architecture/door_schedule_export.py',
        lastRun: new Date(Date.now() - 21600000).toISOString(),
        runs: 156,
      },
      {
        id: 'macro_005',
        name: 'window_schedule_export',
        category: 'architecture',
        description: 'Export window and opening pattern data.',
        dynamoFile: 'dynamo/architecture/window_schedule_export.dyn',
        pyrevitFile: 'pyrevit/architecture/window_schedule_export.py',
        macroFile: 'macros/architecture/window_schedule_export.cs',
        pythonFile: 'python/architecture/window_schedule_export.py',
        lastRun: new Date(Date.now() - 28800000).toISOString(),
        runs: 98,
      },
      {
        id: 'macro_006',
        name: 'level_validation',
        category: 'architecture',
        description: 'Validate level names, elevations, and offset consistency.',
        dynamoFile: 'dynamo/architecture/level_validation.dyn',
        pyrevitFile: 'pyrevit/architecture/level_validation.py',
        macroFile: 'macros/architecture/level_validation.cs',
        pythonFile: 'python/architecture/level_validation.py',
        lastRun: new Date(Date.now() - 43200000).toISOString(),
        runs: 312,
      },
      {
        id: 'macro_007',
        name: 'element_count_by_category',
        category: 'general',
        description: 'Count elements by category in active view.',
        dynamoFile: null,
        pyrevitFile: null,
        macroFile: 'macros/general/element_count_by_category.cs',
        pythonFile: null,
        lastRun: new Date(Date.now() - 5400000).toISOString(),
        runs: 445,
      },
      {
        id: 'macro_008',
        name: 'get_element_info',
        category: 'general',
        description: 'Get detailed information for selected elements.',
        dynamoFile: null,
        pyrevitFile: null,
        macroFile: 'macros/general/get_element_info.cs',
        pythonFile: null,
        lastRun: new Date(Date.now() - 1800000).toISOString(),
        runs: 672,
      },
    ];

    const filtered = category ? macros.filter(m => m.category === category) : macros;
    const result = script ? filtered.find(m => m.name === script) : filtered;

    return NextResponse.json({
      total: macros.length,
      categories: [...new Set(macros.map(m => m.category))],
      macros: filtered,
      result: script ? result : null,
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
    const { scriptId, parameters } = body;

    if (!scriptId) {
      return NextResponse.json({ error: "scriptId is required" }, { status: 400 });
    }

    broadcast('revit_macros', 'macro_executed', { scriptId, parameters }, 'System');

    return NextResponse.json({
      ok: true,
      message: "Macro executed successfully",
      scriptId,
      parameters,
      executedAt: new Date().toISOString(),
    });
  } catch (e) {
    return errorResponse(e, req);
  }
}
