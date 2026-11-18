import "server-only";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  APP_URL: z.string().url().default("http://localhost:3000"),
  SESSION_SECRET: z
    .string()
    .min(32, "SESSION_SECRET must be at least 32 characters"),
  PASSWORD_PEPPER: z
    .string()
    .min(16, "PASSWORD_PEPPER must be at least 16 characters"),
  IP_HASH_SALT: z
    .string()
    .min(16, "IP_HASH_SALT must be at least 16 characters"),
  SEED_ADMIN_EMAIL: z.string().email().default("codeloom.lk@gmail.com"),
  SEED_ADMIN_PASSWORD: z.string().optional().default(""),
  REQUIRE_ADMIN_2FA: z
    .enum(["true", "false"])
    .default("false")
    .transform((v) => v === "true"),
  ADMIN_IP_ALLOWLIST: z.string().optional().default(""),
  SMTP_HOST: z.string().optional().default(""),
  SMTP_PORT: z.string().optional().default(""),
  SMTP_USER: z.string().optional().default(""),
  SMTP_PASS: z.string().optional().default(""),
  MAIL_FROM: z.string().optional().default("no-reply@codeloom.site"),
  NOTIFY_EMAIL: z.string().email().default("codeloom.lk@gmail.com"),
  STORAGE_DRIVER: z.enum(["local", "s3"]).default("local"),
  UPLOAD_MAX_IMAGE_MB: z.coerce.number().positive().default(8),
  UPLOAD_MAX_VIDEO_MB: z.coerce.number().positive().default(100),
  CAPTCHA_PROVIDER: z.enum(["turnstile", "hcaptcha", ""]).default(""),
  CAPTCHA_SITE_KEY: z.string().optional().default(""),
  CAPTCHA_SECRET: z.string().optional().default(""),
});

export type Env = z.infer<typeof envSchema>;

let cachedEnv: Env | null = null;

export function getEnv(): Env {
  if (cachedEnv) return cachedEnv;

  const parsed = envSchema.safeParse({
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_URL: process.env.DATABASE_URL,
    APP_URL: process.env.APP_URL,
    SESSION_SECRET: process.env.SESSION_SECRET,
    PASSWORD_PEPPER: process.env.PASSWORD_PEPPER,
    IP_HASH_SALT: process.env.IP_HASH_SALT,
    SEED_ADMIN_EMAIL: process.env.SEED_ADMIN_EMAIL,
    SEED_ADMIN_PASSWORD: process.env.SEED_ADMIN_PASSWORD,
    REQUIRE_ADMIN_2FA: process.env.REQUIRE_ADMIN_2FA,
    ADMIN_IP_ALLOWLIST: process.env.ADMIN_IP_ALLOWLIST,
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: process.env.SMTP_PORT,
    SMTP_USER: process.env.SMTP_USER,
    SMTP_PASS: process.env.SMTP_PASS,
    MAIL_FROM: process.env.MAIL_FROM,
    NOTIFY_EMAIL: process.env.NOTIFY_EMAIL,
    STORAGE_DRIVER: process.env.STORAGE_DRIVER,
    UPLOAD_MAX_IMAGE_MB: process.env.UPLOAD_MAX_IMAGE_MB,
    UPLOAD_MAX_VIDEO_MB: process.env.UPLOAD_MAX_VIDEO_MB,
    CAPTCHA_PROVIDER: process.env.CAPTCHA_PROVIDER,
    CAPTCHA_SITE_KEY: process.env.CAPTCHA_SITE_KEY,
    CAPTCHA_SECRET: process.env.CAPTCHA_SECRET,
  });

  if (!parsed.success) {
    const formatted = parsed.error.issues
      .map((i) => `${i.path.join(".")}: ${i.message}`)
      .join(", ");
    throw new Error(`Invalid environment configuration: ${formatted}`);
  }

  cachedEnv = parsed.data;
  return cachedEnv;
}
