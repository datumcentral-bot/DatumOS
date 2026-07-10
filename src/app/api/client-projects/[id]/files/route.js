import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req, { params }) {
  try {
    const files = await prisma.projectFile.findMany({ where: { clientProjectId: params.id }, orderBy: { createdAt: "desc" } });
    return NextResponse.json(files);
  } catch (e) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}

export async function POST(req, { params }) {
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
  } catch (e) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}

export async function DELETE(req, { params }) {
  try {
    const { searchParams } = new URL(req.url);
    const fileId = searchParams.get("fileId");
    if (!fileId) return NextResponse.json({ error: "fileId required" }, { status: 400 });
    await prisma.projectFile.delete({ where: { id: fileId } });
    return NextResponse.json({ ok: true });
  } catch (e) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
