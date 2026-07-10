#!/usr/bin/env python3
"""Write all missing/fixed API routes for DatumOS v18"""
import os

BASE = "/workspace/datumos_v18/src/app/api"

def write(path, content):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w') as f:
        f.write(content)
    print(f"  ✓ {path.replace(BASE,'')}")

# ─── Generic [id] route factory ───────────────────────────────────────────────
def id_route(model, include="", date_fields=None):
    date_lines = ""
    if date_fields:
        for df in date_fields:
            date_lines += f"    if (body.{df}) body.{df} = new Date(body.{df});\n"
    inc = f", include: {include}" if include else ""
    return f"""import {{ NextResponse }} from 'next/server'
import {{ prisma }} from '@/lib/prisma'
export async function GET(req, {{ params }}) {{
  try {{
    const data = await prisma.{model}.findUnique({{ where: {{ id: params.id }}{inc} }})
    if (!data) return NextResponse.json({{ error: 'Not found' }}, {{ status: 404 }})
    return NextResponse.json(data)
  }} catch(e) {{ return NextResponse.json({{ error: e.message }}, {{ status: 500 }}) }}
}}
export async function PUT(req, {{ params }}) {{
  try {{
    const raw = await req.json()
    const {{ id, ...body }} = raw
    // strip relation objects
    for (const k of Object.keys(body)) {{
      if (typeof body[k] === 'object' && body[k] !== null && !Array.isArray(body[k]) && !(body[k] instanceof Date)) {{
        delete body[k]
      }}
    }}
    // empty string → null
    for (const k of Object.keys(body)) {{ if (body[k] === '') body[k] = null }}
{date_lines}    const data = await prisma.{model}.update({{ where: {{ id: params.id }}, data: body{inc} }})
    return NextResponse.json(data)
  }} catch(e) {{ return NextResponse.json({{ error: e.message }}, {{ status: 500 }}) }}
}}
export async function DELETE(req, {{ params }}) {{
  try {{
    await prisma.{model}.delete({{ where: {{ id: params.id }} }})
    return NextResponse.json({{ ok: true }})
  }} catch(e) {{ return NextResponse.json({{ error: e.message }}, {{ status: 500 }}) }}
}}
"""

# ─── Generic collection route factory ─────────────────────────────────────────
def coll_route(model, order_by="createdAt", include="", filter_field=None, date_fields=None):
    where_lines = "  const where = {}\n"
    if filter_field:
        where_lines += f"  const {filter_field} = searchParams.get('{filter_field}')\n"
        where_lines += f"  if ({filter_field}) where.{filter_field} = {filter_field}\n"
    date_lines = ""
    if date_fields:
        for df in date_fields:
            date_lines += f"  if (body.{df}) body.{df} = new Date(body.{df})\n"
    inc = f", include: {include}" if include else ""
    return f"""import {{ NextResponse }} from 'next/server'
import {{ prisma }} from '@/lib/prisma'
export async function GET(req) {{
  try {{
    const {{ searchParams }} = new URL(req.url)
{where_lines}    const data = await prisma.{model}.findMany({{ where, orderBy: {{ {order_by}: 'desc' }}{inc} }})
    return NextResponse.json(data)
  }} catch(e) {{ return NextResponse.json({{ error: e.message }}, {{ status: 500 }}) }}
}}
export async function POST(req) {{
  try {{
    const raw = await req.json()
    const {{ id, ...body }} = raw
    // strip relation objects
    for (const k of Object.keys(body)) {{
      if (typeof body[k] === 'object' && body[k] !== null && !Array.isArray(body[k]) && !(body[k] instanceof Date)) {{
        delete body[k]
      }}
    }}
    // empty string → null
    for (const k of Object.keys(body)) {{ if (body[k] === '') body[k] = null }}
{date_lines}    const data = await prisma.{model}.create({{ data: body{inc} }})
    return NextResponse.json(data, {{ status: 201 }})
  }} catch(e) {{ return NextResponse.json({{ error: e.message }}, {{ status: 500 }}) }}
}}
export async function PUT(req) {{
  try {{
    const raw = await req.json()
    const {{ id, ...body }} = raw
    for (const k of Object.keys(body)) {{
      if (typeof body[k] === 'object' && body[k] !== null && !Array.isArray(body[k]) && !(body[k] instanceof Date)) {{
        delete body[k]
      }}
    }}
    for (const k of Object.keys(body)) {{ if (body[k] === '') body[k] = null }}
{date_lines}    const data = await prisma.{model}.update({{ where: {{ id }}, data: body{inc} }})
    return NextResponse.json(data)
  }} catch(e) {{ return NextResponse.json({{ error: e.message }}, {{ status: 500 }}) }}
}}
export async function DELETE(req) {{
  try {{
    const {{ searchParams }} = new URL(req.url)
    const id = searchParams.get('id')
    await prisma.{model}.delete({{ where: {{ id }} }})
    return NextResponse.json({{ ok: true }})
  }} catch(e) {{ return NextResponse.json({{ error: e.message }}, {{ status: 500 }}) }}
}}
"""

print("Writing API routes...")

# ─── BIM Responsibility ────────────────────────────────────────────────────────
write(f"{BASE}/bim/responsibility/route.js", coll_route(
    "responsibilityMatrix", "createdAt",
    include="{ project: { select: { name: true } } }",
    filter_field="projectId"
))
write(f"{BASE}/bim/responsibility/[id]/route.js", id_route("responsibilityMatrix"))

# ─── BIM Naming ───────────────────────────────────────────────────────────────
write(f"{BASE}/bim/naming/route.js", coll_route(
    "namingConvention", "name",
    include="{ project: { select: { name: true } } }",
    filter_field="projectId"
))
write(f"{BASE}/bim/naming/[id]/route.js", id_route("namingConvention"))

# ─── BIM SOP ──────────────────────────────────────────────────────────────────
write(f"{BASE}/bim/sop/route.js", coll_route("sop", "title"))
write(f"{BASE}/bim/sop/[id]/route.js", id_route("sop"))

# ─── BIM Clash [id] ───────────────────────────────────────────────────────────
write(f"{BASE}/bim/clash/[id]/route.js", id_route(
    "clashDetection",
    include="{ project: { select: { name: true } } }",
    date_fields=["detectedAt", "resolvedAt"]
))

# ─── BIM Scope [id] ───────────────────────────────────────────────────────────
write(f"{BASE}/bim/scope/[id]/route.js", id_route(
    "bimScopeMatrix",
    include="{ project: { select: { name: true } } }"
))

# ─── BIM Verify [id] ──────────────────────────────────────────────────────────
write(f"{BASE}/bim/verify/[id]/route.js", id_route(
    "bimVerifyCheck",
    include="{ project: { select: { name: true } } }",
    date_fields=["checkedAt"]
))

# ─── BIM Coord Schedule [id] ──────────────────────────────────────────────────
write(f"{BASE}/bim/coord-schedule/[id]/route.js", id_route(
    "bimCoordSchedule",
    include="{ project: { select: { name: true } } }",
    date_fields=["meetingDate"]
))

# ─── BIM Delivery Milestones [id] ─────────────────────────────────────────────
write(f"{BASE}/bim/delivery-milestones/[id]/route.js", id_route(
    "bimDeliveryMilestone",
    include="{ project: { select: { name: true } } }",
    date_fields=["dueDate", "completedAt"]
))

# ─── BIM Model Production [id] ────────────────────────────────────────────────
write(f"{BASE}/bim/model-production/[id]/route.js", id_route(
    "modelProduction",
    include="{ project: { select: { name: true } }, assignee: { select: { name: true } } }",
    date_fields=["plannedDate", "actualDate"]
))

# ─── Delivery Schedule [id] ───────────────────────────────────────────────────
write(f"{BASE}/delivery-schedule/[id]/route.js", id_route(
    "deliverySchedule",
    include="{ project: { select: { name: true } } }",
    date_fields=["startDate", "endDate"]
))

# ─── Financial [id] ───────────────────────────────────────────────────────────
write(f"{BASE}/financial/[id]/route.js", id_route(
    "financialEntry",
    include="{ project: { select: { name: true } }, client: { select: { companyName: true } } }",
    date_fields=["dueDate", "paidDate"]
))

# ─── ISO 19650 [id] ───────────────────────────────────────────────────────────
write(f"{BASE}/iso19650/[id]/route.js", id_route(
    "isoComplianceItem",
    include="{ project: { select: { name: true } } }",
    date_fields=["dueDate"]
))

# ─── Activity Log [id] ────────────────────────────────────────────────────────
write(f"{BASE}/activity-log/[id]/route.js", id_route("activityLog"))

# ─── Subcontractors [id] ──────────────────────────────────────────────────────
write(f"{BASE}/subcontractors/[id]/route.js", id_route("subcontractor"))

# ─── Clients [id] ─────────────────────────────────────────────────────────────
write(f"{BASE}/clients/[id]/route.js", id_route("client"))

# ─── PM Tasks [id] ────────────────────────────────────────────────────────────
write(f"{BASE}/pm-tasks/[id]/route.js", id_route(
    "task",
    include="{ project: { select: { name: true } }, assignee: { select: { name: true } } }",
    date_fields=["dueDate", "startDate"]
))

# ─── Risks [id] ───────────────────────────────────────────────────────────────
write(f"{BASE}/risks/[id]/route.js", id_route("risk", date_fields=["reviewDate"]))

# ─── Lessons [id] ─────────────────────────────────────────────────────────────
write(f"{BASE}/lessons/[id]/route.js", id_route("lesson"))

# ─── RACI [id] ────────────────────────────────────────────────────────────────
write(f"{BASE}/raci/[id]/route.js", id_route("raciEntry"))

# ─── BIM Meetings [id] ────────────────────────────────────────────────────────
write(f"{BASE}/bim-meetings/[id]/route.js", id_route("bimMeeting", date_fields=["date"]))

# ─── Mobilization [id] ────────────────────────────────────────────────────────
write(f"{BASE}/mobilization/[id]/route.js", id_route("mobilizationItem", date_fields=["dueDate"]))

# ─── Appointing Parties [id] ──────────────────────────────────────────────────
write(f"{BASE}/appointing-parties/[id]/route.js", id_route("appointingParty"))

# ─── External Stakeholders [id] ───────────────────────────────────────────────
write(f"{BASE}/external-stakeholders/[id]/route.js", id_route("externalStakeholder"))

# ─── Fix SOP main route (alias /api/sop → /api/bim/sop) ──────────────────────
# The sop page uses /api/sop, so keep that route but also add /api/bim/sop
# Already exists at /api/sop — just ensure [id] exists
os.makedirs(f"{BASE}/sop/[id]", exist_ok=True)
write(f"{BASE}/sop/[id]/route.js", id_route("sop"))

print("\nAll API routes written ✓")
