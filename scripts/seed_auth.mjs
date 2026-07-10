import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
const prisma = new PrismaClient();

async function main() {
  await prisma.authUser.deleteMany();

  const directorHash = await bcrypt.hash("DatumDir2026!", 10);
  const memberHash = await bcrypt.hash("Member@2026!", 10);
  const clientHash = await bcrypt.hash("Client@2026!", 10);

  await prisma.authUser.create({
    data: {
      email: "director@datumbim.com",
      passwordHash: directorHash,
      role: "DIRECTOR",
      name: "Director",
      linkedEntityId: "demo-director",
      linkedEntityType: "USER",
    },
  });
  await prisma.authUser.create({
    data: {
      email: "ahmed@datum-bim.com",
      passwordHash: memberHash,
      role: "MEMBER",
      name: "Ahmed Khan",
      linkedEntityId: "demo-member",
      linkedEntityType: "USER",
    },
  });
  await prisma.authUser.create({
    data: {
      email: "khalid@bagc.ae",
      passwordHash: clientHash,
      role: "CLIENT",
      name: "Khalid Al-Mansoori",
      linkedEntityId: "demo-client",
      linkedEntityType: "USER",
    },
  });

  console.log("Demo auth users created");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
