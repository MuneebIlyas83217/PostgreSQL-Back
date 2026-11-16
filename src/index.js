const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const express = require("express");
const cors = require("cors");
const { getPrisma } = require("./db");
const authRoutes = require("./routes/auth");

const app = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ──────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── Request Logger ──────────────────────────────────────────
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// ── Root GET / (health/diagnostic when opened in a browser) ─
app.get("/", (_req, res) => {
  res.json({
    status: "ok",
    service: "Letter Crafts API",
    databaseConfigured: Boolean(process.env.DATABASE_URL),
    timestamp: new Date().toISOString(),
  });
});

// ── Root POST / (Used by Form.jsx via API.post("", form)) ───
app.post("/", async (req, res) => {
  try {
    const { name, email, password, message, phone } = req.body || {};
    if (!name || !email) {
      return res.status(400).json({ error: "Name and email are required" });
    }

    const prisma = getPrisma();
    const existing = await prisma.user.findUnique({ where: { email } });
    let user;

    if (existing) {
      user = await prisma.user.update({
        where: { email },
        data: {
          name,
          ...(password ? { password } : {}),
          ...(message ? { message } : {}),
          ...(phone ? { phone } : {}),
        },
      });
    } else {
      user = await prisma.user.create({
        data: {
          name,
          email,
          password: password || null,
          message: message || null,
          phone: phone || null,
        },
      });
    }

    const { password: _password, ...safeUser } = user;
    res.status(201).json({
      ...safeUser,
      id: user.id,
      _id: user.id,
      success: true,
      message: user.message || "User created successfully",
    });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: "Failed to create user" });
  }
});

// ── /auth routes ────────────────────────────────────────────
app.use("/auth", authRoutes);

// ── Health check ────────────────────────────────────────────
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ── Error handler (keeps the function alive and reports details) ──
app.use((error, _req, res, _next) => {
  console.error("Unhandled error:", error);
  res.status(500).json({ error: "Internal server error" });
});

// ── Export for Vercel Functions ─────────────────────────────
module.exports = app;

// ── Start server for local development ──────────────────────
// On Vercel the exported app is used directly; calling listen() there would
// create a second server inside the function.
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 Letter Crafts Backend running on http://localhost:${PORT}`);
  });
}
