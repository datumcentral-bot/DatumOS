import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Checking for dummy data in various tables...\n');

  // Check activityLog
  const activities = await prisma.activityLog.findMany({ take: 20, orderBy: { createdAt: 'desc' } });
  console.log(`📋 Activity Log (${activities.length} entries):`);
  activities.forEach(a => console.log(`  - ${a.action} — ${a.entity || a.title || a.summary || 'N/A'} (${a.createdAt})`));

  // Check projects
  const projects = await prisma.project.findMany({ include: { client: true } });
  console.log(`\n📊 Projects (${projects.length} entries):`);
  projects.forEach(p => console.log(`  - ${p.name} [${p.code}] — client: ${p.client?.companyName}`));

  // Check clients
  const clients = await prisma.client.findMany();
  console.log(`\n👥 Clients (${clients.length} entries):`);
  clients.forEach(c => console.log(`  - ${c.companyName} (${c.id})`));

  // Check tasks
  const tasks = await prisma.task.findMany({ take: 10, orderBy: { createdAt: 'desc' } });
  console.log(`\n📋 Tasks (${tasks.length} entries):`);
  tasks.forEach(t => console.log(`  - ${t.title} (${t.status})`));

  // Check risks
  const risks = await prisma.risk.findMany({ take: 10 });
  console.log(`\n⚠️ Risks (${risks.length} entries):`);
  risks.forEach(r => console.log(`  - ${r.title} (${r.severity || r.impact})`));

  // Check leads
  const leads = await prisma.lead.findMany({ take: 10 });
  console.log(`\n🎯 Leads (${leads.length} entries):`);
  leads.forEach(l => console.log(`  - ${l.company} (${l.stage})`));

  // Check activityLog for dummy entries
  const dummyKeywords = ['manarat', 'london', 'masdar', 'riyadh', 'dubai', 'kafD', 'kafD', 'betavolt', 'raissy', 'dcpms'];
  const dummyActivities = activities.filter(a => 
    dummyKeywords.some(k => (a.entity || a.summary || a.title || '').toLowerCase().includes(k.toLowerCase()))
  );
  console.log(`\n🎯 Dummy activities found: ${dummyActivities.length}`);
  dummyActivities.forEach(a => console.log(`  - ${a.action} — ${a.entity || a.summary || a.title}`));

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error('❌ Error:', e);
  process.exit(1);
});