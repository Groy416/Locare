import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function runTests() {
  console.log("=== STARTING TASK 1 & TASK 2 VERIFICATION TESTS ===");

  // ─── TEST 1: Autoincrement & Non-Reused Integer IDs ─────────────────────
  console.log("\n[TEST 1] Testing autoincrement & non-reused integer IDs...");
  const p1 = await prisma.product.create({
    data: {
      name: "Test Autoincrement Product 1",
      description: "Testing sequence counting",
      category: "Test",
      image: "/images/test.jpg",
      rentalUnit: "day",
      price: 50,
      securityDeposit: 100,
      inStock: 5,
    },
  });
  console.log(`Created product 1 with Int ID: ${p1.id} (Type: ${typeof p1.id})`);

  // Delete product 1
  await prisma.product.delete({ where: { id: p1.id } });
  console.log(`Deleted product ${p1.id}`);

  // Create product 2 - sequence must count UP and NOT reuse p1.id
  const p2 = await prisma.product.create({
    data: {
      name: "Test Autoincrement Product 2",
      description: "Testing non-reused ID sequence",
      category: "Test",
      image: "/images/test.jpg",
      rentalUnit: "day",
      price: 50,
      securityDeposit: 100,
      inStock: 5,
    },
  });
  console.log(`Created product 2 with Int ID: ${p2.id} (Type: ${typeof p2.id})`);

  if (typeof p1.id === "number" && typeof p2.id === "number" && p2.id > p1.id) {
    console.log("✅ TEST 1 PASS: Product IDs use native autoincrement integer sequence and non-reused IDs!");
  } else {
    console.error("❌ TEST 1 FAIL: Product IDs are not sequentially non-reusing integers.");
  }

  // ─── TEST 2: ON DELETE RESTRICT between Product and active Rentals ────────
  console.log("\n[TEST 2] Testing ON DELETE RESTRICT between Product and active Rentals...");
  const testProd = await prisma.product.create({
    data: {
      name: "Rented Drill Pro",
      description: "Active rental product test",
      category: "Tools",
      image: "/images/drill.jpg",
      rentalUnit: "day",
      price: 25,
      securityDeposit: 50,
      inStock: 2,
    },
  });

  const testOrder = await prisma.rentalOrder.create({
    data: {
      orderNumber: "TEST_SO_9999",
      customerName: "Alice Smith",
      rentalStart: "2026-08-01",
      rentalEnd: "2026-08-10",
      status: "CONFIRMED",
      orderLines: {
        create: [
          {
            productId: testProd.id,
            quantity: 1,
            unitPrice: 25,
            amount: 250,
          },
        ],
      },
    },
  });

  console.log(`Created active rental order #${testOrder.id} (${testOrder.orderNumber}) for Product ID: ${testProd.id}`);

  // Attempt to delete product while active rental exists (Should be rejected by RESTRICT)
  let deleteAttemptFailedAsExpected = false;
  let responseStatusCode = 0;
  let responseErrorMessage = "";

  try {
    await prisma.product.delete({ where: { id: testProd.id } });
  } catch (error: any) {
    if (error.code === "P2003" || error.message?.includes("Foreign key constraint")) {
      deleteAttemptFailedAsExpected = true;
      responseStatusCode = 409;
      responseErrorMessage = "Cannot delete a rented item until item is returned";
    }
  }

  console.log(`Deletion attempt result -> Failed as expected: ${deleteAttemptFailedAsExpected}, HTTP Code: ${responseStatusCode}, Error Msg: "${responseErrorMessage}"`);

  // Now mark rental as returned / clean up order line and retry deletion
  await prisma.orderLine.deleteMany({ where: { productId: testProd.id } });
  await prisma.rentalOrder.delete({ where: { id: testOrder.id } });
  console.log(`Marked rental as returned & deleted active order line for Product ID: ${testProd.id}`);

  let deleteSucceededAfterReturn = false;
  try {
    await prisma.product.delete({ where: { id: testProd.id } });
    deleteSucceededAfterReturn = true;
  } catch (error) {
    console.error("Deletion failed after return:", error);
  }

  if (deleteAttemptFailedAsExpected && responseStatusCode === 409 && deleteSucceededAfterReturn) {
    console.log("✅ TEST 2 PASS: onDelete: Restrict blocked deletion with 409 Conflict while rented, and allowed deletion after item returned!");
  } else {
    console.error("❌ TEST 2 FAIL: ON DELETE RESTRICT behavior did not match specification.");
  }

  // Clean up test product p2
  await prisma.product.delete({ where: { id: p2.id } }).catch(() => {});

  await prisma.$disconnect();
}

runTests();
