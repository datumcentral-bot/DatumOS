// DatumOS v13 — Comprehensive Seed Script
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding DatumOS v13...')

  // ── USERS ──────────────────────────────────────────────────────────────────
  const directorPw = await bcrypt.hash('DatumDir2026!', 10)
  const memberPw   = await bcrypt.hash('Member@2026!', 10)
  const clientPw   = await bcrypt.hash('Client@2026!', 10)

  const director = await prisma.user.upsert({
    where: { email: 'director@datumbim.com' },
    update: {},
    create: { name: 'Asad Syed Askary', email: 'director@datumbim.com', password: directorPw, role: 'DIRECTOR', title: 'Managing Director', division: 'EXEC', avatarHue: '45', capacityHrs: 50 }
  })
  const ahmed = await prisma.user.upsert({
    where: { email: 'ahmed@datum-bim.com' },
    update: {},
    create: { name: 'Ahmed Al-Rashidi', email: 'ahmed@datum-bim.com', password: memberPw, role: 'MEMBER', title: 'BIM Manager', division: 'BIM', avatarHue: '200', capacityHrs: 40 }
  })
  const sara = await prisma.user.upsert({
    where: { email: 'sara@datum-bim.com' },
    update: {},
    create: { name: 'Sara Al-Mansouri', email: 'sara@datum-bim.com', password: memberPw, role: 'MEMBER', title: 'Project Manager', division: 'PM', avatarHue: '320', capacityHrs: 40 }
  })
  const omar = await prisma.user.upsert({
    where: { email: 'omar@datum-bim.com' },
    update: {},
    create: { name: 'Omar Khalid', email: 'omar@datum-bim.com', password: memberPw, role: 'MEMBER', title: 'BIM Coordinator', division: 'BIM', avatarHue: '160', capacityHrs: 40 }
  })
  const fatima = await prisma.user.upsert({
    where: { email: 'fatima@datum-bim.com' },
    update: {},
    create: { name: 'Fatima Hassan', email: 'fatima@datum-bim.com', password: memberPw, role: 'MEMBER', title: 'Structural Engineer', division: 'STR', avatarHue: '280', capacityHrs: 40 }
  })
  const khalid = await prisma.user.upsert({
    where: { email: 'khalid@bagc.ae' },
    update: {},
    create: { name: 'Khalid Al-Farsi', email: 'khalid@bagc.ae', password: clientPw, role: 'CLIENT', title: 'Project Director', division: 'CLIENT', avatarHue: '30', capacityHrs: 40 }
  })

  // ── DIVISIONS ──────────────────────────────────────────────────────────────
  const divBIM = await prisma.division.upsert({ where: { code: 'BIM' }, update: {}, create: { code: 'BIM', name: 'BIM & Digital', colorHex: '#4a7c59', isFlagship: true } })
  const divPM  = await prisma.division.upsert({ where: { code: 'PM' },  update: {}, create: { code: 'PM',  name: 'Project Management', colorHex: '#8b6914' } })
  const divSTR = await prisma.division.upsert({ where: { code: 'STR' }, update: {}, create: { code: 'STR', name: 'Structural Engineering', colorHex: '#5a3e2b' } })
  const divMEP = await prisma.division.upsert({ where: { code: 'MEP' }, update: {}, create: { code: 'MEP', name: 'MEP Engineering', colorHex: '#2b4a5a' } })

  // ── CLIENTS ────────────────────────────────────────────────────────────────
  const clientBAGC = await prisma.client.create({
    data: {
      companyName: 'Bawabat Al-Sharq Group', industry: 'Real Estate', country: 'UAE', city: 'Abu Dhabi',
      address: 'Al Reem Island, Abu Dhabi, UAE', contactName: 'Khalid Al-Farsi', contactEmail: 'khalid@bagc.ae',
      contactPhone: '+971-2-555-0100', website: 'https://bagc.ae', status: 'ACTIVE', notes: 'Premium real estate developer',
      contacts: { create: [
        { name: 'Khalid Al-Farsi', role: 'Project Director', email: 'khalid@bagc.ae', phone: '+971-2-555-0100', isPrimary: true },
        { name: 'Mariam Al-Zaabi', role: 'Technical Manager', email: 'mariam@bagc.ae', phone: '+971-2-555-0101' }
      ]},
      requirements: { create: [
        { title: 'ISO 19650 Compliance', description: 'All BIM deliverables must comply with ISO 19650 standards', category: 'BIM', priority: 'HIGH', status: 'OPEN' },
        { title: 'LOD 400 for Structural', description: 'Structural elements require LOD 400 for fabrication', category: 'TECHNICAL', priority: 'HIGH', status: 'IN_PROGRESS' },
        { title: 'CDE Integration', description: 'All documents managed through approved CDE platform', category: 'PROCESS', priority: 'MEDIUM', status: 'OPEN' }
      ]},
      assessments: { create: [
        { title: 'Technical Capability Assessment', criteria: 'BIM software, team skills, past projects', score: 8.5, maxScore: 10, notes: 'Strong BIM capability demonstrated' },
        { title: 'Financial Standing', criteria: 'Credit rating, payment history', score: 9.0, maxScore: 10, notes: 'Excellent payment record' }
      ]}
    }
  })

  const clientDGDA = await prisma.client.create({
    data: {
      companyName: 'Diriyah Gate Development Authority', industry: 'Government / Heritage', country: 'Saudi Arabia', city: 'Riyadh',
      address: 'Diriyah, Riyadh, Saudi Arabia', contactName: 'Mohammed Al-Ghamdi', contactEmail: 'mghamdi@dgda.gov.sa',
      contactPhone: '+966-11-555-0200', website: 'https://dgda.gov.sa', status: 'ACTIVE',
      contacts: { create: [
        { name: 'Mohammed Al-Ghamdi', role: 'BIM Director', email: 'mghamdi@dgda.gov.sa', isPrimary: true },
        { name: 'Nora Al-Otaibi', role: 'Project Coordinator', email: 'notaibi@dgda.gov.sa' }
      ]},
      requirements: { create: [
        { title: 'Heritage Preservation Standards', description: 'All models must respect UNESCO heritage guidelines', category: 'COMPLIANCE', priority: 'CRITICAL', status: 'OPEN' },
        { title: 'Clash-Free Models', description: 'Zero clashes in published models', category: 'QUALITY', priority: 'HIGH', status: 'IN_PROGRESS' }
      ]}
    }
  })

  const clientNEOM = await prisma.client.create({
    data: {
      companyName: 'NEOM Development Company', industry: 'Mega-Project', country: 'Saudi Arabia', city: 'Tabuk',
      address: 'NEOM, Tabuk Province, Saudi Arabia', contactName: 'James Whitfield', contactEmail: 'jwhitfield@neom.com',
      contactPhone: '+966-14-555-0300', website: 'https://neom.com', status: 'ACTIVE',
      contacts: { create: [
        { name: 'James Whitfield', role: 'Digital Construction Lead', email: 'jwhitfield@neom.com', isPrimary: true }
      ]}
    }
  })

  // ── PROJECTS ───────────────────────────────────────────────────────────────
  const projReem = await prisma.project.create({
    data: {
      name: 'Al Reem Island Tower Complex', code: 'ARITC-001', clientId: clientBAGC.id,
      description: 'Mixed-use tower complex with 3 residential towers and podium retail', status: 'ACTIVE',
      phase: 'DESIGN DEVELOPMENT', startDate: new Date('2025-01-15'), endDate: new Date('2027-06-30'),
      budget: 450000000, contractValue: 2800000, bimLevel: 'BIM Level 2', isoStage: 'Stage 3',
      location: 'Al Reem Island', country: 'UAE', healthScore: 82, progressPct: 35,
      assignments: { create: [
        { userId: director.id, role: 'Project Director', isLead: true },
        { userId: ahmed.id, role: 'BIM Manager' },
        { userId: sara.id, role: 'Project Manager' },
        { userId: omar.id, role: 'BIM Coordinator' }
      ]},
      divisions: { create: [{ divisionId: divBIM.id }, { divisionId: divPM.id }] }
    }
  })

  const projDiriyah = await prisma.project.create({
    data: {
      name: 'Diriyah Gate Heritage District', code: 'DGHD-002', clientId: clientDGDA.id,
      description: 'BIM coordination for heritage district restoration and new build', status: 'ACTIVE',
      phase: 'CONSTRUCTION', startDate: new Date('2024-06-01'), endDate: new Date('2026-12-31'),
      budget: 1200000000, contractValue: 5500000, bimLevel: 'BIM Level 2', isoStage: 'Stage 4',
      location: 'Diriyah', country: 'Saudi Arabia', healthScore: 71, progressPct: 62,
      assignments: { create: [
        { userId: director.id, role: 'Project Director', isLead: true },
        { userId: ahmed.id, role: 'BIM Lead' },
        { userId: fatima.id, role: 'Structural Lead' }
      ]},
      divisions: { create: [{ divisionId: divBIM.id }, { divisionId: divSTR.id }] }
    }
  })

  const projNEOM = await prisma.project.create({
    data: {
      name: 'NEOM The Line Infrastructure BIM', code: 'NEOM-003', clientId: clientNEOM.id,
      description: 'BIM management for The Line linear city infrastructure', status: 'ACTIVE',
      phase: 'SCHEMATIC DESIGN', startDate: new Date('2025-03-01'), endDate: new Date('2030-12-31'),
      budget: 5000000000, contractValue: 12000000, bimLevel: 'BIM Level 3', isoStage: 'Stage 2',
      location: 'Tabuk Province', country: 'Saudi Arabia', healthScore: 90, progressPct: 15,
      assignments: { create: [
        { userId: director.id, role: 'Project Director', isLead: true },
        { userId: ahmed.id, role: 'BIM Manager' },
        { userId: omar.id, role: 'BIM Coordinator' }
      ]},
      divisions: { create: [{ divisionId: divBIM.id }, { divisionId: divMEP.id }] }
    }
  })

  // ── TASKS ──────────────────────────────────────────────────────────────────
  const task1 = await prisma.task.create({ data: { title: 'Develop BIM Execution Plan', description: 'Create comprehensive BEP for Al Reem Tower project', projectId: projReem.id, assigneeId: ahmed.id, status: 'IN_PROGRESS', priority: 'HIGH', dueDate: new Date('2025-08-15'), estimatedHrs: 40, loggedHrs: 18, tags: 'BIM,Documentation' } })
  const task2 = await prisma.task.create({ data: { title: 'Structural Model — Podium Level', description: 'Complete structural BIM model for podium levels B1-L4', projectId: projReem.id, assigneeId: fatima.id, status: 'TODO', priority: 'HIGH', dueDate: new Date('2025-09-01'), estimatedHrs: 80, tags: 'Structural,Revit' } })
  const task3 = await prisma.task.create({ data: { title: 'Clash Detection Report — Round 1', description: 'Run clash detection between architectural and structural models', projectId: projReem.id, assigneeId: omar.id, status: 'TODO', priority: 'MEDIUM', dueDate: new Date('2025-09-15'), estimatedHrs: 16 } })
  const task4 = await prisma.task.create({ data: { title: 'CDE Setup and Configuration', description: 'Configure Common Data Environment for project team', projectId: projDiriyah.id, assigneeId: ahmed.id, status: 'DONE', priority: 'HIGH', dueDate: new Date('2025-07-01'), estimatedHrs: 24, loggedHrs: 22 } })
  const task5 = await prisma.task.create({ data: { title: 'Heritage Element Survey', description: 'Survey and document existing heritage structures for BIM', projectId: projDiriyah.id, assigneeId: omar.id, status: 'IN_PROGRESS', priority: 'CRITICAL', dueDate: new Date('2025-08-30'), estimatedHrs: 120, loggedHrs: 45 } })
  const task6 = await prisma.task.create({ data: { title: 'EIR Document Preparation', description: 'Prepare Employer Information Requirements for NEOM project', projectId: projNEOM.id, assigneeId: sara.id, status: 'IN_PROGRESS', priority: 'HIGH', dueDate: new Date('2025-08-01'), estimatedHrs: 32, loggedHrs: 12 } })
  const task7 = await prisma.task.create({ data: { title: 'LOD Matrix Definition', description: 'Define LOD requirements for all model elements', projectId: projNEOM.id, assigneeId: ahmed.id, status: 'TODO', priority: 'MEDIUM', dueDate: new Date('2025-09-01'), estimatedHrs: 20 } })

  // Subtasks
  await prisma.task.createMany({ data: [
    { title: 'BEP Section 1 — Project Information', parentId: task1.id, projectId: projReem.id, assigneeId: ahmed.id, status: 'DONE', priority: 'HIGH' },
    { title: 'BEP Section 2 — BIM Objectives', parentId: task1.id, projectId: projReem.id, assigneeId: ahmed.id, status: 'IN_PROGRESS', priority: 'HIGH' },
    { title: 'BEP Section 3 — Software & Standards', parentId: task1.id, projectId: projReem.id, assigneeId: omar.id, status: 'TODO', priority: 'MEDIUM' },
    { title: 'Podium B1 Structural Grid', parentId: task2.id, projectId: projReem.id, assigneeId: fatima.id, status: 'TODO', priority: 'HIGH' },
    { title: 'Podium L1-L4 Slab Modelling', parentId: task2.id, projectId: projReem.id, assigneeId: fatima.id, status: 'TODO', priority: 'HIGH' }
  ]})

  // Task Dependencies
  await prisma.taskDependency.create({ data: { blockingTaskId: task1.id, blockedTaskId: task3.id, type: 'BLOCKS' } })
  await prisma.taskDependency.create({ data: { blockingTaskId: task2.id, blockedTaskId: task3.id, type: 'BLOCKS' } })

  // Comments
  await prisma.comment.createMany({ data: [
    { body: 'BEP template has been shared with the team. Please review Section 2 by EOW.', authorId: ahmed.id, taskId: task1.id },
    { body: 'Structural drawings received from client. Starting modelling next week.', authorId: fatima.id, taskId: task2.id },
    { body: 'CDE is now live. All team members have been granted access.', authorId: ahmed.id, taskId: task4.id },
    { body: 'Project kickoff meeting scheduled for next Monday.', authorId: director.id, projectId: projReem.id },
    { body: 'Heritage survey team mobilised on site.', authorId: omar.id, taskId: task5.id }
  ]})

  // Time Entries
  const now = new Date()
  await prisma.timeEntry.createMany({ data: [
    { taskId: task1.id, userId: ahmed.id, startedAt: new Date(now - 7200000), stoppedAt: new Date(now - 3600000), durationMin: 60, notes: 'Worked on BEP Section 1' },
    { taskId: task5.id, userId: omar.id, startedAt: new Date(now - 14400000), stoppedAt: new Date(now - 10800000), durationMin: 60, notes: 'Heritage survey documentation' }
  ]})

  // Attachments
  await prisma.attachment.createMany({ data: [
    { name: 'BEP_Template_v1.0.docx', fileType: 'docx', fileSize: 245000, taskId: task1.id, uploadedBy: ahmed.id },
    { name: 'Structural_Drawings_Rev3.pdf', fileType: 'pdf', fileSize: 8500000, taskId: task2.id, uploadedBy: fatima.id },
    { name: 'Project_Brief_ARITC.pdf', fileType: 'pdf', fileSize: 1200000, projectId: projReem.id, uploadedBy: director.id }
  ]})

  // Tags
  const tagBIM = await prisma.tag.upsert({ where: { name: 'BIM' }, update: {}, create: { name: 'BIM', colorHex: '#4a7c59' } })
  const tagUrgent = await prisma.tag.upsert({ where: { name: 'Urgent' }, update: {}, create: { name: 'Urgent', colorHex: '#8b1a1a' } })
  const tagISO = await prisma.tag.upsert({ where: { name: 'ISO 19650' }, update: {}, create: { name: 'ISO 19650', colorHex: '#8b6914' } })
  await prisma.projectTag.createMany({ data: [
    { projectId: projReem.id, tagId: tagBIM.id },
    { projectId: projReem.id, tagId: tagISO.id },
    { projectId: projDiriyah.id, tagId: tagBIM.id },
    { projectId: projDiriyah.id, tagId: tagUrgent.id }
  ]})

  // ── BIM DATA ───────────────────────────────────────────────────────────────
  // BEPs
  const bep1 = await prisma.bep.create({ data: {
    projectId: projReem.id, title: 'BEP — Al Reem Island Tower Complex', version: '1.2', status: 'APPROVED',
    projectInfo: 'Mixed-use tower complex on Al Reem Island, Abu Dhabi. 3 residential towers (45, 38, 32 floors) with podium retail.',
    objectives: 'Achieve BIM Level 2 compliance. Deliver coordinated federated model. Support construction with LOD 400 models.',
    standards: 'ISO 19650-1, ISO 19650-2, BS EN ISO 19650, UAE BIM Mandate 2021',
    software: 'Autodesk Revit 2024, Navisworks Manage 2024, BIM 360, Dynamo',
    coordination: 'Weekly clash detection meetings. Federated model updated every 2 weeks. CDE: BIM 360 Docs.',
    qualityPlan: 'Model audits every 4 weeks. QA checklist per discipline. Director sign-off before publishing.',
    deliveryPlan: 'Stage 3: Architectural + Structural models. Stage 4: MEP coordination. Stage 5: As-built.'
  }})

  const bep2 = await prisma.bep.create({ data: {
    projectId: projDiriyah.id, title: 'BEP — Diriyah Gate Heritage District', version: '2.0', status: 'APPROVED',
    projectInfo: 'Heritage district restoration and new build in Diriyah, Riyadh. UNESCO World Heritage Site.',
    objectives: 'Document existing heritage structures. Coordinate new build with heritage constraints. Deliver as-built BIM.',
    standards: 'ISO 19650, Saudi BIM Standards, UNESCO Heritage Documentation Guidelines',
    software: 'Autodesk Revit 2024, ReCap Pro, Navisworks, Leica Cyclone (Point Cloud)',
    coordination: 'Bi-weekly coordination meetings. Point cloud integration with BIM models.',
    qualityPlan: 'Heritage element verification against survey data. Clash tolerance: 0mm for heritage zones.',
    deliveryPlan: 'Phase 1: Survey & existing conditions. Phase 2: Design models. Phase 3: Construction support.'
  }})

  // MIDPs
  const midp1 = await prisma.midp.create({ data: {
    projectId: projReem.id, title: 'MIDP — Al Reem Tower Complex', version: '1.0', status: 'ACTIVE',
    deliverables: { create: [
      { title: 'Architectural Model — Tower A', discipline: 'Architecture', format: 'RVT', lodLevel: 'LOD 350', dueDate: new Date('2025-10-01'), status: 'IN_PROGRESS', responsible: 'Ahmed Al-Rashidi' },
      { title: 'Structural Model — Podium', discipline: 'Structure', format: 'RVT', lodLevel: 'LOD 400', dueDate: new Date('2025-11-01'), status: 'PENDING', responsible: 'Fatima Hassan' },
      { title: 'MEP Coordination Model', discipline: 'MEP', format: 'RVT', lodLevel: 'LOD 300', dueDate: new Date('2025-12-01'), status: 'PENDING', responsible: 'Omar Khalid' },
      { title: 'Federated Model — Stage 3', discipline: 'All', format: 'NWD', lodLevel: 'LOD 350', dueDate: new Date('2026-01-15'), status: 'PENDING', responsible: 'Ahmed Al-Rashidi' }
    ]}
  }})

  // TIDPs
  const tidp1 = await prisma.tidp.create({ data: {
    midpId: midp1.id, projectId: projReem.id, title: 'TIDP — Structural Discipline', discipline: 'Structure', responsible: 'Fatima Hassan', status: 'ACTIVE',
    items: { create: [
      { title: 'Foundation Model', format: 'RVT', lodLevel: 'LOD 400', dueDate: new Date('2025-09-15'), status: 'PENDING' },
      { title: 'Podium Slab Model', format: 'RVT', lodLevel: 'LOD 400', dueDate: new Date('2025-10-15'), status: 'PENDING' },
      { title: 'Tower A Core & Frame', format: 'RVT', lodLevel: 'LOD 350', dueDate: new Date('2025-11-30'), status: 'PENDING' }
    ]}
  }})

  // EIRs
  const eir1 = await prisma.eir.create({ data: {
    projectId: projReem.id, title: 'EIR — Al Reem Tower Complex', version: '1.0', status: 'ISSUED',
    purpose: 'Define information requirements for BIM deliverables throughout the project lifecycle.',
    scope: 'All BIM deliverables from Stage 2 through Stage 5 including as-built models.',
    requirements: 'ISO 19650 compliance. LOD as specified in MIDP. CDE via BIM 360.',
    deliverables: 'Federated model, clash reports, COBie data, as-built models.',
    standards: 'ISO 19650-1:2018, ISO 19650-2:2018, UAE BIM Mandate',
    sections: { create: [
      { sectionNo: '1', title: 'Project Information Requirements', content: 'All models to include project metadata per ISO 19650 naming convention.', status: 'COMPLETE', orderIndex: 1 },
      { sectionNo: '2', title: 'Asset Information Requirements', content: 'Asset data to be captured in COBie format for FM handover.', status: 'IN_PROGRESS', orderIndex: 2 },
      { sectionNo: '3', title: 'Technical Requirements', content: 'Software: Revit 2024+. File format: IFC 4.0 for exchange. Native RVT for collaboration.', status: 'COMPLETE', orderIndex: 3 },
      { sectionNo: '4', title: 'Management Requirements', content: 'Weekly model uploads to CDE. Clash detection bi-weekly. QA sign-off before publishing.', status: 'IN_PROGRESS', orderIndex: 4 }
    ]}
  }})

  // AIRs
  const air1 = await prisma.air.create({ data: {
    projectId: projReem.id, title: 'AIR — Al Reem Tower Complex', version: '1.0', status: 'DRAFT',
    assetType: 'Mixed-Use Residential Tower',
    requirements: 'All assets to be tagged with unique asset IDs. FM-relevant data captured at LOD 500.',
    dataFields: 'Asset ID, Type, Manufacturer, Model, Install Date, Warranty, Maintenance Schedule',
    sections: { create: [
      { sectionNo: '1', title: 'Mechanical Assets', content: 'HVAC units, pumps, fans — full COBie data required.', status: 'IN_PROGRESS', orderIndex: 1 },
      { sectionNo: '2', title: 'Electrical Assets', content: 'Switchgear, UPS, lighting — manufacturer data required.', status: 'PENDING', orderIndex: 2 }
    ]}
  }})

  // CDE Documents
  await prisma.cdeDocument.createMany({ data: [
    { projectId: projReem.id, name: 'ARITC-ARC-ZZ-XX-M3-A-0001', docCode: 'ARC-0001', revision: 'P03', status: 'SHARED', discipline: 'Architecture', fileType: 'RVT', fileSize: 125000000, owner: 'Ahmed Al-Rashidi', access: 'PROJECT', approvalStatus: 'APPROVED' },
    { projectId: projReem.id, name: 'ARITC-STR-ZZ-XX-M3-S-0001', docCode: 'STR-0001', revision: 'P01', status: 'WIP', discipline: 'Structure', fileType: 'RVT', fileSize: 89000000, owner: 'Fatima Hassan', access: 'PRIVATE', approvalStatus: 'PENDING' },
    { projectId: projReem.id, name: 'ARITC-MEP-ZZ-XX-M3-M-0001', docCode: 'MEP-0001', revision: 'P01', status: 'WIP', discipline: 'MEP', fileType: 'RVT', fileSize: 67000000, owner: 'Omar Khalid', access: 'PRIVATE', approvalStatus: 'PENDING' },
    { projectId: projReem.id, name: 'ARITC-ALL-ZZ-XX-M3-F-0001', docCode: 'FED-0001', revision: 'P02', status: 'PUBLISHED', discipline: 'Federated', fileType: 'NWD', fileSize: 280000000, owner: 'Ahmed Al-Rashidi', access: 'ALL_TEAMS', approvalStatus: 'APPROVED' },
    { projectId: projDiriyah.id, name: 'DGHD-ARC-ZZ-XX-M3-A-0001', docCode: 'ARC-0001', revision: 'C01', status: 'PUBLISHED', discipline: 'Architecture', fileType: 'RVT', fileSize: 210000000, owner: 'Ahmed Al-Rashidi', access: 'ALL_TEAMS', approvalStatus: 'APPROVED' },
    { projectId: projDiriyah.id, name: 'DGHD-SUR-ZZ-XX-M3-P-0001', docCode: 'SUR-0001', revision: 'P04', status: 'ARCHIVED', discipline: 'Survey', fileType: 'RCP', fileSize: 450000000, owner: 'Omar Khalid', access: 'PROJECT', approvalStatus: 'APPROVED' }
  ]})

  // LOD Specs
  await prisma.lodSpec.createMany({ data: [
    { projectId: projReem.id, element: 'Walls — External', discipline: 'Architecture', lodLevel: 'LOD 350', loaLevel: 'LOA 20', purpose: '3D Coordination' },
    { projectId: projReem.id, element: 'Walls — Internal', discipline: 'Architecture', lodLevel: 'LOD 300', purpose: 'Design Development' },
    { projectId: projReem.id, element: 'Columns', discipline: 'Structure', lodLevel: 'LOD 400', loaLevel: 'LOA 30', purpose: 'Fabrication' },
    { projectId: projReem.id, element: 'Beams', discipline: 'Structure', lodLevel: 'LOD 400', loaLevel: 'LOA 30', purpose: 'Fabrication' },
    { projectId: projReem.id, element: 'HVAC Ductwork', discipline: 'MEP', lodLevel: 'LOD 300', purpose: '3D Coordination' },
    { projectId: projReem.id, element: 'Electrical Conduit', discipline: 'MEP', lodLevel: 'LOD 200', purpose: 'Spatial Coordination' },
    { projectId: projReem.id, element: 'Plumbing', discipline: 'MEP', lodLevel: 'LOD 300', purpose: '3D Coordination' },
    { projectId: projReem.id, element: 'Doors', discipline: 'Architecture', lodLevel: 'LOD 350', purpose: 'Shop Drawings' },
    { projectId: projReem.id, element: 'Windows', discipline: 'Architecture', lodLevel: 'LOD 350', purpose: 'Shop Drawings' },
    { projectId: projReem.id, element: 'Foundations', discipline: 'Structure', lodLevel: 'LOD 400', loaLevel: 'LOA 30', purpose: 'Construction' }
  ]})

  // Clash Detection
  await prisma.clashDetection.createMany({ data: [
    { projectId: projReem.id, title: 'HVAC vs Structural Beam — Level 5', description: 'Main supply duct clashes with 600mm deep beam at grid C-4', discipline1: 'MEP', discipline2: 'Structure', severity: 'HIGH', status: 'OPEN', assignedTo: 'Omar Khalid', notes: 'Duct rerouting required. Structural cannot move.' },
    { projectId: projReem.id, title: 'Plumbing vs Electrical Tray — Level 8', description: 'Waste pipe crosses cable tray at grid B-7', discipline1: 'MEP', discipline2: 'MEP', severity: 'MEDIUM', status: 'IN_REVIEW', assignedTo: 'Omar Khalid' },
    { projectId: projReem.id, title: 'Architectural Wall vs Structural Column — Podium', description: 'Partition wall conflicts with 800mm column at grid A-2', discipline1: 'Architecture', discipline2: 'Structure', severity: 'LOW', status: 'RESOLVED', assignedTo: 'Ahmed Al-Rashidi', resolvedAt: new Date('2025-07-01') },
    { projectId: projDiriyah.id, title: 'New Foundation vs Heritage Wall', description: 'Proposed pile cap conflicts with existing heritage wall foundation', discipline1: 'Structure', discipline2: 'Heritage', severity: 'CRITICAL', status: 'OPEN', assignedTo: 'Fatima Hassan' },
    { projectId: projDiriyah.id, title: 'MEP Riser vs Existing Masonry', description: 'New MEP riser shaft conflicts with existing masonry wall', discipline1: 'MEP', discipline2: 'Heritage', severity: 'HIGH', status: 'IN_REVIEW', assignedTo: 'Omar Khalid' }
  ]})

  // Responsibility Matrix
  await prisma.responsibilityMatrix.createMany({ data: [
    { projectId: projReem.id, discipline: 'Architecture', deliverable: 'Architectural Model', role: 'BIM Author', responsible: 'Ahmed Al-Rashidi', accountable: 'Asad Syed Askary', consulted: 'Sara Al-Mansouri', informed: 'Khalid Al-Farsi' },
    { projectId: projReem.id, discipline: 'Structure', deliverable: 'Structural Model', role: 'BIM Author', responsible: 'Fatima Hassan', accountable: 'Asad Syed Askary', consulted: 'Ahmed Al-Rashidi', informed: 'Khalid Al-Farsi' },
    { projectId: projReem.id, discipline: 'MEP', deliverable: 'MEP Coordination Model', role: 'BIM Coordinator', responsible: 'Omar Khalid', accountable: 'Ahmed Al-Rashidi', consulted: 'Fatima Hassan', informed: 'Sara Al-Mansouri' },
    { projectId: projReem.id, discipline: 'All', deliverable: 'Federated Model', role: 'BIM Manager', responsible: 'Ahmed Al-Rashidi', accountable: 'Asad Syed Askary', consulted: 'All Disciplines', informed: 'Khalid Al-Farsi' },
    { projectId: projReem.id, discipline: 'All', deliverable: 'Clash Detection Report', role: 'BIM Coordinator', responsible: 'Omar Khalid', accountable: 'Ahmed Al-Rashidi', consulted: 'All Disciplines', informed: 'Sara Al-Mansouri' }
  ]})

  // Naming Conventions
  await prisma.namingConvention.createMany({ data: [
    { projectId: projReem.id, name: 'Model File Naming', pattern: '{ProjectCode}-{Discipline}-{Zone}-{Level}-{Type}-{Role}-{Number}', description: 'Standard ISO 19650 model file naming', fields: 'ProjectCode,Discipline,Zone,Level,Type,Role,Number', example: 'ARITC-ARC-ZZ-XX-M3-A-0001' },
    { projectId: projReem.id, name: 'Drawing Naming', pattern: '{ProjectCode}-{Discipline}-{Level}-{Type}-{Number}', description: 'Drawing sheet naming convention', fields: 'ProjectCode,Discipline,Level,Type,Number', example: 'ARITC-ARC-L05-GA-0001' },
    { projectId: projDiriyah.id, name: 'Heritage Document Naming', pattern: '{ProjectCode}-{Heritage Zone}-{DocType}-{Number}', description: 'Heritage zone document naming', fields: 'ProjectCode,HeritageZone,DocType,Number', example: 'DGHD-HZ01-SUR-0001' }
  ]})

  // ── MEETINGS ───────────────────────────────────────────────────────────────
  const meeting1 = await prisma.meeting.create({ data: {
    projectId: projReem.id, title: 'BIM Coordination Meeting — Week 28', description: 'Weekly BIM coordination and clash review',
    scheduledAt: new Date('2025-07-14T10:00:00Z'), duration: 90, status: 'SCHEDULED', isVirtual: true,
    roomId: 'datum-room-001', agenda: '1. Clash review\n2. Model status update\n3. CDE issues\n4. AOB',
    participants: { create: [
      { userId: director.id, name: 'Asad Syed Askary', email: 'director@datumbim.com', role: 'CHAIR' },
      { userId: ahmed.id, name: 'Ahmed Al-Rashidi', email: 'ahmed@datum-bim.com', role: 'ATTENDEE' },
      { userId: omar.id, name: 'Omar Khalid', email: 'omar@datum-bim.com', role: 'ATTENDEE' },
      { userId: fatima.id, name: 'Fatima Hassan', email: 'fatima@datum-bim.com', role: 'ATTENDEE' },
      { name: 'Khalid Al-Farsi', email: 'khalid@bagc.ae', role: 'CLIENT' }
    ]},
    minutes: { create: [
      { section: 'Clash Review', content: 'Reviewed 5 open clashes. 2 resolved, 3 in progress. HVAC vs Beam clash requires structural review.', orderIndex: 1 },
      { section: 'Model Status', content: 'Architectural model at 75% completion. Structural model at 40%. MEP not yet started.', orderIndex: 2 }
    ]},
    actionItems: { create: [
      { title: 'Resolve HVAC vs Beam clash', description: 'Omar to coordinate with structural team for duct rerouting solution', assigneeId: omar.id, dueDate: new Date('2025-07-21'), status: 'OPEN' },
      { title: 'Upload structural model to CDE', description: 'Fatima to upload latest structural model by Friday', assigneeId: fatima.id, dueDate: new Date('2025-07-18'), status: 'OPEN' }
    ]}
  }})

  const meeting2 = await prisma.meeting.create({ data: {
    projectId: projDiriyah.id, title: 'Heritage BIM Review — Monthly', description: 'Monthly review of heritage documentation progress',
    scheduledAt: new Date('2025-07-20T09:00:00Z'), duration: 120, status: 'SCHEDULED', isVirtual: false,
    location: 'Diriyah Site Office', agenda: '1. Survey progress\n2. Heritage model review\n3. Clash with new build\n4. Client update',
    participants: { create: [
      { userId: director.id, name: 'Asad Syed Askary', email: 'director@datumbim.com', role: 'CHAIR' },
      { userId: ahmed.id, name: 'Ahmed Al-Rashidi', email: 'ahmed@datum-bim.com', role: 'ATTENDEE' },
      { name: 'Mohammed Al-Ghamdi', email: 'mghamdi@dgda.gov.sa', role: 'CLIENT' }
    ]}
  }})

  // ── CRM LEADS ──────────────────────────────────────────────────────────────
  await prisma.lead.createMany({ data: [
    { company: 'Aldar Properties', contactName: 'Rashed Al-Mansoori', contactEmail: 'rashed@aldar.com', country: 'UAE', source: 'REFERRAL', serviceInterest: 'BIM Management', estValue: 3500000, stage: 'PROPOSAL', probability: 65, ownerName: 'Asad Syed Askary', orderIndex: 0 },
    { company: 'Emaar Properties', contactName: 'David Chen', contactEmail: 'dchen@emaar.com', country: 'UAE', source: 'CONFERENCE', serviceInterest: 'BIM Coordination', estValue: 8000000, stage: 'NEGOTIATION', probability: 80, ownerName: 'Asad Syed Askary', orderIndex: 0 },
    { company: 'Saudi Aramco', contactName: 'Abdullah Al-Qahtani', contactEmail: 'aqlqahtani@aramco.com', country: 'Saudi Arabia', source: 'LINKEDIN', serviceInterest: 'Digital Twin', estValue: 15000000, stage: 'QUALIFIED', probability: 40, ownerName: 'Sara Al-Mansouri', orderIndex: 0 },
    { company: 'ADNOC', contactName: 'Fatima Al-Mazrouei', contactEmail: 'fmazrouei@adnoc.ae', country: 'UAE', source: 'WEBSITE', serviceInterest: 'BIM Consulting', estValue: 5000000, stage: 'TO_CONTACT', probability: 20, ownerName: 'Ahmed Al-Rashidi', orderIndex: 0 },
    { company: 'Miral Asset Management', contactName: 'James O\'Brien', contactEmail: 'jobrien@miral.ae', country: 'UAE', source: 'REFERRAL', serviceInterest: 'BIM Management', estValue: 4200000, stage: 'CONTACTED', probability: 35, ownerName: 'Asad Syed Askary', orderIndex: 0 },
    { company: 'Red Sea Global', contactName: 'Sarah Mitchell', contactEmail: 'smitchell@redseaglobal.com', country: 'Saudi Arabia', source: 'CONFERENCE', serviceInterest: 'ISO 19650 Consulting', estValue: 2800000, stage: 'QUALIFIED', probability: 55, ownerName: 'Sara Al-Mansouri', orderIndex: 0 }
  ]})

  // ── INVOICES ───────────────────────────────────────────────────────────────
  await prisma.invoice.createMany({ data: [
    { invoiceNo: 'INV-2025-001', clientId: clientBAGC.id, projectId: projReem.id, amount: 280000, currency: 'AED', status: 'PAID', issueDate: new Date('2025-01-31'), dueDate: new Date('2025-02-28'), paidDate: new Date('2025-02-25'), description: 'BIM Services — January 2025' },
    { invoiceNo: 'INV-2025-002', clientId: clientBAGC.id, projectId: projReem.id, amount: 280000, currency: 'AED', status: 'PAID', issueDate: new Date('2025-02-28'), dueDate: new Date('2025-03-31'), paidDate: new Date('2025-03-28'), description: 'BIM Services — February 2025' },
    { invoiceNo: 'INV-2025-003', clientId: clientDGDA.id, projectId: projDiriyah.id, amount: 458333, currency: 'SAR', status: 'SENT', issueDate: new Date('2025-06-30'), dueDate: new Date('2025-07-30'), description: 'BIM Coordination — June 2025' },
    { invoiceNo: 'INV-2025-004', clientId: clientBAGC.id, projectId: projReem.id, amount: 280000, currency: 'AED', status: 'DRAFT', issueDate: new Date('2025-07-01'), dueDate: new Date('2025-07-31'), description: 'BIM Services — July 2025' },
    { invoiceNo: 'INV-2025-005', clientId: clientNEOM.id, projectId: projNEOM.id, amount: 1000000, currency: 'SAR', status: 'SENT', issueDate: new Date('2025-06-15'), dueDate: new Date('2025-07-15'), description: 'EIR & BEP Preparation — Phase 1' }
  ]})

  // ── SUBCONTRACTORS ─────────────────────────────────────────────────────────
  const sub1 = await prisma.subcontractor.create({ data: {
    companyName: 'Gulf MEP Solutions', specialization: 'MEP Engineering & BIM', contactPerson: 'Hassan Al-Balushi', contactEmail: 'hassan@gulfmep.ae', contactPhone: '+971-4-555-0400', country: 'UAE', rating: 4.2, status: 'ACTIVE',
    members: { create: [
      { name: 'Hassan Al-Balushi', role: 'MEP BIM Lead', email: 'hassan@gulfmep.ae', phone: '+971-4-555-0401' },
      { name: 'Priya Sharma', role: 'MEP Modeller', email: 'priya@gulfmep.ae' },
      { name: 'Carlos Mendez', role: 'HVAC Specialist', email: 'carlos@gulfmep.ae' }
    ]},
    assignments: { create: [{ projectId: projReem.id, scope: 'MEP BIM Modelling — All Disciplines', startDate: new Date('2025-06-01'), endDate: new Date('2026-06-30'), status: 'ACTIVE', performanceScore: 4.1 }] }
  }})

  const sub2 = await prisma.subcontractor.create({ data: {
    companyName: 'Precision Structural Consultants', specialization: 'Structural Engineering & BIM', contactPerson: 'Dr. Yusuf Al-Hamdan', contactEmail: 'yusuf@precisionsc.com', contactPhone: '+966-11-555-0500', country: 'Saudi Arabia', rating: 4.7, status: 'ACTIVE',
    members: { create: [
      { name: 'Dr. Yusuf Al-Hamdan', role: 'Principal Engineer', email: 'yusuf@precisionsc.com' },
      { name: 'Aisha Noor', role: 'Structural BIM Modeller', email: 'aisha@precisionsc.com' }
    ]},
    assignments: { create: [{ projectId: projDiriyah.id, scope: 'Heritage Structural Assessment & BIM', startDate: new Date('2024-06-01'), endDate: new Date('2026-12-31'), status: 'ACTIVE', performanceScore: 4.8 }] }
  }})

  // ── RISKS ──────────────────────────────────────────────────────────────────
  await prisma.risk.createMany({ data: [
    { projectId: projReem.id, title: 'Client Design Changes', description: 'Frequent design changes may impact BIM model and schedule', category: 'SCOPE', probability: 'HIGH', impact: 'HIGH', riskScore: 9, status: 'OPEN', mitigation: 'Implement change control process. Freeze design at each stage gate.', owner: 'Sara Al-Mansouri' },
    { projectId: projReem.id, title: 'Software Compatibility Issues', description: 'Different software versions between team and subcontractors', category: 'TECHNICAL', probability: 'MEDIUM', impact: 'MEDIUM', riskScore: 4, status: 'MITIGATED', mitigation: 'Standardise on Revit 2024. IFC exchange for non-Revit disciplines.', owner: 'Ahmed Al-Rashidi' },
    { projectId: projDiriyah.id, title: 'Heritage Discovery During Construction', description: 'Unexpected heritage finds may halt construction', category: 'COMPLIANCE', probability: 'HIGH', impact: 'CRITICAL', riskScore: 12, status: 'OPEN', mitigation: 'Pre-construction archaeological survey. Contingency protocol in place.', owner: 'Asad Syed Askary' },
    { projectId: projNEOM.id, title: 'Scope Expansion', description: 'NEOM project scope may expand significantly', category: 'SCOPE', probability: 'HIGH', impact: 'HIGH', riskScore: 9, status: 'OPEN', mitigation: 'Clear scope definition in contract. Change order process agreed.', owner: 'Sara Al-Mansouri' }
  ]})

  // ── MILESTONES ─────────────────────────────────────────────────────────────
  await prisma.milestone.createMany({ data: [
    { projectId: projReem.id, title: 'BEP Approved by Client', dueDate: new Date('2025-07-31'), status: 'COMPLETE', completedAt: new Date('2025-07-15') },
    { projectId: projReem.id, title: 'Stage 3 Model Submission', dueDate: new Date('2025-10-31'), status: 'PENDING' },
    { projectId: projReem.id, title: 'Clash-Free Federated Model', dueDate: new Date('2025-12-15'), status: 'PENDING' },
    { projectId: projDiriyah.id, title: 'Heritage Survey Complete', dueDate: new Date('2025-08-31'), status: 'IN_PROGRESS' },
    { projectId: projDiriyah.id, title: 'Stage 4 Model Submission', dueDate: new Date('2025-11-30'), status: 'PENDING' },
    { projectId: projNEOM.id, title: 'EIR Issued to Design Team', dueDate: new Date('2025-08-15'), status: 'IN_PROGRESS' }
  ]})

  // ── LESSONS LEARNED ────────────────────────────────────────────────────────
  await prisma.lesson.createMany({ data: [
    { projectId: projReem.id, title: 'Early CDE Setup Critical', description: 'Setting up CDE in week 1 prevented document management issues later', category: 'PROCESS', impact: 'HIGH', action: 'Include CDE setup as Day 1 task in all future projects', status: 'CLOSED' },
    { projectId: projDiriyah.id, title: 'Heritage Survey Before BIM Modelling', description: 'Starting BIM before survey completion caused rework', category: 'TECHNICAL', impact: 'HIGH', action: 'Mandate survey completion before BIM modelling starts', status: 'OPEN' },
    { title: 'Subcontractor BIM Training', description: 'Subcontractors needed additional Revit training, causing delays', category: 'RESOURCE', impact: 'MEDIUM', action: 'Include BIM competency assessment in subcontractor pre-qualification', status: 'OPEN' }
  ]})

  // ── SOPs ───────────────────────────────────────────────────────────────────
  await prisma.sop.createMany({ data: [
    { title: 'BIM Model Quality Audit', division: 'BIM', category: 'QUALITY', version: '2.1', status: 'ACTIVE', steps: '1. Open model in Revit\n2. Run model checker\n3. Check naming convention\n4. Verify LOD compliance\n5. Check clash status\n6. Sign off QA checklist', notes: 'Audit every 4 weeks minimum' },
    { title: 'CDE Document Upload Procedure', division: 'BIM', category: 'PROCESS', version: '1.3', status: 'ACTIVE', steps: '1. Complete QA check\n2. Apply correct naming convention\n3. Set correct status (WIP/Shared/Published)\n4. Upload to correct folder\n5. Notify team via CDE notification', notes: 'Never upload directly to Published without QA sign-off' },
    { title: 'New Project Setup Checklist', division: 'PM', category: 'PROCESS', version: '1.0', status: 'ACTIVE', steps: '1. Create project in DatumOS\n2. Set up CDE\n3. Prepare BEP\n4. Issue EIR\n5. Set up MIDP\n6. Assign team\n7. Kickoff meeting', notes: 'Complete within first 2 weeks of project start' },
    { title: 'Clash Detection Workflow', division: 'BIM', category: 'TECHNICAL', version: '1.5', status: 'ACTIVE', steps: '1. Federate models in Navisworks\n2. Run clash detection\n3. Export clash report\n4. Assign clashes to responsible parties\n5. Track resolution\n6. Re-run after resolution', notes: 'Run clash detection every 2 weeks minimum' }
  ]})

  // ── COORDINATION ITEMS ─────────────────────────────────────────────────────
  await prisma.coordinationItem.createMany({ data: [
    { projectId: projReem.id, title: 'RFI-001: Structural Grid Clarification', description: 'Clarification needed on grid offset at Level 5 transfer slab', discipline: 'Structure', priority: 'HIGH', status: 'OPEN', assignedTo: 'Fatima Hassan', dueDate: new Date('2025-07-20') },
    { projectId: projReem.id, title: 'RFI-002: MEP Riser Shaft Size', description: 'Confirm MEP riser shaft dimensions for Towers B and C', discipline: 'MEP', priority: 'MEDIUM', status: 'IN_REVIEW', assignedTo: 'Omar Khalid', response: 'Awaiting client confirmation' },
    { projectId: projDiriyah.id, title: 'RFI-001: Heritage Wall Thickness', description: 'Confirm thickness of heritage wall at Zone HZ-03 for BIM modelling', discipline: 'Heritage', priority: 'HIGH', status: 'CLOSED', assignedTo: 'Ahmed Al-Rashidi', response: 'Wall thickness confirmed as 600mm per survey report SUR-0001' }
  ]})

  // ── KPI METRICS ────────────────────────────────────────────────────────────
  await prisma.kpiMetric.createMany({ data: [
    { projectId: projReem.id, name: 'Model Completion %', value: 35, target: 100, unit: '%', category: 'BIM', period: 'Q3-2025' },
    { projectId: projReem.id, name: 'Open Clashes', value: 4, target: 0, unit: 'count', category: 'QUALITY', period: 'Q3-2025' },
    { projectId: projReem.id, name: 'CDE Documents Published', value: 12, target: 50, unit: 'count', category: 'CDE', period: 'Q3-2025' },
    { projectId: projDiriyah.id, name: 'Heritage Elements Surveyed', value: 62, target: 100, unit: '%', category: 'SURVEY', period: 'Q3-2025' },
    { name: 'Revenue YTD', value: 4850000, target: 12000000, unit: 'AED', category: 'FINANCE', period: '2025' },
    { name: 'Active Projects', value: 3, target: 8, unit: 'count', category: 'BUSINESS', period: 'Q3-2025' },
    { name: 'Team Utilisation', value: 78, target: 85, unit: '%', category: 'RESOURCE', period: 'Q3-2025' }
  ]})

  // ── RESOURCE ALLOCATIONS ───────────────────────────────────────────────────
  const weekStart = new Date('2025-07-07')
  await prisma.resourceAllocation.createMany({ data: [
    { userId: ahmed.id, projectId: projReem.id, weekStart, hours: 24 },
    { userId: ahmed.id, projectId: projDiriyah.id, weekStart, hours: 16 },
    { userId: omar.id, projectId: projReem.id, weekStart, hours: 32 },
    { userId: fatima.id, projectId: projReem.id, weekStart, hours: 20 },
    { userId: fatima.id, projectId: projDiriyah.id, weekStart, hours: 20 },
    { userId: sara.id, projectId: projNEOM.id, weekStart, hours: 40 }
  ]})

  // ── INTERNAL MESSAGES ──────────────────────────────────────────────────────
  await prisma.internalMessage.createMany({ data: [
    { authorId: director.id, channel: 'GENERAL', body: 'Team — please ensure all models are uploaded to CDE before the coordination meeting on Monday.' },
    { authorId: ahmed.id, channel: 'BIM', body: 'Clash detection report for Al Reem is ready. 5 clashes found, 1 critical. Please review.' },
    { authorId: sara.id, channel: 'PM', body: 'NEOM project kickoff confirmed for 15 August. Travel arrangements being made.' },
    { authorId: omar.id, channel: 'BIM', body: 'Structural model received from Precision SC. Integrating into federated model now.' }
  ]})

  // ── SCHEDULE ITEMS ─────────────────────────────────────────────────────────
  await prisma.scheduleItem.createMany({ data: [
    { projectId: projReem.id, title: 'BEP Preparation', startDate: new Date('2025-01-15'), endDate: new Date('2025-02-28'), status: 'COMPLETE', progress: 100, resource: 'Ahmed Al-Rashidi' },
    { projectId: projReem.id, title: 'Architectural Modelling — Stage 3', startDate: new Date('2025-03-01'), endDate: new Date('2025-10-31'), status: 'IN_PROGRESS', progress: 35, resource: 'Ahmed Al-Rashidi' },
    { projectId: projReem.id, title: 'Structural Modelling', startDate: new Date('2025-05-01'), endDate: new Date('2025-11-30'), status: 'IN_PROGRESS', progress: 20, resource: 'Fatima Hassan' },
    { projectId: projReem.id, title: 'MEP Coordination', startDate: new Date('2025-08-01'), endDate: new Date('2026-02-28'), status: 'PLANNED', progress: 0, resource: 'Omar Khalid' },
    { projectId: projDiriyah.id, title: 'Heritage Survey', startDate: new Date('2024-06-01'), endDate: new Date('2025-08-31'), status: 'IN_PROGRESS', progress: 62, resource: 'Omar Khalid' },
    { projectId: projDiriyah.id, title: 'Heritage BIM Modelling', startDate: new Date('2025-03-01'), endDate: new Date('2025-12-31'), status: 'IN_PROGRESS', progress: 40, resource: 'Ahmed Al-Rashidi' }
  ]})

  // ── PRE-QUAL ───────────────────────────────────────────────────────────────
  await prisma.prequalSubmission.createMany({ data: [
    { company: 'Gulf MEP Solutions', projectRef: 'ARITC-001', status: 'APPROVED', score: 87.5, notes: 'Strong BIM capability. Approved for MEP works.' },
    { company: 'Precision Structural Consultants', projectRef: 'DGHD-002', status: 'APPROVED', score: 92.0, notes: 'Excellent heritage experience. Approved.' },
    { company: 'Al Futtaim Engineering', projectRef: 'NEOM-003', status: 'PENDING', notes: 'Awaiting financial documents.' },
    { company: 'Consolidated Contractors', projectRef: 'ARITC-001', status: 'REJECTED', score: 45.0, notes: 'Insufficient BIM experience for this project.' }
  ]})

  // ── SAVED VIEWS ────────────────────────────────────────────────────────────
  await prisma.savedView.createMany({ data: [
    { userId: director.id, name: 'My Active Projects', module: 'projects', filters: '{"status":"ACTIVE"}', viewType: 'BOARD' },
    { userId: ahmed.id, name: 'BIM Tasks This Week', module: 'tasks', filters: '{"assigneeId":"' + ahmed.id + '","status":"IN_PROGRESS"}', viewType: 'LIST' },
    { userId: sara.id, name: 'High Priority Tasks', module: 'tasks', filters: '{"priority":"HIGH"}', viewType: 'BOARD' }
  ]})

  console.log('✅ DatumOS v13 seed complete!')
  console.log('   Users: 6 | Clients: 3 | Projects: 3 | Tasks: 12 | BEPs: 2 | MIDPs: 1 | EIRs: 1 | AIRs: 1')
  console.log('   CDE Docs: 6 | LOD Specs: 10 | Clashes: 5 | Meetings: 2 | Leads: 6 | Invoices: 5')
}

main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
