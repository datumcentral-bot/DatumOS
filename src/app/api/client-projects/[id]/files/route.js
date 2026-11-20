import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { guard } from '@/lib/auth';
import { errorResponse } from "@/lib/api-errors";

export const dynamic = "force-dynamic";

export async function GET(req, { params }) {
  const denied = await guard('DIRECTOR');
  if (denied) return denied;
  try {
    const files = await prisma.projectFile.findMany({ where: { clientProjectId: params.id }, orderBy: { createdAt: "desc" } });
    return NextResponse.json(files);
  } catch (e) { return errorResponse(e, req) }
}

export async function POST(req, { params }) {
  const denied = await guard('DIRECTOR');
  if (denied) return denied;
  try {
    const b = await req.json();
    const file = await prisma.projectFile.create({ data: {
      clientProjectId: params.id, fileName: b.fileName, fileType: b.fileType || "PDF",
      discipline: b.discipline || null, revision: b.revision || "P01",
      cdeState: b.cdeState || "WIP", suitability: b.suitability || "S0",
      url: b.url || null, fileSizeKb: Number(b.fileSizeKb) || 0,
      uploadedBy: b.uploadedBy || null, note: b.note || null,
    }});
    return NextResponse.json(file, { status: 201 });
  } catch (e) { return errorResponse(e, req) }
}

export async function DELETE(req, { params }) {
  const denied = await guard('DIRECTOR');
  if (denied) return denied;
  try {
    const { searchParams } = new URL(req.url);
    const fileId = searchParams.get("fileId");
    if (!fileId) return NextResponse.json({ error: "fileId required" }, { status: 400 });
    await prisma.projectFile.delete({ where: { id: fileId } });
    return NextResponse.json({ ok: true });
  } catch (e) { return errorResponse(e, req) }
}
