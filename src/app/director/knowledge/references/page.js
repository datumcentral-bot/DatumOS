"use client";

const REFERENCES = [
  { category: "ISO Standards", items: [
    { title: "ISO 19650-1:2018", desc: "Concepts and principles", url: "https://www.iso.org/standard/68078.html" },
    { title: "ISO 19650-2:2018", desc: "Delivery phase of assets", url: "https://www.iso.org/standard/68080.html" },
    { title: "ISO 19650-3:2020", desc: "Operational phase of assets", url: "https://www.iso.org/standard/75056.html" },
    { title: "ISO 19650-5:2020", desc: "Security-minded approach", url: "https://www.iso.org/standard/77661.html" },
  ]},
  { category: "UK Standards", items: [
    { title: "PAS 1192-2:2013", desc: "BIM Level 2 delivery phase", url: "https://www.bsigroup.com" },
    { title: "BS EN ISO 19650", desc: "UK National Annex", url: "https://www.bsigroup.com" },
    { title: "CIC BIM Protocol", desc: "Legal framework for BIM", url: "https://www.cic.org.uk" },
  ]},
  { category: "UAE / GCC Standards", items: [
    { title: "Dubai BIM Mandate", desc: "Dubai Municipality BIM requirements", url: "https://www.dm.gov.ae" },
    { title: "Abu Dhabi BIM Guidelines", desc: "ADAC BIM requirements", url: "https://www.adac.ae" },
    { title: "NEOM BIM Standards", desc: "NEOM project BIM requirements", url: "https://www.neom.com" },
  ]},
  { category: "Software Resources", items: [
    { title: "Autodesk Knowledge Network", desc: "Revit, Navisworks, ACC documentation", url: "https://knowledge.autodesk.com" },
    { title: "Trimble Connect Help", desc: "Trimble Connect documentation", url: "https://connect.trimble.com" },
    { title: "Solibri Academy", desc: "Model checking tutorials", url: "https://www.solibri.com/academy" },
    { title: "BIM Collab", desc: "BCF issue management", url: "https://www.bimcollab.com" },
  ]},
  { category: "Industry Bodies", items: [
    { title: "buildingSMART International", desc: "Open BIM standards (IFC, BCF)", url: "https://www.buildingsmart.org" },
    { title: "RICS BIM Resources", desc: "5D BIM and cost management", url: "https://www.rics.org" },
    { title: "CIOB BIM Hub", desc: "BIM for construction managers", url: "https://www.ciob.org" },
    { title: "NBS National BIM Library", desc: "BIM objects and specifications", url: "https://www.nationalbimlibrary.com" },
  ]},
];

export default function ReferencesPage() {
  return (
    <div style={{ padding: "1.5rem", fontFamily: "'Rajdhani', sans-serif", color: "#f0f2f5" }}>
      <h1 style={{ fontFamily: "'Orbitron', sans-serif", fontSize: "1rem", color: "#fff", letterSpacing: "2px", marginBottom: "0.25rem" }}>🔗 EXTERNAL REFERENCES</h1>
      <p style={{ fontSize: "0.8rem", color: "#6b8e23", letterSpacing: "1px", marginBottom: "1.5rem" }}>ISO STANDARDS · UK STANDARDS · UAE MANDATES · INDUSTRY BODIES</p>
      
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))", gap: "1.25rem" }}>
        {REFERENCES.map((group) => (
          <div key={group.category} style={{ background: "rgba(13,17,23,0.8)", border: "1px solid rgba(107,142,35,0.15)", borderRadius: 4, padding: "1.25rem" }}>
            <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: "0.65rem", color: "#6b8e23", letterSpacing: "1.5px", marginBottom: "1rem", borderBottom: "1px solid rgba(107,142,35,0.15)", paddingBottom: "0.5rem" }}>
              {group.category.toUpperCase()}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {group.items.map((item) => (
                <div key={item.title} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.75rem" }}>
                  <div>
                    <div style={{ fontSize: "0.88rem", color: "#f0f2f5", fontWeight: 500 }}>{item.title}</div>
                    <div style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: "0.15rem" }}>{item.desc}</div>
                  </div>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: "0.7rem", color: "#4a9eff", textDecoration: "none", whiteSpace: "nowrap", flexShrink: 0, padding: "0.2rem 0.5rem", border: "1px solid rgba(74,158,255,0.2)", borderRadius: 2 }}
                  >
                    VISIT →
                  </a>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
