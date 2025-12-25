const nodemailer = require("nodemailer");

function createTransport() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const secure =
    String(process.env.SMTP_SECURE || "false").toLowerCase() === "true";
  console.log(user);
  if (!host || !user || !pass) {
    throw new Error(
      "SMTP configuration missing. Please set SMTP_HOST, SMTP_USER, SMTP_PASS"
    );
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });
}

async function sendEmployeeWelcomePassword({ to, name, password }) {
  const from = process.env.MAIL_FROM || process.env.SMTP_USER;
  const appName = process.env.APP_NAME || "SiraFlow";
  const loginUrl = process.env.APP_LOGIN_URL || "https://your-frontend/login";

  const transporter = createTransport();
  const subject = `${appName} account created`;
  const text = `Hello ${
    name || ""
  },\n\nYour ${appName} account has been created.\n\nEmail: ${to}\nTemporary password: ${password}\n\nYou can log in here: ${loginUrl}\nAfter logging in, you may change your password from your profile settings.\n\nRegards,\n${appName} Team`;
  const html = `<p>Hello ${name || ""},</p>
<p>Your <strong>${appName}</strong> account has been created.</p>
<ul>
  <li><b>Email</b>: ${to}</li>
  <li><b>Temporary password</b>: <code>${password}</code></li>
  </ul>
<p>You can log in here: <a href="${loginUrl}">${loginUrl}</a></p>
<p>After logging in, you may change your password from your profile settings.</p>
<p>Regards,<br/>${appName} Team</p>`;

  await transporter.sendMail({ from, to, subject, text, html });
}

async function sendContactReply({ to, name, originalMessage, replyMessage }) {
  try {
    const from = process.env.MAIL_FROM || process.env.SMTP_USER;
    const appName = process.env.APP_NAME || "SiraFlow";

    const transporter = createTransport();
    const subject = `Re: Your message to ${appName} Support`;
    const text = `Hello ${name},\n\nThank you for contacting ${appName} support. Here's our response to your inquiry:\n\n---\nYour Original Message:\n${originalMessage}\n\n---\nOur Response:\n${replyMessage}\n\n---\n\nIf you have any further questions, please don't hesitate to reach out.\n\nBest regards,\n${appName} Support Team`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #000;">Hello ${name},</h2>
        <p>Thank you for contacting <strong>${appName}</strong> support. Here's our response to your inquiry:</p>
        
        <div style="background: #f5f5f5; border-left: 4px solid #ddd; padding: 15px; margin: 20px 0;">
          <p style="color: #666; font-size: 12px; margin: 0 0 10px 0;"><strong>Your Original Message:</strong></p>
          <p style="margin: 0;">${originalMessage}</p>
        </div>
        
        <div style="background: #000; color: #fff; border-left: 4px solid #000; padding: 15px; margin: 20px 0;">
          <p style="color: #ccc; font-size: 12px; margin: 0 0 10px 0;"><strong>Our Response:</strong></p>
          <p style="margin: 0; color: #fff;">${replyMessage}</p>
        </div>
        
        <p>If you have any further questions, please don't hesitate to reach out.</p>
        <p style="margin-top: 30px;">Best regards,<br/><strong>${appName} Support Team</strong></p>
      </div>
    `;

    await transporter.sendMail({ from, to, subject, text, html });
    console.log(`Reply email sent to ${to}`);
  } catch (error) {
    console.error('Failed to send reply email:', error.message);
    // Don't throw - reply is saved even if email fails
  }
}

async function sendContactConfirmation({ to, name, subject }) {
  try {
    const from = process.env.MAIL_FROM || process.env.SMTP_USER;
    const appName = process.env.APP_NAME || "SiraFlow";

    const transporter = createTransport();
    const emailSubject = `${appName} - Message Received`;
    const text = `Hello ${name},\n\nWe've received your message about "${subject}".\n\nOur support team will review your message and get back to you within 24 hours.\n\nThank you for your patience.\n\nBest regards,\n${appName} Support Team`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #000;">Hello ${name},</h2>
        <p>We've received your message about <strong>"${subject}"</strong>.</p>
        <div style="background: #f0f9ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <p style="margin: 0; color: #1e40af;">✓ Message received and logged</p>
          <p style="margin: 10px 0 0 0; color: #1e40af;">Our support team will review your message and get back to you within 24 hours.</p>
        </div>
        <p>Thank you for your patience.</p>
        <p style="margin-top: 30px;">Best regards,<br/><strong>${appName} Support Team</strong></p>
      </div>
    `;

    await transporter.sendMail({ from, to, subject: emailSubject, text, html });
    console.log(`Confirmation email sent to ${to}`);
  } catch (error) {
    console.error('Failed to send confirmation email:', error.message);
    // Don't throw - contact is saved even if email fails
  }
}

module.exports = {
  sendEmployeeWelcomePassword,
  sendContactReply,
  sendContactConfirmation
};
