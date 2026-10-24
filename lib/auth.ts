import crypto from "crypto";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

const SESSION_COOKIE_NAME = "admin_auth_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

function getSecretKey(): string {
  return process.env.ADMIN_SESSION_SECRET || "fallback_default_secure_secret_key_data_entry_2026";
}

export function getAdminPassword(): string {
  return process.env.ADMIN_PASSWORD || "admin123";
}

/**
 * Creates a cryptographically signed session token: timestamp.signature
 */
export function createSessionToken(): string {
  const timestamp = Date.now().toString();
  const hmac = crypto.createHmac("sha256", getSecretKey());
  hmac.update(timestamp);
  const signature = hmac.digest("hex");
  return `${timestamp}.${signature}`;
}

/**
 * Verifies if the given token is authentic and not expired
 */
export function verifySessionToken(token: string | undefined | null): boolean {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 2) return false;

  const [timestampStr, providedSignature] = parts;
  const timestamp = parseInt(timestampStr, 10);
  if (isNaN(timestamp)) return false;

  // Check expiration (7 days)
  const now = Date.now();
  if (now - timestamp > SESSION_MAX_AGE_SECONDS * 1000 || timestamp > now + 60000) {
    return false;
  }

  const hmac = crypto.createHmac("sha256", getSecretKey());
  hmac.update(timestampStr);
  const expectedSignature = hmac.digest("hex");

  try {
    return crypto.timingSafeEqual(
      Buffer.from(providedSignature, "hex"),
      Buffer.from(expectedSignature, "hex")
    );
  } catch {
    return false;
  }
}

/**
 * Validates password with timing-safe comparison
 */
export function verifyAdminPassword(password: string): boolean {
  const actualPassword = getAdminPassword();
  const inputHash = crypto.createHash("sha256").update(password).digest();
  const actualHash = crypto.createHash("sha256").update(actualPassword).digest();
  return crypto.timingSafeEqual(inputHash, actualHash);
}

/**
 * Server-side check for authentication from Next.js Server Components or Route Handlers
 */
export async function isAuthenticatedServer(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  return verifySessionToken(token);
}

/**
 * Check authentication directly from a NextRequest in Route Handlers
 */
export function isAuthenticatedRequest(req: NextRequest): boolean {
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  return verifySessionToken(token);
}

export { SESSION_COOKIE_NAME, SESSION_MAX_AGE_SECONDS };
