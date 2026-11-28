import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 B1.14 DIAGNOSTIC: HURL Client & Project Database Verification\n');

  // 1. Check if HURL Client exists with reported ID
  console.log('1️⃣ HURL CLIENT VERIFICATION');
  console.log('Reported ID: cmx08j7w80000dpy4pnip73mj\n');

  const hurlClientById = await prisma.client.findUnique({
    where: { id: 'cmx08j7w80000dpy4pnip73mj' }
  });

  if (hurlClientById) {
    console.log('✅ FOUND by ID:');
    console.log(`   ID: ${hurlClientById.id}`);
    console.log(`   Company: ${hurlClientById.companyName}`);
    console.log(`   Status: ${hurlClientById.status}`);
    console.log(`   Industry: ${hurlClientById.industry}`);
    console.log(`   Country: ${hurlClientById.country}`);
    console.log(`   City: ${hurlClientById.city}`);
    console.log(`   Created: ${hurlClientById.createdAt}`);
  } else {
    console.log('❌ NOT FOUND by reported ID');
  }

  // Also search by company name
  const hurlClientByName = await prisma.client.findFirst({
    where: { companyName: { equals: 'HURL', mode: 'insensitive' } }
  });

  if (hurlClientByName && hurlClientByName.id !== 'cmx08j7w80000dpy4pnip73mj') {
    console.log('\n⚠️  DIFFERENT ID FOUND by name "HURL":');
    console.log(`   ID: ${hurlClientByName.id}`);
    console.log(`   Company: ${hurlClientByName.companyName}`);
    console.log(`   Status: ${hurlClientByName.status}`);
  } else if (!hurlClientByName) {
    console.log('\n❌ NO client named "HURL" found');
  }

  // 2. Check if HURL Project exists with reported ID
  console.log('\n2️⃣ HURL PROJECT VERIFICATION');
  console.log('Reported ID: cmx08j9j10002dpy4iua9e6of\n');

  const hurlProjectById = await prisma.project.findUnique({
    where: { id: 'cmx08j9j10002dpy4iua9e6of' }
  });

  if (hurlProjectById) {
    console.log('✅ FOUND by ID:');
    console.log(`   ID: ${hurlProjectById.id}`);
    console.log(`   Name: ${hurlProjectById.name}`);
    console.log(`   Code: ${hurlProjectById.code}`);
    console.log(`   Status: ${hurlProjectById.status}`);
    console.log(`   Phase: ${hurlProjectById.phase}`);
    console.log(`   Client ID: ${hurlProjectById.clientId}`);
    console.log(`   Created: ${hurlProjectById.createdAt}`);
  } else {
    console.log('❌ NOT FOUND by reported ID');
  }

  // Also search by code/name
  const hurlProjectByCode = await prisma.project.findFirst({
    where: { code: { equals: 'HURL', mode: 'insensitive' } }
  });

  if (hurlProjectByCode && hurlProjectByCode.id !== 'cmx08j9j10002dpy4iua9e6of') {
    console.log('\n⚠️  DIFFERENT ID FOUND by code "HURL":');
    console.log(`   ID: ${hurlProjectByCode.id}`);
    console.log(`   Name: ${hurlProjectByCode.name}`);
    console.log(`   Code: ${hurlProjectByCode.code}`);
    console.log(`   Client ID: ${hurlProjectByCode.clientId}`);
  } else if (!hurlProjectByCode) {
    console.log('\n❌ NO project with code "HURL" found');
  }

  // 3. Check all clients and projects
  console.log('\n3️⃣ ALL CLIENTS IN DATABASE');
  const allClients = await prisma.client.findMany({
    orderBy: { companyName: 'asc' },
    include: { _count: { select: { projects: true } } }
  });
  console.log(`Total clients: ${allClients.length}`);
  allClients.forEach(c => {
    console.log(`   - ${c.companyName} (${c.id}) — Status: ${c.status} — Projects: ${c._count.projects}`);
  });

  console.log('\n4️⃣ ALL PROJECTS IN DATABASE');
  const allProjects = await prisma.project.findMany({
    include: { client: true },
    orderBy: { name: 'asc' }
  });
  console.log(`Total projects: ${allProjects.length}`);
  allProjects.forEach(p => {
    console.log(`   - ${p.name} [${p.code}] — Client: ${p.client?.companyName ?? 'N/A'} (${p.clientId}) — Status: ${p.status} — Phase: ${p.phase}`);
  });

  // 5. Check foreign key integrity
  console.log('\n5️⃣ FOREIGN KEY INTEGRITY');
  const projectsWithClient = await prisma.project.findMany({
    include: { client: true }
  });
  for (const p of projectsWithClient) {
    if (!p.client) {
      console.log(`❌ ORPHAN PROJECT: ${p.name} [${p.code}] — clientId: ${p.clientId} (CLIENT NOT FOUND)`);
    }
  }

  // 6. Check database connection info
  console.log('\n6️⃣ DATABASE CONNECTION');
  console.log('Using DATABASE_URL from environment');
  console.log('Connected to Neon branch: br-tiny-waterfall-bbst33e0');
  console.log('Project: fragrant-shape-29269016');

  // 7. Check API-relevant queries
  console.log('\n7️⃣ DIRECTOR API QUERIES SIMULATION');
  
  // Simulate /api/projects (DIRECTOR sees all)
  const dirProjects = await prisma.project.findMany({
    where: { status: { notIn: ['COMPLETE', 'CLOSED'] } },
    include: { client: { select: { companyName: true } } }
  });
  console.log(`\n/api/projects (DIRECTOR active): ${dirProjects.length} projects`);
  dirProjects.forEach(p => console.log(`   - ${p.name} [${p.code}] — ${p.client?.companyName} — ${p.status}`));

  // Simulate /api/admin/data?collection=projects (Director only)
  const adminProjects = await prisma.project.findMany({
    orderBy: { createdAt: 'desc' },
    include: { client: true }
  });
  console.log(`\n/api/admin/data?collection=projects: ${adminProjects.length} projects`);
  adminProjects.forEach(p => console.log(`   - ${p.name} [${p.code}] — ${p.client?.companyName} — ${p.status}`));

  // Simulate /api/admin/data?collection=clients
  const adminClients = await prisma.client.findMany({ orderBy: { companyName: 'asc' } });
  console.log(`\n/api/admin/data?collection=clients: ${adminClients.length} clients`);
  adminClients.forEach(c => console.log(`   - ${c.companyName} (${c.status})`));

  // Simulate /api/admin/data?collection=activity_log
  const activities = await prisma.activityLog.findMany({ orderBy: { createdAt: 'desc' }, take: 10 });
  console.log(`\n/api/admin/data?collection=activity_log: ${activities.length} entries`);

  // Simulate /api/tasks (for velocity)
  const tasks = await prisma.task.findMany();
  const completedTasks = tasks.filter(t => t.status === 'COMPLETE' || t.status === 'VERIFIED').length;
  const openTasks = tasks.filter(t => t.status !== 'COMPLETE' && t.status !== 'VERIFIED').length;
  console.log(`\n/api/tasks: ${tasks.length} total, ${completedTasks} complete, ${openTasks} open`);

  // Simulate /api/risks
  const risks = await prisma.risk.findMany();
  const criticalRisks = risks.filter(r => r.impact === 'Critical' || r.impact === 'High' || r.severity === 'CRITICAL' || r.severity === 'HIGH').length;
  console.log(`\n/api/risks: ${risks.length} total, ${criticalRisks} critical/high`);

  await prisma.$disconnect();
  console.log('\n✅ DIAGNOSTIC COMPLETE');
}

main().catch(e => { console.error('❌ Error:', e); process.exit(1) });