import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const clients = await prisma.client.findMany({ select: { id: true, email: true, userId: true } });
  console.log("=== CLIENTS ===");
  clients.forEach((c) => console.log(c.id, c.email, "userId:", c.userId));

  const users = await prisma.user.findMany({ where: { role: "client" }, select: { id: true, email: true } });
  console.log("\n=== CLIENT USERS ===");
  users.forEach((u) => console.log(u.id, u.email));

  const assignments = await prisma.trainingPlanAssignment.findMany({
    select: {
      id: true,
      clientId: true,
      isActive: true,
      trainingPlan: { select: { name: true, workouts: { select: { id: true, name: true } } } },
    },
  });
  console.log("\n=== ASSIGNMENTS ===");
  assignments.forEach((a) =>
    console.log("clientId:", a.clientId, "active:", a.isActive, "plan:", a.trainingPlan.name, "workouts:", a.trainingPlan.workouts.map((w) => w.id))
  );
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
