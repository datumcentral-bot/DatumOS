// ============================================================================
// DatumOS — Seed script. Populates the local SQLite DB with realistic dummy
// data so every dashboard/portal renders live content out of the box.
// Run:  node prisma/seed.mjs   (or  npm run db:seed )
// ============================================================================
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
const prisma = new PrismaClient();

const daysAgo = (n) => new Date(Date.now() - n * 86400000);
const daysAhead = (n) => new Date(Date.now() + n * 86400000);
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const rand = (a, b) => Math.round(a + Math.random() * (b - a));

async function main() {
  console.log("🌱  Seeding DatumOS database…");

  // --- wipe (order matters for FK integrity) -------------------------------
  await prisma.activityLog.deleteMany();
  await prisma.screenShareSession.deleteMany();
  await prisma.meetingNote.deleteMany();
  await prisma.meeting.deleteMany();
  await prisma.invoiceLineItem.deleteMany();
  await prisma.approval.deleteMany();
  await prisma.statusReport.deleteMany();
  await prisma.clientMessage.deleteMany();
  await prisma.timesheetEntry.deleteMany();
  await prisma.rfi.deleteMany();
  await prisma.clash.deleteMany();
  await prisma.document.deleteMany();
  await prisma.taskChecklistItem.deleteMany();
  await prisma.qaSignoff.deleteMany();
  await prisma.task.deleteMany();
  await prisma.scopeOfWork.deleteMany();
  await prisma.sopChecklistItem.deleteMany();
  await prisma.sop.deleteMany();
  await prisma.projectFolder.deleteMany();
  await prisma.milestone.deleteMany();
  await prisma.projectAssignment.deleteMany();
  await prisma.projectDivision.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.outreachActivity.deleteMany();
  await prisma.lead.deleteMany();
  await prisma.project.deleteMany();
  await prisma.clientUser.deleteMany();
  await prisma.client.deleteMany();
  await prisma.division.deleteMany();
  await prisma.user.deleteMany();
  await prisma.authUser.deleteMany();

  // --- DIVISIONS -----------------------------------------------------------
  // Colors aligned to the DATUM BIM military olive/sand + navy brand palette.
  const divisionData = [
    { code: "AR", name: "Architecture", colorHex: "#7c8340", description: "Architectural design & documentation" },
    { code: "ST", name: "Structural Engineering", colorHex: "#5f6733", description: "Structural analysis & detailing" },
    { code: "ME", name: "Mechanical (HVAC)", colorHex: "#a67d3c", description: "Heating, ventilation & air-conditioning" },
    { code: "EL", name: "Electrical", colorHex: "#c19749", description: "Power, lighting & low-voltage systems" },
    { code: "PL", name: "Plumbing", colorHex: "#979d52", description: "Domestic water, drainage & sanitary" },
    { code: "FP", name: "Fire Protection", colorHex: "#b04a34", description: "Sprinklers, alarms & life-safety" },
    { code: "BIM", name: "BIM & Digital Delivery", colorHex: "#0d2a3a", description: "Flagship: coordination, clash detection & digital twins", isFlagship: true },
  ];
  const divisions = {};
  for (const d of divisionData) {
    divisions[d.code] = await prisma.division.create({ data: d });
  }
  console.log(`  ✓ ${divisionData.length} service divisions`);

  // --- TEAM (internal users) ----------------------------------------------
  // Real key personnel (CEO Syed Asad Abrar) + expert team named in the
  // DATUM BIM ENGINEERING profile & services documents.
  const userData = [
    { name: "Syed Asad Abrar", email: "asad@datum-bim.com", role: "DIRECTOR", title: "Chief Executive Officer & Managing Director", division: "BIM", avatarHue: "#0d2a3a", capacityHrs: 40 },
    { name: "Ahmed Khan", email: "ahmed@datum-bim.com", role: "BIM_COORDINATOR", title: "Lead BIM Manager (ISO 19650 · PMP)", division: "BIM", avatarHue: "#5f6733", capacityHrs: 40 },
    { name: "Sarah Miller", email: "sarah@datum-bim.com", role: "BIM_COORDINATOR", title: "Senior BIM Coordinator", division: "AR", avatarHue: "#7c8340", capacityHrs: 40 },
    { name: "John Roberts", email: "john@datum-bim.com", role: "BIM_COORDINATOR", title: "Information Manager (CDE Admin)", division: "BIM", avatarHue: "#0d2a3a", capacityHrs: 40 },
    { name: "Lisa Martinez", email: "lisa@datum-bim.com", role: "ENGINEER", title: "MEPF Coordinator", division: "ME", avatarHue: "#a67d3c", capacityHrs: 40 },
    { name: "Fatima Noor", email: "fatima@datum-bim.com", role: "MODELER", title: "Structural Revit Modeler", division: "ST", avatarHue: "#5f6733", capacityHrs: 40 },
    { name: "Zain Abbas", email: "zain@datum-bim.com", role: "QA_QC", title: "QA/QC Lead", division: "BIM", avatarHue: "#b04a34", capacityHrs: 40 },
    { name: "Maria Iqbal", email: "maria@datum-bim.com", role: "ENGINEER", title: "Electrical Engineer", division: "EL", avatarHue: "#c19749", capacityHrs: 40 },
  ];
  const users = {};
  for (const u of userData) {
    const created = await prisma.user.create({ data: u });
    users[created.email] = created;
  }
  const userList = Object.values(users);
  console.log(`  ✓ ${userData.length} team members`);

  // --- CLIENTS (international) ---------------------------------------------
  // International clients drawn from the real DATUM BIM project portfolio (GCC / UK / USA).
  const clientData = [
    { companyName: "BAGC Developments", country: "United Arab Emirates", city: "Abu Dhabi", contactName: "Khalid Al-Mansoori", contactEmail: "khalid@bagc.ae", timezone: "GST", logoHue: "#0d2a3a" },
    { companyName: "U+A Architects", country: "United Arab Emirates", city: "Dubai", contactName: "Rania Haddad", contactEmail: "rania@u-a.ae", timezone: "GST", logoHue: "#7c8340" },
    { companyName: "KAFD Development Co.", country: "Saudi Arabia", city: "Riyadh", contactName: "Faisal Al-Otaibi", contactEmail: "faisal@kafd.sa", timezone: "AST", logoHue: "#a67d3c" },
    { companyName: "Masdar Sustainable Estates", country: "United Arab Emirates", city: "Abu Dhabi", contactName: "Noura Al-Zaabi", contactEmail: "noura@masdar-estates.ae", timezone: "GST", logoHue: "#5f6733" },
    { companyName: "Meridian Health Trust", country: "United Kingdom", city: "London", contactName: "James Whitfield", contactEmail: "james@meridian-health.co.uk", timezone: "GMT", logoHue: "#0d2a3a" },
  ];
  const clients = {};
  for (const c of clientData) {
    const created = await prisma.client.create({ data: c });
    clients[created.companyName] = created;
    await prisma.clientUser.create({
      data: { name: c.contactName, email: c.contactEmail, clientId: created.id },
    });
  }
  console.log(`  ✓ ${clientData.length} international clients (+ portal logins)`);

  // --- PROJECTS ------------------------------------------------------------
  // Real landmark engagements from the DATUM BIM portfolio.
  const projectData = [
    { code: "DS-2401", name: "Manarat Residence — Full BIM (4 Towers G+25)", client: "BAGC Developments", health: "GREEN", stage: "Coordination", progress: 68, contractValue: 182000, estimatedHrs: 3200, actualHrs: 2180, divs: ["AR", "ST", "ME", "EL", "PL", "FP", "BIM"], daysStart: -120, daysDue: 55 },
    { code: "DS-2402", name: "Dubai Airport Terminal 4 — Federated BIM", client: "U+A Architects", health: "AMBER", stage: "Construction Docs", progress: 47, contractValue: 265000, estimatedHrs: 4200, actualHrs: 2510, divs: ["AR", "ST", "ME", "EL", "PL", "FP", "BIM"], daysStart: -90, daysDue: 40, healthNote: "Client design changes to check-in hall delaying structural sign-off." },
    { code: "DS-2403", name: "Riyadh KAFD District — Information Management", client: "KAFD Development Co.", health: "GREEN", stage: "Design Development", progress: 55, contractValue: 196000, estimatedHrs: 3600, actualHrs: 2010, divs: ["AR", "ST", "BIM"], daysStart: -70, daysDue: 80 },
    { code: "DS-2404", name: "Masdar City Square — Sustainable HVAC Model", client: "Masdar Sustainable Estates", health: "RED", stage: "Coordination", progress: 31, contractValue: 118000, estimatedHrs: 2200, actualHrs: 2360, healthNote: "Actual hours exceeded estimate; clashes in Zone 2 (plant) unresolved.", divs: ["ME", "PL", "BIM"], daysStart: -100, daysDue: 12 },
    { code: "DS-2405", name: "Manarat Residence — As-Built Digital Twin", client: "BAGC Developments", health: "GREEN", stage: "As-Built", progress: 88, contractValue: 74000, estimatedHrs: 1200, actualHrs: 1050, divs: ["AR", "ST", "BIM"], daysStart: -150, daysDue: 20 },
    { code: "DS-2406", name: "London Central Hospital — Fire Protection", client: "Meridian Health Trust", health: "AMBER", stage: "Design Development", progress: 22, contractValue: 88000, estimatedHrs: 1600, actualHrs: 540, divs: ["FP", "EL", "BIM"], daysStart: -30, daysDue: 95, healthNote: "Awaiting sprinkler layout confirmation per HTM standards." },
  ];

  const projects = {};
  for (const p of projectData) {
    const created = await prisma.project.create({
      data: {
        code: p.code,
        name: p.name,
        clientId: clients[p.client].id,
        status: "ACTIVE",
        health: p.health,
        healthNote: p.healthNote || null,
        stage: p.stage,
        progress: p.progress,
        contractValue: p.contractValue,
        estimatedHrs: p.estimatedHrs,
        actualHrs: p.actualHrs,
        startDate: daysAgo(-p.daysStart),
        dueDate: daysAhead(p.daysDue),
        description: `${p.name} — delivered by DATUM BIM ENGINEERING from Lahore for ${p.client}.`,
      },
    });
    projects[p.code] = { ...created, divs: p.divs };

    // project divisions
    for (const dc of p.divs) {
      await prisma.projectDivision.create({
        data: { projectId: created.id, divisionId: divisions[dc].id, scopeNote: `${divisions[dc].name} scope` },
      });
    }

    // delivery folder structure (mirrors ISO-19650-style CDE)
    const folders = ["00-Incoming", "01-WIP", "02-Shared", "03-Published", "04-Archive"];
    let fi = 0;
    for (const f of folders) {
      await prisma.projectFolder.create({ data: { projectId: created.id, name: f, orderIndex: fi++ } });
    }

    // milestones
    const ms = [
      { title: "Kick-off & BEP agreed", status: "DONE", d: p.daysStart + 5 },
      { title: "LOD 300 model issued", status: p.progress > 40 ? "DONE" : "IN_PROGRESS", d: p.daysStart + 35 },
      { title: "Clash-free coordination", status: p.progress > 70 ? "DONE" : p.progress > 40 ? "IN_PROGRESS" : "PENDING", d: p.daysDue - 30 },
      { title: "Final deliverables published", status: "PENDING", d: p.daysDue },
    ];
    let mi = 0;
    for (const m of ms) {
      await prisma.milestone.create({
        data: { projectId: created.id, title: m.title, status: m.status, dueDate: daysAhead(m.d < 0 ? -Math.abs(m.d) : m.d) , orderIndex: mi++ },
      });
    }
  }
  console.log(`  ✓ ${projectData.length} projects (+ divisions, folders, milestones)`);

  // --- ASSIGNMENTS ---------------------------------------------------------
  const assignPlan = [
    { code: "DS-2401", people: [["ahmed@datum-bim.com", "Lead BIM Manager", 55], ["lisa@datum-bim.com", "MEPF Coordinator", 70], ["zain@datum-bim.com", "QA Reviewer", 25]] },
    { code: "DS-2402", people: [["ahmed@datum-bim.com", "Lead BIM Manager", 40], ["sarah@datum-bim.com", "Senior BIM Coordinator", 80], ["fatima@datum-bim.com", "Structural Modeler", 60], ["zain@datum-bim.com", "QA Reviewer", 30]] },
    { code: "DS-2403", people: [["john@datum-bim.com", "Information Manager", 45], ["fatima@datum-bim.com", "Structural Modeler", 65]] },
    { code: "DS-2404", people: [["lisa@datum-bim.com", "MEPF Coordinator", 60], ["john@datum-bim.com", "Coordinator", 40], ["zain@datum-bim.com", "QA Reviewer", 35]] },
    { code: "DS-2405", people: [["sarah@datum-bim.com", "Senior BIM Coordinator", 50], ["fatima@datum-bim.com", "Structural Modeler", 40]] },
    { code: "DS-2406", people: [["maria@datum-bim.com", "Electrical Engineer", 45], ["ahmed@datum-bim.com", "Coordinator", 25]] },
  ];
  for (const a of assignPlan) {
    for (const [email, role, pct] of a.people) {
      await prisma.projectAssignment.create({
        data: { projectId: projects[a.code].id, userId: users[email].id, roleOnProject: role, allocationPct: pct },
      });
    }
  }
  console.log("  ✓ team assignments");

  // --- SCOPE OF WORK (project -> scope packages, owned by a division) -------
  // client -> project -> scope -> tasks  (fully connected)
  const scopeTemplates = {
    AR: "Architectural Design & Documentation",
    ST: "Structural Modeling & Detailing",
    ME: "HVAC / Mechanical Coordination",
    EL: "Electrical Systems Design",
    PL: "Plumbing & Drainage Design",
    FP: "Fire Protection & Life-Safety",
    BIM: "BIM Coordination & Clash Detection",
  };
  const projectScopes = {}; // code -> [scope,...]
  let scopeCount = 0;
  for (const code of Object.keys(projects)) {
    const proj = projects[code];
    projectScopes[code] = [];
    let si = 0;
    for (const dc of proj.divs) {
      const status = proj.progress > 70 ? (si === 0 ? "DELIVERED" : "IN_PROGRESS") : proj.progress > 30 ? "IN_PROGRESS" : "PLANNED";
      const scope = await prisma.scopeOfWork.create({
        data: {
          projectId: proj.id,
          title: scopeTemplates[dc] || `${dc} Scope`,
          divisionCode: dc,
          description: `${scopeTemplates[dc] || dc} package for ${proj.name}.`,
          status,
          budgetHrs: rand(80, 320),
          orderIndex: si++,
        },
      });
      projectScopes[code].push(scope);
      scopeCount++;
    }
  }
  console.log(`  ✓ ${scopeCount} scope-of-work packages`);

  // --- SOPs + checklists ---------------------------------------------------
  const sopData = [
    {
      code: "SOP-BIM-001", title: "Model Setup & Shared Coordinates", divisionCode: "BIM",
      summary: "Standard procedure to initialise a federated model with correct shared coordinates.",
      steps: "Create central file\nApply project template\nSet shared coordinates from survey\nAcquire coordinates in linked models\nPublish to Shared folder",
      checklist: ["Central file created from studio template", "Shared coordinates set from survey point", "Worksets configured per discipline", "Project base point verified", "Model published to 02-Shared"],
    },
    {
      code: "SOP-BIM-002", title: "Clash Detection & Coordination", divisionCode: "BIM",
      summary: "Weekly clash detection routine and issue assignment.",
      steps: "Append discipline models\nRun clash tests by rule set\nGroup & filter clashes\nAssign to responsible discipline\nIssue coordination report",
      checklist: ["All discipline models appended & current", "Clash rules run (ST↔ME, ME↔EL, etc.)", "False positives filtered", "Clashes assigned with owner + due date", "Coordination report issued to team"],
    },
    {
      code: "SOP-ST-001", title: "Structural Detailing QA", divisionCode: "ST",
      summary: "Quality checks before issuing structural drawings.",
      steps: "Verify grid & levels\nCheck member sizes vs analysis\nConfirm connection details\nCheck annotations & tags\nPeer review",
      checklist: ["Grids & levels match architectural", "Member sizes match analysis output", "Connections detailed & tagged", "Drawing title block correct", "Peer review completed"],
    },
    {
      code: "SOP-DOC-001", title: "Deliverable Naming & Issue", divisionCode: "BIM",
      summary: "Enforce file naming standard before publishing to client.",
      steps: "Apply naming standard\nRun model health check\nExport to required formats\nUpdate revision\nPublish to 03-Published",
      checklist: ["File name follows DS-code-Disc-Zone-Type-Rev", "Revision incremented correctly", "Model audited (no warnings)", "PDF + native exported", "Uploaded to Published folder"],
    },
    {
      code: "SOP-QA-020", title: "20-Point Model QA/QC Verification", divisionCode: "BIM",
      summary: "Datum BIM's mandatory 20-point model verification per ISO 19650-2 before any submission.",
      steps: "Run model checker\nRun federated clash detection\nValidate parameters & classification\nAudit naming & suitability\nInformation Manager sign-off",
      checklist: [
        "QA-01 · Overall model dimensions verified vs control coordinates",
        "QA-03 · Required BEP parameters populated correctly",
        "QA-05 · File-naming per BS EN ISO 19650-2 verified",
        "QA-07 · Interference check run across all federated disciplines",
        "QA-16 · LOD / LOI meets specified requirement",
        "QA-19 · Suitability status (S0–S4) & revision coding correct",
        "QA-20 · Final Information-Manager sign-off before issue",
      ],
    },
  ];
  const sops = {};
  for (const s of sopData) {
    const sop = await prisma.sop.create({
      data: { code: s.code, title: s.title, divisionCode: s.divisionCode, summary: s.summary, steps: s.steps },
    });
    sops[s.code] = { ...sop, checklist: s.checklist };
    let ci = 0;
    for (const label of s.checklist) {
      await prisma.sopChecklistItem.create({ data: { sopId: sop.id, label, orderIndex: ci++ } });
    }
  }
  console.log(`  ✓ ${sopData.length} SOPs with QA/QC checklists`);

  // --- TASKS (+ per-task checklist instances + some QA signoffs) -----------
  const taskTemplates = [
    { title: "Set up federated model", sop: "SOP-BIM-001", div: "BIM", status: "DONE", est: 12, act: 11 },
    { title: "Model HVAC ductwork — Level 3", sop: null, div: "ME", status: "IN_PROGRESS", est: 40, act: 26 },
    { title: "Run clash detection — Zone 2", sop: "SOP-BIM-002", div: "BIM", status: "QA_REVIEW", est: 8, act: 9 },
    { title: "Detail structural connections", sop: "SOP-ST-001", div: "ST", status: "IN_PROGRESS", est: 32, act: 18 },
    { title: "Coordinate electrical containment", sop: null, div: "EL", status: "TODO", est: 24, act: 0 },
    { title: "Publish LOD300 deliverables", sop: "SOP-DOC-001", div: "BIM", status: "TODO", est: 6, act: 0 },
    { title: "Resolve sprinkler / duct clashes", sop: "SOP-BIM-002", div: "FP", status: "BLOCKED", est: 16, act: 4 },
    { title: "As-built model verification", sop: "SOP-ST-001", div: "ST", status: "DONE", est: 20, act: 19 },
  ];
  const priorities = ["LOW", "MEDIUM", "HIGH", "URGENT"];
  let createdTasks = 0;
  for (const code of Object.keys(projects)) {
    const proj = projects[code];
    // 3-5 tasks per project
    const n = rand(3, 5);
    for (let i = 0; i < n; i++) {
      const t = taskTemplates[(i + createdTasks) % taskTemplates.length];
      const assignee = pick(userList.filter((u) => u.role !== "DIRECTOR"));
      const sopRef = t.sop ? sops[t.sop] : null;
      // link task to a scope package of the same division when available
      const scopeMatch = (projectScopes[code] || []).find((s) => s.divisionCode === t.div) || (projectScopes[code] || [])[0] || null;
      // ISO 19650 CDE state derived from task status
      const cdeMap = { TODO: "S0", IN_PROGRESS: "S1", QA_REVIEW: "S3", DONE: "S4", BLOCKED: "S1" };
      const task = await prisma.task.create({
        data: {
          projectId: proj.id,
          title: t.title,
          description: `${t.title} for ${proj.name}.`,
          divisionCode: t.div,
          status: t.status,
          priority: pick(priorities),
          assigneeId: assignee.id,
          sopId: sopRef ? sopRef.id : null,
          scopeId: scopeMatch ? scopeMatch.id : null,
          cdeState: cdeMap[t.status] || "S0",
          estimatedHrs: t.est,
          actualHrs: t.act,
          dueDate: daysAhead(rand(3, 45)),
          qaRequired: true,
        },
      });
      createdTasks++;

      // instantiate checklist from SOP (or a generic QA list)
      const items = sopRef ? sopRef.checklist : ["Work completed to brief", "Self-check performed", "Naming standard applied", "Ready for QA review"];
      let ci = 0;
      const doneCount = t.status === "DONE" ? items.length : t.status === "QA_REVIEW" ? items.length : rand(0, items.length - 1);
      for (const label of items) {
        await prisma.taskChecklistItem.create({
          data: { taskId: task.id, label, checked: ci < doneCount, orderIndex: ci },
        });
        ci++;
      }

      // QA signoff for DONE tasks
      if (t.status === "DONE") {
        await prisma.qaSignoff.create({
          data: {
            taskId: task.id,
            reviewerId: users["zain@datum-bim.com"].id,
            result: "PASS",
            comment: "Checklist complete, naming standard verified. Approved for issue.",
            signedAt: daysAgo(rand(1, 20)),
          },
        });
      }
    }
  }
  console.log(`  ✓ ${createdTasks} tasks (+ checklists & QA sign-offs)`);

  // --- DOCUMENTS (with naming standard; some client-visible/approved) ------
  const docSpecs = [
    { disc: "ST", zone: "Z01", type: "DWG", rev: "R03", status: "APPROVED", visible: true },
    { disc: "ME", zone: "Z02", type: "MDL", rev: "R02", status: "SHARED", visible: false },
    { disc: "AR", zone: "Z01", type: "DWG", rev: "R04", status: "APPROVED", visible: true },
    { disc: "EL", zone: "Z02", type: "SCH", rev: "R01", status: "FOR_REVIEW", visible: false },
    { disc: "BIM", zone: "SITE", type: "MDL", rev: "R05", status: "APPROVED", visible: true },
    { disc: "FP", zone: "Z01", type: "RPT", rev: "R01", status: "WIP", visible: false },
    { disc: "PL", zone: "Z02", type: "DWG", rev: "R02", status: "SHARED", visible: false },
  ];
  let docCount = 0;
  for (const code of Object.keys(projects)) {
    const proj = projects[code];
    const specs = docSpecs.filter((s) => proj.divs.includes(s.disc));
    // ISO 19650: map document status -> CDE state + suitability code
    const cdeFromStatus = { WIP: ["S0", "S0"], SHARED: ["S2", "S2"], FOR_REVIEW: ["S3", "S3"], APPROVED: ["S4", "A1"], SUPERSEDED: ["S4", "CR"] };
    for (const s of specs) {
      const fileName = `${code}-${s.disc}-${s.zone}-${s.type}-${s.rev}`;
      const [cde, suit] = cdeFromStatus[s.status] || ["S0", "S0"];
      await prisma.document.create({
        data: {
          projectId: proj.id,
          fileName,
          projectCode: code,
          discipline: s.disc,
          zone: s.zone,
          docType: s.type,
          revision: s.rev,
          namingValid: true,
          status: s.status,
          cdeState: cde,
          suitability: suit,
          container: fileName,
          folder: s.status === "APPROVED" ? "03-Published" : s.status === "WIP" ? "01-WIP" : "02-Shared",
          clientVisible: s.visible && s.status === "APPROVED",
          fileSizeKb: rand(800, 48000),
          uploadedBy: pick(userList).name,
          createdAt: daysAgo(rand(1, 40)),
        },
      });
      docCount++;
    }
    // one intentionally non-standard file to show enforcement working
    await prisma.document.create({
      data: {
        projectId: proj.id,
        fileName: `${code}_final_MODEL_v2`,
        projectCode: code,
        discipline: "BIM",
        zone: "SITE",
        docType: "MDL",
        revision: "R00",
        namingValid: false,
        status: "WIP",
        folder: "01-WIP",
        clientVisible: false,
        fileSizeKb: rand(5000, 30000),
        uploadedBy: pick(userList).name,
        createdAt: daysAgo(rand(1, 10)),
      },
    });
    docCount++;
  }
  console.log(`  ✓ ${docCount} documents (naming standard enforced)`);

  // --- CLASHES -------------------------------------------------------------
  const clashSpecs = [
    { title: "Beam clashing with main supply duct", disc: "ST vs ME", sev: "HIGH", status: "OPEN" },
    { title: "Cable tray through structural wall", disc: "EL vs ST", sev: "MEDIUM", status: "ASSIGNED" },
    { title: "Sprinkler pipe vs return duct", disc: "FP vs ME", sev: "HIGH", status: "OPEN" },
    { title: "Drainage stack vs column", disc: "PL vs ST", sev: "MEDIUM", status: "RESOLVED" },
    { title: "Light fitting vs diffuser", disc: "EL vs ME", sev: "LOW", status: "CLOSED" },
  ];
  let clashCount = 0;
  for (const code of Object.keys(projects)) {
    const proj = projects[code];
    const n = rand(2, 4);
    for (let i = 0; i < n; i++) {
      const c = clashSpecs[(i + clashCount) % clashSpecs.length];
      await prisma.clash.create({
        data: {
          projectId: proj.id,
          ref: `CL-${String(i + 1).padStart(3, "0")}`,
          title: c.title,
          disciplines: c.disc,
          zone: pick(["Z01", "Z02", "SITE"]),
          severity: c.sev,
          status: c.status,
          assignedTo: pick(userList).name,
          createdAt: daysAgo(rand(1, 30)),
        },
      });
      clashCount++;
    }
  }
  console.log(`  ✓ ${clashCount} clashes`);

  // --- RFIs ----------------------------------------------------------------
  const rfiSpecs = [
    { subject: "Confirm slab thickness at grid C-4", disc: "ST", status: "OPEN", pr: "HIGH" },
    { subject: "Ceiling void clearance for ductwork", disc: "ME", status: "ANSWERED", pr: "MEDIUM" },
    { subject: "Electrical room location approval", disc: "EL", status: "OPEN", pr: "MEDIUM" },
    { subject: "Fire-rated wall penetration detail", disc: "FP", status: "CLOSED", pr: "LOW" },
    { subject: "Architectural finish schedule missing", disc: "AR", status: "OPEN", pr: "HIGH" },
  ];
  let rfiCount = 0;
  for (const code of Object.keys(projects)) {
    const proj = projects[code];
    const n = rand(2, 3);
    for (let i = 0; i < n; i++) {
      const r = rfiSpecs[(i + rfiCount) % rfiSpecs.length];
      await prisma.rfi.create({
        data: {
          projectId: proj.id,
          ref: `RFI-${String(i + 1).padStart(3, "0")}`,
          subject: r.subject,
          question: `Please clarify: ${r.subject.toLowerCase()}.`,
          discipline: r.disc,
          status: r.status,
          priority: r.pr,
          raisedById: pick(userList).id,
          dueDate: daysAhead(rand(2, 20)),
          answer: r.status !== "OPEN" ? "Confirmed by design team — see attached markup." : null,
          createdAt: daysAgo(rand(1, 25)),
        },
      });
      rfiCount++;
    }
  }
  console.log(`  ✓ ${rfiCount} RFIs`);

  // --- TIMESHEETS (last 14 days) ------------------------------------------
  const activities = ["Modeling", "Coordination", "QA", "Documentation", "Client Meeting"];
  let tsCount = 0;
  const projCodes = Object.keys(projects);
  for (const u of userList) {
    if (u.role === "DIRECTOR") continue;
    for (let d = 0; d < 14; d++) {
      // skip weekends roughly
      const day = daysAgo(d);
      if (day.getDay() === 0 || day.getDay() === 6) continue;
      const entries = rand(1, 2);
      for (let e = 0; e < entries; e++) {
        const code = pick(projCodes);
        await prisma.timesheetEntry.create({
          data: {
            userId: u.id,
            projectId: projects[code].id,
            date: day,
            hours: rand(2, 6),
            activity: pick(activities),
            billable: Math.random() > 0.2,
          },
        });
        tsCount++;
      }
    }
  }
  console.log(`  ✓ ${tsCount} timesheet entries`);

  // --- CRM LEADS (pipeline) ------------------------------------------------
  const leadData = [
    { company: "Skyline Developers", contactName: "Rachel Green", country: "USA", source: "LinkedIn", serviceInterest: "BIM Coordination", estValue: 120000, stage: "TO_CONTACT", probability: 10 },
    { company: "Emirates Facilities", contactName: "Khalid Nasser", country: "UAE", source: "Referral", serviceInterest: "MEP Modeling", estValue: 88000, stage: "TO_CONTACT", probability: 15 },
    { company: "BrightBuild Ltd", contactName: "Tom Hardy", country: "UK", source: "Upwork", serviceInterest: "Structural Detailing", estValue: 45000, stage: "CONTACTED", probability: 25 },
    { company: "Copenhagen Studio", contactName: "Freja Sørensen", country: "Denmark", source: "Inbound", serviceInterest: "Full BIM", estValue: 160000, stage: "CONTACTED", probability: 30 },
    { company: "Summit Engineers", contactName: "Daniel Cho", country: "Canada", source: "Conference", serviceInterest: "Clash Detection", estValue: 72000, stage: "MEETING_BOOKED", probability: 45 },
    { company: "Harbor Architects", contactName: "Olivia Brooks", country: "Australia", source: "LinkedIn", serviceInterest: "Architecture", estValue: 54000, stage: "MEETING_BOOKED", probability: 50 },
    { company: "Vertex Construction", contactName: "Marcus Reid", country: "USA", source: "Referral", serviceInterest: "Fire Protection", estValue: 39000, stage: "PROPOSAL_SENT", probability: 65 },
    { company: "Alpine MEP", contactName: "Hans Weber", country: "Switzerland", source: "Inbound", serviceInterest: "HVAC Modeling", estValue: 91000, stage: "PROPOSAL_SENT", probability: 70 },
    { company: "Coastal Design Co", contactName: "Nina Patel", country: "UK", source: "Upwork", serviceInterest: "As-Built Twin", estValue: 47000, stage: "WON", probability: 100 },
    { company: "Metro Structures", contactName: "Paul Adams", country: "USA", source: "LinkedIn", serviceInterest: "Structural BIM", estValue: 103000, stage: "WON", probability: 100 },
  ];
  let li = 0;
  for (const l of leadData) {
    await prisma.lead.create({
      data: { ...l, ownerName: "Bilal Ahmed", orderIndex: li++, notes: `${l.serviceInterest} opportunity via ${l.source}.` },
    });
  }
  console.log(`  ✓ ${leadData.length} CRM leads across pipeline`);

  // --- OUTREACH ACTIVITY (25/day KPI, last 14 days) ------------------------
  const director = users["asad@datum-bim.com"];
  let oaCount = 0;
  for (let d = 0; d < 14; d++) {
    const day = daysAgo(d);
    if (day.getDay() === 0 || day.getDay() === 6) continue;
    const completed = rand(14, 28);
    await prisma.outreachActivity.create({
      data: {
        date: day,
        userId: director.id,
        target: 25,
        completed,
        meetings: rand(0, 2),
        replies: rand(1, 6),
        notes: completed >= 25 ? "Target hit ✅" : "Below target",
      },
    });
    oaCount++;
  }
  console.log(`  ✓ ${oaCount} daily outreach records (25/day KPI)`);

  // --- INVOICES + line items ----------------------------------------------
  const invStatuses = ["PAID", "PAID", "SENT", "OVERDUE", "DRAFT"];
  let invCount = 0;
  let invNum = 1;
  for (const code of Object.keys(projects)) {
    const proj = projects[code];
    const nInv = rand(1, 2);
    for (let i = 0; i < nInv; i++) {
      const status = pick(invStatuses);
      const amount = rand(8000, 32000);
      const issue = daysAgo(rand(5, 60));
      const inv = await prisma.invoice.create({
        data: {
          number: `INV-2025-${String(invNum++).padStart(3, "0")}`,
          projectId: proj.id,
          clientId: proj.clientId,
          issueDate: issue,
          dueDate: new Date(issue.getTime() + 30 * 86400000),
          amount,
          currency: "USD",
          status,
          notes: `Progress billing for ${proj.name}.`,
        },
      });
      // line items
      const items = [
        { description: "BIM Coordination — monthly retainer", qty: 1, rate: Math.round(amount * 0.5) },
        { description: "Modeling hours", qty: rand(40, 120), rate: 45 },
      ];
      for (const it of items) {
        await prisma.invoiceLineItem.create({
          data: { invoiceId: inv.id, description: it.description, qty: it.qty, rate: it.rate, amount: it.qty * it.rate },
        });
      }
      invCount++;
    }
  }
  console.log(`  ✓ ${invCount} invoices (+ line items)`);

  // --- EXPENSES ------------------------------------------------------------
  const expenseCats = [
    { category: "Salaries", vendor: "Payroll", base: 18000 },
    { category: "Software", vendor: "Autodesk AEC Collection", base: 2400 },
    { category: "Software", vendor: "Navisworks / BIM 360", base: 900 },
    { category: "Subcontractor", vendor: "Freelance Modeler", base: 3200 },
    { category: "Marketing", vendor: "LinkedIn Ads", base: 600 },
    { category: "Overhead", vendor: "Office & Utilities", base: 1500 },
  ];
  let expCount = 0;
  for (let m = 0; m < 3; m++) {
    for (const e of expenseCats) {
      await prisma.expense.create({
        data: {
          projectId: Math.random() > 0.5 ? projects[pick(projCodes)].id : null,
          category: e.category,
          vendor: e.vendor,
          amount: e.base + rand(-200, 400),
          currency: "USD",
          date: daysAgo(m * 30 + rand(1, 25)),
          note: `${e.category} — ${e.vendor}`,
        },
      });
      expCount++;
    }
  }
  console.log(`  ✓ ${expCount} expenses`);

  // --- CLIENT MESSAGES + STATUS REPORTS + APPROVALS ------------------------
  let msgCount = 0, srCount = 0, apprCount = 0;
  for (const code of Object.keys(projects)) {
    const proj = projects[code];
    // messages
    const convo = [
      { side: "STUDIO", author: "Bilal Ahmed", body: "Weekly update: coordination progressing well, clash count down 30% this week." },
      { side: "CLIENT", author: "Client Reviewer", body: "Thanks — could you prioritise the Zone 2 structural clashes before the next review?" },
      { side: "STUDIO", author: "Ayesha Khan", body: "Absolutely. Zone 2 clashes assigned to the structural team, targeting resolution by Friday." },
    ];
    for (const m of convo) {
      await prisma.clientMessage.create({
        data: { projectId: proj.id, authorName: m.author, authorSide: m.side, body: m.body, createdAt: daysAgo(rand(1, 10)) },
      });
      msgCount++;
    }
    // status reports (last 3 weeks)
    for (let w = 0; w < 3; w++) {
      await prisma.statusReport.create({
        data: {
          projectId: proj.id,
          weekOf: daysAgo(w * 7 + 3),
          headline: w === 0 ? "Coordination on track for milestone" : "Steady progress across disciplines",
          summary: "Modeling advanced across active zones; QA reviews completed for issued packages.",
          progressPct: Math.max(5, proj.progress - w * 8),
          risks: proj.health === "RED" ? "Schedule pressure in Zone 2; escalated internally." : proj.health === "AMBER" ? "Minor dependency on client sign-off." : "No significant risks.",
          nextSteps: "Continue clash resolution and prepare next deliverable package.",
          createdAt: daysAgo(w * 7 + 3),
        },
      });
      srCount++;
    }
    // approvals — pick approved client-visible docs
    const approvedDocs = await prisma.document.findMany({ where: { projectId: proj.id, clientVisible: true } });
    for (const doc of approvedDocs) {
      const st = pick(["APPROVED", "APPROVED", "PENDING", "CHANGES_REQUESTED"]);
      await prisma.approval.create({
        data: {
          projectId: proj.id,
          documentId: doc.id,
          title: `Review: ${doc.fileName}`,
          status: st,
          reviewer: "Client Reviewer",
          markup: st === "CHANGES_REQUESTED" ? "Please adjust dimension on grid line B — see redline." : st === "APPROVED" ? "Approved for construction." : null,
          decidedAt: st === "PENDING" ? null : daysAgo(rand(1, 8)),
          createdAt: daysAgo(rand(8, 15)),
        },
      });
      apprCount++;
    }
  }
  console.log(`  ✓ ${msgCount} messages, ${srCount} status reports, ${apprCount} approvals`);

  // --- MEETINGS + notes (director-driven, some with recordings) ------------
  const meetingSpecs = [
    { title: "Weekly BIM Coordination — Meridian Tower", code: "DS-2401", status: "ENDED", recSecs: 1840, days: -3,
      agenda: "Zone 2 MEP clashes, structural sign-off, deliverable schedule",
      attendees: "Bilal Ahmed, Ayesha Khan, Usman Riaz, James Whitfield (client)",
      notes: [
        { kind: "DECISION", body: "Prioritise Zone 2 duct-vs-beam clashes this sprint." },
        { kind: "ACTION", body: "Usman to remodel Level 3 ductwork by Friday." },
        { kind: "NOTE", body: "Client happy with 68% progress; next review in 1 week." },
      ] },
    { title: "Aurora Civic Center — Design Change Review", code: "DS-2402", status: "ENDED", recSecs: 2670, days: -5,
      agenda: "Atrium redesign impact on structural sign-off",
      attendees: "Bilal Ahmed, Sana Malik, Fatima Noor, Emily Carter (client)",
      notes: [
        { kind: "DECISION", body: "Adopt revised atrium geometry; re-baseline structural scope." },
        { kind: "ACTION", body: "Fatima to update structural model to reflect atrium change." },
      ] },
    { title: "Nordic Health Campus — Recovery Plan", code: "DS-2404", status: "LIVE", recSecs: 0, days: 0,
      agenda: "Red-status recovery: resolve Zone 2 clashes, contain hours overrun",
      attendees: "Bilal Ahmed, Usman Riaz, Hamza Sethi, Zain Abbas",
      notes: [
        { kind: "ACTION", body: "Freeze new scope; focus team on clash resolution." },
      ] },
    { title: "Monday Studio Stand-up", code: null, status: "SCHEDULED", recSecs: 0, days: 1,
      agenda: "Portfolio health review, outreach KPIs, resourcing",
      attendees: "All team",
      notes: [] },
  ];
  let mtgCount = 0, noteCount = 0;
  for (const m of meetingSpecs) {
    const meeting = await prisma.meeting.create({
      data: {
        title: m.title,
        projectId: m.code ? projects[m.code].id : null,
        scheduledAt: daysAhead(m.days),
        status: m.status,
        agenda: m.agenda,
        attendees: m.attendees,
        recordingSecs: m.recSecs,
        recordingUrl: m.recSecs > 0 ? "captured-locally" : null,
      },
    });
    for (const n of m.notes) {
      await prisma.meetingNote.create({ data: { meetingId: meeting.id, body: n.body, kind: n.kind } });
      noteCount++;
    }
    mtgCount++;
  }
  console.log(`  ✓ ${mtgCount} meetings (+ ${noteCount} minutes/action items)`);

  // --- ACTIVITY LOG (drives the live real-time feed) -----------------------
  const activityFeed = [
    { actor: "Ayesha Khan", action: "MOVED", entity: "Task", summary: "moved 'Run clash detection — Zone 2' to QA Review", portal: "workspace" },
    { actor: "Zain Abbas", action: "SIGNED_OFF", entity: "Task", summary: "QA sign-off passed on 'Set up federated model'", portal: "workspace" },
    { actor: "Bilal Ahmed", action: "MOVED", entity: "Lead", summary: "moved 'Alpine MEP' to Proposal Sent", portal: "director" },
    { actor: "James Whitfield", action: "APPROVED", entity: "Document", summary: "approved DS-2401-ST-Z01-DWG-R03 for construction", portal: "client" },
    { actor: "Bilal Ahmed", action: "CREATED", entity: "Meeting", summary: "started live meeting 'Nordic Health Campus — Recovery Plan'", portal: "director" },
    { actor: "Usman Riaz", action: "UPDATED", entity: "Task", summary: "logged 4h on 'Model HVAC ductwork — Level 3'", portal: "workspace" },
    { actor: "Emily Carter", action: "REQUESTED_CHANGES", entity: "Approval", summary: "requested changes on Aurora atrium drawing", portal: "client" },
    { actor: "Bilal Ahmed", action: "CREATED", entity: "Project", summary: "created project DS-2406 Meridian Retail Park", portal: "director" },
  ];
  let afCount = 0;
  for (const a of activityFeed) {
    await prisma.activityLog.create({ data: { ...a, createdAt: daysAgo(0 + afCount * 0.05) } });
    afCount++;
  }
  console.log(`  ✓ ${afCount} activity-log events (real-time feed)`);

  // --- AUTH USERS (login identities) ---------------------------------------
  // Director account + one per team member + one per client
  const SALT = 10;
  const directorHash = await bcrypt.hash("DatumDir2026!", SALT);
  await prisma.authUser.create({
    data: {
      email: "director@datumbim.com",
      passwordHash: directorHash,
      name: "Syed Asad Abrar",
      role: "DIRECTOR",
    },
  });

  // Team member auth accounts (password: Member@2026!)
  const memberPassword = await bcrypt.hash("Member@2026!", SALT);
  const memberAuthData = [
    { email: "ahmed@datum-bim.com", name: "Ahmed Khan" },
    { email: "sarah@datum-bim.com", name: "Sarah Miller" },
    { email: "john@datum-bim.com", name: "John Roberts" },
    { email: "lisa@datum-bim.com", name: "Lisa Martinez" },
    { email: "fatima@datum-bim.com", name: "Fatima Noor" },
    { email: "zain@datum-bim.com", name: "Zain Abbas" },
    { email: "maria@datum-bim.com", name: "Maria Iqbal" },
  ];
  for (const m of memberAuthData) {
    const teamUser = users[m.email];
    await prisma.authUser.create({
      data: {
        email: m.email,
        passwordHash: memberPassword,
        name: m.name,
        role: "MEMBER",
        linkedEntityId: teamUser?.id ?? null,
        linkedEntityType: "member",
      },
    });
  }

  // Client auth accounts (password: Client@2026!)
  const clientPassword = await bcrypt.hash("Client@2026!", SALT);
  const clientAuthData = [
    { email: "khalid@bagc.ae", name: "Khalid Al-Mansoori", company: "BAGC Developments" },
    { email: "rania@u-a.ae", name: "Rania Haddad", company: "U+A Architects" },
    { email: "faisal@kafd.sa", name: "Faisal Al-Otaibi", company: "KAFD Development Co." },
    { email: "noura@masdar-estates.ae", name: "Noura Al-Zaabi", company: "Masdar Sustainable Estates" },
    { email: "james@meridian-health.co.uk", name: "James Whitfield", company: "Meridian Health Trust" },
  ];
  for (const c of clientAuthData) {
    const clientEntity = clients[c.company];
    await prisma.authUser.create({
      data: {
        email: c.email,
        passwordHash: clientPassword,
        name: c.name,
        role: "CLIENT",
        linkedEntityId: clientEntity?.id ?? null,
        linkedEntityType: "client",
      },
    });
  }
  console.log(`  ✓ ${1 + memberAuthData.length + clientAuthData.length} auth users seeded`);
  console.log("    Director:  director@datumbim.com  /  DatumDir2026!");
  console.log("    Members:   ahmed@datum-bim.com    /  Member@2026!");
  console.log("    Clients:   khalid@bagc.ae         /  Client@2026!");

  // --- RISKS ---------------------------------------------------------------
  await prisma.risk.deleteMany();
  const firstProject = await prisma.project.findFirst();
  const riskData = [
    { ref: "RISK-001", title: "Key BIM Coordinator unavailable mid-project", category: "RESOURCE", probability: "MEDIUM", impact: "HIGH", severity: "HIGH", status: "OPEN", owner: "Syed Asad Abrar", mitigation: "Cross-train two coordinators on each active project", projectId: firstProject?.id },
    { ref: "RISK-002", title: "Client delays in providing design inputs", category: "SCHEDULE", probability: "HIGH", impact: "HIGH", severity: "CRITICAL", status: "MITIGATED", owner: "Ahmed Khan", mitigation: "Weekly input-request tracker with escalation to Director after 5 days", projectId: firstProject?.id },
    { ref: "RISK-003", title: "Revit model file corruption / version conflict", category: "TECHNICAL", probability: "LOW", impact: "HIGH", severity: "MEDIUM", status: "MITIGATED", owner: "John Roberts", mitigation: "Daily CDE backups + Revit worksharing audit every Monday" },
    { ref: "RISK-004", title: "Scope creep from undocumented client requests", category: "COST", probability: "HIGH", impact: "MEDIUM", severity: "HIGH", status: "OPEN", owner: "Syed Asad Abrar", mitigation: "All scope changes require signed Change Order before work begins" },
    { ref: "RISK-005", title: "Clash detection not completed before IFC export", category: "QUALITY", probability: "MEDIUM", impact: "HIGH", severity: "HIGH", status: "OPEN", owner: "Zain Abbas", mitigation: "QA gate blocks IFC export until clash report is signed off" },
    { ref: "RISK-006", title: "Software license expiry during project delivery", category: "EXTERNAL", probability: "LOW", impact: "MEDIUM", severity: "LOW", status: "CLOSED", owner: "Maria Iqbal", mitigation: "License renewal calendar with 30-day advance alert" },
  ];
  for (const r of riskData) await prisma.risk.create({ data: r });
  console.log(`  ✓ ${riskData.length} risks seeded`);

  // --- RACI MATRIX ---------------------------------------------------------
  await prisma.raciEntry.deleteMany();
  const raciData = [
    { deliverable: "BIM Execution Plan (BEP)", phase: "Mobilization", directorRole: "A", coordinatorRole: "R", modelerRole: "C", qaRole: "C", clientRole: "I", orderIndex: 1 },
    { deliverable: "Architectural BIM Model — LOD 300", phase: "Design Development", directorRole: "A", coordinatorRole: "R", modelerRole: "R", qaRole: "C", clientRole: "I", orderIndex: 2 },
    { deliverable: "Structural BIM Model — LOD 300", phase: "Design Development", directorRole: "A", coordinatorRole: "C", modelerRole: "R", qaRole: "C", clientRole: "I", orderIndex: 3 },
    { deliverable: "MEPF Coordination Model", phase: "Coordination", directorRole: "A", coordinatorRole: "R", modelerRole: "R", qaRole: "R", clientRole: "I", orderIndex: 4 },
    { deliverable: "Clash Detection Report", phase: "Coordination", directorRole: "I", coordinatorRole: "A", modelerRole: "C", qaRole: "R", clientRole: "I", orderIndex: 5 },
    { deliverable: "IFC Export — For Review", phase: "Coordination", directorRole: "A", coordinatorRole: "R", modelerRole: "C", qaRole: "R", clientRole: "C", orderIndex: 6 },
    { deliverable: "Construction Documentation Package", phase: "Construction Docs", directorRole: "A", coordinatorRole: "R", modelerRole: "R", qaRole: "R", clientRole: "A", orderIndex: 7 },
    { deliverable: "As-Built BIM Model", phase: "Closeout", directorRole: "A", coordinatorRole: "R", modelerRole: "R", qaRole: "R", clientRole: "A", orderIndex: 8 },
    { deliverable: "Project Closeout Report", phase: "Closeout", directorRole: "R", coordinatorRole: "C", modelerRole: "I", qaRole: "C", clientRole: "A", orderIndex: 9 },
  ];
  for (const r of raciData) await prisma.raciEntry.create({ data: r });
  console.log(`  ✓ ${raciData.length} RACI entries seeded`);

  // --- LESSONS LEARNED -----------------------------------------------------
  await prisma.lessonLearned.deleteMany();
  const lessonsData = [
    { title: "Early BEP alignment prevents scope disputes", category: "PROCESS", phase: "Mobilization", description: "Projects where the BEP was agreed and signed within the first 2 weeks had 40% fewer scope change requests.", impact: "HIGH", action: "Make BEP sign-off a mandatory gate before any modeling begins", status: "IMPLEMENTED", author: "Syed Asad Abrar", projectId: firstProject?.id },
    { title: "Revit shared coordinates must be set before model split", category: "TECHNICAL", phase: "Design Development", description: "Two projects suffered major rework when shared coordinates were set after the model was split into disciplines.", impact: "HIGH", action: "Add shared-coordinate setup as Step 1 in SOP-BIM-001", status: "IMPLEMENTED", author: "Ahmed Khan" },
    { title: "Client approval delays cascade into fee disputes", category: "COMMUNICATION", phase: "Coordination", description: "When clients take >10 days to approve IFC submissions, the project schedule slips and fee claims become contentious.", impact: "MEDIUM", action: "Include approval SLA (7 days) in all contracts; auto-escalate at day 5", status: "OPEN", author: "Syed Asad Abrar" },
    { title: "Weekly clash reports reduce RFI volume by 60%", category: "QUALITY", phase: "Coordination", description: "Projects with weekly clash detection meetings generated 60% fewer RFIs during construction.", impact: "HIGH", action: "Mandate weekly clash meetings for all active coordination projects", status: "IMPLEMENTED", author: "Zain Abbas" },
    { title: "Timesheet gaps make invoicing inaccurate", category: "PLANNING", phase: "Delivery", description: "When team members skip timesheet entries for >3 days, invoice reconciliation takes 2x longer.", impact: "MEDIUM", action: "Daily timesheet reminder at 4:30 PM; Director reviews weekly", status: "OPEN", author: "Maria Iqbal" },
  ];
  for (const l of lessonsData) await prisma.lessonLearned.create({ data: l });
  console.log(`  ✓ ${lessonsData.length} lessons learned seeded`);

  // --- SCOPE OF WORK (additional packages) ---------------------------------
  const allProjects = await prisma.project.findMany({ take: 3 });
  const existingScopes = await prisma.scopeOfWork.count();
  if (existingScopes === 0 && allProjects.length > 0) {
    const scopeData = [
      { title: "Architectural BIM Modeling — LOD 300", divisionCode: "AR", status: "IN_PROGRESS", budgetHrs: 320, projectId: allProjects[0].id },
      { title: "Structural BIM Modeling — LOD 300", divisionCode: "ST", status: "IN_PROGRESS", budgetHrs: 240, projectId: allProjects[0].id },
      { title: "MEPF Coordination & Clash Detection", divisionCode: "BIM", status: "PLANNED", budgetHrs: 180, projectId: allProjects[0].id },
      { title: "IFC Export & CDE Upload", divisionCode: "BIM", status: "PLANNED", budgetHrs: 40, projectId: allProjects[0].id },
      { title: "Architectural BIM Modeling — LOD 200", divisionCode: "AR", status: "DELIVERED", budgetHrs: 160, projectId: allProjects[1]?.id ?? allProjects[0].id },
      { title: "MEP Coordination", divisionCode: "ME", status: "IN_PROGRESS", budgetHrs: 120, projectId: allProjects[1]?.id ?? allProjects[0].id },
    ];
    for (const s of scopeData) await prisma.scopeOfWork.create({ data: s });
    console.log(`  ✓ ${scopeData.length} scope packages seeded`);
  }

  console.log("\n✅  Seed complete. DatumOS is ready — run: npm run dev\n");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });