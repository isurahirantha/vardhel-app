import { describe, it, expect, beforeAll } from "vitest";
import {
  hashPassword,
  verifyPassword,
  checkPasswordStrength,
} from "@/lib/auth/password";
import {
  generateTotpSecret,
  verifyTotpCode,
  encryptTotpSecret,
  decryptTotpSecret,
  generateRecoveryCodes,
  hashRecoveryCode,
} from "@/lib/auth/totp";
import {
  sanitizeRichText,
  sanitizePlainText,
  isSafeExternalUrl,
  isValidHexColor,
  safeJsonLd,
} from "@/lib/security/sanitize";
import { isPrivateOrReservedIp } from "@/lib/security/ssrf";
import { authenticator } from "otplib";

beforeAll(() => {
  process.env.DATABASE_URL = "mysql://test:test@localhost:3306/codeloom";
  process.env.SESSION_SECRET = "0123456789abcdef0123456789abcdef0123456789abcdef";
  process.env.PASSWORD_PEPPER = "0123456789abcdef0123456789abcdef";
  process.env.IP_HASH_SALT = "0123456789abcdef0123456789abcdef";
});

describe("VAPT Auth & Security Controls (Section 11)", () => {
  it("hashes and verifies passwords with Argon2id + server-side pepper", async () => {
    const plain = "Correct-Horse-Battery-Staple-99!";
    const hashed = await hashPassword(plain);
    expect(hashed.startsWith("$argon2id$")).toBe(true);
    expect(await verifyPassword(plain, hashed)).toBe(true);
    expect(await verifyPassword("Wrong-Password-123!", hashed)).toBe(false);
  });

  it("enforces password strength rules (>=12 chars, no brand/email, zxcvbn >= 3)", () => {
    expect(checkPasswordStrength("short123!").valid).toBe(false);
    expect(
      checkPasswordStrength("CodeLoomSuperAdminPassword2026!").valid
    ).toBe(false);
    expect(checkPasswordStrength("aaaaaaaaaaaa").valid).toBe(false);
    expect(
      checkPasswordStrength("Quantum$Weaver# Falcon92*Orbit").valid
    ).toBe(true);
  });

  it("encrypts and decrypts TOTP secrets with AES-256-GCM and verifies codes", () => {
    const secret = generateTotpSecret();
    const enc = encryptTotpSecret(secret);
    expect(enc).not.toContain(secret);
    const dec = decryptTotpSecret(enc);
    expect(dec).toBe(secret);

    const token = authenticator.generate(secret);
    expect(verifyTotpCode(token, dec)).toBe(true);
    expect(verifyTotpCode("000000", dec)).toBe(false);
  });

  it("generates 10 one-time recovery codes and hashes them deterministically", () => {
    const { plainCodes, hashedCodes } = generateRecoveryCodes();
    expect(plainCodes).toHaveLength(10);
    expect(hashedCodes).toHaveLength(10);
    expect(hashRecoveryCode(plainCodes[0]!)).toBe(hashedCodes[0]);
  });

  it("strips XSS payloads from rich text and plain text inputs", () => {
    const xssPayload =
      '<p>Hello</p><script>alert(1)</script><img src=x onerror=alert(1)><a href="javascript:alert(1)">Click</a>';
    const cleanedRich = sanitizeRichText(xssPayload);
    expect(cleanedRich).not.toContain("<script>");
    expect(cleanedRich).not.toContain("onerror");
    expect(cleanedRich).not.toContain("javascript:");
    expect(cleanedRich).toContain("<p>Hello</p>");

    const cleanedPlain = sanitizePlainText("<b>Bold</b><script>evil()</script>");
    expect(cleanedPlain).toBe("Bold");
  });

  it("blocks unsafe URLs (javascript:, data:, file:) and allows HTTPS", () => {
    expect(isSafeExternalUrl("https://eventloom.codeloom.site")).toBe(true);
    expect(isSafeExternalUrl("javascript:alert(1)")).toBe(false);
    expect(isSafeExternalUrl("data:text/html,<script>alert(1)</script>")).toBe(false);
  });

  it("blocks private, loopback, link-local, and cloud metadata IPs (SSRF protection)", () => {
    expect(isPrivateOrReservedIp("127.0.0.1")).toBe(true);
    expect(isPrivateOrReservedIp("10.0.0.1")).toBe(true);
    expect(isPrivateOrReservedIp("192.168.1.1")).toBe(true);
    expect(isPrivateOrReservedIp("169.254.169.254")).toBe(true);
    expect(isPrivateOrReservedIp("::1")).toBe(true);
    expect(isPrivateOrReservedIp("8.8.8.8")).toBe(false);
  });

  it("validates hex colours and safely serializes JSON-LD against script breakout", () => {
    expect(isValidHexColor("#ea580c")).toBe(true);
    expect(isValidHexColor("#EA580C; background:url(evil)")).toBe(false);

    const jsonLd = safeJsonLd({ name: "</script><script>alert(1)</script>" });
    expect(jsonLd).not.toContain("</script>");
    expect(jsonLd).toContain("\\u003c/script\\u003e");
  });
});
