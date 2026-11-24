import { NextResponse } from 'next/server';
import { guard } from '@/lib/auth';
import { errorResponse } from '@/lib/api-errors';

export const dynamic = 'force-dynamic';

const macros = [
  { id: 'macro_001', name: 'room_area_summary', category: 'architecture', description: 'Summarize room areas and identify anomalies.' },
  { id: 'macro_002', name: 'facade_review', category: 'architecture', description: 'Review facade zones, glazing ratios, and massing logic.' },
  { id: 'macro_003', name: 'wall_type_inventory', category: 'architecture', description: 'Inventory wall types and their usage across the project.' },
  { id: 'macro_004', name: 'door_schedule_export', category: 'architecture', description: 'Export door schedule style and count data.' },
  { id: 'macro_005', name: 'window_schedule_export', category: 'architecture', description: 'Export window and opening pattern data.' },
  { id: 'macro_006', name: 'level_validation', category: 'architecture', description: 'Validate level names, elevations, and offset consistency.' },
  { id: 'macro_007', name: 'element_count_by_category', category: 'general', description: 'Count elements by category in the active view.' },
  { id: 'macro_008', name: 'get_element_info', category: 'general', description: 'Get detailed information for selected elements.' },
];

export async function GET(req) {
  const denied = await guard('DIRECTOR');
  if (denied) return denied;
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const script = searchParams.get('script');
    const filtered = category ? macros.filter((m) => m.category === category) : macros;
    return NextResponse.json({
      total: filtered.length,
      categories: [...new Set(macros.map((m) => m.category))],
      macros: filtered.map((m) => ({ ...m, executionEnabled: false })),
      result: script ? filtered.find((m) => m.name === script) || null : null,
      execution: { available: false, reason: 'A verified Revit bridge command adapter is not configured.' },
    });
  } catch (e) {
    return errorResponse(e, req);
  }
}

export async function POST(req) {
  const denied = await guard('DIRECTOR');
  if (denied) return denied;
  return NextResponse.json({
    ok: false,
    code: 'REVIT_BRIDGE_NOT_IMPLEMENTED',
    error: 'Macro execution was not performed. Configure and verify the Revit bridge agent before enabling execution.',
  }, { status: 503 });
}
