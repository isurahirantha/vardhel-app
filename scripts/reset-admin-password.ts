import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import crypto from "node:crypto";
import { PrismaClient } from "@prisma/client";
import { hash } from "@node-rs/argon2";

const prisma = new PrismaClient();

async function main() {
  const rl = readline.createInterface({ input, output });
  try {
    const email = (
      await rl.question("Enter Master Admin email [codeloom.lk@gmail.com]: ")
    ).trim() || "codeloom.lk@gmail.com";

    const newPassword = (
      await rl.question("Enter new password (min 12 chars): ")
    ).trim();

    if (newPassword.length < 12) {
      console.error("❌ Password must be at least 12 characters.");
      process.exit(1);
    }

    const pepper = process.env.PASSWORD_PEPPER || "dev-fallback-pepper-minimum-16-chars";
    const peppered = crypto
      .createHmac("sha256", pepper)
      .update(newPassword)
      .digest("hex");

    const passwordHash = await hash(peppered, {
      memoryCost: 65536,
      timeCost: 3,
      parallelism: 4,
      outputLen: 32,
    });

    const admin = await prisma.adminUser.upsert({
      where: { email },
      update: {
        passwordHash,
        mustChangePassword: true,
        failedAttempts: 0,
        lockedUntil: null,
      },
      create: {
        email,
        passwordHash,
        role: "SUPER_ADMIN",
        mustChangePassword: true,
      },
    });

    await prisma.adminSession.updateMany({
      where: { adminId: admin.id, revokedAt: null },
      data: { revokedAt: new Date() },
    });

    await prisma.auditLog.create({
      data: {
        adminId: admin.id,
        action: "CLI_PASSWORD_RESET",
        entity: "admin_users",
        entityId: admin.id,
        ip: "127.0.0.1",
        userAgent: "cli/reset-admin-password",
      },
    });

    console.info(`✅ Password reset for ${email}. All active sessions revoked.`);
  } finally {
    rl.close();
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error("Failed to reset password:", err);
  process.exit(1);
});
