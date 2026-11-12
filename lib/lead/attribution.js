const FIELDS = ["landing_page", "form_page", "form_id", "referrer", "utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "gclid", "gbraid", "wbraid", "fbclid"];
export function normalizeAttribution(input, submittedPage) {
  const source = input && typeof input === "object" && !Array.isArray(input) ? input : {};
  const out = {};
  for (const key of FIELDS) {
    if (key === "form_page") continue;
    const value = source[key];
    if (typeof value === "string") out[key] = value.trim().slice(0, key === "referrer" ? 500 : 300);
  }
  // The actual submitting page comes from the request, rather than browser JSON.
  out.form_page = String(submittedPage || "").slice(0, 300);
  return out;
}
