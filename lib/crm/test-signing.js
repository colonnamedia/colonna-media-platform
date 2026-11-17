import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

const lifetimeSeconds = 24 * 60 * 60;
const uuid = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;
const noncePattern = /^[A-Za-z0-9_-]{22}$/;
const signaturePattern = /^[A-Za-z0-9_-]{43}$/;

function signature(payload) {
  const key = process.env.CRM_SUPABASE_SECRET_KEY;
  if (!key) throw Object.assign(new Error("Test signing is unavailable"), { status: 503 });
  return createHmac("sha256", key).update(`colonna-test-signing-v1:${payload}`).digest("base64url");
}

export function createTestSigningToken(id, now = Date.now()) {
  if (!uuid.test(id)) throw Error("Invalid agreement ID");
  const payload = `${id}.${Math.floor(now / 1000) + lifetimeSeconds}.${randomBytes(16).toString("base64url")}`;
  return `${payload}.${signature(payload)}`;
}

export function verifyTestSigningToken(token, now = Date.now()) {
  const parts = String(token || "").split(".");
  if (parts.length !== 4 || !uuid.test(parts[0]) || !/^\d{10}$/.test(parts[1]) ||
      !noncePattern.test(parts[2]) || !signaturePattern.test(parts[3]) ||
      Number(parts[1]) <= Math.floor(now / 1000) ||
      Number(parts[1]) > Math.floor(now / 1000) + lifetimeSeconds)
    throw Object.assign(new Error("Test signing link is invalid or expired"), { status: 404 });
  const actual = Buffer.from(parts[3]);
  const expected = Buffer.from(signature(parts.slice(0, 3).join(".")));
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected))
    throw Object.assign(new Error("Test signing link is invalid or expired"), { status: 404 });
  return parts[0];
}
