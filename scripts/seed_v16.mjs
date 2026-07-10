import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  console.log('Seeding v16 new models...')

  // Get first project for relations
  const project = await prisma.project.findFirst()
  const projectId = project?.id

  // BIM Scope Matrix
  const scopeItems = [
    { element: 'Interior Walls', discipline: 'Architecture', lodRequired: 'LOD 300', loaRequired: 'LOA 20', status: 'IN_PROGRESS', responsible: 'Arch Team', projectId },
    { element: 'Structural Columns', discipline: 'Structure', lodRequired: 'LOD 350', loaRequired: 'LOA 30', status: 'COMPLETE', responsible: 'Struct Team', projectId },
    { element: 'HVAC Ducts', discipline: 'MEP', lodRequired: 'LOD 300', loaRequired: 'LOA 20', status: 'PENDING', responsible: 'MEP Team', projectId },
    { element: 'Foundations', discipline: 'Structure', lodRequired: 'LOD 400', loaRequired: 'LOA 40', status: 'COMPLETE', responsible: 'Struct Team', projectId },
    { element: 'Curtain Walls', discipline: 'Architecture', lodRequired: 'LOD 350', loaRequired: 'LOA 30', status: 'IN_PROGRESS', responsible: 'Facade Team', projectId },
    { element: 'Electrical Panels', discipline: 'Electrical', lodRequired: 'LOD 300', loaRequired: 'LOA 20', status: 'PENDING', responsible: 'Elec Team', projectId },
  ]
  for (const item of scopeItems) {
    await prisma.bimScopeMatrix.create({ data: item })
  }
  console.log('✓ BIM Scope Matrix seeded')

  // BIM Verify Checks
  const verifyChecks = [
    { category: 'Naming Convention', checkItem: 'All model files follow ISO 19650 naming standard', status: 'PASS', result: 'Verified — all 47 files comply', checkedBy: 'BIM Manager', projectId },
    { category: 'LOD Compliance', checkItem: 'Structural elements meet LOD 350 requirement', status: 'PASS', result: 'Confirmed via model audit', checkedBy: 'BIM Coordinator', projectId },
    { category: 'Clash Detection', checkItem: 'Zero critical clashes in federated model', status: 'FAIL', result: '3 critical clashes found — HVAC vs Beam Level 4', checkedBy: 'BIM Coordinator', projectId },
    { category: 'CDE Upload', checkItem: 'All deliverables uploaded to CDE with correct status', status: 'IN_REVIEW', result: 'Pending review by client', checkedBy: 'BIM Manager', projectId },
    { category: 'Metadata', checkItem: 'All elements have required IFC parameters', status: 'PASS', result: 'IFC export validated', checkedBy: 'BIM Author', projectId },
  ]
  for (const check of verifyChecks) {
    await prisma.bimVerifyCheck.create({ data: check })
  }
  console.log('✓ BIM Verify Checks seeded')

  // Delivery Schedule
  const scheduleItems = [
    { title: 'Architectural BIM Model — Phase 1', description: 'LOD 300 architectural model for design development', startDate: new Date('2026-01-15'), endDate: new Date('2026-03-31'), status: 'COMPLETE', responsible: 'Arch Team', deliverable: 'RVT, IFC', projectId },
    { title: 'Structural BIM Model — Phase 1', description: 'LOD 350 structural model', startDate: new Date('2026-02-01'), endDate: new Date('2026-04-15'), status: 'IN_PROGRESS', responsible: 'Struct Team', deliverable: 'RVT, IFC', projectId },
    { title: 'MEP Coordination Model', description: 'Coordinated MEP model for clash detection', startDate: new Date('2026-03-01'), endDate: new Date('2026-05-30'), status: 'PLANNED', responsible: 'MEP Team', deliverable: 'RVT, NWD', projectId },
    { title: 'Federated Model — Milestone 1', description: 'Combined architectural + structural federated model', startDate: new Date('2026-04-01'), endDate: new Date('2026-04-30'), status: 'PLANNED', responsible: 'BIM Manager', deliverable: 'NWD, IFC', projectId },
    { title: 'As-Built Documentation', description: 'Final as-built BIM model and documentation', startDate: new Date('2026-10-01'), endDate: new Date('2026-12-31'), status: 'PLANNED', responsible: 'BIM Team', deliverable: 'RVT, IFC, PDF', projectId },
  ]
  for (const item of scheduleItems) {
    await prisma.deliverySchedule.create({ data: item })
  }
  console.log('✓ Delivery Schedule seeded')

  // Financial Entries
  const client = await prisma.client.findFirst()
  const clientId = client?.id
  const financialItems = [
    { title: 'BIM Modeling Services — Phase 1', type: 'INVOICE', amount: 185000, currency: 'AED', status: 'PAID', invoiceNo: 'INV-2026-001', dueDate: new Date('2026-02-28'), paidDate: new Date('2026-02-25'), projectId, clientId },
    { title: 'BIM Coordination Services — Phase 2', type: 'INVOICE', amount: 220000, currency: 'AED', status: 'SENT', invoiceNo: 'INV-2026-002', dueDate: new Date('2026-05-31'), projectId, clientId },
    { title: 'Clash Detection & Resolution', type: 'INVOICE', amount: 45000, currency: 'AED', status: 'DRAFT', invoiceNo: 'INV-2026-003', dueDate: new Date('2026-06-30'), projectId, clientId },
    { title: 'Software Licenses — Revit 2026', type: 'EXPENSE', amount: 28500, currency: 'AED', status: 'PAID', invoiceNo: 'EXP-2026-001', dueDate: new Date('2026-01-31'), projectId },
    { title: 'Retention Release — Phase 1', type: 'RETENTION', amount: 18500, currency: 'AED', status: 'OVERDUE', invoiceNo: 'RET-2026-001', dueDate: new Date('2026-03-31'), projectId, clientId },
  ]
  for (const item of financialItems) {
    await prisma.financialEntry.create({ data: item })
  }
  console.log('✓ Financial Entries seeded')

  // ISO 19650 Compliance
  const isoItems = [
    { clause: '5.1 Organizational information requirements', title: 'OIR documented and approved', status: 'COMPLETE', responsible: 'BIM Manager', evidence: 'OIR-DATUM-2026-v1.0.pdf', projectId },
    { clause: '6.1 Appointment', title: 'BIM Execution Plan signed by all parties', status: 'COMPLETE', responsible: 'Project Director', evidence: 'BEP-DATUM-2026-v2.0.pdf signed', projectId },
    { clause: '6.2 Information management', title: 'MIDP established and published', status: 'IN_PROGRESS', responsible: 'BIM Coordinator', dueDate: new Date('2026-04-30'), projectId },
    { clause: '7.1 BIM Execution Plan', title: 'BEP reviewed and updated at each stage', status: 'IN_PROGRESS', responsible: 'BIM Manager', dueDate: new Date('2026-05-15'), projectId },
    { clause: '8.1 CDE', title: 'CDE established with correct access controls', status: 'COMPLETE', responsible: 'IT / BIM Manager', evidence: 'CDE configured in DatumOS', projectId },
    { clause: '8.2 Naming conventions', title: 'Naming convention standard applied to all files', status: 'COMPLETE', responsible: 'BIM Coordinator', evidence: 'Naming convention register in DatumOS', projectId },
    { clause: '9.1 Clash detection', title: 'Clash detection process established and documented', status: 'IN_PROGRESS', responsible: 'BIM Coordinator', dueDate: new Date('2026-04-15'), projectId },
    { clause: '6.4 Collaborative production', title: 'Coordination meetings scheduled and minuted', status: 'NOT_STARTED', responsible: 'BIM Manager', dueDate: new Date('2026-05-01'), projectId },
  ]
  for (const item of isoItems) {
    await prisma.isoComplianceItem.create({ data: item })
  }
  console.log('✓ ISO 19650 Compliance seeded')

  // Activity Log
  const user = await prisma.user.findFirst()
  const userId = user?.id
  const activities = [
    { action: 'CREATE', entity: 'Project', entityId: projectId, details: 'Created project: Diriyah Gate Cultural District', userId },
    { action: 'UPDATE', entity: 'CdeDocument', details: 'Status changed: WIP → Shared', userId },
    { action: 'CREATE', entity: 'ClashDetection', details: 'Logged clash: HVAC vs Structural Beam Level 4', userId },
    { action: 'UPDATE', entity: 'BimDeliveryMilestone', details: 'Milestone marked complete: Arch Model Phase 1', userId },
    { action: 'CREATE', entity: 'Client', details: 'New client added: Bagc Engineering', userId },
    { action: 'UPDATE', entity: 'Task', details: 'Task status: IN_PROGRESS → DONE', userId },
    { action: 'CREATE', entity: 'Meeting', details: 'BIM Coordination Meeting scheduled', userId },
    { action: 'DELETE', entity: 'Risk', details: 'Risk closed: Schedule delay risk resolved', userId },
  ]
  for (const log of activities) {
    await prisma.activityLog.create({ data: log })
  }
  console.log('✓ Activity Log seeded')

  console.log('✅ v16 seed complete!')
}

main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
