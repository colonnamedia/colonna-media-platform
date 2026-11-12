// Shared by the public capture script, validation, and reporting.
export const TRACKING_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "gclid",
  "gbraid",
  "wbraid",
  "fbclid",
  "msclkid",
  "ttclid",
  "li_fat_id",
];
export const FORM_PAGES = {
  "/contact": "contact-inquiry",
  "/start": "start-inquiry",
  "/web-design-ads": "web-design-inquiry",
  "/google-ads-management": "google-ads-inquiry",
  "/photography": "photography-inquiry",
};
export function pagePath(value, origin = "https://www.colonnamedia.com") {
  if (!value) return "";
  try {
    const url = new URL(value, origin);
    if (!["http:", "https:"].includes(url.protocol)) return "";
    return url.pathname.replace(/\.html$/, "").replace(/\/$/, "") || "/";
  } catch {
    return "";
  }
}
export function cleanReferrer(value) {
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol)
      ? (url.origin + url.pathname).slice(0, 2048)
      : "";
  } catch {
    return "";
  }
}
export function attributionSource(inquiry) {
  if (inquiry.utm_source) return inquiry.utm_source;
  if (inquiry.gclid || inquiry.gbraid || inquiry.wbraid) return "Google Ads";
  if (inquiry.msclkid) return "Microsoft Ads";
  // fbclid alone is also attached to organic Facebook clicks.
  if (inquiry.fbclid) return "Facebook / Instagram click";
  if (inquiry.ttclid) return "TikTok click";
  if (inquiry.referrer) {
    try {
      return new URL(inquiry.referrer).hostname;
    } catch {
      /* Legacy values. */
    }
  }
  return inquiry.attribution_version ? "Direct / unavailable" : "Not recorded";
}
