import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth, ROLES } from "@/lib/auth";

// DN019 hardening: /api/team-members was unauthenticated AND referenced a
// Prisma model (`teamMember`) that does not exist, causing 500 for every
// caller. Canonical team data lives on the User model (see /api/team).
// Now: DIRECTOR-only, backed by prisma.user, password never returned.

const GET = withAuth(async () => {
  const rows = await prisma.user.findMany({
    where: { role: { not: "CLIENT" } },
    include: {
      _count: { select: { tasks: true, assignments: true } },
    },
    orderBy: { name: "asc" },
  });
  const safe = rows.map((u) => ({ ...u, password: undefined, passwordHash: undefined }));
  return NextResponse.json(safe);
}, ROLES.DIRECTOR);

const POST = withAuth(async (req) => {
  const b = await req.json();
  const { password, ...rest } = b;
  // DN038: the hardcoded default password is removed. Previously a POST with no
  // password silently created the account with a value published in source, so
  // every such account shared one publicly known credential. The caller must now
  // supply the password explicitly; nothing is defaulted, invented or reset
  // here, and no existing user record is touched.
  if (typeof password !== "string" || password.length === 0) {
    return NextResponse.json(
      { error: "password is required to create a team member; no default is applied" },
      { status: 400 }
    );
  }
  const hashed = await require("bcryptjs").hash(password, 10);
  const row = await prisma.user.create({
    data: {
      ...rest,
      name: rest.name || b.name,
      email: b.email || null,
      role: b.role || "MEMBER",
      password: hashed,
    },
  });
  return NextResponse.json({ ...row, password: undefined, passwordHash: undefined }, { status: 201 });
}, ROLES.DIRECTOR);

export { GET, POST };