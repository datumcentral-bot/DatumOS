/**
 * Seed AuthUser table with correct bcrypt hashes.
 * Run: node scripts/seed_auth.mjs
 */
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const SALT = 10;

async function main() {
  console.log("🔐 Seeding AuthUser table...");

  // Clear existing auth users
  await prisma.authUser.deleteMany();

  // Director
  const directorHash = await bcrypt.hash("DatumDir2026!", SALT);
  await prisma.authUser.create({
    data: {
      id: "auth-director-001",
      email: "director@datumbim.com",
      name: "Operations Director",
      passwordHash: directorHash,
      role: "DIRECTOR",
      active: true,
    },
  });
  console.log("  ✅ director@datumbim.com / DatumDir2026!");

  // Members
  const memberHash = await bcrypt.hash("Member@2026!", SALT);
  const members = [
    { id: "auth-ahmed-001", email: "ahmed@datum-bim.com", name: "Ahmed Khan" },
    { id: "auth-sarah-001", email: "sarah@datum-bim.com", name: "Sarah Mitchell" },
    { id: "auth-lisa-001", email: "lisa@datum-bim.com", name: "Lisa Chen" },
    { id: "auth-zain-001", email: "zain@datum-bim.com", name: "Zain Al-Rashid" },
    { id: "auth-fatima-001", email: "fatima@datum-bim.com", name: "Fatima Al-Zahra" },
    { id: "auth-maria-001", email: "maria@datum-bim.com", name: "Maria Santos" },
    { id: "auth-james-001", email: "james@datum-bim.com", name: "James Okafor" },
    { id: "auth-priya-001", email: "priya@datum-bim.com", name: "Priya Sharma" },
  ];
  for (const m of members) {
    await prisma.authUser.create({
      data: { ...m, passwordHash: memberHash, role: "MEMBER", active: true },
    });
  }
  console.log(`  ✅ ${members.length} member accounts / Member@2026!`);

  // Clients
  const clientHash = await bcrypt.hash("Client@2026!", SALT);
  const clients = [
    { id: "auth-khalid-001", email: "khalid@bagc.ae", name: "Khalid Al-Mansoori" },
    { id: "auth-omar-001", email: "omar@emaar.ae", name: "Omar Al-Farsi" },
    { id: "auth-rania-001", email: "rania@adnoc.ae", name: "Rania Hassan" },
  ];
  for (const c of clients) {
    await prisma.authUser.create({
      data: { ...c, passwordHash: clientHash, role: "CLIENT", active: true },
    });
  }
  console.log(`  ✅ ${clients.length} client accounts / Client@2026!`);

  const total = await prisma.authUser.count();
  console.log(`\n✅ AuthUser seeding complete — ${total} users in DB`);
  console.log("\n🔑 Login credentials:");
  console.log("   DIRECTOR: director@datumbim.com  /  DatumDir2026!");
  console.log("   MEMBER:   ahmed@datum-bim.com    /  Member@2026!");
  console.log("   CLIENT:   khalid@bagc.ae         /  Client@2026!");
}

main()
  .catch((e) => { console.error("❌ Seed failed:", e); process.exit(1); })
  .finally(() => prisma.$disconnect());
