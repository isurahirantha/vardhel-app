import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { checkRateLimit, hashIpAddress } from "@/lib/rate-limit";
import { sanitizePlainText, stripCrLf } from "@/lib/security/sanitize";
import { sendAdminNotificationEmail } from "@/lib/email";

const feedbackSchema = z
  .object({
    name: z.string().min(2).max(120),
    company: z.string().max(120).optional().default(""),
    role: z.string().max(120).optional().default(""),
    email: z.string().email().max(200).optional().or(z.literal("")),
    rating: z.number().int().min(1).max(5),
    message: z.string().min(15).max(2000),
    consentToPublish: z.literal(true),
    locale: z.enum(["en", "si"]).default("en"),
    honeypot: z.string().max(0).optional().default(""),
    renderedAt: z.number().optional(),
  })
  .strict();

export async function POST(req: NextRequest) {
  try {
    const clientIp =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      req.headers.get("x-real-ip") ??
      "127.0.0.1";
    const ipHash = hashIpAddress(clientIp);

    const rate = await checkRateLimit("public_feedback", ipHash, 4, 900);
    if (!rate.allowed) {
      return NextResponse.json(
        { ok: false, error: "Too many submissions. Please try again later." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const parsed = feedbackSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: "Please complete all required fields." },
        { status: 400 }
      );
    }

    if (
      parsed.data.honeypot ||
      (parsed.data.renderedAt && Date.now() - parsed.data.renderedAt < 1200)
    ) {
      return NextResponse.json({ ok: true });
    }

    const cleanName = stripCrLf(sanitizePlainText(parsed.data.name));
    const cleanCompany = stripCrLf(sanitizePlainText(parsed.data.company));
    const cleanRole = stripCrLf(sanitizePlainText(parsed.data.role));
    const cleanEmail = parsed.data.email
      ? stripCrLf(sanitizePlainText(parsed.data.email))
      : null;
    const cleanMessage = sanitizePlainText(parsed.data.message);

    // Stored strictly as PENDING until moderated by Master Admin (Section 8)
    await prisma.feedback.create({
      data: {
        status: "PENDING",
        name: cleanName,
        company: cleanCompany || null,
        role: cleanRole || null,
        email: cleanEmail,
        rating: parsed.data.rating,
        message: cleanMessage,
        consentToPublish: true,
        source: "PUBLIC_FORM",
        locale: parsed.data.locale,
        submittedIpHash: ipHash,
      },
    });

    await sendAdminNotificationEmail({
      subject: `[Vardhel Feedback Pending] ${cleanName} (${parsed.data.rating}/5)`,
      text: `New customer feedback awaiting moderation in /admin/feedback:\nName: ${cleanName}\nCompany: ${cleanCompany}\nRating: ${parsed.data.rating}/5\nMessage:\n${cleanMessage}`,
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Unable to submit feedback right now." },
      { status: 500 }
    );
  }
}
