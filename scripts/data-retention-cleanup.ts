/**
 * RGPD Data Retention Cleanup Script
 * 
 * Purges soft-deleted accounts older than 2 years (as stated in privacy policy).
 * Schedule via cron: 0 3 * * 0 (every Sunday at 3am)
 * 
 * Usage: npx tsx scripts/data-retention-cleanup.ts [--dry-run]
 */
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client.js";
import pg from "pg";

const DRY_RUN = process.argv.includes("--dry-run");
const RETENTION_DAYS = 730; // 2 years

async function main() {
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - RETENTION_DAYS);

  console.log("══════════════════════════════════════");
  console.log("  SIGA180 — RGPD Data Retention Cleanup");
  console.log(`  Mode: ${DRY_RUN ? "DRY RUN (no changes)" : "LIVE"}`);
  console.log(`  Cutoff: ${cutoffDate.toISOString()} (${RETENTION_DAYS} days ago)`);
  console.log("══════════════════════════════════════\n");

  // 1. Find soft-deleted clients past retention period
  const expiredClients = await prisma.client.findMany({
    where: {
      deletedAt: { not: null, lt: cutoffDate },
    },
    select: { id: true, name: true, email: true, deletedAt: true },
  });

  console.log(`Found ${expiredClients.length} expired client(s) to purge.\n`);

  for (const client of expiredClients) {
    console.log(`  → ${client.name} (${client.email}) — deleted ${client.deletedAt?.toISOString()}`);

    if (!DRY_RUN) {
      // Delete related data first (cascade may handle some, but be explicit)
      await prisma.$transaction(async (tx) => {
        // Delete workout logs (SetLog → ExerciseLog → WorkoutLog cascade)
        await tx.workoutLog.deleteMany({ where: { clientId: client.id } });

        // Delete bookings
        await tx.booking.deleteMany({ where: { clientId: client.id } });

        // Delete check-ins  
        await tx.checkIn.deleteMany({ where: { clientId: client.id } });

        // Delete feedbacks
        await tx.feedback.deleteMany({ where: { clientId: client.id } });

        // Delete messages via conversation participants
        const participantRecords = await tx.conversationParticipant.findMany({
          where: { clientId: client.id },
          select: { conversationId: true },
        });
        const convIds = participantRecords.map((p) => p.conversationId);
        if (convIds.length > 0) {
          await tx.message.deleteMany({ where: { conversationId: { in: convIds } } });
          await tx.conversationParticipant.deleteMany({ where: { conversationId: { in: convIds } } });
          await tx.conversation.deleteMany({ where: { id: { in: convIds } } });
        }

        // Delete notifications
        await tx.notification.deleteMany({ where: { clientId: client.id } });

        // Delete body assessments
        await tx.bodyAssessment.deleteMany({ where: { clientId: client.id } });

        // Unassign from training/nutrition plans (don't delete PT's plans)
        await tx.trainingPlanAssignment.deleteMany({ where: { clientId: client.id } });
        await tx.nutritionPlanAssignment.deleteMany({ where: { clientId: client.id } });

        // Finally, delete the client record
        await tx.client.delete({ where: { id: client.id } });

        // Delete the associated User record (if exists)
        await tx.user.deleteMany({ where: { email: client.email, role: "deleted_client" } });
      });

      console.log(`    ✅ Purged`);
    }
  }

  // 2. Find deleted PT/admin accounts past retention
  const expiredUsers = await prisma.user.findMany({
    where: {
      role: { in: ["deleted_admin", "suspended"] },
      updatedAt: { lt: cutoffDate },
    },
    select: { id: true, name: true, email: true, role: true, updatedAt: true },
  });

  console.log(`\nFound ${expiredUsers.length} expired PT/admin account(s) to purge.\n`);

  for (const user of expiredUsers) {
    console.log(`  → ${user.name} (${user.email}) [${user.role}] — updated ${user.updatedAt.toISOString()}`);

    if (!DRY_RUN) {
      await prisma.$transaction(async (tx) => {
        // Remove managed clients association (orphan them)
        await tx.client.updateMany({
          where: { managerId: user.id },
          data: { managerId: null },
        });

        // Delete conversations and messages via participants
        const participantRecords = await tx.conversationParticipant.findMany({
          where: { userId: user.id },
          select: { conversationId: true },
        });
        const convIds = participantRecords.map((p) => p.conversationId);
        if (convIds.length > 0) {
          await tx.message.deleteMany({ where: { conversationId: { in: convIds } } });
          await tx.conversationParticipant.deleteMany({ where: { conversationId: { in: convIds } } });
          await tx.conversation.deleteMany({ where: { id: { in: convIds } } });
        }

        // Delete notifications sent by this user
        await tx.notification.deleteMany({ where: { senderId: user.id } });

        // Delete the user record
        await tx.user.delete({ where: { id: user.id } });
      });

      console.log(`    ✅ Purged`);
    }
  }

  // 3. Clean up old audit logs (keep 1 year)
  const auditCutoff = new Date();
  auditCutoff.setFullYear(auditCutoff.getFullYear() - 1);

  const oldLogs = await prisma.auditLog.count({
    where: { createdAt: { lt: auditCutoff } },
  });

  console.log(`\nFound ${oldLogs} audit log(s) older than 1 year.`);

  if (!DRY_RUN && oldLogs > 0) {
    await prisma.auditLog.deleteMany({
      where: { createdAt: { lt: auditCutoff } },
    });
    console.log(`  ✅ Purged ${oldLogs} old audit logs`);
  }

  // 4. Summary
  console.log("\n══════════════════════════════════════");
  if (DRY_RUN) {
    console.log("  DRY RUN complete. Re-run without --dry-run to execute.");
  } else {
    console.log("  ✅ Cleanup complete!");
    console.log(`  Purged: ${expiredClients.length} client(s), ${expiredUsers.length} user(s), ${oldLogs} log(s)`);
  }
  console.log("══════════════════════════════════════");

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error("Cleanup failed:", err);
  process.exit(1);
});
