const express = require("express");
const router = express.Router();
const { getPrisma } = require("../db");
const { sendWelcomeEmail, sendQuoteConfirmationEmail } = require("../mailer");

// Helper to format a user for API responses without leaking the password
const formatUser = (user) => {
  if (!user) return null;
  const { password: _password, ...safeUser } = user;
  return {
    ...safeUser,
    _id: user.id,
  };
};

// ── POST /auth/register (Used by Lastpage.jsx quote form & general registration) ──
router.post("/register", async (req, res) => {
  try {
    const prisma = getPrisma();
    const {
      name,
      email,
      password,
      phone,
      sourceLanguage,
      toLanguage,
      deliveryOptions,
      message,
      urgentReq,
      notarization,
    } = req.body || {};

    const cleanEmail = email && typeof email === "string" && email.trim()
      ? email.trim().toLowerCase()
      : `quote_${Date.now()}_${Math.random().toString(36).slice(2, 6)}@lettercrafts.local`;

    const cleanName = name && typeof name === "string" && name.trim() ? name.trim() : "Quote Client";

    // Upsert so repeat submissions from the same email don't crash
    const existing = await prisma.user.findUnique({ where: { email: cleanEmail } });
    let user;

    if (existing) {
      user = await prisma.user.update({
        where: { email: cleanEmail },
        data: {
          name: cleanName,
          phone: phone !== undefined ? phone : existing.phone,
          sourceLanguage: sourceLanguage !== undefined ? sourceLanguage : existing.sourceLanguage,
          toLanguage: toLanguage !== undefined ? toLanguage : existing.toLanguage,
          deliveryOptions: deliveryOptions !== undefined ? deliveryOptions : existing.deliveryOptions,
          message: message !== undefined ? message : existing.message,
          urgentReq: urgentReq !== undefined ? Boolean(urgentReq) : existing.urgentReq,
          notarization: notarization !== undefined ? Boolean(notarization) : existing.notarization,
          ...(password ? { password } : {}),
        },
      });
    } else {
      user = await prisma.user.create({
        data: {
          name: cleanName,
          email: cleanEmail,
          password: password || null,
          phone: phone || null,
          sourceLanguage: sourceLanguage || null,
          toLanguage: toLanguage || null,
          deliveryOptions: deliveryOptions || null,
          message: message || null,
          urgentReq: Boolean(urgentReq),
          notarization: Boolean(notarization),
        },
      });
    }

    // Send confirmation email via nodemailer (non-blocking)
    if (sourceLanguage || toLanguage || deliveryOptions) {
      sendQuoteConfirmationEmail(user).catch((err) =>
        console.error("[Mailer] Error sending quote confirmation:", err.message)
      );
    } else {
      sendWelcomeEmail(user).catch((err) =>
        console.error("[Mailer] Error sending welcome email:", err.message)
      );
    }

    res.status(201).json({
      success: true,
      message: "Form submitted successfully",
      user: formatUser(user),
    });
  } catch (error) {
    console.error("Error in /auth/register:", error);
    res.status(500).json({ error: "Failed to submit form" });
  }
});

// ── GET /auth/get-user (Used by GetUsers.jsx) ──
router.get(["/get-user", "/get-users"], async (req, res) => {
  try {
    const prisma = getPrisma();
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.json(users.map(formatUser));
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// ── GET /auth/getuser/:id (Used by Update.jsx) ──
router.get(["/getuser/:id", "/get-user/:id"], async (req, res) => {
  try {
    const prisma = getPrisma();
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(formatUser(user));
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

// ── PUT /auth/update-user/:id (Used by Update.jsx) ──
router.put("/update-user/:id", async (req, res) => {
  try {
    const prisma = getPrisma();
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    const {
      name,
      email,
      message,
      phone,
      sourceLanguage,
      toLanguage,
      deliveryOptions,
      urgentReq,
      notarization,
    } = req.body || {};

    const data = {};
    if (name !== undefined) data.name = name;
    if (email !== undefined) data.email = typeof email === "string" ? email.trim().toLowerCase() : email;
    if (message !== undefined) data.message = message;
    if (phone !== undefined) data.phone = phone;
    if (sourceLanguage !== undefined) data.sourceLanguage = sourceLanguage;
    if (toLanguage !== undefined) data.toLanguage = toLanguage;
    if (deliveryOptions !== undefined) data.deliveryOptions = deliveryOptions;
    if (typeof urgentReq === "boolean") data.urgentReq = urgentReq;
    if (typeof notarization === "boolean") data.notarization = notarization;

    const user = await prisma.user.update({
      where: { id },
      data,
    });

    res.json({
      message: "User updated successfully",
      ...formatUser(user),
    });
  } catch (error) {
    console.error("Error updating user:", error);
    if (error.code === "P2025") {
      return res.status(404).json({ error: "User not found" });
    }
    if (error.code === "P2002") {
      return res.status(409).json({ error: "A user with that email already exists" });
    }
    res.status(500).json({ error: "Failed to update user" });
  }
});

// ── DELETE /auth/delete-user/:id (Used by GetUsers.jsx) ──
router.delete("/delete-user/:id", async (req, res) => {
  try {
    const prisma = getPrisma();
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    await prisma.user.delete({
      where: { id },
    });

    res.json({ message: "User deleted successfully", id });
  } catch (error) {
    console.error("Error deleting user:", error);
    if (error.code === "P2025") {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(500).json({ error: "Failed to delete user" });
  }
});

module.exports = router;
