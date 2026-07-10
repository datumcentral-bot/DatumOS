// DatumOS v21 — Clean seed script using only valid schema models
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
const prisma = new PrismaClient();

const daysAgo = (n) => new Date(Date.now() - n * 86400000);
const daysAhead = (n) => new Date(Date.now() + n * 86400000);

async function main() {
  console.log("🌱 Seeding DatumOS v21...");

  // Wipe in FK-safe order
  await prisma.activityLog.deleteMany();
  await prisma.kpiMetric.deleteMany();
  await prisma.bimVerifyCheck.deleteMany();
  await prisma.bimScopeMatrix.deleteMany();
  await prisma.bimCoordSchedule.deleteMany();
  await prisma.bimDeliveryMilestone.deleteMany();
  await prisma.bimMeeting.deleteMany();
  await prisma.clashDetection.deleteMany();
  await prisma.cdeDocument.deleteMany();
  await prisma.midpDeliverable.deleteMany();
  await prisma.midp.deleteMany();
  await prisma.tidpItem.deleteMany();
  await prisma.tidp.deleteMany();
  await prisma.lodSpec.deleteMany();
  await prisma.namingConvention.deleteMany();
  await prisma.modelProduction.deleteMany();
  await prisma.responsibilityMatrix.deleteMany();
  await prisma.isoComplianceItem.deleteMany();
  await prisma.financialEntry.deleteMany();
  await prisma.deliverySchedule.deleteMany();
  await prisma.risk.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.raciEntry.deleteMany();
  await prisma.mobilizationItem.deleteMany();
  await prisma.sop.deleteMany();
  await prisma.externalStakeholder.deleteMany();
  await prisma.appointingParty.deleteMany();
  await prisma.taskDependency.deleteMany();
  await prisma.timeEntry.deleteMany();
  await prisma.qaSignoff.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.attachment.deleteMany();
  await prisma.task.deleteMany();
  await prisma.milestone.deleteMany();
  await prisma.projectAssignment.deleteMany();
  await prisma.projectFile.deleteMany();
  await prisma.projectDivision.deleteMany();
  await prisma.outreachActivity.deleteMany();
  await prisma.lead.deleteMany();
  await prisma.clientUser.deleteMany();
  await prisma.clientContact.deleteMany();
  await prisma.clientRequirement.deleteMany();
  await prisma.clientAssessment.deleteMany();
  await prisma.clientDocument.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.project.deleteMany();
  await prisma.client.deleteMany();
  await prisma.timesheetEntry.deleteMany();
  await prisma.resourceAllocation.deleteMany();
  await prisma.subcontractorMember.deleteMany();
  await prisma.subcontractorAssignment.deleteMany();
  await prisma.subcontractor.deleteMany();
  await prisma.rfi.deleteMany();
  await prisma.coordinationItem.deleteMany();
  await prisma.internalMessage.deleteMany();
  await prisma.meetingParticipant.deleteMany();
  await prisma.meetingMinute.deleteMany();
  await prisma.actionItem.deleteMany();
  await prisma.meeting.deleteMany();
  await prisma.scheduleItem.deleteMany();
  await prisma.savedView.deleteMany();
  await prisma.starredItem.deleteMany();
  await prisma.user.deleteMany();
  await prisma.authUser.deleteMany();

  // --- USERS ---
  const pw = await bcrypt.hash("DatumDir2026!", 10);
  const memberPw = await bcrypt.hash("Member@2026!", 10);
  const clientPw = await bcrypt.hash("Client@2026!", 10);

  const director = await prisma.user.create({ data: { name: "James Al-Rashid", email: "director@datumbim.com", password: pw, role: "DIRECTOR", title: "Managing Director", division: "Management", avatarHue: "210" } });
  const ahmed = await prisma.user.create({ data: { name: "Ahmed Al-Rashid", email: "ahmed@datum-bim.com", password: memberPw, role: "MEMBER", title: "BIM Coordinator", division: "BIM", avatarHue: "140" } });
  const sara = await prisma.user.create({ data: { name: "Sara Malik", email: "sara@datum-bim.com", password: memberPw, role: "MEMBER", title: "BIM Engineer", division: "BIM", avatarHue: "280" } });
  const omar = await prisma.user.create({ data: { name: "Omar Hassan", email: "omar@datum-bim.com", password: memberPw, role: "MEMBER", title: "MEP Coordinator", division: "MEP", avatarHue: "30" } });

  await prisma.authUser.create({ data: { email: "director@datumbim.com", passwordHash: pw, role: "DIRECTOR", name: "James Al-Rashid" } });
  await prisma.authUser.create({ data: { email: "ahmed@datum-bim.com", passwordHash: memberPw, role: "MEMBER", name: "Ahmed Al-Rashid" } });
  await prisma.authUser.create({ data: { email: "khalid@bagc.ae", passwordHash: clientPw, role: "CLIENT", name: "Khalid Al-Mansoori" } });

  // --- CLIENTS ---
  const bagc = await prisma.client.create({ data: { companyName: "BAGC Engineering", country: "UAE", city: "Dubai", contactName: "Khalid Al-Mansoori", contactEmail: "khalid@bagc.ae", contactPhone: "+971-50-123-4567", status: "ACTIVE", tier: "TIER1", priority: "HIGH" } });
  const emaar = await prisma.client.create({ data: { companyName: "Emaar Properties", country: "UAE", city: "Dubai", contactName: "Mohammed Al-Farsi", contactEmail: "m.alfarsi@emaar.ae", status: "ACTIVE", tier: "TIER1", priority: "HIGH" } });
  const neom = await prisma.client.create({ data: { companyName: "NEOM Development", country: "Saudi Arabia", city: "Tabuk", contactName: "Abdullah Al-Saud", contactEmail: "a.alsaud@neom.com", status: "ACTIVE", tier: "TIER1", priority: "CRITICAL" } });

  await prisma.clientUser.create({ data: { name: "Khalid Al-Mansoori", email: "khalid@bagc.ae", clientId: bagc.id } });

  // --- PROJECTS ---
  const proj1 = await prisma.project.create({ data: { name: "Dubai Marina Tower BIM", code: "DMT-001", clientId: bagc.id, status: "ACTIVE", phase: "CONSTRUCTION", startDate: daysAgo(90), endDate: daysAhead(180), budget: 850000, contractValue: 920000, bimLevel: "LOD 350", isoStage: "CONSTRUCTION", location: "Dubai Marina, UAE", description: "Full BIM coordination for 45-storey residential tower" } });
  const proj2 = await prisma.project.create({ data: { name: "Emaar Business Park MEP", code: "EBP-002", clientId: emaar.id, status: "ACTIVE", phase: "DESIGN", startDate: daysAgo(30), endDate: daysAhead(240), budget: 1200000, contractValue: 1350000, bimLevel: "LOD 300", isoStage: "DESIGN", location: "Business Bay, Dubai", description: "MEP BIM coordination for commercial complex" } });
  const proj3 = await prisma.project.create({ data: { name: "NEOM Linear City Infrastructure", code: "NLC-003", clientId: neom.id, status: "PLANNING", phase: "DESIGN", startDate: daysAhead(30), endDate: daysAhead(540), budget: 5000000, contractValue: 5500000, bimLevel: "LOD 200", isoStage: "PRE-APPOINTMENT", location: "NEOM, Saudi Arabia", description: "Infrastructure BIM for The Line project" } });

  // --- PROJECT ASSIGNMENTS ---
  await prisma.projectAssignment.createMany({ data: [
    { projectId: proj1.id, userId: ahmed.id, role: "BIM COORDINATOR" },
    { projectId: proj1.id, userId: sara.id, role: "BIM ENGINEER" },
    { projectId: proj2.id, userId: omar.id, role: "MEP COORDINATOR" },
    { projectId: proj3.id, userId: ahmed.id, role: "BIM MANAGER" },
  ]});

  // --- TASKS ---
  const t1 = await prisma.task.create({ data: { title: "Clash Detection Review — Level 3-8", projectId: proj1.id, assigneeId: ahmed.id, status: "IN_PROGRESS", priority: "HIGH", dueDate: daysAhead(7), estimatedHrs: 16, description: "Run Navisworks clash detection for structural vs MEP on levels 3-8" } });
  const t2 = await prisma.task.create({ data: { title: "BEP Update — Construction Phase", projectId: proj1.id, assigneeId: sara.id, status: "TODO", priority: "MEDIUM", dueDate: daysAhead(14), estimatedHrs: 8 } });
  const t3 = await prisma.task.create({ data: { title: "MEP Coordination Drawings — Level 1", projectId: proj2.id, assigneeId: omar.id, status: "IN_REVIEW", priority: "HIGH", dueDate: daysAhead(3), estimatedHrs: 24 } });
  const t4 = await prisma.task.create({ data: { title: "LOD 300 Model Audit", projectId: proj1.id, assigneeId: ahmed.id, status: "DONE", priority: "LOW", dueDate: daysAgo(5), estimatedHrs: 12 } });
  const t5 = await prisma.task.create({ data: { title: "ISO 19650 Compliance Check", projectId: proj2.id, assigneeId: sara.id, status: "TODO", priority: "CRITICAL", dueDate: daysAhead(21), estimatedHrs: 20 } });

  // --- CLASH DETECTION ---
  await prisma.clashDetection.createMany({ data: [
    { title: "HVAC Duct vs Structural Beam — Level 5", discipline1: "MEP", discipline2: "Structure", severity: "CRITICAL", status: "OPEN", projectId: proj1.id, description: "600mm HVAC duct clashes with 400mm deep beam at grid C-7", assignedTo: ahmed.id },
    { title: "Sprinkler Pipe vs Slab Penetration — Level 8", discipline1: "Fire", discipline2: "Structure", severity: "HIGH", status: "IN_REVIEW", projectId: proj1.id, description: "Sprinkler main runs through slab without sleeve", assignedTo: sara.id },
    { title: "Electrical Tray vs Plumbing — Level 3", discipline1: "Electrical", discipline2: "Plumbing", severity: "MEDIUM", status: "RESOLVED", projectId: proj1.id, description: "Cable tray conflicts with 100mm drain pipe", assignedTo: omar.id },
    { title: "Curtain Wall vs MEP Riser — Facade", discipline1: "Architecture", discipline2: "MEP", severity: "HIGH", status: "OPEN", projectId: proj2.id, description: "MEP riser shaft conflicts with curtain wall system", assignedTo: ahmed.id },
  ]});

  // --- CDE DOCUMENTS ---
  await prisma.cdeDocument.createMany({ data: [
    { name: "BIM Execution Plan v3.2", docCode: "DMT-BEP-001", revision: "C", status: "APPROVED", discipline: "BIM", projectId: proj1.id, owner: ahmed.id, fileType: "PDF", fileSize: 2400000 },
    { name: "Structural Model — Level 1-10", docCode: "DMT-STR-001", revision: "B", status: "IN_REVIEW", discipline: "Structure", projectId: proj1.id, owner: sara.id, fileType: "RVT", fileSize: 85000000 },
    { name: "MEP Coordination Model", docCode: "EBP-MEP-001", revision: "A", status: "WIP", discipline: "MEP", projectId: proj2.id, owner: omar.id, fileType: "NWD", fileSize: 120000000 },
    { name: "ISO 19650 Compliance Report", docCode: "DMT-ISO-001", revision: "A", status: "APPROVED", discipline: "QA", projectId: proj1.id, owner: director.id, fileType: "PDF", fileSize: 1800000 },
  ]});

  // --- MIDP ---
  const midp1 = await prisma.midp.create({ data: { projectId: proj1.id, title: "Master Information Delivery Plan — DMT-001", version: "v2.1", status: "ACTIVE" } });
  await prisma.midpDeliverable.createMany({ data: [
    { midpId: midp1.id, title: "Architectural BIM Model LOD 350", discipline: "Architecture", lodLevel: "LOD 350", dueDate: daysAhead(30), status: "IN_PROGRESS", responsible: ahmed.id },
    { midpId: midp1.id, title: "Structural BIM Model LOD 300", discipline: "Structure", lodLevel: "LOD 300", dueDate: daysAhead(45), status: "PENDING", responsible: sara.id },
    { midpId: midp1.id, title: "MEP Coordination Model", discipline: "MEP", lodLevel: "LOD 300", dueDate: daysAhead(60), status: "PENDING", responsible: omar.id },
  ]});

  // --- TIDP ---
  const tidp1 = await prisma.tidp.create({ data: { midpId: midp1.id, projectId: proj1.id, title: "Task Information Delivery Plan — Structural", discipline: "Structure", status: "ACTIVE", responsible: ahmed.id } });
  await prisma.tidpItem.createMany({ data: [
    { tidpId: tidp1.id, title: "Foundation Structural Model", lodLevel: "LOD 300", dueDate: daysAhead(20), status: "IN_PROGRESS" },
    { tidpId: tidp1.id, title: "Superstructure Model Levels 1-20", lodLevel: "LOD 350", dueDate: daysAhead(50), status: "PENDING" },
  ]});

  // --- BIM SCOPE MATRIX ---
  const elements = ["Foundation", "Columns", "Beams", "Slabs", "Walls", "Facade", "Roof", "MEP Risers"];
  const disciplines = ["Architecture", "Structure", "HVAC", "Plumbing", "Electrical", "Fire", "Civil"];
  for (const element of elements) {
    for (const discipline of disciplines) {
      await prisma.bimScopeMatrix.create({ data: { projectId: proj1.id, element, discipline, lodRequired: ["LOD 200", "LOD 300", "LOD 350"][Math.floor(Math.random() * 3)], responsible: [ahmed.id, sara.id, omar.id][Math.floor(Math.random() * 3)], status: ["PENDING", "IN_PROGRESS", "COMPLETE"][Math.floor(Math.random() * 3)] } });
    }
  }

  // --- RESPONSIBILITY MATRIX ---
  await prisma.responsibilityMatrix.createMany({ data: [
    { projectId: proj1.id, discipline: "BIM", deliverable: "BIM Model Authoring", role: "BIM Coordinator", responsible: "Ahmed Al-Rashid", accountable: "James Al-Rashid", consulted: "Sara Malik", informed: "Client" },
    { projectId: proj1.id, discipline: "BIM", deliverable: "Clash Detection", role: "BIM Engineer", responsible: "Sara Malik", accountable: "Ahmed Al-Rashid", consulted: "Omar Hassan", informed: "Director" },
    { projectId: proj1.id, discipline: "QA", deliverable: "QA/QC Review", role: "Director", responsible: "James Al-Rashid", accountable: "James Al-Rashid", consulted: "All Team", informed: "Client" },
    { projectId: proj2.id, discipline: "MEP", deliverable: "MEP Coordination", role: "MEP Coordinator", responsible: "Omar Hassan", accountable: "Ahmed Al-Rashid", consulted: "Sara Malik", informed: "Client" },
  ]});

  // --- FINANCIAL ENTRIES ---
  await prisma.financialEntry.createMany({ data: [
    { projectId: proj1.id, clientId: bagc.id, type: "INVOICE", title: "BIM Coordination Services — Month 1", amount: 85000, currency: "AED", status: "PAID", dueDate: daysAgo(30), paidDate: daysAgo(25) },
    { projectId: proj1.id, clientId: bagc.id, type: "INVOICE", title: "BIM Coordination Services — Month 2", amount: 85000, currency: "AED", status: "PENDING", dueDate: daysAhead(5) },
    { projectId: proj2.id, clientId: emaar.id, type: "INVOICE", title: "MEP BIM Services — Initial Payment", amount: 150000, currency: "AED", status: "PAID", dueDate: daysAgo(15), paidDate: daysAgo(10) },
    { projectId: proj3.id, clientId: neom.id, type: "QUOTE", title: "Infrastructure BIM — Proposal", amount: 500000, currency: "USD", status: "DRAFT" },
  ]});

  // --- DELIVERY SCHEDULE ---
  await prisma.deliverySchedule.createMany({ data: [
    { projectId: proj1.id, title: "Architectural Model — Milestone 1", endDate: daysAhead(30), status: "PLANNED", responsible: ahmed.id, deliverable: "LOD 300 architectural model delivery" },
    { projectId: proj1.id, title: "Structural Model — Milestone 1", endDate: daysAhead(45), status: "PLANNED", responsible: sara.id },
    { projectId: proj2.id, title: "MEP Coordination — Phase 1", endDate: daysAhead(60), status: "PLANNED", responsible: omar.id, deliverable: "MEP coordination drawings for levels 1-5" },
  ]});

  // --- ISO 19650 ---
  await prisma.isoComplianceItem.createMany({ data: [
    { projectId: proj1.id, clause: "5.1", title: "BIM Execution Plan", status: "COMPLIANT", responsible: ahmed.id, dueDate: daysAgo(30), notes: "BEP v3.2 approved by client" },
    { projectId: proj1.id, clause: "5.2", title: "Common Data Environment Setup", status: "COMPLIANT", responsible: sara.id, dueDate: daysAgo(60) },
    { projectId: proj1.id, clause: "5.3", title: "Information Delivery Milestones", status: "IN_PROGRESS", responsible: ahmed.id, dueDate: daysAhead(14) },
    { projectId: proj2.id, clause: "5.1", title: "BIM Execution Plan", status: "IN_PROGRESS", responsible: omar.id, dueDate: daysAhead(21) },
    { projectId: proj2.id, clause: "6.1", title: "Asset Information Requirements", status: "NOT_STARTED", responsible: director.id, dueDate: daysAhead(90) },
  ]});

  // --- RISKS ---
  await prisma.risk.createMany({ data: [
    { projectId: proj1.id, title: "Structural Model Delays", category: "SCHEDULE", probability: "HIGH", impact: "HIGH", status: "OPEN", description: "Structural engineer delays in providing updated model", mitigation: "Weekly coordination calls, escalation protocol", owner: ahmed.id },
    { projectId: proj1.id, title: "Client Scope Changes", category: "COMMERCIAL", probability: "MEDIUM", impact: "HIGH", status: "MONITORING", description: "Client may request additional scope mid-project", mitigation: "Change order process in contract", owner: director.id },
    { projectId: proj2.id, title: "MEP Design Incomplete", category: "TECHNICAL", probability: "HIGH", impact: "CRITICAL", status: "OPEN", description: "MEP design not finalized before BIM coordination", mitigation: "Phased delivery approach", owner: omar.id },
  ]});

  // --- LESSONS LEARNED ---
  await prisma.lesson.createMany({ data: [
    { projectId: proj1.id, title: "Early Clash Detection Saves Cost", category: "TECHNICAL", description: "Running clash detection at LOD 200 stage identified 47 critical clashes before construction, saving estimated AED 380,000 in rework", impact: "HIGH" },
    { projectId: proj1.id, title: "Weekly BIM Coordination Meetings Essential", category: "PROCESS", description: "Structured weekly meetings with all disciplines reduced RFI response time by 60%", impact: "MEDIUM" },
  ]});

  // --- RACI ENTRIES ---
  await prisma.raciEntry.createMany({ data: [
    { projectId: proj1.id, task: "BIM Model Creation", person: "Ahmed Al-Rashid", role: "R" },
    { projectId: proj1.id, task: "Clash Detection Reports", person: "Sara Malik", role: "R" },
    { projectId: proj1.id, task: "Client Submissions", person: "James Al-Rashid", role: "A" },
    { projectId: proj2.id, task: "MEP Coordination", person: "Omar Hassan", role: "R" },
  ]});

  // --- BIM MEETINGS ---
  await prisma.bimMeeting.createMany({ data: [
    { projectId: proj1.id, title: "Weekly BIM Coordination — Week 12", date: daysAgo(3), attendees: "Ahmed, Sara, Omar, Client PM", agenda: "Clash review, model updates, upcoming milestones", minutes: "47 clashes reviewed, 23 resolved, 24 in progress.", status: "COMPLETED" },
    { projectId: proj1.id, title: "Weekly BIM Coordination — Week 13", date: daysAhead(4), attendees: "Ahmed, Sara, Omar, Client PM", agenda: "Level 5-10 model review, MEP coordination update", status: "SCHEDULED" },
    { projectId: proj2.id, title: "MEP Kickoff Meeting", date: daysAgo(7), attendees: "Omar, Director, Client MEP Engineer", agenda: "Project scope, BIM requirements, delivery schedule", status: "COMPLETED" },
  ]});

  // --- MOBILIZATION ---
  await prisma.mobilizationItem.createMany({ data: [
    { projectId: proj1.id, task: "Revit License Setup", responsible: ahmed.id, status: "COMPLETE", dueDate: daysAgo(80) },
    { projectId: proj1.id, task: "CDE Platform Access", responsible: sara.id, status: "COMPLETE", dueDate: daysAgo(75) },
    { projectId: proj1.id, task: "BIM Standards Template", responsible: ahmed.id, status: "COMPLETE", dueDate: daysAgo(70) },
    { projectId: proj2.id, task: "Project Folder Structure", responsible: omar.id, status: "IN_PROGRESS", dueDate: daysAhead(5) },
  ]});

  // --- SOPs ---
  await prisma.sop.createMany({ data: [
    { title: "SOP-001: BIM Model Naming Convention", code: "SOP-001", category: "BIM", version: "v2.0", status: "ACTIVE", summary: "All BIM models must follow ISO 19650 naming convention" },
    { title: "SOP-002: File Naming Convention", code: "SOP-002", category: "DOCUMENTATION", version: "v1.5", status: "ACTIVE", summary: "All project files must follow the standard naming convention" },
    { title: "SOP-003: Clash Detection Process", code: "SOP-003", category: "QA", version: "v1.0", status: "ACTIVE", summary: "Weekly clash detection runs using Navisworks. All critical clashes must be resolved within 48 hours." },
  ]});

  // --- EXTERNAL STAKEHOLDERS ---
  await prisma.externalStakeholder.createMany({ data: [
    { name: "Al-Futtaim Engineering", role: "Structural Design Lead", contactEmail: "h.alfuttaim@afe.ae", projectId: proj1.id, organization: "Al-Futtaim Engineering LLC" },
    { name: "Buro Happold", role: "MEP Design Consultant", contactEmail: "j.wilson@burohappold.com", projectId: proj1.id, organization: "Buro Happold Engineering" },
    { name: "Dubai Municipality", role: "Regulatory Authority", projectId: proj1.id, organization: "Dubai Municipality" },
  ]});

  // --- APPOINTING PARTIES ---
  await prisma.appointingParty.createMany({ data: [
    { name: "Khalid Al-Mansoori", organization: "BAGC Engineering LLC", role: "Main Contractor", contactEmail: "khalid@bagc.ae", contactPhone: "+971-50-123-4567", country: "UAE" },
    { name: "Mohammed Al-Farsi", organization: "Emaar Properties PJSC", role: "Developer", contactEmail: "m.alfarsi@emaar.ae", country: "UAE" },
  ]});

  // --- NAMING CONVENTIONS ---
  await prisma.namingConvention.createMany({ data: [
    { projectId: proj1.id, name: "Model File Naming", pattern: "[ProjectCode]-[Discipline]-[Type]-[Zone]-[Level]-[Rev]", example: "DMT-STR-M3D-Z01-L05-C01", description: "Standard model file naming per ISO 19650" },
    { projectId: proj1.id, name: "Drawing Naming", pattern: "[ProjectCode]-[Discipline]-[DrawingType]-[Zone]-[Level]-[Number]", example: "DMT-STR-GA-Z01-L05-001", description: "General arrangement drawing naming" },
    { projectId: proj1.id, name: "Document Naming", pattern: "[ProjectCode]-[DocType]-[Discipline]-[Number]-[Rev]", example: "DMT-BEP-BIM-001-C", description: "Project document naming convention" },
  ]});

  // --- LOD SPECS ---
  await prisma.lodSpec.createMany({ data: [
    { projectId: proj1.id, element: "Structural Columns", discipline: "Structure", lodLevel: "LOD 350", loaLevel: "LOA 30", purpose: "Construction coordination", notes: "Include connection details" },
    { projectId: proj1.id, element: "HVAC Ductwork", discipline: "MEP", lodLevel: "LOD 300", loaLevel: "LOA 20", purpose: "Clash detection", notes: "Include insulation thickness" },
    { projectId: proj1.id, element: "Architectural Walls", discipline: "Architecture", lodLevel: "LOD 350", loaLevel: "LOA 30", purpose: "Construction documentation" },
  ]});

  // --- KPI METRICS ---
  await prisma.kpiMetric.createMany({ data: [
    { projectId: proj1.id, name: "Clash Resolution Rate", value: 87.5, target: 95, unit: "%", category: "CLASH_RESOLUTION_RATE", period: daysAgo(7).toISOString().split("T")[0], notes: "23 of 47 clashes resolved this week" },
    { projectId: proj1.id, name: "BIM Model Completion", value: 72, target: 100, unit: "%", category: "PROJECT_PROGRESS", period: daysAgo(7).toISOString().split("T")[0] },
    { projectId: proj2.id, name: "Team Utilization", value: 91, target: 85, unit: "%", category: "TEAM_UTILIZATION", period: daysAgo(7).toISOString().split("T")[0] },
    { name: "Client Satisfaction Score", value: 4.2, target: 4.5, unit: "/5", category: "CLIENT_SATISFACTION", period: daysAgo(30).toISOString().split("T")[0] },
    { name: "RFI Response Time", value: 2.3, target: 2, unit: "days", category: "RFI_RESPONSE_TIME", period: daysAgo(7).toISOString().split("T")[0] },
  ]});

  // --- ACTIVITY LOG ---
  await prisma.activityLog.createMany({ data: [
    { userId: ahmed.id, action: "CREATE", entity: "ClashDetection", entityId: "seed-1", details: "Created clash detection report for Level 5" },
    { userId: sara.id, action: "UPDATE", entity: "CdeDocument", entityId: "seed-2", details: "Updated BEP to revision C" },
    { userId: director.id, action: "LOGIN", entity: "User", entityId: director.id, details: "Director logged in" },
    { userId: omar.id, action: "CREATE", entity: "Task", entityId: "seed-3", details: "Created MEP coordination task" },
  ]});

  // --- LEADS (CRM) ---
  await prisma.lead.createMany({ data: [
    { company: "Aldar Properties", contactName: "Saeed Al-Hamdan", contactEmail: "s.alhamdan@aldar.com", country: "UAE", source: "REFERRAL", serviceInterest: "BIM Coordination", estValue: 750000, stage: "PROPOSAL_SENT" },
    { company: "Saudi Aramco", contactName: "Abdullah Al-Qahtani", contactEmail: "a.qahtani@aramco.com", country: "Saudi Arabia", source: "LINKEDIN", serviceInterest: "Digital Twin", estValue: 2000000, stage: "MEETING_BOOKED" },
    { company: "ADNOC Engineering", contactName: "Fatima Al-Zaabi", contactEmail: "f.alzaabi@adnoc.ae", country: "UAE", source: "WEBSITE", serviceInterest: "MEP BIM", estValue: 450000, stage: "CONTACTED" },
    { company: "Mace Group", contactName: "David Thompson", contactEmail: "d.thompson@macegroup.com", country: "UK", source: "CONFERENCE", serviceInterest: "BIM Management", estValue: 300000, stage: "TO_CONTACT" },
    { company: "Laing O'Rourke", contactName: "Michael Chen", contactEmail: "m.chen@laingorourke.com", country: "Australia", source: "LINKEDIN", serviceInterest: "Scan-to-BIM", estValue: 180000, stage: "WON" },
  ]});

  // --- SUBCONTRACTORS ---
  const sub1 = await prisma.subcontractor.create({ data: { companyName: "Gulf MEP Solutions", specialty: "MEP Installation", contactName: "Hassan Al-Marzouqi", contactEmail: "h.marzouqi@gulfmep.ae", contactPhone: "+971-4-567-8901", country: "UAE", status: "ACTIVE" } });
  await prisma.subcontractorAssignment.create({ data: { subcontractorId: sub1.id, projectId: proj1.id, scope: "MEP Installation Contractor", status: "ACTIVE" } });

  // --- BIM COORD SCHEDULE ---
  await prisma.bimCoordSchedule.createMany({ data: [
    { projectId: proj1.id, title: "Level 3-5 Coordination Meeting", meetingDate: daysAhead(7), attendees: "All disciplines", agenda: "Review clash reports, coordinate MEP routing", status: "SCHEDULED" },
    { projectId: proj1.id, title: "Level 6-10 Coordination Meeting", meetingDate: daysAhead(14), attendees: "All disciplines", agenda: "Upper floor coordination", status: "SCHEDULED" },
  ]});

  // --- DELIVERY MILESTONES ---
  await prisma.bimDeliveryMilestone.createMany({ data: [
    { projectId: proj1.id, title: "Milestone 1: LOD 300 Model Complete", dueDate: daysAhead(30), status: "PENDING", responsible: ahmed.id, description: "Full LOD 300 model for all disciplines" },
    { projectId: proj1.id, title: "Milestone 2: Clash-Free Model", dueDate: daysAhead(60), status: "PENDING", responsible: ahmed.id, description: "Zero critical clashes remaining" },
    { projectId: proj2.id, title: "Milestone 1: MEP Design Freeze", dueDate: daysAhead(45), status: "PENDING", responsible: omar.id },
  ]});

  // --- BIM VERIFY CHECKS ---
  await prisma.bimVerifyCheck.createMany({ data: [
    { projectId: proj1.id, category: "Naming", checkItem: "Model Naming Convention", status: "PASS", checkedBy: ahmed.id, notes: "All files follow ISO 19650 naming" },
    { projectId: proj1.id, category: "LOD", checkItem: "LOD Compliance", status: "PASS", checkedBy: sara.id, notes: "LOD 300 achieved for all structural elements" },
    { projectId: proj1.id, category: "Clash", checkItem: "Clash-Free Status", status: "FAIL", checkedBy: ahmed.id, notes: "24 clashes still open — critical resolution required" },
    { projectId: proj2.id, category: "BEP", checkItem: "BEP Compliance", status: "IN_PROGRESS", checkedBy: omar.id },
  ]});

  // --- INVOICES (for client portal) ---
  await prisma.invoice.createMany({ data: [
    { invoiceNo: "INV-2026-001", clientId: bagc.id, projectId: proj1.id, amount: 125000, currency: "AED", status: "PAID", issueDate: daysAgo(60), dueDate: daysAgo(30), description: "BIM Coordination Services - Phase 1", notes: "Payment received" },
    { invoiceNo: "INV-2026-002", clientId: bagc.id, projectId: proj1.id, amount: 85000, currency: "AED", status: "SENT", issueDate: daysAgo(15), dueDate: daysAhead(15), description: "BIM Coordination Services - Phase 2", notes: "Awaiting payment" },
    { invoiceNo: "INV-2026-003", clientId: emaar.id, projectId: proj2.id, amount: 45000, currency: "AED", status: "DRAFT", issueDate: daysAgo(5), dueDate: daysAhead(25), description: "MEP Coordination - Initial Setup", notes: "Draft for review" },
    { invoiceNo: "INV-2026-004", clientId: bagc.id, projectId: proj1.id, amount: 32000, currency: "AED", status: "OVERDUE", issueDate: daysAgo(45), dueDate: daysAgo(15), description: "Scan to BIM Services", notes: "Payment overdue - follow up required" },
  ]});

  console.log("✅ DatumOS v22 seeded successfully!");
  console.log("   Users: 4 | Clients: 3 | Projects: 3 | Tasks: 5");
  console.log("   Clashes: 4 | CDE Docs: 4 | KPIs: 5 | Leads: 5 | Invoices: 4");
}

main().catch(e => { console.error("❌ Seed failed:", e.message); process.exit(1); }).finally(() => prisma.$disconnect());