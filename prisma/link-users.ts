import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  // Find all clients without a userId link
  const clients = await prisma.client.findMany({ where: { userId: null } });
  console.log("Clients without userId:", clients.length);

  let linked = 0;
  for (const client of clients) {
    const user = await prisma.user.findUnique({ where: { email: client.email } });
    if (user && user.role === "client") {
      await prisma.client.update({
        where: { id: client.id },
        data: { userId: user.id },
      });
      console.log("Linked:", client.email, "->", user.id);
      linked++;
    }
  }
  console.log("Total linked:", linked);
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
