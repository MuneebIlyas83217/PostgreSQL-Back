const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const { PrismaClient } = require("@prisma/client");
const { PrismaNeon } = require("@prisma/adapter-neon");
const { neonConfig } = require("@neondatabase/serverless");
const ws = require("ws");

// Node has no global WebSocket. The Neon driver needs one for pooled connections.
neonConfig.webSocketConstructor = ws;

function connectionString() {
  const raw = process.env.DATABASE_URL;
  if (!raw) {
    throw new Error("DATABASE_URL is not set. Add it to backend/.env");
  }

  // The Neon serverless driver rejects libpq's channel_binding option.
  const url = new URL(raw);
  url.searchParams.delete("channel_binding");
  return url.toString();
}

const adapter = new PrismaNeon({
  connectionString: connectionString(),
});

const prisma = new PrismaClient({ adapter });

module.exports = { prisma };
