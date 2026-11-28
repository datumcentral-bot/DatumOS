import { prisma } from "../src/lib/prisma.js";

async function main() {
  const clients = await prisma.client.findMany({ take: 5 });
  console.log("CLIENT COUNT:", clients.length);
  clients.forEach((c) => console.log("-", c.id, c.name ?? "(no name)"));
  const projects = await prisma.project.findMany({ take: 5 });
  console.log("PROJECT COUNT:", projects.length);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error("DB ERROR:", e);
  process.exit(1);
});
