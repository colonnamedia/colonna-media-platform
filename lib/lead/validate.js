import { z } from "zod";
import {
  TRACKING_KEYS,
  FORM_PAGES,
  pagePath,
  cleanReferrer,
} from "./attribution.js";
const tracking = z.string().trim().max(500).default("");
const inputSchema = z.object({
  submission_page: z.string().max(2048).optional(),
  form_id: z
    .string()
    .regex(/^[a-zA-Z0-9_-]{1,100}$/)
    .optional(),
  landing_page: z.string().max(2048).optional(),
  referrer: z.string().max(2048).optional(),
  ...Object.fromEntries(TRACKING_KEYS.map((key) => [key, tracking])),
});
export function normalizeAttribution(input, req) {
  const data = inputSchema.parse(input || {});
  const fallback = pagePath(req.headers?.referer || "");
  const submitting = data.submission_page
    ? pagePath(data.submission_page)
    : fallback;
  return {
    ...Object.fromEntries(TRACKING_KEYS.map((key) => [key, data[key]])),
    submission_page: submitting,
    form_id: data.form_id || FORM_PAGES[submitting] || "legacy-inquiry",
    landing_page: data.landing_page ? pagePath(data.landing_page) : submitting,
    referrer: cleanReferrer(data.referrer),
    attribution_version: input ? 1 : 0,
  };
}
