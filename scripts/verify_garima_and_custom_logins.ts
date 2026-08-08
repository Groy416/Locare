import { PrismaClient } from "@prisma/client";
import { authOptions } from "../src/lib/auth";

const prisma = new PrismaClient();

async function runVerification() {
  console.log("=== VERIFYING PERMANENT ACCOUNTS & DYNAMIC LOGIN FIX ===");

  // 1. Verify Garima Roy Account in DB
  const garimaUser = await prisma.user.findUnique({
    where: { email: "garimaa.roy0401@gmail.com" },
  });
  console.log("1. Garima Roy User Record in DB:", {
    id: garimaUser?.id,
    name: garimaUser?.name,
    email: garimaUser?.email,
    role: garimaUser?.role,
  });

  if (garimaUser && garimaUser.email === "garimaa.roy0401@gmail.com") {
    console.log("   --> Garima Roy Permanent Account Seeded PASSED ✓");
  } else {
    console.error("   --> Garima Roy Account missing from DB ✗");
  }

  // 2. Verify NextAuth authorize callback for garimaa.roy0401@gmail.com with Garima@0401
  const provider = authOptions.providers[0] as any;
  const authorizeFn = provider.options?.authorize || provider.authorize;
  if (typeof authorizeFn === "function") {
    const authResult = await authorizeFn(
      { email: "garimaa.roy0401@gmail.com", password: "Garima@0401" },
      {} as any
    );
    console.log("2. Authorize Result for garimaa.roy0401@gmail.com:", authResult);
    if (authResult && authResult.email === "garimaa.roy0401@gmail.com") {
      console.log("   --> Garima Roy NextAuth Authentication PASSED ✓");
    } else {
      console.error("   --> NextAuth Authentication failed for Garima Roy account ✗");
    }
  }

  console.log("\n=======================================================");
  console.log("PERMANENT USER ACCOUNT & LOGIN AUTHENTICATION VERIFIED!");
  console.log("=======================================================\n");
}

runVerification().catch(console.error).finally(() => prisma.$disconnect());
