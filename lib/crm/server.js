import { createClient } from "@supabase/supabase-js";
import { createHash, randomBytes } from "node:crypto";
export const OWNER_EMAIL = "colonnamedia@gmail.com";
export function configured() {
  return Boolean(
    process.env.CRM_SUPABASE_URL &&
      process.env.CRM_SUPABASE_PUBLISHABLE_KEY &&
      process.env.CRM_SUPABASE_SECRET_KEY &&
      process.env.CRM_ADMIN_USER_ID,
  );
}
export function db() {
  if (!configured())
    throw Object.assign(new Error("CRM setup is not complete"), {
      status: 503,
    });
  return createClient(
    process.env.CRM_SUPABASE_URL,
    process.env.CRM_SUPABASE_SECRET_KEY,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
export const hashToken = (t) => createHash("sha256").update(t).digest("hex");
export const newToken = () => randomBytes(32).toString("base64url");
export function tokenFrom(req) {
  const t = String(req.headers["x-signing-token"] || "");
  if (!/^[A-Za-z0-9_-]{43}$/.test(t))
    throw Object.assign(new Error("Signing link is invalid or expired"), {
      status: 404,
    });
  return t;
}
export function assertOrigin(req) {
  if (!["POST", "PATCH", "DELETE"].includes(req.method)) return;
  const origin = req.headers.origin;
  const allowed =
    process.env.CRM_PUBLIC_ORIGIN || "https://www.colonnamedia.com";
  if (origin !== allowed)
    throw Object.assign(new Error("Request origin is not allowed"), {
      status: 403,
    });
}
export async function requireAdmin(req, client = db()) {
  const jwt = String(req.headers.authorization || "").replace(/^Bearer /, "");
  if (!jwt) throw Object.assign(new Error("Please sign in"), { status: 401 });
  const { data, error } = await client.auth.getUser(jwt);
  if (error || !data?.user)
    throw Object.assign(new Error("Please sign in again"), { status: 401 });
  const user = data.user;
  if (
    user.id !== process.env.CRM_ADMIN_USER_ID ||
    user.email?.toLowerCase() !== OWNER_EMAIL ||
    !user.email_confirmed_at
  )
    throw Object.assign(new Error("Access restricted"), { status: 403 });
  const { data: aal, error: aalError } =
    await client.auth.mfa.getAuthenticatorAssuranceLevel(jwt);
  if (aalError || aal?.currentLevel !== "aal2")
    throw Object.assign(
      new Error("Google Authenticator verification is required"),
      { status: 403 },
    );
  return user;
}
export function check(result) {
  if (result.error) throw new Error("Database operation failed");
  return result.data;
}
export function body(req) {
  try {
    const v = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    if (!v || Array.isArray(v) || typeof v !== "object") throw Error();
    return v;
  } catch {
    throw Object.assign(new Error("Invalid request"), { status: 400 });
  }
}
export function headers(res) {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Robots-Tag", "noindex, nofollow, noarchive");
}
export function fail(res, e) {
  const status = e.status || (e.name === "ZodError" ? 400 : 500);
  return res
    .status(status)
    .json({
      error:
        status === 500
          ? "Unable to complete this request. Please try again."
          : e.name === "ZodError"
            ? e.issues.map((i) => i.message).join("; ")
            : e.message,
    });
}
export async function audit(client, entity, id, event, actor, details = {}) {
  check(
    await client
      .from("crm_events")
      .insert({ entity, entity_id: id, event, actor, details }),
  );
}
export async function captureLead(lead, serviceIds = []) {
  if (!configured()) return false;
  const client = db();
  // Retain each submission, including repeat inquiries from an existing contact.
  const { error: inquiryError } = await client.from("crm_inquiries").insert(lead);
  if (inquiryError) console.error("CRM inquiry persistence failed", inquiryError);

  // Create a lead once per email. A public form must never overwrite an owner's
  // notes, stage, contact details, or an existing client's profile.
  const { error: contactError } = await client.from("crm_contacts").upsert({
    name: lead.name,
    email: lead.email.trim().toLowerCase(),
    business: lead.business || "",
    phone: lead.phone || "",
    website: lead.website_url || "",
    kind: "lead",
    stage: "new",
    services: serviceIds,
    source: `Website inquiry${lead.page ? ` ${lead.page}` : ""}`,
    notes: lead.message || "",
    follow_up: "",
    marketing_consent: false,
  }, { onConflict: "email", ignoreDuplicates: true });
  if (contactError) console.error("CRM contact persistence failed", contactError);
  return !inquiryError && !contactError;
}
