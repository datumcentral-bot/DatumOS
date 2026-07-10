import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const article = await prisma.knowledgeArticle.findUnique({
      where: { id: params.id },
    });

    if (!article) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Check visibility
    const role = session.user?.role || "MEMBER";
    if (article.visibility === "DIRECTOR" && role !== "DIRECTOR") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (article.visibility === "MEMBER" && role === "CLIENT") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(article);
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "DIRECTOR") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { title, category, subcategory, content, tags, fileUrl, visibility } = body;

    const article = await prisma.knowledgeArticle.update({
      where: { id: params.id },
      data: {
        ...(title !== undefined && { title }),
        ...(category !== undefined && { category }),
        ...(subcategory !== undefined && { subcategory: subcategory || null }),
        ...(content !== undefined && { content }),
        ...(tags !== undefined && { tags: tags || null }),
        ...(fileUrl !== undefined && { fileUrl: fileUrl || null }),
        ...(visibility !== undefined && { visibility }),
      },
    });

    return NextResponse.json(article);
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "DIRECTOR") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.knowledgeArticle.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
