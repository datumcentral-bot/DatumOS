import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔧 Creating canonical HURL Client + Project records...');

  // 1. Create or upsert HURL Client
  let hurlClient = await prisma.client.findFirst({ where: { companyName: 'HURL' } });
  if (!hurlClient) {
    hurlClient = await prisma.client.create({
      data: {
        companyName: 'HURL',
        industry: 'Infrastructure / BIM Engineering',
        country: 'United Arab Emirates',
        city: 'Abu Dhabi',
        address: 'PMU-HURL, Abu Dhabi, UAE',
        contactName: 'Project Management Unit - HURL',
        contactEmail: 'pmu@hurl.gov.ae',
        contactPhone: '+971 2 XXXXXXX',
        website: 'https://hurl.gov.ae',
        timezone: 'Asia/Dubai',
        notes: 'Canonical HURL client record for single-project DATUMBIMOS configuration. PMU-HURL.',
        status: 'ACTIVE',
        tier: 'TIER1',
        leadMember: 'Director',
        repTeam: 'BIM Engineering',
        priority: 'HIGH',
      },
    });
  }
  console.log('✅ HURL Client:', hurlClient.id, hurlClient.companyName);

  // 2. Create or upsert PROJECT HURL
  let hurlProject = await prisma.project.findFirst({ where: { code: 'HURL' } });
  if (!hurlProject) {
    hurlProject = await prisma.project.create({
      data: {
        name: 'PROJECT HURL',
        code: 'HURL',
        clientId: hurlClient.id,
        description: 'HURL Infrastructure BIM Project — consolidated from F:\\PROJECT HURL source folder. Single active project in DATUMBIMOS.',
        status: 'ACTIVE',
        phase: 'PRE_PRODUCTION',
        bimLevel: 'LOD 300-400',
        isoStage: 'ISO 19650-2',
        location: 'Abu Dhabi, UAE',
        country: 'United Arab Emirates',
        healthScore: 50,
        health: 'ON_TRACK',
        healthNote: 'Pre-production preparation ~18.3% engineering readiness per baseline. Revit production not started. CRS/survey verification blocked.',
        contractValue: null,
        budget: null,
        startDate: new Date('2024-01-01'),
        endDate: null,
      },
    });
  }
  console.log('✅ PROJECT HURL:', hurlProject.id, hurlProject.code);

  // 3. Link core divisions to PROJECT HURL
  const divisions = await prisma.division.findMany({
    where: { code: { in: ['BIM', 'CIVIL', 'STRUCTURAL', 'MEP', 'SURVEY'] } },
  });

  for (const div of divisions) {
    await prisma.projectDivision.upsert({
      where: { projectId_divisionId: { projectId: hurlProject.id, divisionId: div.id } },
      update: {},
      create: { projectId: hurlProject.id, divisionId: div.id },
    });
    console.log(`🔗 Linked division ${div.code} to PROJECT HURL`);
  }

  // 4. Create basic project folders structure
  const folders = [
    { name: '00_PROJECT_CONTROL', orderIndex: 0 },
    { name: '01_CLIENT_AND_CONTRACT', orderIndex: 1 },
    { name: '02_SOURCE_DOCUMENTS', orderIndex: 2 },
    { name: '03_SURVEY_AND_SITE_DATA', orderIndex: 3 },
    { name: '04_CAD_AND_DRAWINGS', orderIndex: 4 },
    { name: '05_ENGINEERING', orderIndex: 5 },
    { name: '06_BIM_REQUIREMENTS', orderIndex: 6 },
    { name: '07_BIM_EXECUTION', orderIndex: 7 },
    { name: '08_REVIT_MODELS', orderIndex: 8 },
    { name: '09_COORDINATION_AND_CLASH', orderIndex: 9 },
    { name: '10_QA_QC', orderIndex: 10 },
    { name: '11_RFI_AND_ISSUES', orderIndex: 11 },
    { name: '12_PROGRAMME_AND_WBS', orderIndex: 12 },
    { name: '13_COMMERCIAL_AND_FINANCE', orderIndex: 13 },
    { name: '14_RESOURCE_MANAGEMENT', orderIndex: 14 },
    { name: '15_DELIVERABLES', orderIndex: 15 },
    { name: '16_DIGITAL_HANDOVER', orderIndex: 16 },
    { name: '17_REPORTS_AND_DASHBOARDS', orderIndex: 17 },
    { name: '18_EVIDENCE_AND_AUDIT', orderIndex: 18 },
    { name: '19_ARCHIVE', orderIndex: 19 },
  ];

  for (const folder of folders) {
    await prisma.projectFolder.create({
      data: { projectId: hurlProject.id, name: folder.name, orderIndex: folder.orderIndex },
    });
  }
  console.log('📁 Created', folders.length, 'project folders');

  // 5. Create baseline WBS tasks
  const wbsTasks = [
    { title: 'Source Recovery & Document Inventory', phase: 'PRE_PRODUCTION', status: 'COMPLETED', orderIndex: 1 },
    { title: 'Client Requirements & EIR Review', phase: 'PRE_PRODUCTION', status: 'IN_PROGRESS', orderIndex: 2 },
    { title: 'Survey & CRS Verification', phase: 'PRE_PRODUCTION', status: 'BLOCKED', orderIndex: 3 },
    { title: 'CAD Inventory & Metadata Audit', phase: 'PRE_PRODUCTION', status: 'PARTIAL', orderIndex: 4 },
    { title: 'CAD Geometry & Engineering Extraction', phase: 'PRE_PRODUCTION', status: 'NOT_STARTED', orderIndex: 5 },
    { title: 'Drawing & BoQ Reconciliation', phase: 'PRE_PRODUCTION', status: 'NOT_STARTED', orderIndex: 6 },
    { title: 'BIM Requirements Definition', phase: 'PRE_PRODUCTION', status: 'COMPLETED', orderIndex: 7 },
    { title: 'BIM Execution Planning', phase: 'PRE_PRODUCTION', status: 'COMPLETED', orderIndex: 8 },
    { title: 'Revit Model Production', phase: 'PRODUCTION', status: 'NOT_STARTED', orderIndex: 9 },
    { title: 'Coordination & Clash Detection', phase: 'PRODUCTION', status: 'NOT_STARTED', orderIndex: 10 },
    { title: 'QA/QC & Model Reviews', phase: 'PRODUCTION', status: 'NOT_STARTED', orderIndex: 11 },
    { title: 'Documentation & Deliverables', phase: 'HANDOVER', status: 'NOT_STARTED', orderIndex: 12 },
    { title: 'Digital Handover & Closeout', phase: 'HANDOVER', status: 'NOT_STARTED', orderIndex: 13 },
  ];

  for (const task of wbsTasks) {
    await prisma.task.create({
      data: {
        project: { connect: { id: hurlProject.id } },
        title: task.title,
        description: `Workstream: ${task.title}`,
        status: task.status,
        orderIndex: task.orderIndex,
      },
    });
  }
  console.log('✅ Created', wbsTasks.length, 'WBS tasks');

  await prisma.$disconnect();
  console.log('🎉 Canonical HURL records created successfully!');
}

main().catch((e) => {
  console.error('❌ Error:', e);
  process.exit(1);
});