import "server-only";
import crypto from "node:crypto";
import { hash, verify } from "@node-rs/argon2";
import { zxcvbn, zxcvbnOptions } from "@zxcvbn-ts/core";
import * as zxcvbnCommonPackage from "@zxcvbn-ts/language-common";
import * as zxcvbnEnPackage from "@zxcvbn-ts/language-en";
import { getEnv } from "@/lib/env";

// Configure zxcvbn dictionary once
zxcvbnOptions.setOptions({
  translations: zxcvbnEnPackage.translations,
  graphs: zxcvbnCommonPackage.adjacencyGraphs,
  dictionary: {
    ...zxcvbnCommonPackage.dictionary,
    ...zxcvbnEnPackage.dictionary,
  },
});

const ARGON2_OPTIONS = {
  memoryCost: 65536, // 64 MiB
  timeCost: 3,
  parallelism: 4,
  outputLen: 32,
};

function applyPepper(password: string): string {
  const env = getEnv();
  return crypto
    .createHmac("sha256", env.PASSWORD_PEPPER)
    .update(password)
    .digest("hex");
}

export async function hashPassword(plainPassword: string): Promise<string> {
  const peppered = applyPepper(plainPassword);
  return hash(peppered, ARGON2_OPTIONS);
}

export async function verifyPassword(
  plainPassword: string,
  storedHash: string
): Promise<boolean> {
  try {
    const peppered = applyPepper(plainPassword);
    return await verify(storedHash, peppered);
  } catch {
    return false;
  }
}

/**
 * Runs a dummy Argon2 verification when an email doesn't exist to ensure uniform response timing (Section 11.1).
 */
const DUMMY_ARGON2_HASH =
  "$argon2id$v=19$m=65536,t=3,p=4$c29tZXJhbmRvbXNhbHQxMjM0NTY$R3B2bFpqV2t5amh6V2t5amh6V2t5amh6V2t5amh6V2s";

export async function verifyDummyPassword(plainPassword: string): Promise<void> {
  try {
    const peppered = applyPepper(plainPassword);
    await verify(DUMMY_ARGON2_HASH, peppered);
  } catch {
    // Ignore
  }
}

export interface PasswordStrengthResult {
  valid: boolean;
  score: number;
  reason?: string;
}

/**
 * Validates password strength per Section 7.2 & 11.1:
 * - Minimum 12 characters
 * - Does not contain email or brand name ("codeloom")
 * - zxcvbn score >= 3
 */
export function checkPasswordStrength(
  password: string,
  email = "codeloom.lk@gmail.com"
): PasswordStrengthResult {
  if (password.length < 12) {
    return {
      valid: false,
      score: 0,
      reason: "Password must be at least 12 characters long.",
    };
  }

  const lower = password.toLowerCase();
  const emailPrefix = email.split("@")[0]?.toLowerCase() ?? "codeloom";
  if (
    lower.includes("codeloom") ||
    lower.includes("code loom") ||
    (emailPrefix.length >= 3 && lower.includes(emailPrefix))
  ) {
    return {
      valid: false,
      score: 1,
      reason: "Password must not contain the brand name or your email address.",
    };
  }

  const evaluation = zxcvbn(password, [email, "codeloom", "eventloom", "captureloom", "promoloom"]);
  if (evaluation.score < 3) {
    return {
      valid: false,
      score: evaluation.score,
      reason:
        evaluation.feedback.warning ||
        "Password is too predictable. Use a longer passphrase or mix of words and symbols.",
    };
  }

  return { valid: true, score: evaluation.score };
}
