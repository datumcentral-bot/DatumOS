import { PrismaClient } from '@prisma/client';
import fs from 'fs';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Auditing dummy operational clients and projects...\n');

  // Known dummy client names from seed data
  const dummyClientNames = [
    'BAGC Developments',
    'U+A Architects',
    'KAFD',
    'Masdar',
    'Meridian Health Trust',
    'Meridian Architects',
    'Demo Client',
    'Test Client',
    'Sample Client',
    'Placeholder Client',
  ];

  // Known dummy project names/codes
  const dummyProjectNames = [
    'Manarat Residence',
    'Dubai Airport',
    'Riyadh KAFD',
    'Masdar City Square',
    'Demo Project',
    'Test Project',
    'Sample Project',
    'Project Example',
  ];

  // 1. List all clients
  const allClients = await prisma.client.findMany({
    include: { _count: { select: { projects: true } } },
    orderBy: { companyName: 'asc' },
  });

  console.log(`📊 Total clients: ${allClients.length}`);
  allClients.forEach(c => console.log(`  - ${c.companyName} (${c.id}) — projects: ${c._count.projects}`));

  // 2. Identify dummy clients
  const dummyClients = allClients.filter(c => 
    dummyClientNames.some(d => c.companyName.toLowerCase().includes(d.toLowerCase()))
  );
  
  console.log(`\n🎯 Dummy clients identified: ${dummyClients.length}`);
  dummyClients.forEach(c => console.log(`  - ${c.companyName} (${c.id})`));

  // 3. List all projects
  const allProjects = await prisma.project.findMany({
    include: { client: true },
    orderBy: { name: 'asc' },
  });

  console.log(`\n📊 Total projects: ${allProjects.length}`);
  allProjects.forEach(p => console.log(`  - ${p.name} [${p.code}] — client: ${p.client?.companyName ?? 'N/A'}`));

  // 4. Identify dummy projects
  const dummyProjects = allProjects.filter(p => 
    dummyProjectNames.some(d => p.name.toLowerCase().includes(d.toLowerCase()) || (p.code && p.code.toLowerCase().includes(d.toLowerCase())))
  );

  console.log(`\n🎯 Dummy projects identified: ${dummyProjects.length}`);
  dummyProjects.forEach(p => console.log(`  - ${p.name} [${p.code}] — client: ${p.client?.companyName ?? 'N/A'}`));

  // 5. Also identify projects belonging to dummy clients
  const dummyClientIds = dummyClients.map(c => c.id);
  const projectsOfDummyClients = allProjects.filter(p => p.clientId && dummyClientIds.includes(p.clientId));
  
  console.log(`\n🔗 Projects belonging to dummy clients: ${projectsOfDummyClients.length}`);
  projectsOfDummyClients.forEach(p => console.log(`  - ${p.name} [${p.code}] — client: ${p.client?.companyName ?? 'N/A'}`));

  // 6. Combine all dummy projects (unique)
  const allDummyProjectIds = new Set([
    ...dummyProjects.map(p => p.id),
    ...projectsOfDummyClients.map(p => p.id),
  ]);

  console.log(`\n📋 Total unique dummy project IDs: ${allDummyProjectIds.size}`);

  // 7. Backup - export to JSON
  const backup = {
    timestamp: new Date().toISOString(),
    dummyClients: dummyClients.map(c => ({ id: c.id, companyName: c.companyName, status: c.status })),
    dummyProjects: Array.from(allDummyProjectIds).map(id => {
      const p = allProjects.find(x => x.id === id);
      return p ? { id: p.id, name: p.name, code: p.code, clientId: p.clientId, clientName: p.client?.companyName } : null;
    }).filter(Boolean),
  };

  const backupPath = `./scripts/dummy-backup-${Date.now()}.json`;
  fs.writeFileSync(backupPath, JSON.stringify(backup, null, 2));
  console.log(`\n💾 Backup saved to: ${backupPath}`);

  // 8. Now delete dummy projects first (due to FK constraints)
  if (allDummyProjectIds.size > 0) {
    console.log('\n🗑️  Deleting dummy projects...');
    const deletedProjects = await prisma.project.deleteMany({
      where: { id: { in: Array.from(allDummyProjectIds) } },
    });
    console.log(`✅ Deleted ${deletedProjects.count} dummy projects`);
  }

  // 9. Delete dummy clients
  if (dummyClients.length > 0) {
    console.log('\n🗑️  Deleting dummy clients...');
    const dummyClientIds = dummyClients.map(c => c.id);
    const deletedClients = await prisma.client.deleteMany({
      where: { id: { in: dummyClientIds } },
    });
    console.log(`✅ Deleted ${deletedClients.count} dummy clients`);
  }

  // 10. Verify remaining
  const remainingClients = await prisma.client.findMany({ orderBy: { companyName: 'asc' } });
  const remainingProjects = await prisma.project.findMany({ include: { client: true }, orderBy: { name: 'asc' } });

  console.log(`\n✅ Remaining clients (${remainingClients.length}):`);
  remainingClients.forEach(c => console.log(`  - ${c.companyName} (${c.id})`));

  console.log(`\n✅ Remaining projects (${remainingProjects.length}):`);
  remainingProjects.forEach(p => console.log(`  - ${p.name} [${p.code}] — client: ${p.client?.companyName ?? 'N/A'}`));

  await prisma.$disconnect();
  console.log('\n🎉 Dummy cleanup complete!');
}

main().catch((e) => {
  console.error('❌ Error:', e);
  process.exit(1);
});