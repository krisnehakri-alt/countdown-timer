import { PrismaClient } from "@prisma/client";

// Correct singleton pattern: in development, attach to `global` to prevent
// hot-reload from spawning hundreds of connections. In production, always
// create exactly one client per server process.
let prisma;

if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient();
} else {
  if (!global.__prisma) {
    global.__prisma = new PrismaClient({
      log: ["query", "error", "warn"],
    });
  }
  prisma = global.__prisma;
}

export default prisma;
