const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const express = require("express");
const cors = require("cors");
const { prisma } = require("./db");
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

// ── Root POST / (Used by Form.jsx via API.post("", form)) ───
app.post("/", async (req, res) => {
  try {
    const { name, email, password, message, phone } = req.body;
    if (!name || !email) {
      return res.status(400).json({ error: "Name and email are required" });
    }

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

    res.status(201).json({
      ...user,
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
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ── Start server ────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 Letter Crafts Backend running on http://localhost:${PORT}`);
});
