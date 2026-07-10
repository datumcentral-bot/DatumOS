import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const visibility = searchParams.get("visibility") || "";
    const role = session.user?.role || "MEMBER";

    // Build visibility filter based on role
    const visibilityFilter = role === "DIRECTOR"
      ? {} // Director sees all
      : role === "MEMBER"
      ? { visibility: { in: ["ALL", "MEMBER"] } }
      : { visibility: "ALL" }; // CLIENT

    const where = {
      ...visibilityFilter,
      ...(category ? { category } : {}),
      ...(search ? {
        OR: [
          { title: { contains: search } },
          { content: { contains: search } },
          { tags: { contains: search } },
          { subcategory: { contains: search } },
        ],
      } : {}),
    };

    const articles = await prisma.knowledgeArticle.findMany({
      where,
      orderBy: [{ category: "asc" }, { title: "asc" }],
    });

    // Group by category for tree view
    const grouped = articles.reduce((acc, article) => {
      if (!acc[article.category]) acc[article.category] = [];
      acc[article.category].push(article);
      return acc;
    }, {});

    return NextResponse.json({ articles, grouped, total: articles.length });
  } catch (e) {
    console.error("GET /api/knowledge error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "DIRECTOR") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { title, category, subcategory, content, tags, fileUrl, visibility } = body;

    if (!title || !category || !content) {
      return NextResponse.json({ error: "title, category, and content are required" }, { status: 400 });
    }

    const article = await prisma.knowledgeArticle.create({
      data: {
        title,
        category,
        subcategory: subcategory || null,
        content,
        tags: tags || null,
        fileUrl: fileUrl || null,
        visibility: visibility || "ALL",
      },
    });

    return NextResponse.json(article, { status: 201 });
  } catch (e) {
    console.error("POST /api/knowledge error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
