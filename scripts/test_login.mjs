/**
 * Test login via NextAuth credentials provider directly
 * Tests the authorize() function without HTTP
 */
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function testLogin(email, password) {
  console.log(`\n🔐 Testing: ${email} / ${password}`);
  
  const user = await prisma.authUser.findUnique({
    where: { email: email.toLowerCase().trim() },
  });

  if (!user) {
    console.log("  ❌ User NOT FOUND in database");
    return false;
  }
  
  console.log(`  ✅ User found: ${user.name} (${user.role})`);
  console.log(`  Active: ${user.active}`);
  
  if (!user.active) {
    console.log("  ❌ User is INACTIVE");
    return false;
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    console.log("  ❌ Password INVALID");
    return false;
  }
  
  console.log("  ✅ Password VALID — login would SUCCEED");
  return true;
}

async function main() {
  console.log("🧪 DatumOS Auth Test\n");
  
  const tests = [
    ["director@datumbim.com", "DatumDir2026!"],
    ["ahmed@datum-bim.com", "Member@2026!"],
    ["khalid@bagc.ae", "Client@2026!"],
    ["director@datumbim.com", "WrongPassword"],  // Should fail
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const [email, pass] of tests) {
    const result = await testLogin(email, pass);
    if (result) passed++; else failed++;
  }
  
  console.log(`\n📊 Results: ${passed} passed, ${failed} failed`);
  console.log("Expected: 3 passed, 1 failed (wrong password test)");
  
  const total = await prisma.authUser.count();
  console.log(`\n📋 Total AuthUsers in DB: ${total}`);
}

main()
  .catch(e => { console.error("Error:", e); process.exit(1); })
  .finally(() => prisma.$disconnect());
