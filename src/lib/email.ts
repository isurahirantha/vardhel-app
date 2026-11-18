import "server-only";
import nodemailer from "nodemailer";
import { getEnv } from "@/lib/env";
import { stripCrLf } from "@/lib/security/sanitize";
import { logEvent } from "@/lib/logger";

export async function sendAdminNotificationEmail(input: {
  subject: string;
  text: string;
  replyTo?: string;
}): Promise<void> {
  const env = getEnv();
  if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASS) {
    logEvent("info", "SMTP not configured; skipping email dispatch", {
      subject: stripCrLf(input.subject),
    });
    return;
  }

  try {
    const transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: Number(env.SMTP_PORT || 587),
      secure: Number(env.SMTP_PORT) === 465,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: stripCrLf(env.MAIL_FROM || "no-reply@codeloom.site"),
      to: stripCrLf(env.NOTIFY_EMAIL),
      replyTo: input.replyTo ? stripCrLf(input.replyTo) : undefined,
      subject: stripCrLf(input.subject),
      text: input.text,
    });
  } catch (err) {
    logEvent("error", "Failed to send notification email", {
      error: err instanceof Error ? err.message : "unknown",
    });
  }
}
