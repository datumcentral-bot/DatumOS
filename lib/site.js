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
  email: "info@datum-bim.com",
  phone: "+92 334 4063563",
  whatsapp: "+92 334 4063563",
  website: "www.datumstudios.com",
  addr: "Plot #42, Phase V, Industrial Area, Lahore, Pakistan",
  standards: ["ISO 9001:2015", "ISO 19650", "BS 19650", "BIM Level 2", "LEED AP"],
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
  { href: "/capabilities", label: "Capabilities" },
  { href: "/projects", label: "Projects" },
  { href: "/group", label: "Datum Group" },
  { href: "/careers", label: "Careers" },
  { href: "/contact", label: "Contact" },
];

export const SOCIALS = [
  { key: "linkedin", label: "LinkedIn", href: "https://www.linkedin.com/company/datum-bim-engineering" },
  { key: "instagram", label: "Instagram", href: "https://www.instagram.com/datumbim" },
  { key: "facebook", label: "Facebook", href: "https://www.facebook.com/datumbim" },
  { key: "youtube", label: "YouTube", href: "https://www.youtube.com/@datumbim" },
  { key: "x", label: "X", href: "https://x.com/datumbim" },
];

// Headline KPIs (Company Profile §1.2).
export const STATS = [
  { value: "250+", label: "BIM Projects Delivered" },
  { value: "30+", label: "Countries Served" },
  { value: "150+", label: "BIM Experts" },
  { value: "98%", label: "Client Satisfaction" },
  { value: "95%", label: "On-Time Delivery" },
  { value: "LOD 500", label: "Max Capability" },
];

// The 5-Point Delivery Assurance Guarantee (BIM Services doc).
export const ASSURANCE = [
  { icon: "ShieldCheck", title: "ISO 19650 Compliance", text: "Full adherence to international information-management standards with audit-ready documentation." },
  { icon: "BadgeCheck", title: "Certified Data Guarantee", text: "All deliverables meet the specified LOD/LOI — or we correct them at no cost." },
  { icon: "Clock", title: "On-Time Delivery", text: "Weekly milestone tracking with 48-hour risk notification and mitigation plans." },
  { icon: "GitMerge", title: "Coordination Certainty", text: "100% hard-clash detection above tolerance with weekly federated reports." },
  { icon: "Lock", title: "Security Guarantee", text: "ISO 19650-5 compliant data handling with NDAs and encrypted transfers." },
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

// Certifications & standards (Company Profile §7).
export const CERTS = [
  { name: "ISO 9001:2015", type: "Quality Management", status: "In Progress" },
  { name: "ISO 19650", type: "BIM Information Management", status: "Compliant" },
  { name: "BS 19650", type: "BIM British Standard", status: "Compliant" },
  { name: "BIM Level 2", type: "UKAS Accredited", status: "In Progress" },
  { name: "Autodesk Partner", type: "Certified Implementation", status: "Gold Partner" },
  { name: "LEED AP", type: "Sustainability", status: "Accredited" },
];

// Core values (Company Profile §3.3).
export const VALUES = [
  { title: "Excellence", text: "We strive for excellence in everything we do, maintaining the highest standards of quality and professionalism." },
  { title: "Innovation", text: "We embrace new technologies and innovative solutions to deliver cutting-edge BIM services." },
  { title: "Integrity", text: "We conduct business with integrity, transparency and ethical practices, building long-term relationships." },
  { title: "Collaboration", text: "We believe in collaborative partnerships with clients, architects, contractors and consultants." },
  { title: "Continuous Improvement", text: "We continuously improve our processes, skills and services through training, innovation and feedback." },
];

// Featured projects (Company Profile §8 + BIM Services portfolio).
export const PORTFOLIO = [
  { name: "Manarat Residence", loc: "Abu Dhabi, UAE", type: "Residential Towers", area: "85,000 m²", lod: "LOD 400", status: "Completed", disc: ["Architecture", "Structure", "MEP"], note: "4 towers (G+25). CDE workflow per BS 1192 & ISO 19650; clash detection resolved 850+ issues; 450+ sheets to Abu Dhabi Municipality." },
  { name: "Dubai Airport Terminal 4", loc: "Dubai, UAE", type: "Airport", area: "450,000 m²", lod: "LOD 500", status: "Completed", disc: ["Architecture", "Structure", "MEPF"], note: "Federated BIM model with ISO 19650 CDE protocols. Reduced coordination issues by 30%." },
  { name: "Riyadh KAFD District", loc: "Riyadh, KSA", type: "Commercial District", area: "850,000 m²", lod: "LOD 400", status: "In Progress", disc: ["Architecture", "Structure", "MEPF"], note: "Centralized information management for multiple towers with district-wide coordination." },
  { name: "Masdar City Square", loc: "Abu Dhabi, UAE", type: "Sustainable", area: "280,000 m²", lod: "LOD 350", status: "In Progress", disc: ["Architecture", "Structure", "MEPF"], note: "Sustainability-focused BIM with energy analysis. Achieving LEED / Estidama certifications." },
  { name: "Kingdom Tower Complex", loc: "Jeddah, KSA", type: "65-Story Tower", area: "320,000 m²", lod: "LOD 500", status: "Completed", disc: ["Architecture", "Structure", "MEP"], note: "Super-tall mixed-use tower with full-discipline coordination and fabrication-level modeling." },
  { name: "London Central Hospital", loc: "London, UK", type: "Healthcare", area: "220,000 m²", lod: "LOD 400", status: "In Progress", disc: ["Architecture", "Structure", "MEPF"], note: "ISO 19650 compliant with HTM/HBN standards. Structured for CAFM integration." },
  { name: "Doha Festival City", loc: "Doha, Qatar", type: "Shopping Mall", area: "210,000 m²", lod: "LOD 500", status: "Completed", disc: ["Architecture", "MEP", "Shop Drawings"], note: "Large-format retail with detailed MEP coordination and shop-drawing production." },
  { name: "NYC Campus", loc: "New York, USA", type: "Commercial", area: "380,000 m²", lod: "LOD 400", status: "Completed", disc: ["Architecture", "Facade", "MEPF"], note: "Parametric aluminium facade model driving fabrication with precision quality control." },
];

// Expert team (BIM Services doc — "Our Expert Team").
export const TEAM = [
  { initials: "AK", name: "Ahmed Khan", role: "Lead BIM Manager", creds: "ISO 19650 Certified · PMP", projects: "Dubai Airport, Riyadh Metro", tools: "Revit, Navisworks, Python" },
  { initials: "SM", name: "Sarah Miller", role: "Senior BIM Coordinator", creds: "Autodesk Certified Professional", projects: "Masdar City, Healthcare", tools: "Revit, Solibri, Dynamo" },
  { initials: "JR", name: "John Roberts", role: "Information Manager", creds: "ISO 19650 Certified · CDE Admin", projects: "KAFD District, Commercial", tools: "Aconex, BIM 360, IFC" },
  { initials: "LM", name: "Lisa Martinez", role: "MEPF Coordinator", creds: "MEP Certification", projects: "Hospitals, Airports", tools: "Revit, Navisworks, Fabrication" },
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
