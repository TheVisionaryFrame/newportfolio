/**
 * Defensive response headers for XSS/clickjacking/MIME sniffing and related
 * scanner findings. This is hardening, not a guarantee against all attacks.
 *
 * Contact form / admin data go through @supabase/supabase-js (parameterized).
 * Never concatenate user input into SQL strings.
 */

const SECURITY_HEADER_NAMES = [
  "Content-Security-Policy",
  "X-Content-Type-Options",
  "X-Frame-Options",
  "Referrer-Policy",
  "Permissions-Policy",
  "Strict-Transport-Security",
  "Cross-Origin-Opener-Policy",
  "Cross-Origin-Resource-Policy",
] as const;

function isProduction(): boolean {
  return process.env["NODE_ENV"] === "production";
}

function isLocalDevHost(hostname: string): boolean {
  return (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "[::1]" ||
    hostname.endsWith(".localhost")
  );
}

function isHttpsRequest(request: Request): boolean {
  try {
    const url = new URL(request.url);
    if (url.protocol === "https:") return true;
  } catch {
    // ignore malformed URL
  }
  const forwarded = request.headers.get("x-forwarded-proto");
  if (forwarded?.split(",")[0]?.trim().toLowerCase() === "https") return true;
  const cfVisitor = request.headers.get("cf-visitor");
  if (cfVisitor?.includes('"scheme":"https"')) return true;
  return false;
}

/**
 * Compatible CSP for this app:
 * - 'self' scripts/styles + Vite HMR in development
 * - Google Fonts (stylesheet + font files)
 * - YouTube thumbnails (i.ytimg.com)
 * - Local hero video (/hero.mp4)
 * - 'unsafe-inline' styles for Framer Motion / Radix inline styles
 * - 'unsafe-inline' scripts for TanStack Start hydration (no nonce pipeline yet)
 * No YouTube iframe embeds today — frame-src stays 'none'.
 */
function supabaseConnectOrigins(): string {
  const fromProcess =
    typeof process !== "undefined" ? process.env["VITE_SUPABASE_URL"]?.trim() : undefined;
  const fromImportMeta =
    typeof import.meta !== "undefined"
      ? (import.meta.env as { VITE_SUPABASE_URL?: string } | undefined)?.["VITE_SUPABASE_URL"]?.trim()
      : undefined;
  const fromEnv = fromProcess || fromImportMeta || "";

  if (fromEnv) {
    try {
      return new URL(fromEnv).origin;
    } catch {
      // fall through to wildcard host pattern
    }
  }

  // Allow any Supabase project host until VITE_SUPABASE_URL is set at build time.
  return "https://*.supabase.co";
}

export function buildContentSecurityPolicy(isDev: boolean): string {
  const scriptSrc = isDev
    ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
    : "script-src 'self' 'unsafe-inline'";

  const supabaseOrigin = supabaseConnectOrigins();
  const connectSrc = isDev
    ? `connect-src 'self' ws: wss: http: https: ${supabaseOrigin}`
    : `connect-src 'self' ${supabaseOrigin}`;

  return [
    "default-src 'self'",
    scriptSrc,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' data: blob: https://i.ytimg.com https://img.youtube.com",
    "media-src 'self' blob:",
    connectSrc,
    "frame-src 'none'",
    "frame-ancestors 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "worker-src 'self' blob:",
  ].join("; ");
}

export type SecurityHeaderMap = Record<string, string>;

export function getSecurityHeaders(request: Request): SecurityHeaderMap {
  const isDev = !isProduction();
  let hostname = "";
  try {
    hostname = new URL(request.url).hostname;
  } catch {
    hostname = "";
  }

  const headers: SecurityHeaderMap = {
    "Content-Security-Policy": buildContentSecurityPolicy(isDev),
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy":
      "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()",
    // Protect same-origin browsing context; YouTube opens in new tabs via links.
    "Cross-Origin-Opener-Policy": "same-origin",
    // Limit other sites from embedding our responses as resources.
    "Cross-Origin-Resource-Policy": "same-origin",
  };

  // HSTS only over real HTTPS and never for local hosts (breaks http://localhost).
  if (isHttpsRequest(request) && !isLocalDevHost(hostname)) {
    headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains";
  }

  return headers;
}

/** Mutates `headers` in place with security headers (overwrites prior values). */
export function applySecurityHeaders(headers: Headers, request: Request): void {
  const next = getSecurityHeaders(request);
  for (const name of SECURITY_HEADER_NAMES) {
    const value = next[name];
    if (value) headers.set(name, value);
    else headers.delete(name);
  }
}

/** Clone a Response with security headers applied. */
export function withSecurityHeaders(request: Request, response: Response): Response {
  const headers = new Headers(response.headers);
  applySecurityHeaders(headers, request);
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

/** Plain object headers for Vite `server.headers` / error Response constructors. */
export function securityHeadersForViteDev(): Record<string, string> {
  // Vite serves over http locally — omit HSTS.
  return getSecurityHeaders(new Request("http://localhost/"));
}
