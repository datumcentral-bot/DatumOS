// DatumOS v14 — Supplemental seed for new BIM models
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding v14 BIM data...')

  // Get existing projects and users
  const projects = await prisma.project.findMany({ take: 3 })
  const users = await prisma.user.findMany({ take: 3 })
  const midps = await prisma.midp.findMany({ take: 2 })

  if (projects.length === 0) {
    console.log('⚠️  No projects found — run main seed first')
    return
  }

  const proj1 = projects[0]
  const proj2 = projects[1] || projects[0]
  const user1 = users[0]
  const user2 = users[1] || users[0]

  // ── MODEL PRODUCTION ──────────────────────────────────────────────────────
  const existingMP = await prisma.modelProduction.count()
  if (existingMP === 0) {
    await prisma.modelProduction.createMany({ data: [
      { projectId: proj1.id, discipline: 'Architecture', element: 'Interior Walls', deliverable: 'Architectural Model — Levels 1-5', format: 'RVT', lodRequired: 'LOD 300', assigneeId: user1.id, plannedDate: new Date('2025-09-30'), status: 'IN_PROGRESS' },
      { projectId: proj1.id, discipline: 'Architecture', element: 'Exterior Facade', deliverable: 'Facade Model — All Elevations', format: 'RVT', lodRequired: 'LOD 350', assigneeId: user1.id, plannedDate: new Date('2025-10-31'), status: 'NOT_STARTED' },
      { projectId: proj1.id, discipline: 'Structure', element: 'Columns & Beams', deliverable: 'Structural Model — Superstructure', format: 'RVT', lodRequired: 'LOD 300', assigneeId: user2.id, plannedDate: new Date('2025-09-15'), status: 'IN_PROGRESS' },
      { projectId: proj1.id, discipline: 'MEP', element: 'HVAC Ducts', deliverable: 'MEP Coordination Model', format: 'RVT', lodRequired: 'LOD 300', assigneeId: user2.id, plannedDate: new Date('2025-11-30'), status: 'NOT_STARTED' },
      { projectId: proj2.id, discipline: 'Architecture', element: 'Heritage Facades', deliverable: 'Heritage Documentation Model', format: 'IFC', lodRequired: 'LOD 400', assigneeId: user1.id, plannedDate: new Date('2025-12-31'), status: 'IN_PROGRESS' },
      { projectId: proj2.id, discipline: 'Civil', element: 'Site Infrastructure', deliverable: 'Civil Infrastructure Model', format: 'DWG', lodRequired: 'LOD 200', assigneeId: user2.id, plannedDate: new Date('2025-08-31'), status: 'COMPLETE' },
    ]})
    console.log('✅ Model Production: 6 entries')
  }

  // ── BIM COORDINATION SCHEDULE ─────────────────────────────────────────────
  const existingCS = await prisma.bimCoordSchedule.count()
  if (existingCS === 0) {
    await prisma.bimCoordSchedule.createMany({ data: [
      { projectId: proj1.id, title: 'Weekly BIM Coordination — Al Reem Tower', meetingDate: new Date('2025-07-14T10:00:00'), location: 'BIM 360 Meeting Room', attendees: 'Ahmed Al-Rashidi (BIM Lead), Omar Khalid (Structure), Fatima Hassan (MEP), Sara Al-Mansouri (PM)', agenda: '1. Clash detection review\n2. Model progress update\n3. CDE status check\n4. Action items review', status: 'SCHEDULED' },
      { projectId: proj1.id, title: 'Monthly BIM Coordination — Al Reem Tower', meetingDate: new Date('2025-07-07T14:00:00'), location: 'Site Office — Conference Room A', attendees: 'Director, Ahmed Al-Rashidi, Client Representative', agenda: '1. Monthly progress review\n2. BEP compliance check\n3. Upcoming milestones\n4. Client queries', minutes: 'Meeting held as scheduled. All models on track. Client satisfied with progress. Next milestone: Stage 3 delivery by end of Q3.', actionItems: '1. Ahmed: Upload updated federated model by 10 July\n2. Omar: Resolve 3 critical clashes by 12 July\n3. Sara: Update project schedule', status: 'COMPLETED' },
      { projectId: proj2.id, title: 'Heritage BIM Coordination — Diriyah Gate', meetingDate: new Date('2025-07-21T09:00:00'), location: 'Diriyah Gate Site Office', attendees: 'Ahmed Al-Rashidi, Heritage Consultant, DGDA Representative', agenda: '1. Heritage scan data review\n2. LOD 400 model progress\n3. Documentation standards\n4. Handover requirements', status: 'SCHEDULED' },
    ]})
    console.log('✅ BIM Coordination Schedule: 3 entries')
  }

  // ── BIM DELIVERY MILESTONES ───────────────────────────────────────────────
  const existingDM = await prisma.bimDeliveryMilestone.count()
  if (existingDM === 0) {
    await prisma.bimDeliveryMilestone.createMany({ data: [
      { projectId: proj1.id, title: 'Stage 2 — Concept Design BIM Delivery', description: 'Deliver LOD 200 architectural and structural models for Stage 2 design review', dueDate: new Date('2025-06-30'), completedAt: new Date('2025-06-28'), status: 'COMPLETE', responsible: 'Ahmed Al-Rashidi' },
      { projectId: proj1.id, title: 'Stage 3 — Developed Design BIM Delivery', description: 'Deliver LOD 300 coordinated federated model for Stage 3 approval', dueDate: new Date('2025-10-31'), status: 'IN_PROGRESS', responsible: 'Ahmed Al-Rashidi' },
      { projectId: proj1.id, title: 'Stage 4 — Technical Design BIM Delivery', description: 'Deliver LOD 350 models for construction documentation', dueDate: new Date('2026-03-31'), status: 'PENDING', responsible: 'Ahmed Al-Rashidi' },
      { projectId: proj1.id, title: 'Stage 5 — Construction BIM Delivery', description: 'Deliver LOD 400 as-built models for construction phase', dueDate: new Date('2026-12-31'), status: 'PENDING', responsible: 'Ahmed Al-Rashidi' },
      { projectId: proj2.id, title: 'Heritage Documentation — Phase 1', description: 'Complete LOD 400 heritage documentation for Zone A', dueDate: new Date('2025-08-31'), status: 'IN_PROGRESS', responsible: 'Omar Khalid' },
      { projectId: proj2.id, title: 'Asset Information Model Delivery', description: 'Deliver complete AIM for facility management handover', dueDate: new Date('2026-06-30'), status: 'PENDING', responsible: 'Ahmed Al-Rashidi' },
    ]})
    console.log('✅ BIM Delivery Milestones: 6 entries')
  }

  // ── TIDP (if no TIDPs exist) ──────────────────────────────────────────────
  const existingTIDPs = await prisma.tidp.count()
  if (existingTIDPs === 0 && midps.length > 0) {
    const tidp = await prisma.tidp.create({
      data: {
        projectId: proj1.id,
        midpId: midps[0].id,
        title: 'Architectural TIDP — Al Reem Tower',
        discipline: 'Architecture',
        taskTeam: 'FIRE Architecture Team',
        version: '1.0',
        status: 'IN_PROGRESS',
        description: 'Task Information Delivery Plan for architectural discipline — Al Reem Tower Complex',
        items: {
          create: [
            { title: 'Interior Walls — Levels 1-5', format: 'RVT', lodLevel: 'LOD 300', dueDate: new Date('2025-09-30'), status: 'IN_PROGRESS' },
            { title: 'Exterior Facade — All Elevations', format: 'RVT', lodLevel: 'LOD 350', dueDate: new Date('2025-10-31'), status: 'PENDING' },
            { title: 'Roof Structure', format: 'RVT', lodLevel: 'LOD 300', dueDate: new Date('2025-11-30'), status: 'PENDING' },
          ]
        }
      }
    })
    console.log('✅ TIDP: 1 entry with 3 items')
  }

  console.log('✅ v14 seed complete!')
}

main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
