import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = "superadmin@school.com";
  const password = "password123";

  // Check if exists
  let user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    const passwordHash = await bcrypt.hash(password, 10);
    user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        role: "superadmin",
      },
    });
    console.log("Created Super Admin:", user.email);
  } else {
    // Ensure role is superadmin
    user = await prisma.user.update({
      where: { email },
      data: { role: "superadmin" },
    });
    console.log("Updated existing Super Admin:", user.email);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
