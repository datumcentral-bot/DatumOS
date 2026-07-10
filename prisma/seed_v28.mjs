import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Seeding DatumOS v28 — GoHighLevel modules...');

  // ── Conversations ──────────────────────────────────────────────────────────
  await prisma.convMessage.deleteMany();
  await prisma.conversation.deleteMany();

  const convData = [
    {
      contactName: 'Mohammed Al-Rashid', contactEmail: 'mrashid@bagc.ae',
      contactCompany: 'BAGC Engineering', channel: 'EMAIL', status: 'OPEN', unreadCount: 2,
      lastMessage: 'Can you send the updated BEP for Phase 2?',
      messages: [
        { content: 'Hello, we need the BIM Execution Plan for Phase 2 of the ADNOC project. Can you share the latest version?', type: 'EMAIL', direction: 'INBOUND', senderName: 'Mohammed Al-Rashid' },
        { content: 'Hi Mohammed, I\'ll prepare the updated BEP and share it by EOD tomorrow. We\'re currently at v2.3 with ISO 19650-2 compliance.', type: 'EMAIL', direction: 'OUTBOUND', senderName: 'Datum BIM Team' },
        { content: 'Can you send the updated BEP for Phase 2?', type: 'EMAIL', direction: 'INBOUND', senderName: 'Mohammed Al-Rashid' },
      ]
    },
    {
      contactName: 'Sarah Chen', contactEmail: 'schen@neom.com',
      contactCompany: 'NEOM Development', channel: 'EMAIL', status: 'OPEN', unreadCount: 1,
      lastMessage: 'We\'d like to schedule a BIM coordination meeting.',
      messages: [
        { content: 'We\'re evaluating BIM consultants for the NEOM Linear City project. Your firm was recommended by our partners.', type: 'EMAIL', direction: 'INBOUND', senderName: 'Sarah Chen' },
        { content: 'Thank you Sarah! We\'d be delighted to discuss the NEOM project. Our team has extensive experience with mega-projects and ISO 19650 compliance.', type: 'EMAIL', direction: 'OUTBOUND', senderName: 'Datum BIM Team' },
        { content: 'We\'d like to schedule a BIM coordination meeting.', type: 'EMAIL', direction: 'INBOUND', senderName: 'Sarah Chen' },
      ]
    },
    {
      contactName: 'Ahmed Khalil', contactEmail: 'akhalil@emaar.ae',
      contactCompany: 'Emaar Properties', channel: 'SMS', status: 'OPEN', unreadCount: 0,
      lastMessage: 'Clash report received, reviewing now.',
      messages: [
        { content: 'Hi, following up on the clash detection report for Downtown Dubai Tower.', type: 'SMS', direction: 'OUTBOUND', senderName: 'Datum BIM' },
        { content: 'Clash report received, reviewing now.', type: 'SMS', direction: 'INBOUND', senderName: 'Ahmed Khalil' },
      ]
    },
    {
      contactName: 'Fatima Al-Zaabi', contactEmail: 'fzaabi@dha.gov.ae',
      contactCompany: 'Dubai Health Authority', channel: 'EMAIL', status: 'CLOSED', unreadCount: 0,
      lastMessage: 'Contract signed. Looking forward to working together.',
      messages: [
        { content: 'We\'re interested in BIM services for our new hospital project in Al Quoz.', type: 'EMAIL', direction: 'INBOUND', senderName: 'Fatima Al-Zaabi' },
        { content: 'Excellent! Healthcare BIM is one of our specializations. We\'ve delivered 3 hospital projects with full COBie data for FM handover.', type: 'EMAIL', direction: 'OUTBOUND', senderName: 'Datum BIM Team' },
        { content: 'Please send your proposal and fee schedule.', type: 'EMAIL', direction: 'INBOUND', senderName: 'Fatima Al-Zaabi' },
        { content: 'Proposal attached — AED 485,000 for full BIM management including LOD 400 models, clash detection, and COBie deliverables.', type: 'EMAIL', direction: 'OUTBOUND', senderName: 'Datum BIM Team' },
        { content: 'Contract signed. Looking forward to working together.', type: 'EMAIL', direction: 'INBOUND', senderName: 'Fatima Al-Zaabi' },
      ]
    },
    {
      contactName: 'James Whitfield', contactEmail: 'jwhitfield@arup.com',
      contactCompany: 'Arup Group', channel: 'INTERNAL', status: 'OPEN', unreadCount: 3,
      lastMessage: 'Can we align on the Navisworks federated model workflow?',
      messages: [
        { content: 'Arup is looking for a local BIM partner for the Abu Dhabi Metro extension. Are you available for a call this week?', type: 'EMAIL', direction: 'INBOUND', senderName: 'James Whitfield' },
        { content: 'Absolutely James. We have capacity and strong metro/infrastructure BIM experience. Thursday 2pm works?', type: 'EMAIL', direction: 'OUTBOUND', senderName: 'Datum BIM Team' },
        { content: 'Can we align on the Navisworks federated model workflow?', type: 'EMAIL', direction: 'INBOUND', senderName: 'James Whitfield' },
      ]
    },
    {
      contactName: 'Rania Mansour', contactEmail: 'rmansour@aldar.ae',
      contactCompany: 'Aldar Properties', channel: 'EMAIL', status: 'OPEN', unreadCount: 1,
      lastMessage: 'Please confirm the LOD 350 deliverable schedule.',
      messages: [
        { content: 'We need BIM coordination services for Yas Island Phase 3. 12 residential towers, 2026 completion.', type: 'EMAIL', direction: 'INBOUND', senderName: 'Rania Mansour' },
        { content: 'We can handle this. Our team is experienced with large residential developments. Sending capability statement.', type: 'EMAIL', direction: 'OUTBOUND', senderName: 'Datum BIM Team' },
        { content: 'Please confirm the LOD 350 deliverable schedule.', type: 'EMAIL', direction: 'INBOUND', senderName: 'Rania Mansour' },
      ]
    },
  ];

  for (const c of convData) {
    const { messages, ...convFields } = c;
    const conv = await prisma.conversation.create({ data: convFields });
    for (const msg of messages) {
      await prisma.convMessage.create({ data: { ...msg, conversationId: conv.id } });
    }
  }
  console.log('✅ Seeded 6 conversations with messages');

  // ── Campaigns ──────────────────────────────────────────────────────────────
  await prisma.campaign.deleteMany();
  await prisma.campaign.createMany({ data: [
    { name: 'Q3 BIM Services Outreach', subject: 'Elevate Your Project with ISO 19650 BIM', body: 'Dear {name},\n\nAs {company} continues to grow its portfolio, we wanted to share how Datum BIM has helped similar firms achieve 30% clash reduction and full regulatory compliance...\n\nBest regards,\nDatum BIM Team', status: 'ACTIVE', targetAudience: 'Developers & Contractors', sentCount: 142, openCount: 67, clickCount: 23, replyCount: 8, scheduledAt: new Date('2026-07-15') },
    { name: 'ISO 19650 Compliance Newsletter', subject: 'New UAE BIM Mandate: Are You Ready?', body: 'The UAE has announced mandatory BIM requirements for all government projects above AED 50M starting Q1 2027. Here\'s what you need to know...', status: 'COMPLETED', targetAudience: 'All Contacts', sentCount: 389, openCount: 201, clickCount: 89, replyCount: 31 },
    { name: 'Digital Twin Webinar Invite', subject: 'Free Webinar: Digital Twin for FM — July 28', body: 'Join our expert panel for a 90-minute deep dive into Digital Twin implementation for Facilities Management. Real case studies from UAE projects.', status: 'ACTIVE', targetAudience: 'FM & Asset Managers', sentCount: 78, openCount: 45, clickCount: 19, replyCount: 6, scheduledAt: new Date('2026-07-28') },
    { name: 'Post-Project Satisfaction Survey', subject: 'How did we do? Quick 2-min survey', body: 'Hi {name},\n\nNow that {project} is complete, we\'d love your feedback. Your input helps us improve our BIM delivery process.', status: 'ACTIVE', targetAudience: 'Completed Project Clients', sentCount: 24, openCount: 18, clickCount: 14, replyCount: 11 },
    { name: 'Year-End BIM Audit Offer', subject: 'Free BIM Health Check — Limited Slots', body: 'As we approach year-end, is your BIM data ready for handover? We\'re offering complimentary BIM audits for 5 projects this quarter.', status: 'DRAFT', targetAudience: 'Active Project Clients', sentCount: 0, openCount: 0, clickCount: 0, replyCount: 0, scheduledAt: new Date('2026-08-01') },
  ]});
  console.log('✅ Seeded 5 campaigns');

  // ── Forms ──────────────────────────────────────────────────────────────────
  await prisma.formSubmission.deleteMany();
  await prisma.datumForm.deleteMany();

  const formsData = [
    {
      name: 'Project Inquiry Form',
      description: 'Initial inquiry form for new project opportunities',
      status: 'ACTIVE',
      submissionCount: 23,
      fields: JSON.stringify([
        { id: 'f1', label: 'Company Name', type: 'text', required: true },
        { id: 'f2', label: 'Contact Name', type: 'text', required: true },
        { id: 'f3', label: 'Email', type: 'email', required: true },
        { id: 'f4', label: 'Project Type', type: 'select', options: ['Residential', 'Commercial', 'Infrastructure', 'Industrial', 'Healthcare'], required: true },
        { id: 'f5', label: 'Estimated Budget (AED)', type: 'number', required: false },
        { id: 'f6', label: 'BIM Requirements', type: 'textarea', required: false },
      ]),
      submissions: [
        { data: JSON.stringify({ 'Company Name': 'Al Habtoor Group', 'Contact Name': 'Omar Al Habtoor', 'Email': 'omar@alhabtoor.ae', 'Project Type': 'Residential', 'Estimated Budget (AED)': '12000000', 'BIM Requirements': 'LOD 350, clash detection, COBie' }) },
        { data: JSON.stringify({ 'Company Name': 'Majid Al Futtaim', 'Contact Name': 'Layla Hassan', 'Email': 'lhassan@maf.ae', 'Project Type': 'Commercial', 'Estimated Budget (AED)': '45000000', 'BIM Requirements': 'Full BIM management, digital twin' }) },
        { data: JSON.stringify({ 'Company Name': 'DEWA', 'Contact Name': 'Khalid Bin Saeed', 'Email': 'kbsaeed@dewa.gov.ae', 'Project Type': 'Infrastructure', 'Estimated Budget (AED)': '8500000', 'BIM Requirements': 'ISO 19650 compliance, GIS integration' }) },
      ]
    },
    {
      name: 'BIM Maturity Assessment',
      description: 'Self-assessment tool for client BIM capability evaluation',
      status: 'ACTIVE',
      submissionCount: 11,
      fields: JSON.stringify([
        { id: 'f1', label: 'Organization', type: 'text', required: true },
        { id: 'f2', label: 'Current BIM Software', type: 'select', options: ['Revit', 'ArchiCAD', 'Bentley', 'None', 'Other'], required: true },
        { id: 'f3', label: 'BIM Experience Level', type: 'select', options: ['None', 'Basic', 'Intermediate', 'Advanced', 'Expert'], required: true },
        { id: 'f4', label: 'ISO 19650 Familiarity', type: 'select', options: ['Not aware', 'Aware', 'Partially implemented', 'Fully implemented'], required: true },
        { id: 'f5', label: 'Main BIM Challenges', type: 'textarea', required: false },
      ]),
      submissions: [
        { data: JSON.stringify({ 'Organization': 'Emaar Properties', 'Current BIM Software': 'Revit', 'BIM Experience Level': 'Intermediate', 'ISO 19650 Familiarity': 'Partially implemented', 'Main BIM Challenges': 'Clash coordination between disciplines' }) },
      ]
    },
    {
      name: 'Client Satisfaction Survey',
      description: 'Post-project feedback collection',
      status: 'ACTIVE',
      submissionCount: 18,
      fields: JSON.stringify([
        { id: 'f1', label: 'Project Name', type: 'text', required: true },
        { id: 'f2', label: 'Overall Satisfaction', type: 'rating', max: 5, required: true },
        { id: 'f3', label: 'BIM Quality Rating', type: 'rating', max: 5, required: true },
        { id: 'f4', label: 'Communication Rating', type: 'rating', max: 5, required: true },
        { id: 'f5', label: 'Would you recommend us?', type: 'select', options: ['Definitely', 'Probably', 'Not sure', 'Probably not'], required: true },
        { id: 'f6', label: 'Comments', type: 'textarea', required: false },
      ]),
      submissions: [
        { data: JSON.stringify({ 'Project Name': 'BAGC Tower A', 'Overall Satisfaction': '5', 'BIM Quality Rating': '5', 'Communication Rating': '4', 'Would you recommend us?': 'Definitely', 'Comments': 'Excellent clash detection work, saved us significant rework costs.' }) },
        { data: JSON.stringify({ 'Project Name': 'DHA Hospital', 'Overall Satisfaction': '4', 'BIM Quality Rating': '5', 'Communication Rating': '4', 'Would you recommend us?': 'Definitely', 'Comments': 'COBie deliverables were comprehensive and well-structured.' }) },
      ]
    },
    {
      name: 'Subcontractor Registration',
      description: 'New subcontractor onboarding form',
      status: 'ACTIVE',
      submissionCount: 7,
      fields: JSON.stringify([
        { id: 'f1', label: 'Company Name', type: 'text', required: true },
        { id: 'f2', label: 'Specialization', type: 'select', options: ['Structural BIM', 'MEP BIM', 'Architectural BIM', 'Civil/Infrastructure', 'Quantity Surveying', 'FM/COBie'], required: true },
        { id: 'f3', label: 'Years of Experience', type: 'number', required: true },
        { id: 'f4', label: 'Software Proficiency', type: 'text', required: true },
        { id: 'f5', label: 'ISO 19650 Certified', type: 'select', options: ['Yes', 'No', 'In Progress'], required: true },
        { id: 'f6', label: 'Daily Rate (AED)', type: 'number', required: false },
      ]),
      submissions: [
        { data: JSON.stringify({ 'Company Name': 'MEP BIM Solutions LLC', 'Specialization': 'MEP BIM', 'Years of Experience': '8', 'Software Proficiency': 'Revit MEP, Navisworks, MagiCAD', 'ISO 19650 Certified': 'Yes', 'Daily Rate (AED)': '2500' }) },
      ]
    },
  ];

  for (const f of formsData) {
    const { submissions, ...formFields } = f;
    const form = await prisma.datumForm.create({ data: formFields });
    for (const sub of submissions) {
      await prisma.formSubmission.create({ data: { ...sub, formId: form.id } });
    }
  }
  console.log('✅ Seeded 4 forms with submissions');

  // ── Appointments ───────────────────────────────────────────────────────────
  await prisma.appointment.deleteMany();
  const now = new Date();
  const d = (daysOffset, hour = 10) => {
    const dt = new Date(now);
    dt.setDate(dt.getDate() + daysOffset);
    dt.setHours(hour, 0, 0, 0);
    return dt;
  };
  await prisma.appointment.createMany({ data: [
    { title: 'BAGC BIM Kickoff Meeting', type: 'CLIENT_MEETING', startTime: d(1, 9), endTime: d(1, 11), attendees: JSON.stringify(['Mohammed Al-Rashid', 'Ahmed Hassan', 'Director']), location: 'BAGC HQ, Dubai', status: 'CONFIRMED', description: 'Project kickoff for BAGC Tower A — BIM scope, deliverables, and timeline review' },
    { title: 'Navisworks Clash Review — NEOM', type: 'BIM_COORDINATION', startTime: d(2, 14), endTime: d(2, 16), attendees: JSON.stringify(['Sarah Chen', 'BIM Coordinator', 'MEP Lead']), location: 'MS Teams', status: 'CONFIRMED', description: 'Review 47 open clashes from latest federated model run' },
    { title: 'Site Visit — DHA Hospital', type: 'SITE_VISIT', startTime: d(3, 8), endTime: d(3, 12), attendees: JSON.stringify(['Fatima Al-Zaabi', 'Site Engineer', 'BIM Manager']), location: 'Al Quoz, Dubai', status: 'CONFIRMED', description: 'As-built verification against BIM model, Level 3 MEP' },
    { title: 'ISO 19650 Internal Training', type: 'TRAINING', startTime: d(5, 10), endTime: d(5, 13), attendees: JSON.stringify(['All BIM Team']), location: 'Datum BIM Office', status: 'CONFIRMED', description: 'Refresher training on ISO 19650-2 information management requirements' },
    { title: 'Emaar Q3 Progress Review', type: 'CLIENT_MEETING', startTime: d(7, 15), endTime: d(7, 16), attendees: JSON.stringify(['Ahmed Khalil', 'Project Manager', 'Director']), location: 'Zoom', status: 'CONFIRMED', description: 'Quarterly progress review — Downtown Dubai Tower BIM deliverables' },
    { title: 'BIM Coordination — Yas Island', type: 'BIM_COORDINATION', startTime: d(8, 11), endTime: d(8, 13), attendees: JSON.stringify(['Rania Mansour', 'Structural Lead', 'MEP Lead', 'Architect']), location: 'Aldar HQ, Abu Dhabi', status: 'PENDING', description: 'Multi-discipline coordination session for Towers 1-4' },
    { title: 'Arup Partnership Discussion', type: 'CLIENT_MEETING', startTime: d(10, 14), endTime: d(10, 15), attendees: JSON.stringify(['James Whitfield', 'Director', 'BD Manager']), location: 'Arup Dubai Office', status: 'CONFIRMED', description: 'Discuss subcontracting arrangement for Abu Dhabi Metro BIM' },
    { title: 'Digital Twin Webinar Prep', type: 'INTERNAL_REVIEW', startTime: d(12, 10), endTime: d(12, 12), attendees: JSON.stringify(['BIM Team', 'Marketing']), location: 'Datum BIM Office', status: 'CONFIRMED', description: 'Prepare slides and demo for July 28 Digital Twin webinar' },
    { title: 'COBie Data Handover — DHA', type: 'CLIENT_MEETING', startTime: d(14, 9), endTime: d(14, 11), attendees: JSON.stringify(['Fatima Al-Zaabi', 'FM Manager', 'BIM Manager']), location: 'DHA HQ', status: 'PENDING', description: 'Final COBie data handover and FM system integration walkthrough' },
    { title: 'Revit Template Update Workshop', type: 'TRAINING', startTime: d(-2, 10), endTime: d(-2, 13), attendees: JSON.stringify(['BIM Team']), location: 'Datum BIM Office', status: 'COMPLETED', description: 'Update company Revit templates to 2026 standards' },
    { title: 'BAGC Monthly Progress', type: 'CLIENT_MEETING', startTime: d(-5, 14), endTime: d(-5, 15), attendees: JSON.stringify(['Mohammed Al-Rashid', 'Project Manager']), location: 'Zoom', status: 'COMPLETED', description: 'Monthly BIM progress review — Phase 1 complete' },
    { title: 'Navisworks Advanced Training', type: 'TRAINING', startTime: d(20, 9), endTime: d(20, 17), attendees: JSON.stringify(['Junior BIM Team']), location: 'Datum BIM Office', status: 'CONFIRMED', description: 'Full-day Navisworks advanced clash detection and reporting training' },
  ]});
  console.log('✅ Seeded 12 appointments');

  // ── Automations ────────────────────────────────────────────────────────────
  await prisma.automation.deleteMany();
  await prisma.automation.createMany({ data: [
    { name: 'New Lead → Welcome Email', description: 'Automatically send a welcome email when a new lead is created in the CRM', trigger: 'New Lead Created', actions: JSON.stringify([{ step: 1, type: 'WAIT', duration: '5 minutes' }, { step: 2, type: 'SEND_EMAIL', template: 'Welcome to Datum BIM', subject: 'Thank you for your interest in Datum BIM' }, { step: 3, type: 'CREATE_TASK', title: 'Follow up with new lead', assignTo: 'BD Manager', dueIn: '2 days' }]), status: 'ACTIVE', executionCount: 47, lastExecutedAt: new Date(Date.now() - 86400000 * 2) },
    { name: 'Invoice Overdue → Reminder Sequence', description: 'Send escalating reminders for overdue invoices at 7, 14, and 30 days', trigger: 'Invoice Overdue (7 days)', actions: JSON.stringify([{ step: 1, type: 'SEND_EMAIL', template: 'Invoice Reminder', subject: 'Friendly reminder: Invoice #{invoiceNo} due' }, { step: 2, type: 'WAIT', duration: '7 days' }, { step: 3, type: 'SEND_EMAIL', template: 'Invoice Overdue', subject: 'OVERDUE: Invoice #{invoiceNo} — Action Required' }, { step: 4, type: 'NOTIFY', message: 'Invoice 14 days overdue — escalate to Director', assignTo: 'Director' }]), status: 'ACTIVE', executionCount: 12, lastExecutedAt: new Date(Date.now() - 86400000 * 1) },
    { name: 'Milestone Complete → Notify Client', description: 'Notify client and create next milestone task when a project milestone is marked complete', trigger: 'Project Milestone Completed', actions: JSON.stringify([{ step: 1, type: 'SEND_EMAIL', template: 'Milestone Complete', subject: 'Milestone Achieved: {milestoneName}' }, { step: 2, type: 'CREATE_NOTIFICATION', title: 'Milestone complete', type: 'general' }, { step: 3, type: 'UPDATE_PROJECT', field: 'progressPct', action: 'increment' }]), status: 'ACTIVE', executionCount: 23, lastExecutedAt: new Date(Date.now() - 86400000 * 3) },
    { name: 'Clash Detected → Assign Coordinator', description: 'When a new clash is logged, automatically assign to the relevant discipline coordinator', trigger: 'New Clash Detection Created', actions: JSON.stringify([{ step: 1, type: 'ASSIGN_USER', role: 'BIM Coordinator', based_on: 'discipline' }, { step: 2, type: 'SEND_EMAIL', template: 'Clash Assignment', subject: 'New Clash Assigned: {clashTitle}' }, { step: 3, type: 'CREATE_NOTIFICATION', title: 'New clash assigned to you', type: 'clash_new' }, { step: 4, type: 'SET_DUE_DATE', daysFromNow: 5 }]), status: 'ACTIVE', executionCount: 89, lastExecutedAt: new Date(Date.now() - 3600000 * 4) },
    { name: 'Lead Warm → Schedule Call', description: 'When a lead moves to WARM stage, prompt BD team to schedule a discovery call', trigger: 'Lead Stage Changed to WARM', actions: JSON.stringify([{ step: 1, type: 'CREATE_TASK', title: 'Schedule discovery call with {contactName}', assignTo: 'BD Manager', dueIn: '1 day' }, { step: 2, type: 'SEND_EMAIL', template: 'Discovery Call Request', subject: 'Let\'s connect — {company} BIM opportunity' }, { step: 3, type: 'ADD_TAG', tag: 'warm-prospect' }]), status: 'ACTIVE', executionCount: 31, lastExecutedAt: new Date(Date.now() - 86400000 * 1) },
    { name: 'Risk Escalated → Director Alert', description: 'Alert the Director when a risk score exceeds threshold or is marked CRITICAL', trigger: 'Risk Score > 15 or Status = CRITICAL', actions: JSON.stringify([{ step: 1, type: 'SEND_EMAIL', template: 'Risk Alert', subject: '⚠️ High Risk Alert: {riskTitle}', to: 'director@datumbim.com' }, { step: 2, type: 'CREATE_NOTIFICATION', title: 'Critical risk requires attention', type: 'risk_escalated' }, { step: 3, type: 'CREATE_TASK', title: 'Review and mitigate: {riskTitle}', assignTo: 'Director', priority: 'CRITICAL', dueIn: '1 day' }]), status: 'PAUSED', executionCount: 5, lastExecutedAt: new Date(Date.now() - 86400000 * 14) },
  ]});
  console.log('✅ Seeded 6 automations');

  // ── Reviews ────────────────────────────────────────────────────────────────
  await prisma.review.deleteMany();
  await prisma.review.createMany({ data: [
    { clientName: 'Mohammed Al-Rashid', projectName: 'BAGC Tower A', rating: 5, content: 'Datum BIM delivered exceptional clash detection work that saved us over AED 2.3M in rework costs. Their ISO 19650 compliance was flawless and the COBie handover was the best we\'ve received from any consultant.', status: 'PUBLISHED' },
    { clientName: 'Fatima Al-Zaabi', projectName: 'DHA Al Quoz Hospital', rating: 5, content: 'The BIM team\'s understanding of healthcare facility requirements was impressive. They coordinated 6 disciplines seamlessly and the FM-ready COBie data has already saved our facilities team significant time.', status: 'PUBLISHED' },
    { clientName: 'Ahmed Khalil', projectName: 'Downtown Dubai Tower', rating: 4, content: 'Strong technical BIM capability and responsive team. The clash detection reports were detailed and actionable. Minor delays in initial model setup but overall excellent delivery.', status: 'PUBLISHED' },
    { clientName: 'Rania Mansour', projectName: 'Yas Island Phase 2', rating: 5, content: 'We\'ve worked with many BIM consultants across the UAE and Datum BIM stands out for their attention to detail and proactive communication. The Navisworks coordination sessions were highly productive.', status: 'PUBLISHED' },
    { clientName: 'James Whitfield', projectName: 'Abu Dhabi Metro Extension', rating: 5, content: 'As a global engineering firm, we have high standards for BIM delivery. Datum BIM met every requirement and their local knowledge of UAE regulations was invaluable. We\'ll definitely partner again.', status: 'PUBLISHED' },
    { clientName: 'Omar Al Habtoor', projectName: 'Al Habtoor City Tower D', rating: 4, content: 'Good BIM management throughout the project. The digital twin deliverable was particularly impressive and our FM team is already using it for maintenance planning.', status: 'PUBLISHED' },
    { clientName: 'Layla Hassan', projectName: 'Mall of the Emirates Expansion', rating: 5, content: 'Datum BIM handled the complexity of a live retail environment with professionalism. Zero disruption to operations during the BIM survey and the as-built models were delivered on time.', status: 'PUBLISHED' },
    { clientName: 'Khalid Bin Saeed', projectName: 'DEWA Solar Plant', rating: 4, content: 'Solid BIM delivery for a complex infrastructure project. The GIS integration was handled well and the ISO 19650 documentation was comprehensive.', status: 'PENDING' },
  ]});
  console.log('✅ Seeded 8 reviews');

  console.log('\n🎉 DatumOS v28 seed complete!');
  console.log('   Conversations: 6 | Campaigns: 5 | Forms: 4 | Appointments: 12 | Automations: 6 | Reviews: 8');
}

main().catch(console.error).finally(() => prisma.$disconnect());
