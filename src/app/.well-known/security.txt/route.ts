import { NextResponse } from "next/server";

export async function GET() {
  const body = [
    "Contact: mailto:vardhel.official@gmail.com",
    "Preferred-Languages: en, si",
    "Canonical: https://vardhel.com/.well-known/security.txt",
    "Expires: 2027-12-31T23:59:59.000Z",
  ].join("\n");

  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}
