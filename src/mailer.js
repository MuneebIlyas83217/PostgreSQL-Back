const nodemailer = require("nodemailer");

// Create reusable transporter object using Gmail SMTP
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Send a welcome confirmation email when a user registers (e.g. from Form.jsx)
 * @param {Object} user - { name, email }
 */
async function sendWelcomeEmail(user) {
  if (!user || !user.email) return;

  const recipientEmail = String(user.email).trim();

  // Skip dummy/fallback placeholder emails
  if (recipientEmail.endsWith("@lettercrafts.local") || recipientEmail.endsWith("@quote.local")) {
    console.log(`[Mailer] Skipped sending welcome email to placeholder address: ${recipientEmail}`);
    return;
  }

  const mailOptions = {
    from: `"Letter Crafts" <${process.env.EMAIL_USER}>`,
    to: recipientEmail, // Sent directly to the email entered by the user
    subject: `Welcome to Letter Crafts, ${user.name || "there"}!`,
    text: `Hello ${user.name || "there"},\n\nThank you for registering with Letter Crafts! Your account has been successfully created.\n\nEmail: ${user.email}\n\nWe're excited to have you with us!\n\nBest regards,\nThe Letter Crafts Team`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; background-color: #ffffff;">
        <div style="text-align: center; padding-bottom: 20px; border-bottom: 2px solid #0189CF;">
          <h1 style="color: #0189CF; margin: 0; font-size: 24px;">Letter Crafts</h1>
          <p style="color: #697587; margin: 5px 0 0 0; font-size: 14px;">Professional Translation Services</p>
        </div>
        
        <div style="padding: 24px 0;">
          <h2 style="color: #333333; margin-top: 0;">Welcome, ${user.name || "Valued User"}! 🎉</h2>
          <p style="color: #555555; line-height: 1.6; font-size: 15px;">
            Thank you for registering with <strong>Letter Crafts</strong>. Your account has been successfully created and you're now part of our community.
          </p>
          
          <div style="background-color: #f7fafc; border-left: 4px solid #0189CF; padding: 15px; margin: 20px 0; border-radius: 4px;">
            <p style="margin: 0; color: #333; font-size: 14px;"><strong>Account Details:</strong></p>
            <p style="margin: 6px 0 0 0; color: #555; font-size: 14px;"><strong>Name:</strong> ${user.name || "N/A"}</p>
            <p style="margin: 4px 0 0 0; color: #555; font-size: 14px;"><strong>Email:</strong> ${user.email}</p>
          </div>

          <p style="color: #555555; line-height: 1.6; font-size: 14px;">
            If you need document translation, notary authentication, or certified corporate translations, we're here to help 24/7.
          </p>
        </div>

        <div style="text-align: center; padding-top: 20px; border-top: 1px solid #e0e0e0; color: #888888; font-size: 12px;">
          <p style="margin: 0;">© ${new Date().getFullYear()} Letter Crafts. All rights reserved.</p>
          <p style="margin: 4px 0 0 0;">Need help? Reply directly to this email.</p>
        </div>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`[Mailer] Welcome email sent to ${user.email} (Message ID: ${info.messageId})`);
    return info;
  } catch (error) {
    console.error(`[Mailer] Failed to send welcome email to ${user.email}:`, error.message);
  }
}

/**
 * Send a quote confirmation email when a user submits a quote request (from Lastpage.jsx)
 * @param {Object} user - { name, email, phone, sourceLanguage, toLanguage, deliveryOptions, message, urgentReq, notarization }
 */
async function sendQuoteConfirmationEmail(user) {
  if (!user || !user.email) return;

  const recipientEmail = String(user.email).trim();

  // Skip dummy/fallback emails
  if (recipientEmail.endsWith("@lettercrafts.local") || recipientEmail.endsWith("@quote.local")) {
    console.log(`[Mailer] Skipped sending quote confirmation to placeholder address: ${recipientEmail}`);
    return;
  }

  const mailOptions = {
    from: `"Letter Crafts" <${process.env.EMAIL_USER}>`,
    to: recipientEmail, // Sent directly to the email entered by the user
    subject: `We've Received Your Translation Quote Request - Letter Crafts`,
    text: `Hello ${user.name || "Valued Client"},\n\nThank you for requesting a quote from Letter Crafts! We have received your request and our team will get back to you within 30 minutes.\n\nSummary:\n- Source Language: ${user.sourceLanguage || "Not specified"}\n- Target Language: ${user.toLanguage || "Not specified"}\n- Delivery Option: ${user.deliveryOptions || "Standard"}\n\nBest regards,\nThe Letter Crafts Team`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; background-color: #ffffff;">
        <div style="text-align: center; padding-bottom: 20px; border-bottom: 2px solid #0189CF;">
          <h1 style="color: #0189CF; margin: 0; font-size: 24px;">Letter Crafts</h1>
          <p style="color: #697587; margin: 5px 0 0 0; font-size: 14px;">Certified Translation Services</p>
        </div>
        
        <div style="padding: 24px 0;">
          <h2 style="color: #333333; margin-top: 0;">We've Received Your Quote Request! ⏱️</h2>
          <p style="color: #555555; line-height: 1.6; font-size: 15px;">
            Hello <strong>${user.name || "Valued Client"}</strong>, thank you for contacting <strong>Letter Crafts</strong>. Our team is currently reviewing your request and will get back to you within <strong>30 minutes</strong> with a formal quote.
          </p>
          
          <div style="background-color: #f7fafc; border-left: 4px solid #0189CF; padding: 15px; margin: 20px 0; border-radius: 4px;">
            <p style="margin: 0 0 8px 0; color: #333; font-size: 14px;"><strong>Your Request Details:</strong></p>
            <p style="margin: 4px 0; color: #555; font-size: 14px;"><strong>Source Language:</strong> ${user.sourceLanguage || "Not specified"}</p>
            <p style="margin: 4px 0; color: #555; font-size: 14px;"><strong>Target Language:</strong> ${user.toLanguage || "Not specified"}</p>
            <p style="margin: 4px 0; color: #555; font-size: 14px;"><strong>Delivery:</strong> ${user.deliveryOptions || "Standard"}</p>
            ${user.phone ? `<p style="margin: 4px 0; color: #555; font-size: 14px;"><strong>Phone:</strong> ${user.phone}</p>` : ""}
            ${user.urgentReq ? `<p style="margin: 4px 0; color: #e53e3e; font-size: 14px;"><strong>Urgent Request:</strong> Yes</p>` : ""}
            ${user.notarization ? `<p style="margin: 4px 0; color: #0189CF; font-size: 14px;"><strong>Notarization Required:</strong> Yes</p>` : ""}
            ${user.message ? `<p style="margin: 4px 0; color: #555; font-size: 14px;"><strong>Message:</strong> ${user.message}</p>` : ""}
          </div>
        </div>

        <div style="text-align: center; padding-top: 20px; border-top: 1px solid #e0e0e0; color: #888888; font-size: 12px;">
          <p style="margin: 0;">© ${new Date().getFullYear()} Letter Crafts. All rights reserved.</p>
          <p style="margin: 4px 0 0 0;">Need immediate assistance? Call us at +65 6711 0135</p>
        </div>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`[Mailer] Quote confirmation sent to ${user.email} (Message ID: ${info.messageId})`);
    return info;
  } catch (error) {
    console.error(`[Mailer] Failed to send quote confirmation to ${user.email}:`, error.message);
  }
}

module.exports = {
  transporter,
  sendWelcomeEmail,
  sendQuoteConfirmationEmail,
};

