import "server-only";
import dns from "node:dns/promises";
import net from "node:net";

/**
 * Checks whether an IPv4 or IPv6 address is private, loopback, link-local, or cloud metadata (Section 9 & 11.3).
 */
export function isPrivateOrReservedIp(ip: string): boolean {
  if (!net.isIP(ip)) return true;

  if (net.isIPv4(ip)) {
    const parts = ip.split(".").map(Number);
    const [a = 0, b = 0] = parts;
    // 0.0.0.0/8, 10.0.0.0/8, 127.0.0.0/8
    if (a === 0 || a === 10 || a === 127) return true;
    // 100.64.0.0/10 (Carrier-grade NAT)
    if (a === 100 && b >= 64 && b <= 127) return true;
    // 169.254.0.0/16 (Link-local + AWS/GCP/Azure metadata 169.254.169.254)
    if (a === 169 && b === 254) return true;
    // 172.16.0.0/12
    if (a === 172 && b >= 16 && b <= 31) return true;
    // 192.168.0.0/16
    if (a === 192 && b === 168) return true;
    // 224.0.0.0/4 (Multicast / Reserved)
    if (a >= 224) return true;
    return false;
  }

  // IPv6 checks
  const normalized = ip.toLowerCase();
  if (
    normalized === "::1" ||
    normalized === "::" ||
    normalized.startsWith("fc") ||
    normalized.startsWith("fd") ||
    normalized.startsWith("fe80") ||
    normalized.startsWith("::ffff:127.") ||
    normalized.startsWith("::ffff:10.") ||
    normalized.startsWith("::ffff:192.168.") ||
    normalized.startsWith("::ffff:169.254.")
  ) {
    return true;
  }

  return false;
}

export interface SafeLinkCheckResult {
  ok: boolean;
  status: number;
  error?: string;
}

/**
 * Performs an SSRF-protected HEAD/GET health check for a public HTTPS URL (Section 9).
 */
export async function checkExternalLinkSafety(urlStr: string): Promise<SafeLinkCheckResult> {
  try {
    const parsed = new URL(urlStr);
    if (parsed.protocol !== "https:") {
      return { ok: false, status: 0, error: "Only HTTPS URLs are permitted" };
    }
    if (parsed.username || parsed.password) {
      return { ok: false, status: 0, error: "Credentials in URL are prohibited" };
    }

    // Resolve all DNS records and verify none resolve to private/internal IPs
    const addresses = await dns.lookup(parsed.hostname, { all: true });
    if (addresses.length === 0) {
      return { ok: false, status: 0, error: "DNS resolution failed" };
    }
    for (const addr of addresses) {
      if (isPrivateOrReservedIp(addr.address)) {
        return {
          ok: false,
          status: 0,
          error: "Blocked: resolves to private or reserved IP range",
        };
      }
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4500);

    try {
      const res = await fetch(parsed.toString(), {
        method: "HEAD",
        redirect: "manual",
        signal: controller.signal,
        headers: {
          "User-Agent": "CodeLoom-LinkChecker/1.0",
        },
      });
      return {
        ok: res.status >= 200 && res.status < 400,
        status: res.status,
      };
    } finally {
      clearTimeout(timeout);
    }
  } catch (err) {
    return {
      ok: false,
      status: 0,
      error: err instanceof Error ? err.message : "Health check failed",
    };
  }
}
