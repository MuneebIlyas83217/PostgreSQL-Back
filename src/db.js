const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const ws = require("ws");
const { neonConfig } = require("@neondatabase/serverless");

// Node has no global WebSocket. The Neon driver needs one for pooled connections.
neonConfig.webSocketConstructor = ws;

let prismaClient = null;

function connectionString() {
  const raw = process.env.DATABASE_URL;
  if (!raw) {
    throw new Error(
      "DATABASE_URL is not set. Add it to backend/.env locally and to the Vercel project's Environment Variables."
    );
  }

  // The Neon serverless driver rejects libpq's channel_binding option.
  const url = new URL(raw);
  url.searchParams.delete("channel_binding");
  return url.toString();
}

// Create the client lazily: if Prisma Client was not generated or DATABASE_URL
// is missing on the host, the route handler returns a readable JSON 500 instead
// of the whole Vercel Function crashing during module load.
function getPrisma() {
  if (!prismaClient) {
    const { PrismaClient } = require("@prisma/client");
    const { PrismaNeon } = require("@prisma/adapter-neon");

    const adapter = new PrismaNeon({
      connectionString: connectionString(),
    });

    prismaClient = new PrismaClient({ adapter });
  }

  return prismaClient;
}

module.exports = { getPrisma };
