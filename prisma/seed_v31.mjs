import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const INTEGRATIONS = [
  // Social Media
  { name: 'LinkedIn', slug: 'linkedin', category: 'SOCIAL', icon: '💼', description: 'Post updates, share projects, and generate B2B leads via LinkedIn.', status: 'CONNECTED' },
  { name: 'Instagram', slug: 'instagram', category: 'SOCIAL', icon: '📸', description: 'Share project photos, stories, and reels to showcase BIM work.', status: 'CONNECTED' },
  { name: 'Facebook', slug: 'facebook', category: 'SOCIAL', icon: '👥', description: 'Manage Facebook page, post updates, and run lead ads.', status: 'DISCONNECTED' },
  { name: 'Twitter / X', slug: 'twitter', category: 'SOCIAL', icon: '🐦', description: 'Share industry insights and engage with the AEC community.', status: 'DISCONNECTED' },
  { name: 'WhatsApp Business', slug: 'whatsapp', category: 'SOCIAL', icon: '💬', description: 'Send automated messages, follow-ups, and project updates via WhatsApp.', status: 'CONNECTED' },
  { name: 'TikTok', slug: 'tiktok', category: 'SOCIAL', icon: '🎵', description: 'Share BIM walkthroughs and time-lapse construction videos.', status: 'DISCONNECTED' },
  { name: 'YouTube', slug: 'youtube', category: 'SOCIAL', icon: '▶️', description: 'Publish BIM tutorials, project showcases, and company updates.', status: 'DISCONNECTED' },
  // Automation
  { name: 'Zapier', slug: 'zapier', category: 'AUTOMATION', icon: '⚡', description: 'Connect DatumOS to 5,000+ apps with no-code automation workflows.', status: 'CONNECTED' },
  { name: 'Make.com', slug: 'make', category: 'AUTOMATION', icon: '🔄', description: 'Visual automation builder for complex multi-step workflows.', status: 'DISCONNECTED' },
  { name: 'n8n', slug: 'n8n', category: 'AUTOMATION', icon: '🔗', description: 'Self-hosted workflow automation with full data control.', status: 'DISCONNECTED' },
];

async function main() {
  console.log('🔗 Seeding v31 integrations...');
  for (const integration of INTEGRATIONS) {
    await prisma.integration.upsert({
      where: { slug: integration.slug },
      update: {},
      create: integration,
    });
    console.log(`  ✓ ${integration.name} [${integration.status}]`);
  }
  console.log(`\n✅ DatumOS v31 seed complete! Integrations: ${INTEGRATIONS.length}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
