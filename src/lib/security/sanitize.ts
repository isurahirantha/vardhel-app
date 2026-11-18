import sanitizeHtml from "sanitize-html";

const STRICT_RICHTEXT_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    "p",
    "br",
    "strong",
    "em",
    "u",
    "s",
    "blockquote",
    "ul",
    "ol",
    "li",
    "h2",
    "h3",
    "h4",
    "code",
    "pre",
    "a",
    "hr",
  ],
  allowedAttributes: {
    a: ["href", "target", "rel"],
  },
  allowedSchemes: ["http", "https", "mailto"],
  transformTags: {
    a: sanitizeHtml.simpleTransform("a", {
      rel: "noopener noreferrer",
      target: "_blank",
    }),
  },
};

/**
 * Sanitizes rich text HTML on save AND on render (Section 11.3).
 */
export function sanitizeRichText(dirty: string | null | undefined): string {
  if (!dirty) return "";
  return sanitizeHtml(dirty, STRICT_RICHTEXT_OPTIONS).trim();
}

/**
 * Strips ALL HTML tags for plain-text fields (feedback, enquiries, names, titles).
 */
export function sanitizePlainText(dirty: string | null | undefined): string {
  if (!dirty) return "";
  return sanitizeHtml(dirty, {
    allowedTags: [],
    allowedAttributes: {},
  })
    .replace(/[\r\n]+/g, "\n")
    .trim();
}

/**
 * Strips CR/LF to prevent email header injection (Section 11.3).
 */
export function stripCrLf(input: string): string {
  return input.replace(/[\r\n]/g, " ").trim();
}

/**
 * Safely serializes JSON-LD so `</script>` or HTML entities cannot break out of script tags.
 */
export function safeJsonLd(data: Record<string, unknown>): string {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");
}

/**
 * Validates external URLs (rejects javascript:, data:, vbscript:, etc. — Section 9 & 11.3).
 */
export function isSafeExternalUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    if (parsed.protocol === "https:") return true;
    if (
      process.env.NODE_ENV !== "production" &&
      parsed.protocol === "http:" &&
      (parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1")
    ) {
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

/**
 * Validates hex colour strings (`#RRGGBB`) for CSS token injection (Section 10).
 */
export function isValidHexColor(val: string): boolean {
  return /^#[0-9A-Fa-f]{6}$/.test(val.trim());
}
