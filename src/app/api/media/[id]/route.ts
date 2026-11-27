import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { readStoredMediaBuffer } from "@/lib/storage/local-storage";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const media = await prisma.media.findFirst({
      where: { id, deletedAt: null },
    });

    if (!media) {
      return new NextResponse("Not Found", { status: 404 });
    }

    // If stored in public folder (seeded assets), redirect to static public path
    if (media.storagePath.startsWith("/") && !media.storagePath.startsWith("//")) {
      return NextResponse.redirect(new URL(media.storagePath, _req.url));
    }

    const buffer = await readStoredMediaBuffer(media.storagePath);

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": media.mime,
        "Content-Length": String(buffer.length),
        "X-Content-Type-Options": "nosniff",
        "Content-Disposition": "inline",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new NextResponse("Not Found", { status: 404 });
  }
}
