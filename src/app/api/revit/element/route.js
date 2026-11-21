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
    const elementId = searchParams.get('elementId');
    const category = searchParams.get('category');
    const viewId = searchParams.get('viewId');

    if (!elementId) {
      return NextResponse.json({ error: "elementId is required" }, { status: 400 });
    }

    const element = {
      id: elementId,
      category: category || "Walls",
      name: "Wall - Generic - 200mm",
      level: "Level 1",
      parameters: {
        "BuiltInParameter.LEVEL_PARAM": "Level 1",
        "BuiltInParameter.ROOM_NAME": "",
        "BuiltInParameter.ALL_MODEL_MARK": "",
        "BuiltInParameter.FAMILY_NAME": "Generic - 200mm",
        "BuiltInParameter.ALL_MODEL_TYPE_NAME": "Default",
        "BuiltInParameter.WALL_HEIGHT_TYPE": "Unconnected",
        "BuiltInParameter.WALL_BASE_OFFSET": "0.000",
        "BuiltInParameter.WALL_TOP_OFFSET": "0.000",
        "BuiltInParameter.WALL_USER_HEIGHT_PARAM": "3000.000",
        "BuiltInParameter.WALL_WIDTH": "200.000",
      },
      geometry: {
        area: 45.5,
        volume: 9.1,
        perimeter: 28.0,
        bbox: {
          min: { x: 0, y: 0, z: 0 },
          max: { x: 6000, y: 3000, z: 3000 },
        },
      },
      material: "Concrete",
      materialId: "mat_001",
      family: "Generic Walls",
      type: "Generic - 200mm",
      phase: "Existing",
      phaseCreated: "New Construction",
      phaseDemolished: "None",
      room: null,
      space: null,
    };

    return NextResponse.json(result);
  } catch (e) {
    return errorResponse(e, req);
  }
}

export async function POST(req) {
  const denied = await guard('DIRECTOR');
  if (denied) return denied;

  try {
    const body = await req.json();
    const { elementId, parameterName, parameterValue } = body;

    if (!elementId || !parameterName) {
      return NextResponse.json({ error: "elementId and parameterName are required" }, { status: 400 });
    }

    broadcast('revit', 'element_updated', { elementId, parameterName, parameterValue }, 'System');

    return NextResponse.json({
      ok: true,
      message: "Element updated successfully",
      elementId,
      parameterName,
      parameterValue,
    });
  } catch (e) {
    return errorResponse(e, req);
  }
}
