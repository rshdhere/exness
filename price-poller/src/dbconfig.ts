import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/client";

declare global {
  var prisma: PrismaClient;
}

if (!global.prisma) {
  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  const adapter = new PrismaPg({ connectionString });
  global.prisma = new PrismaClient({ adapter });
}

export default global.prisma;