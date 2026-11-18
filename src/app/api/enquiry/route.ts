import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { checkRateLimit, hashIpAddress } from "@/lib/rate-limit";
import { sanitizePlainText, stripCrLf } from "@/lib/security/sanitize";
import { sendAdminNotificationEmail } from "@/lib/email";

const enquirySchema = z
  .object({
    name: z.string().min(2).max(120),
    email: z.string().email().max(200),
    phone: z.string().max(40).optional().default(""),
    businessName: z.string().max(150).optional().default(""),
    interest: z.string().min(2).max(100),
    budgetRange: z.string().max(100).optional().default(""),
    message: z.string().min(10).max(3000),
    consent: z.literal(true),
    locale: z.enum(["en", "si"]).default("en"),
    sourcePage: z.string().max(200).optional().default("/contact"),
    // Anti-spam fields (Section 5 & 11.6)
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

    // Rate limit: 5 enquiries per 10 minutes per IP
    const rate = await checkRateLimit("public_enquiry", ipHash, 5, 600);
    if (!rate.allowed) {
      return NextResponse.json(
        { ok: false, error: "Too many submissions. Please try again shortly." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const parsed = enquirySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: "Please check all required fields and try again." },
        { status: 400 }
      );
    }

    // Honeypot & Time-trap check (> 1.5s from form render)
    if (
      parsed.data.honeypot ||
      (parsed.data.renderedAt && Date.now() - parsed.data.renderedAt < 1200)
    ) {
      // Return fake 200 to bots without storing
      return NextResponse.json({ ok: true });
    }

    const cleanName = stripCrLf(sanitizePlainText(parsed.data.name));
    const cleanEmail = stripCrLf(sanitizePlainText(parsed.data.email));
    const cleanPhone = stripCrLf(sanitizePlainText(parsed.data.phone));
    const cleanBiz = stripCrLf(sanitizePlainText(parsed.data.businessName));
    const cleanInterest = stripCrLf(sanitizePlainText(parsed.data.interest));
    const cleanBudget = stripCrLf(sanitizePlainText(parsed.data.budgetRange));
    const cleanMessage = sanitizePlainText(parsed.data.message);

    const record = await prisma.enquiry.create({
      data: {
        name: cleanName,
        email: cleanEmail,
        phone: cleanPhone || null,
        businessName: cleanBiz || null,
        interest: cleanInterest,
        budgetRange: cleanBudget || null,
        message: cleanMessage,
        locale: parsed.data.locale,
        sourcePage: sanitizePlainText(parsed.data.sourcePage),
        ipHash,
        userAgent: (req.headers.get("user-agent") ?? "").slice(0, 512),
      },
    });

    await sendAdminNotificationEmail({
      subject: `[Vardhel Lead] ${cleanName} — ${cleanInterest}`,
      replyTo: cleanEmail,
      text: `New Enquiry (#${record.id})\nName: ${cleanName}\nEmail: ${cleanEmail}\nPhone: ${cleanPhone}\nBusiness: ${cleanBiz}\nInterest: ${cleanInterest}\nMessage:\n${cleanMessage}`,
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Unable to process request right now." },
      { status: 500 }
    );
  }
}
