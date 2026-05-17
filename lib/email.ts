import nodemailer from "nodemailer";

function getTransporter() {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER) return null;

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

export async function sendTicketEmail(
  to: string,
  subject: string,
  html: string
) {
  const transporter = getTransporter();
  if (!transporter) return;

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || "IT Support <noreply@company.com>",
      to,
      subject,
      html,
    });
  } catch (err) {
    console.error("Email send failed:", err);
  }
}
