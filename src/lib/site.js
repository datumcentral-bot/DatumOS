// Central config for the public marketing site.
// All facts sourced from the DATUM BIM ENGINEERING Company Profile &
// "Complete BIM Solutions & Services" documents.

export const SITE = {
  name: "Datum BIM Engineering",
  shortName: "DATUM BIM",
  tagline: "Clarity in Digital Construction",
  descriptor: "Building Information Modeling · Architecture · Structure · MEP · Scan-to-BIM · Shop Drawings",
  established: "2021",
  ceo: "Syed Asad Abrar",
  city: "Lahore, Pakistan",
  email: "datumstuidos@gmail.com",
  phone: "+92 334 4063563",
  whatsapp: "+92 334 4063563",
  whatsappUrl: "https://wa.me/923344063563",
  website: "https://datumos.vercel.app/",
  addr: "Plot #42, Phase V, Industrial Area, Lahore, Pakistan",
  standards: ["ISO 19650", "BS 1192 / PAS 1192", "BIM Level 2"],
};

// Regional offices from the company profile.
export const OFFICES = [
  { city: "Lahore", country: "Pakistan", role: "Head Office", addr: "Plot #42, Phase V, Industrial Area, Lahore", primary: true },
  { city: "Dubai", country: "UAE", role: "Regional Office", addr: "Office 1501, API Tower, Business Bay" },
  { city: "Karachi", country: "Pakistan", role: "Regional Office", addr: "Suite #501, Business Avenue, Clifton" },
  { city: "Islamabad", country: "Pakistan", role: "Regional Office", addr: "Blue Area, Sector G-11" },
];

export const PUBLIC_NAV = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/client-journey", label: "How It Works" },
  { href: "/capabilities", label: "Capabilities" },
  { href: "/projects", label: "Projects" },
  { href: "/group", label: "Datum Group" },
  { href: "/careers", label: "Careers" },
  { href: "/contact", label: "Contact" },
];

export const SOCIALS = [
  // Verified owner profile (2026-10-03): no "Datum BIM Engineering" company page exists on LinkedIn.
  { key: "linkedin", label: "LinkedIn", href: "https://www.linkedin.com/in/asad-syed-ba1126412/" },
  { key: "instagram", label: "Instagram", href: "https://www.instagram.com/datumbim" },
  { key: "facebook", label: "Facebook", href: "https://www.facebook.com/datumbim" },
  // Verified owner channel (2026-10-03): 1.01K subscribers, 56 videos. Replaces dead @datumbim (404).
  { key: "youtube", label: "YouTube", href: "https://www.youtube.com/@datumproductions" },
  { key: "x", label: "X", href: "https://x.com/datumbim" },
];

// Engagement facts. Every entry here is countable on this site — no historic
// performance claim, no percentage, no headcount. The previous statistics bar
// carried unverified figures; those were withdrawn on 2026-10-09 and are kept
// in the internal review record, not here. See Claims_Register.md.
export const STATS = [
  { value: "8", label: "MEP Disciplines Covered" },
  { value: "9", label: "Scope Areas (A to I)" },
  { value: "8", label: "QA Checklist Sections" },
  { value: "6", label: "Sample Sheets Published" },
];

// Working practices, not guarantees. The previous block promised "100% hard-clash
// detection" and "we correct them at no cost" — commitments that cannot be
// evidenced and, if untrue, are a breach. These are process statements.
export const ASSURANCE = [
  { icon: "ShieldCheck", title: "Model Requirement Agreed First", text: "Accuracy, level of detail, parameters and naming are agreed in writing before modelling or drawing production starts." },
  { icon: "BadgeCheck", title: "Checked Before Issue", text: "Model, drawing and schedule are checked against each other against a written checklist. Findings are returned, not quietly fixed." },
  { icon: "Clock", title: "Recheck After Correction", text: "A clash group is not closed on sight. It is re-tested at the agreed settings, and the recheck is recorded." },
  { icon: "GitMerge", title: "Revisions Recorded", text: "Every issue and revision carries its status in DatumBIM OS, so the record can be evidenced rather than asserted." },
  { icon: "Lock", title: "Confidentiality Respected", text: "Client drawings are used to price and deliver the work only. Nothing is published or reused as a portfolio example without written permission." },
];

// 6 core service categories (BIM Services doc — "Comprehensive BIM Consultancy Services").
export const SERVICE_GROUPS = [
  { icon: "Database", title: "Information Management", text: "Take control of project information with robust frameworks ensuring structure, security and accessibility.",
    items: ["ISO 19650 Implementation", "EIR Development", "BIM Execution Plans (BEP)", "CDE Management", "Data Validation"] },
  { icon: "Compass", title: "Strategic Support", text: "Partner with organizational leaders to develop clear BIM strategies aligned with business goals.",
    items: ["BIM Strategy & Roadmap", "Process Optimisation", "Training Programs", "Software Selection", "Capability Building"] },
  { icon: "Boxes", title: "3D Modelling & Coordination", text: "Create intelligent, data-rich models as the central hub ensuring accuracy and buildability.",
    items: ["Architectural BIM", "Structural BIM", "MEPF Coordination", "Facade Engineering", "Clash Detection"] },
  { icon: "Workflow", title: "Data Integration & Automation", text: "Liberate BIM data — connecting models to enterprise systems and creating powerful automations.",
    items: ["API Integration", "Database Solutions", "Automation Scripts", "Custom Tools", "ERP Connections"] },
  { icon: "ScanLine", title: "Reality Capture", text: "Advanced technologies create precise digital records of the physical world for renovations & digital twins.",
    items: ["3D Laser Scanning", "Photogrammetry", "Point Cloud Processing", "As-Built Models", "Scan-to-BIM"] },
  { icon: "FlaskConical", title: "Applied Research", text: "Benefit from the latest innovations through testing and implementing cutting-edge methodologies.",
    items: ["Industry Research", "Technology Testing", "Best-Practice Guides", "Benchmarking", "Innovation Pilots"] },
];

// 6 advanced service modules (BIM Services doc — "Advanced Service Modules").
export const ADVANCED_MODULES = [
  { tag: "ADVANCED", title: "Digital Twin & IoT Integration", text: "Moving beyond static as-built models to living digital twins with real-time sensor data.",
    items: ["IoT Sensor Integration", "Real-Time Performance Dashboards", "Predictive Maintenance Alerts", "Live Building Performance"] },
  { tag: "SUSTAINABILITY", title: "Sustainability & ESG Reporting", text: "Leverage BIM data for precise analysis to meet Environmental, Social & Governance goals.",
    items: ["Embodied Carbon Analysis", "LEED / ESTIDAMA / BREEAM Support", "Material Passports", "Circular Economy Assessment"] },
  { tag: "FABRICATION", title: "Supply Chain & Fabrication", text: "Extending BIM value directly to the factory floor, bridging design and fabrication.",
    items: ["Machine Data Integration", "Prefabrication Drawings", "CNC Data Export", "Supplier Portal"] },
  { tag: "INFRASTRUCTURE", title: "BIM for GIS Integration", text: "Connecting building-scale BIM with city / landscape-scale GIS data for masterplans.",
    items: ["Infrastructure Corridor Modelling", "Campus Management", "Planning Compliance", "Site Utilities Tracking"] },
  { tag: "LEGAL", title: "BIM Forensics & Disputes", text: "Forensic analysis using ISO 19650 audit trails for dispute resolution and claims.",
    items: ["Information Provenance Audits", "4D Delay Analysis", "Forensic Model Comparison", "Dispute Resolution Support"] },
  { tag: "OPERATIONAL", title: "Asset Information (AIM)", text: "Complete operational-phase management ensuring digital assets serve facilities for 50+ years.",
    items: ["Asset Handover Management", "COBie Data Drops", "FM Integration (CAFM)", "Long-term Data Strategy"] },
];

// LOD framework (Company Profile §6.1).
export const LOD_LEVELS = [
  { lod: "LOD 100", phase: "Conceptual", desc: "Approximate geometry, massing studies, conceptual cost estimation, area analysis." },
  { lod: "LOD 200", phase: "Schematic", desc: "Approximate geometry, basic systems, preliminary schedules, rough cost estimation." },
  { lod: "LOD 300", phase: "Design Dev.", desc: "Precise geometry, detailed components, coordinated systems, accurate schedules." },
  { lod: "LOD 350", phase: "CD Phase", desc: "Shop-drawing ready, fabrication details, installation information, coordinated." },
  { lod: "LOD 400", phase: "Fabrication", desc: "Fabrication model, detailed connections, erection sequences, fabrication data." },
  { lod: "LOD 500", phase: "As-Built", desc: "Verified from site conditions, as-constructed, FM-ready, complete asset data." },
];

// 6-phase BIM implementation process (Company Profile §6.2).
export const BIM_PROCESS = [
  { n: 1, title: "Project Setup", desc: "Establish CDE, create project execution plan, define LOD targets, set up family libraries." },
  { n: 2, title: "Model Development", desc: "Develop BIM models per discipline, implement levels of development, maintain standards." },
  { n: 3, title: "Coordination", desc: "Federate models, perform clash detection, conduct coordination meetings, resolve conflicts." },
  { n: 4, title: "Documentation", desc: "Generate drawings, produce schedules, extract quantities, create specifications." },
  { n: 5, title: "Construction Support", desc: "Shop-drawing development, site coordination, issue resolution, as-built updates." },
  { n: 6, title: "Handover", desc: "Verify as-built conditions, populate FM data, export COBie, deliver O&M manuals." },
];

// 4-step engagement process (BIM Services doc).
export const ENGAGEMENT = [
  { n: 1, title: "Discover & Diagnose", desc: "We analyse your workflows, identify gaps against ISO 19650, and understand your challenges through a Digital Construction Health Check." },
  { n: 2, title: "Propose & Demonstrate", desc: "A tailored solution with our Team Competency Matrix, QA/QC commitments and live demonstrations of our process and tools." },
  { n: 3, title: "Engage & Onboard", desc: "Seamless onboarding with Client-Portal access, kick-off workshops and a clear 30-day implementation roadmap." },
  { n: 4, title: "Deliver & Evolve", desc: "Weekly KPI dashboards, continuous improvement and long-term partnership for ongoing BIM support and digital-twin evolution." },
];

// Standards we work to. These are method references, not accreditation claims.
// The previous block asserted "Autodesk Gold Partner", "LEED AP", "ISO 9001" and
// "UKAS accredited" — third-party statuses that could not be evidenced. Withdrawn
// 2026-10-09; see Claims_Register.md.
export const CERTS = [
  { name: "ISO 19650", type: "Information management framework we work to", status: "Method" },
  { name: "BS 1192 / PAS 1192", type: "Common data environment workflow", status: "Method" },
  { name: "BIM Level 2", type: "Delivery configuration offered", status: "Offered" },
  { name: "Client and authority requirements", type: "Worked to as instructed per project", status: "Per project" },
];

// Core values (Company Profile §3.3).
export const VALUES = [
  { title: "Excellence", text: "We strive for excellence in everything we do, maintaining the highest standards of quality and professionalism." },
  { title: "Innovation", text: "We embrace new technologies and innovative solutions to deliver cutting-edge BIM services." },
  { title: "Integrity", text: "We conduct business with integrity, transparency and ethical practices, building long-term relationships." },
  { title: "Collaboration", text: "We believe in collaborative partnerships with clients, architects, contractors and consultants." },
  { title: "Continuous Improvement", text: "We continuously improve our processes, skills and services through training, innovation and feedback." },
];

// Delivery scope we offer. This is NOT a project portfolio. The previous block
// named eight third-party landmark developments with areas, sheet counts and
// municipality filings; none could be evidenced and none had publication
// permission. Withdrawn 2026-10-09 — see Claims_Register.md.
// Honest replacement: the work we offer, each startable at one discipline /
// one floor / a fixed sheet count. Demonstration sheets at /samples.
export const PORTFOLIO = [
  { name: "MEP Shop Drawings", loc: "From client-approved design", type: "One discipline or a fixed sheet count", area: "Layouts, sections, risers, schematics", lod: "Checked", status: "Offered", disc: ["All MEP"], note: "Dimensions, levels, tags, equipment details and schedules, checked against the model before issue." },
  { name: "MEP Coordination", loc: "One zone or one floor", type: "Federated review and clash resolution", area: "Routes, voids, access clearances", lod: "Rechecked", status: "Offered", disc: ["All MEP"], note: "Detection, grouping, ownership, approved correction, recheck, recorded closure. No clash-free guarantee." },
  { name: "MEP BIM Modelling", loc: "To an agreed model requirement", type: "Discipline models and exports", area: "Parameters, levels, naming", lod: "Per requirement", status: "Offered", disc: ["All MEP"], note: "Accuracy and level of detail agreed in writing before production starts." },
  { name: "Combined Services & Builders' Work", loc: "One floor", type: "Composite plans and sections", area: "Openings, sleeves, penetrations, plinths", lod: "Scheduled", status: "Offered", disc: ["Multi-trade"], note: "Coordinated from the resolved model. Structural adequacy stays with the responsible party." },
  { name: "MEP QA/QC", loc: "Per deliverable", type: "Model and drawing consistency check", area: "Parameters, systems, naming, schedules", lod: "Checklist", status: "Offered", disc: ["All MEP"], note: "Findings returned against a written checklist, traceable to a file, view or sheet." },
  { name: "As-Built & Handover", loc: "On authorised instructions only", type: "Final models, drawings and registers", area: "Revision history and asset data", lod: "As-built", status: "Offered", disc: ["All MEP"], note: "Nothing changed without an authorised instruction. Superseded revisions are archived." },
];

// Roles, not people. The previous block named four individuals with credentials
// and project credits; no evidence existed that they exist, hold those
// credentials, or consent to being named. Withdrawn 2026-10-09.
export const TEAM = [
  { initials: "01", name: "BIM Manager", role: "Owns the model requirement, naming convention and issue status", creds: "Named on appointment", projects: "—", tools: "Revit, Navisworks" },
  { initials: "02", name: "MEP Coordinator", role: "Runs federated review, assigns issues and records closures", creds: "Named on appointment", projects: "—", tools: "Revit, Navisworks, clash tooling" },
  { initials: "03", name: "MEP Modeller", role: "Produces discipline models to the agreed requirement", creds: "Named on appointment", projects: "—", tools: "Revit, families, Dynamo" },
  { initials: "04", name: "QA/QC Reviewer", role: "Independent check of model and drawing set before issue", creds: "Named on appointment", projects: "—", tools: "Checklists, model checking" },
  { initials: "05", name: "You — the client", role: "Approves design changes and accepts deliverables", creds: "—", projects: "—", tools: "—" },
];

// BIM-enabled products (BIM Services doc — "BIM-Enabled Tools").
export const PRODUCTS = [
  { title: "DATUM BIM Library", sub: "The Ultimate Source of Manufacturer-Specific BIM Content", items: ["50,000+ Components", "500+ Manufacturers", "Multi-Format Support", "IFC Compliant"] },
  { title: "DATUM BIM Viewer", sub: "Your Federated BIM Model. In Your Pocket.", items: ["Offline Access", "AR Integration", "Cloud Sync", "Markup & Annotations"] },
  { title: "Project Analytics Dashboard", sub: "Turn Your BIM Data into Actionable Insights", items: ["Custom Dashboards", "Cost Tracking", "AI-Powered Insights", "4D Progress Tracking"] },
  { title: "Automation Suite", sub: "Automate the Repetitive, Focus on the Creative", items: ["Automated Sheet Generation", "Intelligent Quantity Takeoff", "One-Click Family Creation", "Batch Operations"] },
];

// Software portfolio (Company Profile §10).
export const SOFTWARE = [
  "Autodesk Revit", "ArchiCAD", "Bentley MicroStation", "Tekla Structures", "Navisworks Manage",
  "AutoCAD", "Solibri", "Revizto", "BIM 360 / ACC", "Lumion", "Enscape", "Twinmotion",
  "FARO SCENE", "Leica Cyclone", "Trimble RealWorks", "ReCap Pro", "Dynamo", "IES VE",
];

// Sectors served.
export const SECTORS = ["Commercial", "Residential", "Healthcare", "Airports", "Infrastructure", "Hospitality", "Data Centers", "Heritage", "Industrial", "Mixed-Use"];

// The 7 service divisions (flagship = BIM) — used by data model & discipline chips.
export const SERVICES = [
  { code: "AR", name: "Architecture", tagline: "Design & documentation", color: "#7c8340",
    blurb: "Concept to construction documentation — space planning, detailing and coordinated architectural models to international standards." },
  { code: "ST", name: "Structural Engineering", tagline: "Analysis & detailing", color: "#5f6733",
    blurb: "Analysis-driven structural modeling, connection detailing and rebar coordination for RCC, steel, precast and post-tensioned systems." },
  { code: "ME", name: "Mechanical (HVAC)", tagline: "Comfort & air systems", color: "#a67d3c",
    blurb: "HVAC load calculations, ductwork and plant modeling coordinated clash-free with every other discipline." },
  { code: "EL", name: "Electrical", tagline: "Power & low-voltage", color: "#c19749",
    blurb: "Power, lighting, containment and low-voltage systems — designed, modeled and coordinated for buildability." },
  { code: "PL", name: "Plumbing", tagline: "Water & drainage", color: "#979d52",
    blurb: "Domestic water, sanitary and drainage design with fully routed, coordinated 3D services." },
  { code: "FP", name: "Fire Protection", tagline: "Life-safety systems", color: "#b3b877",
    blurb: "Sprinkler, alarm and life-safety design to code, coordinated with structure and MEP." },
  { code: "BIM", name: "BIM & Digital Delivery", tagline: "Flagship division", color: "#0d2a3a", flagship: true,
    blurb: "Our flagship: BEP authoring, federated coordination, clash detection, 4D/5D, Scan-to-BIM and digital twins under full ISO 19650 information management." },
];

// The Datum Group companies — brand logos in /public/brand.
export const GROUP = [
  { key: "bim", name: "DATUM BIM", logo: "/brand/datum-bim.png", tagline: "BIM & Digital Engineering", text: "The flagship digital-engineering practice delivering ISO 19650 BIM, MEP, structural and architectural production worldwide.", flagship: true },
  { key: "initiative", name: "DATUM INITIATIVE", logo: "/brand/datum-initiative.png", tagline: "Ventures & Innovation", text: "Incubating new ideas, R&D pilots and digital-construction ventures across the group." },
  { key: "central", name: "DATUM CENTRAL", logo: "/brand/datum-central.png", tagline: "Shared Services", text: "Central operations, finance, HR and IT infrastructure powering every Datum company." },
  { key: "capabilities", name: "DATUM CAPABILITIES", logo: "/brand/datum-capabilities.png", tagline: "Talent & Training", text: "Building world-class engineering talent through structured training and capability programs." },
  { key: "developments", name: "DATUM DEVELOPMENTS", logo: "/brand/datum-developments.png", tagline: "Real Estate & Development", text: "Property development and project origination bringing built assets to life." },
  { key: "holdings", name: "DATUM HOLDINGS", logo: "/brand/datum-holdings.png", tagline: "Group Holdings", text: "The parent investment vehicle stewarding long-term value across the Datum portfolio." },
  { key: "productions", name: "DATUM PRODUCTIONS", logo: "/brand/datum-productions.png", tagline: "Media & Visualization", text: "Architectural visualization, walkthroughs and media production for the built environment." },
  { key: "stores", name: "DATUM STORES", logo: "/brand/datum-stores.png", tagline: "Products & Supply", text: "Curated products, BIM content and supply solutions for the engineering ecosystem." },
];
