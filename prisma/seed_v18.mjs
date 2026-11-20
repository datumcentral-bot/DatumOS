import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding DatumOS v18...')

  // ── Wipe in FK-safe order ──────────────────────────────────────────────────
  const wipe = [
    'activityLog','raciEntry','bimMeeting','mobilizationItem',
    'externalStakeholder','appointingParty',
    'isoComplianceItem','financialEntry','deliverySchedule',
    'bimVerifyCheck','bimScopeMatrix','bimDeliveryMilestone','bimCoordSchedule',
    'modelProduction','namingConvention','responsibilityMatrix','clashDetection',
    'lodSpec','cdeDocument','tidpItem','tidp','midpDeliverable','midp',
    'bep','eir','air','scheduleItem','resourceAllocation','timesheetEntry',
    'qaSignoff','rfi','risk','lesson','sop','coordinationItem',
    'actionItem','meetingMinute','meetingParticipant','meeting',
    'comment','attachment','timeEntry','taskDependency','task',
    'subcontractorAssignment','subcontractorMember','subcontractor',
    'invoice','lead','kpiMetric','outreachActivity','internalMessage',
    'starredItem','savedView','milestone','deliverable',
    'projectFile','projectTag','tag','projectDivision','projectAssignment',
    'clientDocument','clientAssessment','clientRequirement','clientContact',
    'clientUser','project','client','division','user','authUser',
  ]
  for (const m of wipe) {
    try { await prisma[m].deleteMany() } catch {}
  }

  // ── Auth users ─────────────────────────────────────────────────────────────
  const hash = (p) => bcrypt.hashSync(p, 10)
  await prisma.authUser.createMany({ data: [
    { email:'director@datumbim.com', name:'Col. James Harrington', passwordHash: hash('DatumDir2026!'), role:'DIRECTOR' },
    { email:'ahmed@datum-bim.com',   name:'Ahmed Al-Rashidi',      passwordHash: hash('Member@2026!'),  role:'MEMBER' },
    { email:'sara@datum-bim.com',    name:'Sara Khalil',           passwordHash: hash('Member@2026!'),  role:'MEMBER' },
    { email:'khalid@bagc.ae',        name:'Khalid Al-Mansoori',    passwordHash: hash('Client@2026!'),  role:'CLIENT' },
  ]})

  // ── Users ──────────────────────────────────────────────────────────────────
  const [dir, ahmed, sara] = await Promise.all([
    prisma.user.create({ data: { name:'Col. James Harrington', email:'director@datumbim.com', role:'DIRECTOR', title:'BIM Director', division:'BIM', capacityHrs:40 } }),
    prisma.user.create({ data: { name:'Ahmed Al-Rashidi',      email:'ahmed@datum-bim.com',   role:'MEMBER',   title:'BIM Coordinator', division:'BIM', capacityHrs:40 } }),
    prisma.user.create({ data: { name:'Sara Khalil',           email:'sara@datum-bim.com',    role:'MEMBER',   title:'BIM Modeller',    division:'BIM', capacityHrs:40 } }),
  ])

  // ── Clients ────────────────────────────────────────────────────────────────
  const [bagc, emaar] = await Promise.all([
    prisma.client.create({ data: { companyName:'BAGC Holdings', industry:'Real Estate', country:'UAE', city:'Dubai', contactName:'Khalid Al-Mansoori', contactEmail:'khalid@bagc.ae', status:'ACTIVE', tier:'TIER1' } }),
    prisma.client.create({ data: { companyName:'Emaar Properties', industry:'Construction', country:'UAE', city:'Dubai', contactName:'Mohammed Al-Emaar', contactEmail:'m.emaar@emaar.ae', status:'ACTIVE', tier:'TIER1' } }),
  ])

  // ── Projects ───────────────────────────────────────────────────────────────
  const [proj1, proj2] = await Promise.all([
    prisma.project.create({ data: { name:'Dubai Marina Tower', code:'DMT-001', clientId:bagc.id, status:'ACTIVE', phase:'TECHNICAL_DESIGN', bimLevel:'LOD 350', budget:5000000, contractValue:4800000, healthScore:85, progressPct:45, location:'Dubai Marina', country:'UAE' } }),
    prisma.project.create({ data: { name:'Emaar Business Bay', code:'EBB-002', clientId:emaar.id, status:'ACTIVE', phase:'PRODUCTION', bimLevel:'LOD 300', budget:8000000, contractValue:7500000, healthScore:72, progressPct:65, location:'Business Bay', country:'UAE' } }),
  ])

  // ── Project Assignments ────────────────────────────────────────────────────
  await prisma.projectAssignment.createMany({ data: [
    { projectId:proj1.id, userId:dir.id,   role:'BIM Director', isLead:true },
    { projectId:proj1.id, userId:ahmed.id, role:'BIM Coordinator' },
    { projectId:proj2.id, userId:dir.id,   role:'BIM Director', isLead:true },
    { projectId:proj2.id, userId:sara.id,  role:'BIM Modeller' },
  ]})

  // ── Tasks ──────────────────────────────────────────────────────────────────
  await prisma.task.createMany({ data: [
    { title:'Set up BIM Execution Plan', projectId:proj1.id, assigneeId:ahmed.id, status:'IN_PROGRESS', priority:'HIGH', estimatedHrs:8 },
    { title:'Clash Detection Report — Level 3', projectId:proj1.id, assigneeId:sara.id, status:'TODO', priority:'HIGH', estimatedHrs:4 },
    { title:'LOD 350 Model Review', projectId:proj2.id, assigneeId:ahmed.id, status:'IN_REVIEW', priority:'MEDIUM', estimatedHrs:6 },
    { title:'ISO 19650 Compliance Audit', projectId:proj2.id, assigneeId:dir.id, status:'TODO', priority:'HIGH', estimatedHrs:12 },
    { title:'CDE Document Upload — Structural', projectId:proj1.id, assigneeId:sara.id, status:'DONE', priority:'LOW', estimatedHrs:2 },
  ]})

  // ── Clash Detections ───────────────────────────────────────────────────────
  await prisma.clashDetection.createMany({ data: [
    { projectId:proj1.id, title:'MEP vs Structural Beam — Level 3', discipline1:'MEP', discipline2:'Structure', severity:'HIGH', status:'OPEN', assignedTo:'Ahmed Al-Rashidi', notes:'Duct clashes with primary beam at grid C3' },
    { projectId:proj1.id, title:'Plumbing vs Slab Penetration — Level 5', discipline1:'Plumbing', discipline2:'Structure', severity:'MEDIUM', status:'IN_PROGRESS', assignedTo:'Sara Khalil' },
    { projectId:proj2.id, title:'HVAC Routing Conflict — Basement', discipline1:'HVAC', discipline2:'Architecture', severity:'LOW', status:'RESOLVED', assignedTo:'Ahmed Al-Rashidi' },
  ]})

  // ── Responsibility Matrix ──────────────────────────────────────────────────
  await prisma.responsibilityMatrix.createMany({ data: [
    { projectId:proj1.id, discipline:'Architecture', deliverable:'Architectural Model LOD 350', role:'BIM Coordinator', responsible:'Ahmed Al-Rashidi', accountable:'Col. James Harrington', consulted:'Sara Khalil', informed:'Khalid Al-Mansoori' },
    { projectId:proj1.id, discipline:'Structure', deliverable:'Structural Model LOD 300', role:'BIM Modeller', responsible:'Sara Khalil', accountable:'Ahmed Al-Rashidi', consulted:'Col. James Harrington', informed:'Client' },
    { projectId:proj2.id, discipline:'MEP', deliverable:'MEP Coordination Model', role:'BIM Coordinator', responsible:'Ahmed Al-Rashidi', accountable:'Col. James Harrington', consulted:'Sara Khalil', informed:'Emaar PM' },
  ]})

  // ── Naming Conventions ─────────────────────────────────────────────────────
  await prisma.namingConvention.createMany({ data: [
    { projectId:proj1.id, name:'Model File Naming', pattern:'{ProjectCode}-{Discipline}-{Zone}-{Level}-{Type}', example:'DMT001-AR-Z01-L03-M3D', fields:'ProjectCode, Discipline, Zone, Level, Type', description:'ISO 19650 compliant model file naming' },
    { projectId:proj1.id, name:'Drawing Sheet Naming', pattern:'{ProjectCode}-{Discipline}-{SheetType}-{Number}', example:'DMT001-AR-GA-001', fields:'ProjectCode, Discipline, SheetType, Number', description:'General arrangement drawing naming' },
    { name:'Global Document Naming', pattern:'{Company}-{DocType}-{Revision}', example:'DATUM-BEP-P01', fields:'Company, DocType, Revision', description:'Company-wide document naming standard' },
  ]})

  // ── Model Production ───────────────────────────────────────────────────────
  await prisma.modelProduction.createMany({ data: [
    { projectId:proj1.id, discipline:'Architecture', element:'External Walls', deliverable:'AR Model LOD 350', format:'RVT', lodRequired:'LOD 350', assigneeId:ahmed.id, status:'IN_PROGRESS', plannedDate:new Date('2026-08-01') },
    { projectId:proj1.id, discipline:'Structure', element:'Foundations', deliverable:'ST Model LOD 300', format:'RVT', lodRequired:'LOD 300', assigneeId:sara.id, status:'NOT_STARTED', plannedDate:new Date('2026-08-15') },
    { projectId:proj2.id, discipline:'MEP', element:'HVAC Systems', deliverable:'MEP Coordination Model', format:'RVT', lodRequired:'LOD 300', assigneeId:ahmed.id, status:'IN_PROGRESS', plannedDate:new Date('2026-07-30') },
  ]})

  // ── BIM Coord Schedule ─────────────────────────────────────────────────────
  await prisma.bimCoordSchedule.createMany({ data: [
    { projectId:proj1.id, title:'Weekly BIM Coordination Meeting', meetingDate:new Date('2026-07-15T10:00:00'), location:'Conference Room A', attendees:'Ahmed, Sara, Director', agenda:'Clash review, LOD progress, CDE updates', status:'SCHEDULED' },
    { projectId:proj2.id, title:'MEP Coordination Session', meetingDate:new Date('2026-07-18T14:00:00'), location:'Virtual — Teams', attendees:'Ahmed, MEP Consultant', agenda:'HVAC routing conflicts, Plumbing coordination', status:'SCHEDULED' },
  ]})

  // ── BIM Delivery Milestones ────────────────────────────────────────────────
  await prisma.bimDeliveryMilestone.createMany({ data: [
    { projectId:proj1.id, title:'Stage 3 BIM Model Submission', dueDate:new Date('2026-08-31'), status:'PENDING', responsible:'Ahmed Al-Rashidi', description:'Full LOD 350 architectural and structural models' },
    { projectId:proj1.id, title:'Clash Detection Report — Final', dueDate:new Date('2026-09-15'), status:'PENDING', responsible:'Sara Khalil' },
    { projectId:proj2.id, title:'MEP Coordination Complete', dueDate:new Date('2026-08-01'), status:'IN_PROGRESS', responsible:'Ahmed Al-Rashidi' },
  ]})

  // ── BIM Scope Matrix ───────────────────────────────────────────────────────
  const elements = ['Site & Topography','Foundations','Structural Frame','Floors & Slabs','External Walls','Internal Walls','HVAC Systems','Electrical Systems']
  const disciplines = ['Architecture','Structure','MEP','Civil','Landscape']
  const lods = ['LOD 200','LOD 300','LOD 350','LOD 400']
  const scopeData = []
  for (const el of elements) {
    for (const disc of disciplines.slice(0,3)) {
      scopeData.push({ projectId:proj1.id, element:el, discipline:disc, lodRequired:lods[Math.floor(Math.random()*lods.length)], status:'PENDING', responsible:'Ahmed Al-Rashidi' })
    }
  }
  await prisma.bimScopeMatrix.createMany({ data: scopeData })

  // ── BIM Verify Checks ──────────────────────────────────────────────────────
  await prisma.bimVerifyCheck.createMany({ data: [
    { projectId:proj1.id, category:'Model Geometry', checkItem:'No overlapping elements', status:'PASS', result:'Clean', checkedBy:'Ahmed Al-Rashidi', checkedAt:new Date() },
    { projectId:proj1.id, category:'Naming Convention', checkItem:'All files follow ISO 19650 naming', status:'PASS', result:'Compliant', checkedBy:'Sara Khalil', checkedAt:new Date() },
    { projectId:proj1.id, category:'LOD Compliance', checkItem:'LOD 350 achieved for all elements', status:'IN_REVIEW', checkedBy:'Col. James Harrington' },
    { projectId:proj2.id, category:'Clash Detection', checkItem:'Zero hard clashes remaining', status:'FAIL', result:'3 hard clashes found', checkedBy:'Ahmed Al-Rashidi', checkedAt:new Date() },
    { projectId:proj2.id, category:'CDE Upload', checkItem:'All models uploaded to CDE', status:'PENDING' },
  ]})

  // ── Delivery Schedule ──────────────────────────────────────────────────────
  await prisma.deliverySchedule.createMany({ data: [
    { projectId:proj1.id, title:'Architectural Drawings Package', startDate:new Date('2026-07-01'), endDate:new Date('2026-08-15'), status:'IN_PROGRESS', responsible:'Ahmed Al-Rashidi', deliverable:'GA Drawings Set' },
    { projectId:proj1.id, title:'Structural BIM Model', startDate:new Date('2026-07-15'), endDate:new Date('2026-09-01'), status:'PLANNED', responsible:'Sara Khalil', deliverable:'RVT Model LOD 300' },
    { projectId:proj2.id, title:'MEP Coordination Package', startDate:new Date('2026-06-01'), endDate:new Date('2026-07-31'), status:'IN_PROGRESS', responsible:'Ahmed Al-Rashidi', deliverable:'MEP Coordination Report' },
  ]})

  // ── Financial Entries ──────────────────────────────────────────────────────
  await prisma.financialEntry.createMany({ data: [
    { projectId:proj1.id, clientId:bagc.id, type:'INVOICE', title:'Stage 1 BIM Services Invoice', amount:480000, currency:'AED', status:'SENT', invoiceNo:'INV-2026-001', dueDate:new Date('2026-08-01') },
    { projectId:proj1.id, clientId:bagc.id, type:'PAYMENT', title:'Stage 1 Payment Received', amount:480000, currency:'AED', status:'PAID', invoiceNo:'PAY-2026-001', paidDate:new Date('2026-07-05') },
    { projectId:proj2.id, clientId:emaar.id, type:'INVOICE', title:'MEP Coordination Services', amount:750000, currency:'AED', status:'DRAFT', invoiceNo:'INV-2026-002', dueDate:new Date('2026-08-15') },
    { projectId:proj2.id, clientId:emaar.id, type:'EXPENSE', title:'Software Licenses Q3', amount:25000, currency:'AED', status:'PAID' },
  ]})

  // ── ISO 19650 Compliance ───────────────────────────────────────────────────
  await prisma.isoComplianceItem.createMany({ data: [
    { projectId:proj1.id, clause:'5.1', title:'Appointment of Lead Appointed Party', status:'COMPLETE', evidence:'Contract signed 2026-01-15', responsible:'Col. James Harrington' },
    { projectId:proj1.id, clause:'5.2', title:'BIM Execution Plan (BEP) Issued', status:'COMPLETE', evidence:'BEP v1.2 issued', responsible:'Ahmed Al-Rashidi' },
    { projectId:proj1.id, clause:'5.3', title:'Master Information Delivery Plan (MIDP)', status:'IN_PROGRESS', responsible:'Ahmed Al-Rashidi', dueDate:new Date('2026-08-01') },
    { projectId:proj1.id, clause:'6.1', title:'Common Data Environment (CDE) Established', status:'COMPLETE', evidence:'CDE live on DatumOS', responsible:'Sara Khalil' },
    { projectId:proj2.id, clause:'5.1', title:'Appointment of Lead Appointed Party', status:'COMPLETE', responsible:'Col. James Harrington' },
    { projectId:proj2.id, clause:'7.1', title:'Information Model Review', status:'NOT_STARTED', responsible:'Ahmed Al-Rashidi', dueDate:new Date('2026-09-01') },
  ]})

  // ── Activity Log ──────────────────────────────────────────────────────────
  await prisma.activityLog.createMany({ data: [
    { userId:dir.id, action:'LOGIN', entity:'AuthUser', details:'Director logged in' },
    { userId:ahmed.id, action:'CREATE', entity:'ClashDetection', details:'Created clash: MEP vs Structural Beam' },
    { userId:sara.id, action:'UPDATE', entity:'BimVerifyCheck', details:'Updated check: Model Geometry — PASS' },
    { userId:ahmed.id, action:'CREATE', entity:'BimScopeMatrix', details:'Assigned LOD 350 to Architecture/External Walls' },
    { userId:dir.id, action:'CREATE', entity:'FinancialEntry', details:'Created invoice INV-2026-001 for AED 480,000' },
  ]})

  // ── Subcontractors ─────────────────────────────────────────────────────────
  const [sub1] = await Promise.all([
    prisma.subcontractor.create({ data: { companyName:'MEP Solutions LLC', specialization:'MEP Engineering', contactPerson:'Hassan Al-Farsi', contactEmail:'hassan@mepsolutions.ae', country:'UAE', rating:4.5, status:'ACTIVE' } }),
  ])
  await prisma.subcontractorAssignment.create({ data: { subcontractorId:sub1.id, projectId:proj2.id, scope:'MEP Coordination and Modeling', status:'ACTIVE', performanceScore:4.2 } })

  // ── Risks ──────────────────────────────────────────────────────────────────
  await prisma.risk.createMany({ data: [
    { projectId:proj1.id, title:'Design Changes Late Stage', category:'Design', probability:'MEDIUM', impact:'HIGH', riskScore:6, status:'OPEN', mitigation:'Freeze design at Stage 3', owner:'Ahmed Al-Rashidi' },
    { projectId:proj2.id, title:'MEP Coordination Delays', category:'Schedule', probability:'HIGH', impact:'HIGH', riskScore:9, status:'OPEN', mitigation:'Weekly coordination meetings', owner:'Col. James Harrington' },
  ]})

  // ── Lessons Learned ────────────────────────────────────────────────────────
  await prisma.lesson.createMany({ data: [
    { projectId:proj1.id, title:'Early BEP Alignment Critical', description:'Ensure BEP is agreed before modeling starts', category:'Process', impact:'HIGH', action:'Add BEP sign-off to project kickoff checklist', status:'IMPLEMENTED' },
    { projectId:proj2.id, title:'MEP Clash Detection Frequency', description:'Weekly clash detection prevents late-stage rework', category:'BIM', impact:'HIGH', action:'Schedule automated clash detection every Monday', status:'OPEN' },
  ]})

  // ── RACI Entries ───────────────────────────────────────────────────────────
  await prisma.raciEntry.createMany({ data: [
    { projectId:proj1.id, task:'BIM Execution Plan', person:'Col. James Harrington', role:'A' },
    { projectId:proj1.id, task:'BIM Execution Plan', person:'Ahmed Al-Rashidi', role:'R' },
    { projectId:proj1.id, task:'Clash Detection', person:'Sara Khalil', role:'R' },
    { projectId:proj1.id, task:'Clash Detection', person:'Ahmed Al-Rashidi', role:'A' },
    { projectId:proj2.id, task:'MEP Coordination', person:'Ahmed Al-Rashidi', role:'R' },
    { projectId:proj2.id, task:'MEP Coordination', person:'Col. James Harrington', role:'A' },
  ]})

  // ── BIM Meetings ───────────────────────────────────────────────────────────
  await prisma.bimMeeting.createMany({ data: [
    { projectId:proj1.id, title:'Weekly BIM Coordination', date:new Date('2026-07-15T10:00:00'), attendees:'Ahmed Al-Rashidi, Sara Khalil, Col. James Harrington', agenda:'Clash review, LOD progress', minutes:'Reviewed 3 clashes. LOD 350 on track.', actionItems:'Ahmed to resolve MEP clash by 2026-07-20', status:'COMPLETED' },
    { projectId:proj2.id, title:'MEP Design Review', date:new Date('2026-07-18T14:00:00'), attendees:'Ahmed Al-Rashidi, MEP Consultant', agenda:'HVAC routing, Plumbing coordination', status:'SCHEDULED' },
  ]})

  // ── Mobilization Items ─────────────────────────────────────────────────────
  await prisma.mobilizationItem.createMany({ data: [
    { projectId:proj1.id, task:'Set up CDE environment', responsible:'Sara Khalil', dueDate:new Date('2026-07-10'), status:'COMPLETE' },
    { projectId:proj1.id, task:'Issue BIM Execution Plan', responsible:'Ahmed Al-Rashidi', dueDate:new Date('2026-07-15'), status:'COMPLETE' },
    { projectId:proj1.id, task:'Onboard subcontractors to CDE', responsible:'Col. James Harrington', dueDate:new Date('2026-07-20'), status:'IN_PROGRESS' },
    { projectId:proj2.id, task:'MEP Consultant kickoff meeting', responsible:'Ahmed Al-Rashidi', dueDate:new Date('2026-07-12'), status:'COMPLETE' },
  ]})

  // ── Appointing Parties ─────────────────────────────────────────────────────
  await prisma.appointingParty.createMany({ data: [
    { name:'BAGC Holdings', organization:'BAGC Holdings LLC', role:'Employer', contactName:'Khalid Al-Mansoori', contactEmail:'khalid@bagc.ae', country:'UAE', status:'ACTIVE' },
    { name:'Emaar Properties', organization:'Emaar Properties PJSC', role:'Employer', contactName:'Mohammed Al-Emaar', contactEmail:'m.emaar@emaar.ae', country:'UAE', status:'ACTIVE' },
  ]})

  // ── External Stakeholders ──────────────────────────────────────────────────
  await prisma.externalStakeholder.createMany({ data: [
    { name:'Dubai Municipality', organization:'Dubai Municipality', role:'Regulatory Authority', contactEmail:'bim@dm.gov.ae', projectId:proj1.id, status:'ACTIVE' },
    { name:'DEWA', organization:'Dubai Electricity & Water Authority', role:'Utility Provider', contactEmail:'projects@dewa.gov.ae', projectId:proj1.id, status:'ACTIVE' },
  ]})

  // ── KPI Metrics ────────────────────────────────────────────────────────────
  await prisma.kpiMetric.createMany({ data: [
    { name:'Active Projects', value:2, target:5, unit:'projects', category:'Portfolio' },
    { name:'Total Revenue', value:5230000, target:10000000, unit:'AED', category:'Finance' },
    { name:'Clash Resolution Rate', value:85, target:95, unit:'%', category:'BIM' },
    { name:'ISO 19650 Compliance', value:72, target:100, unit:'%', category:'Quality' },
    { name:'Team Utilization', value:78, target:85, unit:'%', category:'Resources' },
  ]})

  console.log('✅ Seed complete!')
}

main().catch(e => { console.error('❌ Seed failed:', e.message); process.exit(1) }).finally(() => prisma.$disconnect())
