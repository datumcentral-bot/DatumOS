import { NextResponse } from 'next/server';
import { guard } from '@/lib/auth';
import { errorResponse } from "@/lib/api-errors";

const SUPPORTED_FORMATS = ['.rvt', '.nwd', '.nwc', '.rfa', '.rte'];

function formatCellValue(val) {
  if (val === undefined || val === null || val === "") return "—";
  return typeof val === "object" ? JSON.stringify(val) : String(val);
}

function analyzeModel(filePath) {
  const result = {
    file: filePath,
    format: filePath.toLowerCase().endsWith('.rvt') ? '.rvt' : filePath.toLowerCase().endsWith('.nwd') ? '.nwd' : filePath.toLowerCase().endsWith('.nwc') ? '.nwc' : '.unknown',
    elements: [],
    families: [],
    categories: [],
    levels: [],
    views: [],
    sheets: [],
    parameters: {},
    metadata: {},
    aiAnalysis: {},
  };

  try {
    // Simulate Revit model analysis (in production, this would call the Revit Bridge API)
    // For now, return simulated analysis based on file path characteristics
    const fileName = filePath.split(/[\\/]/).pop() || "unknown.rvt";
    const isRvt = filePath.toLowerCase().endsWith('.rvt');
    const isNwd = filePath.toLowerCase().endsWith('.nwd') || filePath.toLowerCase().endsWith('.nwc');

    result.metadata = {
      fileName,
      format: result.format,
      size: "2.4 MB",
      modified: new Date().toISOString(),
      checksum: "a1b2c3d4e5f6",
    };

    if (isRvt) {
      result.families = ["Generic Walls", "Doors - Panel", "Windows - Fixed", "Columns - Structural", "Levels - Level 1", "Floors - Concrete", "Roofs - Generic", "Ceilings - Gypsum", "Rooms - Office", "Furniture - Desk"];
      result.categories = ["Walls", "Doors", "Windows", "Columns", "Levels", "Floors", "Roofs", "Ceilings", "Rooms", "Furniture"];
      result.levels = ["Level 1", "Level 2", "Level 3", "Level 4", "Roof"];
      result.views = ["3D View - Building", "Floor Plan - Level 1", "Floor Plan - Level 2", "Elevation - East", "Section - Building Section 1"];
      result.sheets = ["A-101 Floor Plan Level 1", "A-102 Floor Plan Level 2", "A-201 Elevation East", "A-301 Section Building"];
      result.elements = 1247;
      result.aiAnalysis = {
        complexity: "medium",
        recommendations: [
          "Consider splitting model by zones for better performance",
          "Review unused families to reduce file size",
          "Verify level naming consistency across views",
        ],
        issues: [],
        summary: `Model contains approximately 1247 elements, 10 families, and 10 categories. Complexity: medium.`,
      };
    } else if (isNwd) {
      result.elements = 3450;
      result.families = ["Export from Revit", "NWD Geometry", "View Template"];
      result.categories = ["Walls", "Doors", "Windows"];
      result.levels = ["Level 1", "Level 2"];
      result.parameters = { count: 156 };
      result.aiAnalysis = {
        complexity: "medium",
        recommendations: ["Verify NWD export settings match source Revit model"],
        issues: [],
        summary: "NWC/NWD file with 3450 elements from federated model.",
      };
    }

    return result;
  } catch (e) {
    result.error = e.message;
    return result;
  }
}

export const dynamic = "force-dynamic";

export async function GET(req) {
  const denied = await guard('DIRECTOR');
  if (denied) return denied;

  try {
    const { searchParams } = new URL(req.url);
    const filePath = searchParams.get('filePath');

    if (!filePath) {
      return NextResponse.json({ error: "filePath is required" }, { status: 400 });
    }

    const result = analyzeModel(filePath);
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
    const { filePath, outputPath } = body;

    if (!filePath) {
      return NextResponse.json({ error: "filePath is required" }, { status: 400 });
    }

    const analysis = analyzeModel(filePath);

    return NextResponse.json({
      status: "success",
      output: outputPath || filePath + ".analysis.json",
      analysis,
    });
  } catch (e) {
    return errorResponse(e, req);
  }
}
