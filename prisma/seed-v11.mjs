// ============================================================================
// DatumOS v11 — Seed for real-time BIM PM extensions
// Idempotent: clears v11 tables then re-inserts comprehensive realistic data.
// ============================================================================
import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();

const hues = ["#6b8e23", "#c19749", "#4cc9f0", "#3d5a3e", "#a2d033", "#d4a853"];
const pick = (a, i) => a[i % a.length];

async function main() {
  console.log("→ Seeding DatumOS v11 extensions…");

  // ── wipe (respect FK order) ───────────────────────────────────────────────
  await db.subAssignment.deleteMany();
  await db.deliverable.deleteMany();
  await db.eirAir.deleteMany();
  await db.bimExecutionPlan.deleteMany();
  await db.projectFile.deleteMany();
  await db.clientProject.deleteMany();
  await db.clientDocX.deleteMany();
  await db.clientAssessment.deleteMany();
  await db.clientRequirement.deleteMany();
  await db.clientX.deleteMany();
  await db.subAssignment.deleteMany();
  await db.teamMember.deleteMany();
  await db.comment.deleteMany();
  await db.attachment.deleteMany();
  await db.entityTag.deleteMany();

  // ── Subcontractors (reuse existing table; ensure some exist) ───────────────
  let subs = await db.subcontractor.findMany();
  if (subs.length === 0) {
    await db.subcontractor.createMany({
      data: [
        { companyName: "Meridian BIM Studio", contactName: "Rana Tariq", contactEmail: "rana@meridianbim.pk", specialty: "MEP Modeling", country: "Pakistan" },
        { companyName: "Apex Structural Drafting", contactName: "Sana Khan", contactEmail: "sana@apexdraft.pk", specialty: "Structural", country: "Pakistan" },
        { companyName: "VectorPoint Scan-to-BIM", contactName: "Omar Sethi", contactEmail: "omar@vectorpoint.ae", specialty: "Point Cloud / Scan-to-BIM", country: "UAE" },
      ],
    });
    subs = await db.subcontractor.findMany();
  }

  // ── Team members (internal + sub-linked) ──────────────────────────────────
  const teamData = [
    { name: "Ahmed Raza", email: "ahmed@datum-bim.com", role: "BIM_COORDINATOR", division: "BIM", seniority: "SENIOR", ratePerHr: 28, skills: "Revit,Navisworks,Dynamo" },
    { name: "Fatima Noor", email: "fatima@datum-bim.com", role: "ARCHITECT", division: "ARCH", seniority: "SENIOR", ratePerHr: 26, skills: "Revit,Enscape,AutoCAD" },
    { name: "Bilal Ahmed", email: "bilal@datum-bim.com", role: "STRUCTURAL_ENGINEER", division: "STR", seniority: "MID", ratePerHr: 22, skills: "Tekla,Revit,ETABS" },
    { name: "Zara Sheikh", email: "zara@datum-bim.com", role: "MEP_ENGINEER", division: "MEP", seniority: "MID", ratePerHr: 24, skills: "Revit MEP,Navisworks" },
    { name: "Hassan Ali", email: "hassan@datum-bim.com", role: "MODELER", division: "BIM", seniority: "JUNIOR", ratePerHr: 15, skills: "Revit,AutoCAD" },
    { name: "Ayesha Malik", email: "ayesha@datum-bim.com", role: "QA_QC", division: "QA", seniority: "SENIOR", ratePerHr: 25, skills: "Solibri,ISO 19650" },
    { name: "Rana Tariq (Meridian)", email: "rana@meridianbim.pk", role: "MEP_ENGINEER", division: "MEP", seniority: "SENIOR", ratePerHr: 20, skills: "Revit MEP", subIdx: 0 },
    { name: "Sana Khan (Apex)", email: "sana@apexdraft.pk", role: "STRUCTURAL_ENGINEER", division: "STR", seniority: "MID", ratePerHr: 18, skills: "Tekla,Revit", subIdx: 1 },
    { name: "Omar Sethi (VectorPoint)", email: "omar@vectorpoint.ae", role: "SCAN_SPECIALIST", division: "BIM", seniority: "SENIOR", ratePerHr: 30, skills: "ReCap,Point Cloud", subIdx: 2 },
  ];
  const team = [];
  for (let i = 0; i < teamData.length; i++) {
    const t = teamData[i];
    team.push(await db.teamMember.create({
      data: {
        name: t.name, email: t.email, role: t.role, division: t.division,
        seniority: t.seniority, ratePerHr: t.ratePerHr, skills: t.skills,
        avatarHue: pick(hues, i),
        subcontractorId: t.subIdx != null ? subs[t.subIdx]?.id : null,
      },
    }));
  }

  // ── Clients (rich) ─────────────────────────────────────────────────────────
  const clientData = [
    { companyName: "BAGC Developments", industry: "Mixed-Use Development", country: "UAE", city: "Dubai", address: "Sheikh Zayed Rd, Dubai", website: "bagc.ae", contactName: "Khalid Al Marri", contactEmail: "khalid@bagc.ae", contactPhone: "+971 50 123 4567", leadMember: "Ahmed Raza", repTeam: "BIM + ARCH", tier: "TIER1", notes: "Flagship Gulf client — 3 active towers." },
    { companyName: "Northgate Estates", industry: "Residential", country: "UK", city: "Manchester", address: "Deansgate, Manchester", website: "northgate.co.uk", contactName: "Emma Whitfield", contactEmail: "emma@northgate.co.uk", contactPhone: "+44 161 555 0199", leadMember: "Fatima Noor", repTeam: "ARCH + STR", tier: "TIER2", notes: "ISO 19650 UK BIM Level 2 mandate." },
    { companyName: "Qatar Healthcare Authority", industry: "Healthcare", country: "Qatar", city: "Doha", address: "West Bay, Doha", website: "qha.qa", contactName: "Dr. Yousef Al Thani", contactEmail: "yousef@qha.qa", contactPhone: "+974 33 445 566", leadMember: "Zara Sheikh", repTeam: "MEP + STR + QA", tier: "TIER1", notes: "Hospital MEP coordination — high LOD." },
    { companyName: "Riyadh Logistics Park", industry: "Industrial / Warehouse", country: "Saudi Arabia", city: "Riyadh", address: "2nd Industrial City, Riyadh", website: "rlp.sa", contactName: "Faisal Al Otaibi", contactEmail: "faisal@rlp.sa", contactPhone: "+966 55 987 6543", leadMember: "Bilal Ahmed", repTeam: "STR", tier: "TIER1", notes: "Large-span steel warehouses." },
  ];
  const clients = [];
  for (let i = 0; i < clientData.length; i++) {
    clients.push(await db.clientX.create({ data: { ...clientData[i], logoHue: pick(hues, i) } }));
  }

  // ── Client requirements ────────────────────────────────────────────────────
  const reqCats = ["FUNCTIONAL", "TECHNICAL", "BIM", "COMMERCIAL"];
  const reqTitles = [
    ["LOD 400 for MEP", "Deliver federated model at LOD 400 for all MEP disciplines"],
    ["ISO 19650 CDE", "All deliverables via ACC with S0-S4 suitability workflow"],
    ["Weekly clash reports", "Navisworks clash reports every Thursday with priority matrix"],
    ["Revit 2024 platform", "All models authored in Revit 2024, shared parameters per template"],
    ["4D sequencing", "Provide 4D construction sequence for Phase 1 structure"],
    ["Point cloud alignment", "Register scan-to-BIM within 15mm tolerance"],
  ];
  for (const c of clients) {
    for (let j = 0; j < 3 + (clients.indexOf(c) % 2); j++) {
      const rt = pick(reqTitles, clients.indexOf(c) + j);
      await db.clientRequirement.create({
        data: {
          clientId: c.id, category: pick(reqCats, j),
          title: rt[0], detail: rt[1],
          priority: pick(["HIGH", "MEDIUM", "CRITICAL"], j),
          status: pick(["CAPTURED", "AGREED", "IN_DELIVERY"], j),
        },
      });
    }
  }

  // ── Client assessments ─────────────────────────────────────────────────────
  for (const c of clients) {
    for (const period of ["2026-Q1", "2026-Q2"]) {
      const d = 70 + Math.floor(Math.random() * 25);
      const co = 70 + Math.floor(Math.random() * 25);
      const v = 70 + Math.floor(Math.random() * 25);
      await db.clientAssessment.create({
        data: {
          clientId: c.id, period, scoreDelivery: d, scoreComms: co, scoreValue: v,
          scoreOverall: Math.round((d + co + v) / 3),
          strengths: "Reliable delivery cadence, strong BIM QA.",
          concerns: "Occasional RFI turnaround delays.",
          action: "Add dedicated coordinator for peak weeks.",
          assessedBy: "Director",
        },
      });
    }
  }

  // ── Client docs ────────────────────────────────────────────────────────────
  const docKinds = ["CONTRACT", "REQUIREMENTS", "CORRESPONDENCE", "EIR"];
  for (const c of clients) {
    for (let k = 0; k < 3; k++) {
      await db.clientDocX.create({
        data: {
          clientId: c.id, name: `${c.companyName.split(" ")[0]}_${pick(docKinds, k)}_v1.pdf`,
          kind: pick(docKinds, k), fileSizeKb: 200 + k * 350,
          note: "Uploaded during mobilization.",
        },
      });
    }
  }

  // ── Client projects ────────────────────────────────────────────────────────
  const projData = [
    { code: "BAGC-T1", name: "Marina Heights Tower 1", type: "Residential Tower", stage: "Detailed Design", iso: "TECHNICAL_DESIGN", val: 480000 },
    { code: "BAGC-T2", name: "Marina Heights Tower 2", type: "Residential Tower", stage: "Concept", iso: "MOBILIZATION", val: 460000 },
    { code: "NG-OAK", name: "Oakwood Residences", type: "Residential", stage: "Technical Design", iso: "TECHNICAL_DESIGN", val: 220000 },
    { code: "QHA-HSP", name: "Doha Specialist Hospital", type: "Healthcare", stage: "Coordination", iso: "PRODUCTION", val: 950000 },
    { code: "RLP-WH3", name: "Logistics Warehouse Block 3", type: "Warehouse", stage: "Production", iso: "PRODUCTION", val: 310000 },
  ];
  const projClientMap = [0, 0, 1, 2, 3];
  const projects = [];
  for (let i = 0; i < projData.length; i++) {
    const p = projData[i];
    projects.push(await db.clientProject.create({
      data: {
        code: p.code, name: p.name, clientId: clients[projClientMap[i]].id,
        projectType: p.type, stage: p.stage, isoStatus: p.iso,
        status: "ACTIVE", health: pick(["GREEN", "GREEN", "AMBER"], i),
        progress: 20 + i * 15, contractValue: p.val, currency: "USD",
        startDate: new Date(2026, i % 6, 1), dueDate: new Date(2026, (i % 6) + 6, 28),
        scopeSummary: "Full BIM authoring, coordination and CDE management per ISO 19650.",
        requirements: "LOD 350-400, federated weekly, clash-free at IFC.",
        description: `${p.type} — ${p.name}. Multi-discipline BIM delivery.`,
        coverHue: pick(hues, i),
      },
    }));
  }

  // ── Project files (CAD/PDF/Revit/Navisworks/Point Cloud) ───────────────────
  const fileTypes = ["REVIT", "NAVISWORKS", "PDF", "DWG", "POINT_CLOUD", "IFC"];
  const disciplines = ["ARCH", "STR", "MEP", "COORD"];
  for (const pr of projects) {
    for (let f = 0; f < 5; f++) {
      const ft = pick(fileTypes, f + projects.indexOf(pr));
      const ext = { REVIT: "rvt", NAVISWORKS: "nwd", PDF: "pdf", DWG: "dwg", POINT_CLOUD: "rcp", IFC: "ifc" }[ft];
      await db.projectFile.create({
        data: {
          clientProjectId: pr.id,
          fileName: `${pr.code}-${pick(disciplines, f)}-${String(f + 1).padStart(3, "0")}.${ext}`,
          fileType: ft, discipline: pick(disciplines, f),
          revision: `P0${(f % 3) + 1}`,
          cdeState: pick(["WIP", "SHARED", "PUBLISHED"], f),
          suitability: pick(["S0", "S1", "S2", "A1"], f),
          fileSizeKb: 1500 + f * 8000, uploadedBy: pick(team, f).name,
          note: "Auto-checked against naming convention.",
        },
      });
    }
  }

  // ── BEP per project ─────────────────────────────────────────────────────────
  for (const pr of projects) {
    await db.bimExecutionPlan.create({
      data: {
        clientProjectId: pr.id,
        bepType: pick(["PRE_APPOINTMENT", "POST_APPOINTMENT"], projects.indexOf(pr)),
        cdePlatform: "Autodesk Construction Cloud (ACC)",
        loin: "LOD 350 concept → LOD 400 production",
        namingConvention: "PROJ-ORIG-VOL-LVL-TYPE-ROLE-NUM (ISO 19650-2)",
        softwarePlatforms: "Revit 2024, Navisworks Manage, Civil 3D, Solibri, ReCap",
        standards: "ISO 19650-1/2, BS EN ISO 19650-2:2018",
        milestonesJson: JSON.stringify([
          { name: "BEP Approved", date: "2026-02-15", done: true },
          { name: "LOD 300 Federated", date: "2026-05-01", done: pr.progress > 40 },
          { name: "Clash-free IFC", date: "2026-08-01", done: false },
        ]),
        status: pick(["APPROVED", "DRAFT", "IN_REVIEW"], projects.indexOf(pr)),
        version: "1." + projects.indexOf(pr),
      },
    });
  }

  // ── EIR / AIR ───────────────────────────────────────────────────────────────
  for (const pr of projects) {
    for (let e = 0; e < 3; e++) {
      await db.eirAir.create({
        data: {
          clientProjectId: pr.id, kind: pick(["EIR", "AIR", "PIR"], e),
          ref: `${pr.code}-${pick(["EIR", "AIR", "PIR"], e)}-${e + 1}`,
          requirement: pick([
            "Provide COBie data drop at each RIBA stage",
            "Asset data aligned to client CAFM system",
            "Geo-referenced federated model to project datum",
          ], e),
          status: pick(["OPEN", "RESPONDED", "CLOSED"], e),
          responseNote: e === 2 ? "Delivered and accepted." : null,
        },
      });
    }
  }

  // ── Deliverables (MIDP/TIDP) ────────────────────────────────────────────────
  for (const pr of projects) {
    for (let d = 0; d < 4; d++) {
      await db.deliverable.create({
        data: {
          clientProjectId: pr.id,
          name: `${pick(disciplines, d)} ${pick(["Model", "Drawings", "Schedule", "Clash Report"], d)}`,
          discipline: pick(disciplines, d),
          loi: pick(["LOD200", "LOD300", "LOD350", "LOD400"], d),
          container: `${pr.code}-${pick(disciplines, d)}-M3`,
          dueDate: new Date(2026, 4 + d, 15),
          status: pick(["PLANNED", "IN_PROGRESS", "SHARED", "PUBLISHED"], d),
          responsible: pick(team, d).name,
        },
      });
    }
  }

  // ── Subcontractor assignments ───────────────────────────────────────────────
  for (const pr of projects) {
    const n = 2 + (projects.indexOf(pr) % 2);
    for (let a = 0; a < n; a++) {
      const tm = pick(team, projects.indexOf(pr) + a);
      await db.subAssignment.create({
        data: {
          clientProjectId: pr.id, teamMemberId: tm.id,
          roleOnProject: tm.role, scopeNote: `${tm.division} package for ${pr.name}`,
          allocationPct: pick([25, 50, 75, 100], a),
          performanceScore: 75 + Math.floor(Math.random() * 20),
          status: "ACTIVE",
        },
      });
    }
  }

  // ── Comments + activity across entities ─────────────────────────────────────
  for (const pr of projects) {
    for (let cm = 0; cm < 2; cm++) {
      await db.comment.create({
        data: {
          entityType: "clientProject", entityId: pr.id,
          author: pick(team, cm).name, authorSide: "STUDIO",
          body: pick([
            "Federated model updated — clash count down 40%.",
            "Client approved LOD 300 milestone. Proceeding to production.",
            "RFI-014 answered, structural opening confirmed.",
          ], cm + projects.indexOf(pr)),
        },
      });
    }
  }

  console.log("✅  v11 seed complete:");
  console.log(`   ${team.length} team members, ${clients.length} clients, ${projects.length} client projects`);
  console.log(`   files, BEPs, EIR/AIR, deliverables, sub-assignments, comments seeded`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => db.$disconnect());
