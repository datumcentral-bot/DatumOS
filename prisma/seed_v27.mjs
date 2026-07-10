import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  console.log("Seeding v27 extras: Notifications + Settings...");

  // Seed Notifications
  await prisma.notification.deleteMany();
  const notifs = [
    { type: "task_assigned", title: "New Task Assigned", message: "You have been assigned: Review BEP for ADNOC Tower", link: "/director/tasks", read: false },
    { type: "invoice_overdue", title: "Invoice Overdue", message: "Invoice INV-2026-003 from BAGC is 15 days overdue (AED 45,000)", link: "/director/finance", read: false },
    { type: "risk_escalated", title: "Risk Escalated", message: "Risk R-007 'Structural clash in Level 3' escalated to HIGH", link: "/director/risks", read: false },
    { type: "meeting_reminder", title: "Meeting in 30 mins", message: "BIM Coordination Meeting at 14:00 — ADNOC Tower Project", link: "/director/meetings", read: false },
    { type: "clash_new", title: "New Clash Detected", message: "3 new clashes detected in Navisworks model — Zone B Level 4", link: "/director/bim/clash", read: false },
    { type: "general", title: "ISO 19650 Deadline", message: "EIR submission deadline in 5 days for NEOM Pavilion project", link: "/director/iso19650", read: true },
    { type: "task_assigned", title: "Task Completed", message: "Ahmed Al-Rashid completed: LOD Matrix Review for BAGC HQ", link: "/director/tasks", read: true },
    { type: "general", title: "New Lead Added", message: "New prospect: Emaar Properties — AED 2.1M BIM consultancy", link: "/director/crm", read: true },
  ];
  for (const n of notifs) {
    await prisma.notification.create({ data: n });
  }
  console.log(`✅ Seeded ${notifs.length} notifications`);

  // Seed System Settings
  await prisma.systemSettings.deleteMany();
  const settings = [
    { key: "company_name", value: "Datum Studios Engineering Consultancy", category: "company" },
    { key: "company_tagline", value: "Digital Building Council — BIM Excellence", category: "company" },
    { key: "company_email", value: "info@datumbim.com", category: "company" },
    { key: "company_phone", value: "+971 4 123 4567", category: "company" },
    { key: "company_address", value: "Dubai Design District, Building 7, Dubai, UAE", category: "company" },
    { key: "company_website", value: "https://datumbim.com", category: "company" },
    { key: "company_currency", value: "AED", category: "company" },
    { key: "company_timezone", value: "Asia/Dubai", category: "company" },
    { key: "bim_standard", value: "ISO 19650", category: "bim" },
    { key: "cde_platform", value: "Autodesk Construction Cloud", category: "bim" },
    { key: "default_lod", value: "LOD 300", category: "bim" },
    { key: "clash_tolerance", value: "10mm", category: "bim" },
    { key: "notification_email", value: "true", category: "notifications" },
    { key: "notification_overdue_days", value: "7", category: "notifications" },
    { key: "kpi_refresh_interval", value: "30", category: "system" },
    { key: "max_file_size_mb", value: "50", category: "system" },
    { key: "session_timeout_min", value: "480", category: "system" },
  ];
  for (const s of settings) {
    await prisma.systemSettings.upsert({ where: { key: s.key }, update: { value: s.value }, create: s });
  }
  console.log(`✅ Seeded ${settings.length} system settings`);

  console.log("🎉 v27 seed complete!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
