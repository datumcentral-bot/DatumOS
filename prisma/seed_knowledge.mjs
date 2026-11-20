import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const articles = [
  // 01_BIM_Standards
  {
    title: "ISO 19650-1: Concepts and Principles",
    category: "01_BIM_Standards",
    subcategory: "ISO 19650 Series",
    visibility: "ALL",
    tags: "ISO,BIM,Standards,Information Management",
    content: `## ISO 19650-1 Overview\n\nISO 19650-1 establishes the concepts and principles for information management using building information modelling (BIM) across the whole life cycle of a built asset.\n\n### Key Concepts\n- **Information Model**: A set of structured and unstructured information containers\n- **Common Data Environment (CDE)**: A single source of information for a given project\n- **Information Container**: A named persistent set of information retrievable from within a file, system or application storage hierarchy\n\n### Information Management Process\n1. Assessment and need\n2. Invitation to tender\n3. Tender response\n4. Appointment\n5. Mobilization\n6. Collaborative production of information\n7. Information model delivery\n8. Project close-out\n\n### Appointing Party Responsibilities\n- Define the Organizational Information Requirements (OIR)\n- Prepare the Exchange Information Requirements (EIR)\n- Assess BIM capability of lead appointed parties\n- Establish the CDE solution\n\n### Appointed Party Responsibilities\n- Prepare the BIM Execution Plan (BEP)\n- Establish the Master Information Delivery Plan (MIDP)\n- Coordinate Task Information Delivery Plans (TIDP)\n- Deliver information models at agreed milestones`,
  },
  {
    title: "ISO 19650-2: Delivery Phase of Assets",
    category: "01_BIM_Standards",
    subcategory: "ISO 19650 Series",
    visibility: "ALL",
    tags: "ISO,BIM,Delivery,Construction",
    content: `## ISO 19650-2: Delivery Phase\n\nISO 19650-2 specifies requirements for information management during the delivery phase of assets using BIM.\n\n### Pre-Appointment Activities\n- **EIR Review**: Assess the Exchange Information Requirements\n- **BEP (Pre-contract)**: Prepare the pre-contract BIM Execution Plan\n- **Capability Assessment**: Evaluate team BIM capability\n- **Risk Assessment**: Identify information management risks\n\n### Post-Appointment Activities\n- **BEP (Post-contract)**: Finalize the BIM Execution Plan\n- **MIDP**: Establish Master Information Delivery Plan\n- **TIDP**: Each task team prepares Task Information Delivery Plan\n- **Mobilization**: Set up CDE, software, and workflows\n\n### Information Delivery Milestones\n| Stage | Deliverable | Format |\n|-------|-------------|--------|\n| RIBA 2 | Concept Design Model | IFC/RVT |\n| RIBA 3 | Developed Design Model | IFC/RVT |\n| RIBA 4 | Technical Design Model | IFC/RVT |\n| RIBA 5 | Construction Model | IFC/RVT |\n| RIBA 6 | As-Built Model | IFC/RVT |\n\n### Quality Assurance\n- Information container naming convention compliance\n- Metadata completeness check\n- Clash detection and resolution\n- COBie data validation`,
  },
  {
    title: "PAS 1192-2: BIM Level 2 Requirements",
    category: "01_BIM_Standards",
    subcategory: "PAS 1192",
    visibility: "ALL",
    tags: "PAS,BIM Level 2,UK Standards",
    content: `## PAS 1192-2 Overview\n\nPAS 1192-2 specifies requirements for achieving BIM Level 2 on construction projects. It has been largely superseded by ISO 19650 but remains relevant for UK projects.\n\n### BIM Level 2 Requirements\n- Collaborative 3D BIM\n- Federated models (not single model)\n- Common Data Environment (CDE)\n- Defined information exchange at project stages\n\n### Key Documents\n- **EIR**: Employer's Information Requirements\n- **BEP**: BIM Execution Plan\n- **MIDP**: Master Information Delivery Plan\n- **TIDP**: Task Information Delivery Plan\n\n### CDE Workflow States\n1. **WIP (Work in Progress)**: Active development\n2. **Shared**: Available for coordination\n3. **Published**: Approved for use\n4. **Archived**: Historical record\n\n### Naming Convention\nFormat: \`[Project]-[Originator]-[Volume/System]-[Level/Location]-[Type]-[Role]-[Number]\`\nExample: \`PROJ-DBC-ZZ-00-M3-A-0001\``,
  },
  // 02_BIM_Execution_Plans
  {
    title: "Pre-Contract BEP Template Guide",
    category: "02_BIM_Execution_Plans",
    subcategory: "BEP Templates",
    visibility: "DIRECTOR",
    tags: "BEP,Pre-contract,Template",
    content: `## Pre-Contract BEP Guide\n\nThe Pre-Contract BIM Execution Plan (BEP) is prepared by the lead appointed party in response to the Exchange Information Requirements (EIR) before appointment.\n\n### Required Sections\n\n#### 1. Project Information\n- Project name, number, and description\n- Client/Appointing party details\n- Project timeline and key milestones\n\n#### 2. BIM Goals and Uses\n- Primary BIM uses (Design Coordination, Clash Detection, etc.)\n- Secondary BIM uses (4D, 5D, 6D)\n- Software and technology stack\n\n#### 3. Team Capability Assessment\n- BIM roles and responsibilities\n- Software competency matrix\n- Training requirements\n\n#### 4. Information Delivery Strategy\n- Model breakdown structure\n- Information delivery milestones\n- File naming conventions\n\n#### 5. CDE Strategy\n- Platform selection (ACC, BIM 360, Aconex)\n- Folder structure\n- Access permissions\n- Workflow states\n\n#### 6. Quality Assurance\n- Model checking procedures\n- Clash detection protocol\n- Information validation process\n\n### Submission Requirements\n- Submit within 14 days of tender\n- Include team CVs and project references\n- Provide software license evidence`,
  },
  {
    title: "Post-Contract BEP Development",
    category: "02_BIM_Execution_Plans",
    subcategory: "BEP Templates",
    visibility: "DIRECTOR",
    tags: "BEP,Post-contract,Execution",
    content: `## Post-Contract BEP Development\n\nThe Post-Contract BEP is developed after appointment and becomes the governing document for information management throughout the project.\n\n### Development Process\n1. Review and update pre-contract BEP\n2. Incorporate client feedback\n3. Coordinate with all task teams\n4. Finalize MIDP and TIDP\n5. Obtain client approval\n\n### Additional Sections vs Pre-Contract\n- Detailed MIDP with all delivery dates\n- Individual TIDP for each discipline\n- Confirmed software versions\n- Agreed model breakdown structure\n- Clash detection matrix\n- COBie data requirements\n\n### MIDP Structure\n| Deliverable | Responsible | Due Date | Format | Status |\n|-------------|-------------|----------|--------|---------|\n| Arch Model Stage 2 | Architect | Week 8 | RVT/IFC | Pending |\n| Struct Model Stage 2 | Engineer | Week 10 | RVT/IFC | Pending |\n| MEP Model Stage 2 | MEP Eng | Week 12 | RVT/IFC | Pending |\n\n### Review Cycle\n- Monthly BEP review meetings\n- Update after each design stage\n- Document all changes with revision history`,
  },
  // 03_Information_Requirements
  {
    title: "Organizational Information Requirements (OIR)",
    category: "03_Information_Requirements",
    subcategory: "OIR",
    visibility: "DIRECTOR",
    tags: "OIR,Information Requirements,Asset Management",
    content: `## Organizational Information Requirements (OIR)\n\nOIR defines the information needed by an organization to support its asset management objectives and decisions.\n\n### Purpose\n- Support strategic asset management decisions\n- Enable portfolio-level reporting\n- Drive Exchange Information Requirements (EIR)\n\n### OIR Categories\n\n#### Asset Performance\n- Energy consumption data\n- Maintenance cost history\n- Occupancy and utilization rates\n- Condition assessments\n\n#### Compliance\n- Regulatory compliance status\n- Safety certifications\n- Environmental permits\n- Warranty information\n\n#### Financial\n- Capital expenditure tracking\n- Operational cost benchmarking\n- Asset valuation data\n- Insurance information\n\n### OIR to EIR Cascade\n\`\`\`\nOIR (Organization Level)\n  └── AIR (Asset Level)\n        └── EIR (Project Level)\n              └── BEP (Delivery Response)\n\`\`\`\n\n### Information Granularity\n- Level 1: Portfolio summary\n- Level 2: Asset type\n- Level 3: Individual asset\n- Level 4: Component level`,
  },
  {
    title: "Exchange Information Requirements (EIR) Framework",
    category: "03_Information_Requirements",
    subcategory: "EIR",
    visibility: "ALL",
    tags: "EIR,Information Exchange,Client Requirements",
    content: `## Exchange Information Requirements (EIR)\n\nThe EIR defines what information the appointing party requires from the appointed party at each stage of the project.\n\n### EIR Structure\n\n#### Technical Requirements\n- Software and file formats\n- Model breakdown structure\n- Level of Information Need (LOIN)\n- Coordinate system and units\n- Classification system (Uniclass 2015)\n\n#### Management Requirements\n- BIM roles and responsibilities\n- Collaboration procedures\n- Health and safety requirements\n- Security requirements\n\n#### Commercial Requirements\n- Information delivery milestones\n- Payment linked to information delivery\n- Intellectual property rights\n- Data security obligations\n\n### Level of Information Need (LOIN)\nReplaces LOD (Level of Development) in ISO 19650:\n- **Geometry**: Physical representation detail\n- **Alphanumeric**: Non-geometric information\n- **Documentation**: Supporting documents\n\n### Acceptance Criteria\n- Model passes automated checking\n- Naming convention compliance: 100%\n- Required attributes populated: >95%\n- No critical clashes unresolved`,
  },
  // 04_CDE
  {
    title: "Common Data Environment (CDE) Setup Guide",
    category: "04_CDE_Common_Data_Environment",
    subcategory: "CDE Setup",
    visibility: "ALL",
    tags: "CDE,Autodesk,BIM 360,ACC,Setup",
    content: `## CDE Setup Guide\n\nThe Common Data Environment (CDE) is the single source of information for a project, enabling collaboration and information management.\n\n### Platform Options\n| Platform | Provider | Best For |\n|----------|----------|----------|\n| Autodesk Construction Cloud (ACC) | Autodesk | Large projects, Revit-heavy |\n| BIM 360 | Autodesk | Legacy projects |\n| Aconex | Oracle | Document management |\n| Trimble Connect | Trimble | Multi-software |\n| Dalux | Dalux | Mobile-first |\n\n### Folder Structure (ISO 19650)\n\`\`\`\nProject Root/\n├── WIP/\n│   ├── Architecture/\n│   ├── Structure/\n│   └── MEP/\n├── Shared/\n│   ├── Coordination/\n│   └── Reference/\n├── Published/\n│   ├── Stage_2/\n│   ├── Stage_3/\n│   └── Stage_4/\n└── Archive/\n    └── Superseded/\n\`\`\`\n\n### Access Control Matrix\n| Role | WIP | Shared | Published | Archive |\n|------|-----|--------|-----------|----------|\n| BIM Manager | R/W | R/W | R/W | R |\n| Discipline Lead | R/W | R/W | R | R |\n| Team Member | R/W | R | R | - |\n| Client | - | R | R | R |\n\n### Workflow States\n1. **WIP**: Work in progress, not shared\n2. **Shared**: Available for coordination review\n3. **Published**: Client-approved deliverable\n4. **Archived**: Superseded, historical record`,
  },
  // 05_Model_Production
  {
    title: "LOD/LOI Specification Matrix",
    category: "05_Model_Production",
    subcategory: "LOD Specifications",
    visibility: "ALL",
    tags: "LOD,LOI,Level of Development,Modeling",
    content: `## LOD/LOI Specification Matrix\n\n### Level of Development (LOD) Definitions\n\n| LOD | Stage | Description |\n|-----|-------|-------------|\n| 100 | Concept | Conceptual representation, approximate size/shape |\n| 200 | Schematic | Generic system with approximate quantities |\n| 300 | Design Development | Specific system with accurate quantities |\n| 350 | Construction Documents | Detailed for coordination |\n| 400 | Fabrication | Fabrication-ready with full detail |\n| 500 | As-Built | Verified field conditions |\n\n### Level of Information (LOI) by Discipline\n\n#### Architecture (LOD 300)\n- Room names and numbers\n- Door/window schedules\n- Material specifications\n- Fire ratings\n\n#### Structure (LOD 350)\n- Member sizes and grades\n- Connection details\n- Foundation types\n- Load capacities\n\n#### MEP (LOD 300)\n- System types and capacities\n- Equipment specifications\n- Duct/pipe sizes\n- Control sequences\n\n### Modeling Guidelines\n- Use shared coordinates from day 1\n- Link models, don't merge\n- Purge unused families monthly\n- Use Uniclass 2015 for classification\n- Maintain model file size <200MB per discipline`,
  },
  // 06_Clash_Detection
  {
    title: "Clash Detection Protocol and Tolerance Matrix",
    category: "06_Clash_Detection",
    subcategory: "Clash Rules",
    visibility: "ALL",
    tags: "Clash Detection,Navisworks,Coordination,Tolerance",
    content: `## Clash Detection Protocol\n\n### Clash Types\n| Type | Description | Priority |\n|------|-------------|----------|\n| Hard Clash | Physical intersection | Critical |\n| Soft Clash | Clearance violation | High |\n| Workflow Clash | Sequence conflict | Medium |\n| Duplicate | Same element twice | Low |\n\n### Tolerance Matrix\n| Discipline Pair | Hard Clash Tolerance | Soft Clash Clearance |\n|-----------------|---------------------|---------------------|\n| Arch vs Struct | 0mm | 25mm |\n| Struct vs MEP | 0mm | 50mm |\n| MEP vs MEP | 0mm | 25mm |\n| Arch vs MEP | 0mm | 50mm |\n\n### Navisworks Clash Rules\n\`\`\`\nRule 1: Structural vs MEP\n- Type: Hard\n- Tolerance: 0mm\n- Selection A: Structure layer\n- Selection B: MEP layer\n- Exclude: Hangers, supports\n\nRule 2: MEP Clearance\n- Type: Soft\n- Tolerance: 50mm\n- Selection A: Ductwork\n- Selection B: Pipework\n\`\`\`\n\n### Clash Resolution Workflow\n1. Run clash detection (weekly minimum)\n2. Export clash report to BCF format\n3. Assign clashes to responsible discipline\n4. Resolution deadline: 5 working days\n5. Re-run detection to verify resolution\n6. Document in clash log\n\n### Clash Meeting Agenda\n- Review new clashes from last run\n- Status update on assigned clashes\n- Escalate unresolved critical clashes\n- Update clash log`,
  },
  // 07_COBie
  {
    title: "COBie Data Requirements and Validation",
    category: "07_COBie_Data",
    subcategory: "COBie Spreadsheets",
    visibility: "DIRECTOR",
    tags: "COBie,Asset Data,FM,Handover",
    content: `## COBie Data Requirements\n\nConstruction Operations Building Information Exchange (COBie) is a data format for the exchange of information about managed assets.\n\n### COBie Sheets\n| Sheet | Description | Populated By |\n|-------|-------------|-------------|\n| Facility | Building information | Architect |\n| Floor | Level information | Architect |\n| Space | Room data | Architect |\n| Zone | Space groupings | Architect |\n| Type | Asset type data | All disciplines |\n| Component | Individual assets | All disciplines |\n| System | System groupings | MEP |\n| Assembly | Sub-assemblies | All |\n| Connection | System connections | MEP |\n| Spare | Spare parts | Contractor |\n| Resource | Maintenance resources | FM |\n| Job | Maintenance tasks | FM |\n| Document | Related documents | All |\n\n### Required Attributes (Minimum)\n- Name (unique identifier)\n- Description\n- Category (Uniclass 2015)\n- Manufacturer\n- Model Number\n- Serial Number (at handover)\n- Warranty Duration\n- Installation Date\n\n### Validation Rules\n- No blank required fields\n- Unique names within each sheet\n- Valid category codes\n- Date format: YYYY-MM-DD\n- Cross-reference integrity between sheets\n\n### Delivery Schedule\n- Stage 4: Type and Component data\n- Stage 5: Serial numbers and installation dates\n- Stage 6: As-built with all FM data`,
  },
  // 08_Digital_Twin
  {
    title: "Digital Twin Framework for Built Assets",
    category: "08_Digital_Twin",
    subcategory: "Digital Twin Frameworks",
    visibility: "DIRECTOR",
    tags: "Digital Twin,IoT,Smart Building,Asset Management",
    content: `## Digital Twin Framework\n\n### Definition\nA digital twin is a virtual representation of a physical asset that is updated with real-time data throughout its lifecycle.\n\n### Maturity Levels\n| Level | Description | Technology |\n|-------|-------------|------------|\n| 1 | Static BIM model | Revit/IFC |\n| 2 | BIM + documents | CDE + BIM |\n| 3 | BIM + IoT sensors | BIM + SCADA |\n| 4 | Predictive analytics | AI + ML |\n| 5 | Autonomous optimization | Full AI |\n\n### Data Sources\n- BIM model (geometry + attributes)\n- IoT sensors (temperature, occupancy, energy)\n- BMS/SCADA systems\n- CMMS (maintenance records)\n- ERP (financial data)\n- Weather data\n\n### Implementation Roadmap\n1. **Phase 1**: Establish BIM as-built model\n2. **Phase 2**: Connect IoT sensors\n3. **Phase 3**: Integrate with BMS\n4. **Phase 4**: Implement analytics dashboard\n5. **Phase 5**: Predictive maintenance\n\n### Platform Options\n- Autodesk Tandem\n- Bentley iTwin\n- Microsoft Azure Digital Twins\n- Siemens MindSphere\n- IBM Maximo\n\n### ROI Metrics\n- 15-25% reduction in maintenance costs\n- 10-20% energy savings\n- 30% reduction in unplanned downtime\n- 5-10% increase in asset lifespan`,
  },
  // 09_Classification
  {
    title: "Uniclass 2015 Classification System Guide",
    category: "09_Classification_Systems",
    subcategory: "Uniclass 2015",
    visibility: "ALL",
    tags: "Uniclass,Classification,BIM,UK Standards",
    content: `## Uniclass 2015 Guide\n\nUniclass 2015 is the unified classification system for the UK construction industry, used for organizing information about the built environment.\n\n### Table Structure\n| Table | Code | Description |\n|-------|------|-------------|\n| Activities | Ac | What happens in/around assets |\n| Complexes | Co | Groups of entities |\n| Entities | En | Discrete built objects |\n| Spaces/locations | SL | Spaces within entities |\n| Elements/functions | EF | Parts of entities |\n| Systems | Ss | Combinations of products |\n| Products | Pr | Manufactured items |\n| Tools | Te | Equipment for construction |\n| Construction resources | Zz | Resources used |\n\n### Common Codes for BIM\n\`\`\`\nSs_20_10_30 - Structural framing systems\nSs_30_10_30 - External wall systems\nSs_45_10_30 - Heating systems\nSs_50_10_30 - Electrical systems\nPr_20_93_47 - Structural steel members\nPr_30_59_64 - Roof coverings\n\`\`\`\n\n### Implementation in Revit\n1. Add Uniclass code as shared parameter\n2. Apply to all families\n3. Export to schedule for COBie\n4. Validate against Uniclass database\n\n### Benefits\n- Consistent information across disciplines\n- Enables automated data exchange\n- Supports COBie export\n- Facilitates FM system integration`,
  },
  // 10_Software_Guides
  {
    title: "Autodesk Revit Best Practices for BIM",
    category: "10_Software_Guides",
    subcategory: "Revit",
    visibility: "ALL",
    tags: "Revit,Autodesk,BIM,Modeling,Best Practices",
    content: `## Revit Best Practices\n\n### Project Setup\n1. Use shared coordinates from day 1\n2. Set project units (metric/imperial)\n3. Configure browser organization\n4. Set up worksets for collaboration\n5. Define view templates\n\n### Workset Strategy\n\`\`\`\nWorksets:\n- Architecture (default)\n- Structure\n- MEP\n- Site\n- Shared Levels and Grids\n- Linked Models\n\`\`\`\n\n### File Naming Convention\n\`[Project]-[Discipline]-[Description]-[Revision].rvt\`\nExample: \`PROJ-ARCH-Level-01-Floor-Plan-R01.rvt\`\n\n### Performance Optimization\n- Keep file size <200MB\n- Purge unused families monthly\n- Use design options sparingly\n- Avoid in-place families\n- Use linked models for large projects\n\n### Collaboration Workflow\n1. Open central model\n2. Create local copy\n3. Work in local copy\n4. Sync to central regularly (every 2 hours)\n5. Relinquish worksets when done\n\n### Quality Checks\n- Run model checker (Solibri/Revit Model Review)\n- Check for warnings (keep <500)\n- Validate shared parameters\n- Verify coordinate alignment with linked models\n\n### Export Settings\n- IFC: Use IFC 2x3 or IFC 4\n- NWC: Use Navisworks exporter\n- DWG: Use AIA layer standards`,
  },
  {
    title: "Navisworks Coordination Workflow",
    category: "10_Software_Guides",
    subcategory: "Navisworks",
    visibility: "ALL",
    tags: "Navisworks,Clash Detection,4D,Coordination",
    content: `## Navisworks Coordination Workflow\n\n### File Formats\n- NWD: Published, read-only\n- NWF: Working file with links\n- NWC: Cache file from Revit/AutoCAD\n\n### Model Aggregation\n1. Export NWC from each discipline\n2. Create NWF and link all NWC files\n3. Verify coordinate alignment\n4. Set up selection sets by discipline\n5. Configure clash tests\n\n### Clash Detection Setup\n\`\`\`\nTest 1: Architecture vs Structure\n- Type: Hard\n- Tolerance: 0mm\n- Self-intersect: No\n\nTest 2: MEP vs Structure\n- Type: Hard + Soft\n- Hard tolerance: 0mm\n- Soft tolerance: 50mm\n\nTest 3: MEP vs MEP\n- Type: Hard + Soft\n- Hard tolerance: 0mm\n- Soft tolerance: 25mm\n\`\`\`\n\n### 4D Simulation\n1. Import project schedule (MPP/XER)\n2. Link model elements to tasks\n3. Set simulation settings\n4. Run and review simulation\n5. Export video for client presentation\n\n### BCF Workflow\n1. Export clashes as BCF\n2. Import BCF in Revit/Archicad\n3. Assign to responsible party\n4. Resolve and mark as closed\n5. Re-export for verification`,
  },
  // 11_Project_Templates
  {
    title: "Project Setup Checklist",
    category: "11_Project_Templates",
    subcategory: "Project Setup",
    visibility: "ALL",
    tags: "Checklist,Project Setup,BIM,Kickoff",
    content: `## Project Setup Checklist\n\n### Week 1: Foundation\n- [ ] Receive and review EIR from client\n- [ ] Prepare pre-contract BEP\n- [ ] Set up CDE (folder structure, permissions)\n- [ ] Establish shared coordinates\n- [ ] Create Revit template files\n- [ ] Set up naming convention register\n- [ ] Schedule BIM kickoff meeting\n\n### Week 2: Team Setup\n- [ ] Assign BIM roles (BIM Manager, Coordinators)\n- [ ] Conduct BIM kickoff meeting\n- [ ] Distribute BEP to all parties\n- [ ] Set up collaboration tools\n- [ ] Configure clash detection tests\n- [ ] Establish weekly coordination meeting schedule\n\n### Week 3: Production Start\n- [ ] Confirm model breakdown structure\n- [ ] Verify all teams have CDE access\n- [ ] First model upload to CDE\n- [ ] Run initial clash detection\n- [ ] Review and approve MIDP\n- [ ] Confirm software versions\n\n### Ongoing (Weekly)\n- [ ] Clash detection run\n- [ ] Model coordination meeting\n- [ ] CDE housekeeping\n- [ ] Progress against MIDP\n- [ ] Issue resolution tracking\n\n### Stage Gate Checks\n- [ ] Model completeness vs LOD requirements\n- [ ] Naming convention compliance\n- [ ] COBie data completeness\n- [ ] Client approval obtained\n- [ ] Archive previous stage`,
  },
  // 12_Quality_Assurance
  {
    title: "BIM Quality Assurance Procedures",
    category: "12_Quality_Assurance",
    subcategory: "QA/QC Checklists",
    visibility: "ALL",
    tags: "QA,QC,Model Audit,Quality,Checking",
    content: `## BIM Quality Assurance Procedures\n\n### Model Audit Checklist\n\n#### File Health\n- [ ] File size within limits (<200MB)\n- [ ] Warnings count acceptable (<500)\n- [ ] No corrupt elements\n- [ ] Purged of unused content\n\n#### Geometry\n- [ ] No overlapping elements\n- [ ] Correct level assignments\n- [ ] Proper use of worksets\n- [ ] Shared coordinates verified\n\n#### Information\n- [ ] Required parameters populated\n- [ ] Uniclass codes applied\n- [ ] Room/space data complete\n- [ ] Material specifications assigned\n\n#### Naming Convention\n- [ ] File name compliant\n- [ ] View names compliant\n- [ ] Sheet names compliant\n- [ ] Family names compliant\n\n### Automated Checking Tools\n| Tool | Purpose | Frequency |\n|------|---------|----------|\n| Solibri | Model checking | Weekly |\n| Navisworks | Clash detection | Weekly |\n| BIM Collab | Issue tracking | Ongoing |\n| Revit Model Review | Revit-specific | Monthly |\n\n### Issue Classification\n- **Critical**: Must fix before sharing\n- **Major**: Fix within 5 days\n- **Minor**: Fix at next revision\n- **Info**: No action required\n\n### Audit Report Template\n1. Executive summary\n2. Model statistics\n3. Issues by category\n4. Trend analysis\n5. Recommendations`,
  },
  // 13_Health_Safety
  {
    title: "4D BIM for Construction Safety Planning",
    category: "13_Health_Safety_BIM",
    subcategory: "4D Safety Planning",
    visibility: "ALL",
    tags: "4D BIM,Safety,Construction,Planning,CDM",
    content: `## 4D BIM for Safety Planning\n\n### Overview\n4D BIM links the 3D model to the construction programme to visualize construction sequences and identify safety risks before work begins.\n\n### CDM 2015 Integration\n- Principal Designer uses 4D to review design for buildability\n- Principal Contractor uses 4D for method statements\n- Identify hazards during design stage\n- Document risk elimination/reduction measures\n\n### Safety Use Cases\n\n#### Temporary Works\n- Visualize scaffolding erection sequence\n- Identify conflicts with permanent works\n- Plan crane positions and radii\n- Sequence excavation and shoring\n\n#### Logistics Planning\n- Site access and egress routes\n- Material delivery zones\n- Welfare facility locations\n- Emergency evacuation routes\n\n#### Hazard Identification\n- Working at height zones\n- Confined space identification\n- Overhead power line clearances\n- Underground service conflicts\n\n### 4D Simulation Process\n1. Import programme (P6/MS Project)\n2. Link model elements to activities\n3. Add temporary works models\n4. Run simulation\n5. Review with safety team\n6. Document findings in risk register\n\n### Deliverables\n- 4D simulation video\n- Safety risk register\n- Method statement support\n- Toolbox talk materials`,
  },
  // 14_Sustainability
  {
    title: "6D BIM for Sustainability and Energy Analysis",
    category: "14_Sustainability_BIM",
    subcategory: "6D Sustainability",
    visibility: "ALL",
    tags: "6D BIM,Sustainability,Energy,LEED,BREEAM",
    content: `## 6D BIM for Sustainability\n\n### What is 6D BIM?\n6D BIM adds sustainability and energy data to the 3D model, enabling analysis of environmental performance throughout the building lifecycle.\n\n### Sustainability Certifications\n| Certification | Region | Key Requirements |\n|---------------|--------|------------------|\n| BREEAM | UK/Europe | Energy, water, materials, ecology |\n| LEED | USA/Global | Energy, water, indoor quality |\n| ESTIDAMA | UAE | Pearl rating system |\n| Green Star | Australia | Energy, water, IEQ |\n\n### Energy Analysis Workflow\n1. Create energy model from BIM\n2. Define thermal zones\n3. Assign material properties\n4. Set HVAC systems\n5. Run energy simulation\n6. Optimize design\n7. Document savings\n\n### Tools Integration\n- Revit → Insight (energy analysis)\n- Revit → IES VE (detailed simulation)\n- Revit → EnergyPlus (open source)\n- Revit → Sefaira (real-time feedback)\n\n### Key Metrics\n- Energy Use Intensity (EUI): kWh/m²/year\n- Carbon emissions: kgCO2e/m²/year\n- Daylight factor: %\n- Water consumption: L/person/day\n\n### BIM Data Requirements for Sustainability\n- U-values for all envelope elements\n- Window-to-wall ratio\n- Glazing solar heat gain coefficient\n- HVAC system efficiencies\n- Occupancy schedules\n- Lighting power density`,
  },
  // 15_Legal_Contractual
  {
    title: "BIM Protocol and Scope of Services",
    category: "15_Legal_Contractual",
    subcategory: "BIM Protocol Templates",
    visibility: "DIRECTOR",
    tags: "BIM Protocol,Legal,Contract,CIC,Scope",
    content: `## BIM Protocol and Scope of Services\n\n### CIC BIM Protocol\nThe Construction Industry Council (CIC) BIM Protocol is a supplementary legal agreement that can be incorporated into professional services contracts.\n\n### Key Provisions\n\n#### Intellectual Property\n- Model ownership remains with creator\n- License granted to appointing party for project use\n- No transfer of IP without written agreement\n- Third-party software licenses responsibility\n\n#### Liability\n- Information provided "as is" for coordination\n- No warranty for downstream use\n- Liability limited to direct losses\n- Professional indemnity insurance requirements\n\n#### Information Manager Role\n- Appointed by client\n- Manages CDE\n- Coordinates information delivery\n- Not responsible for design content\n\n### BIM Scope of Services\n\n#### Basic BIM Services (Included)\n- 3D coordination model\n- Clash detection\n- CDE management\n- BEP preparation\n- MIDP/TIDP management\n\n#### Enhanced BIM Services (Additional Fee)\n- 4D construction simulation\n- 5D cost estimation\n- 6D energy analysis\n- Digital twin setup\n- COBie data preparation\n- Scan-to-BIM\n\n### Fee Structure\n| Service | Typical Fee % |\n|---------|---------------|\n| Basic BIM | 2-3% of construction cost |\n| Enhanced BIM | 1-2% additional |\n| Digital Twin | 0.5-1% additional |\n\n### Contract Checklist\n- [ ] BIM Protocol attached to contract\n- [ ] EIR referenced in contract\n- [ ] BEP approval process defined\n- [ ] Information delivery milestones in programme\n- [ ] Payment linked to information delivery\n- [ ] Dispute resolution for information issues`,
  },
];

async function main() {
  console.log("Seeding Knowledge Base articles...");
  
  // Clear existing
  await prisma.knowledgeArticle.deleteMany({});
  
  for (const article of articles) {
    await prisma.knowledgeArticle.create({ data: article });
    process.stdout.write(".");
  }
  
  console.log(`\nSeeded ${articles.length} knowledge articles successfully!`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
