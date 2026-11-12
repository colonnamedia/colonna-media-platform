import {
  TRACKING_KEYS,
  pagePath,
  cleanReferrer,
  FORM_PAGES,
} from "../lib/lead/attribution.js";

const STORAGE_KEY = "colonna-lead-touch-v1";
const MAX_AGE = 24 * 60 * 60 * 1000;
let touch;
const formFingerprints = new WeakMap();
export function captureTouch(win = window) {
  const now = Date.now();
  let saved;
  try {
    saved = JSON.parse(win.sessionStorage.getItem(STORAGE_KEY));
  } catch {
    /* Storage can be disabled. */
  }
  const params = new URLSearchParams(win.location.search);
  const tagged = TRACKING_KEYS.some(
    (key) => params.has(key) && params.get(key),
  );
  const referrer = cleanReferrer(win.document.referrer);
  let external = false;
  try {
    external = new URL(referrer).origin !== win.location.origin;
  } catch {
    /* No referrer. */
  }
  const fresh =
    saved?.version === 1 && now - saved.at < MAX_AGE && now >= saved.at;
  if (fresh && !tagged && !external) {
    touch = saved;
  } else {
    touch = {
      version: 1,
      at: now,
      landing_page: pagePath(win.location.href),
      referrer: external ? referrer : "",
    };
    for (const key of TRACKING_KEYS)
      touch[key] = (params.get(key) || "").slice(0, 500);
  }
  try {
    win.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(touch));
  } catch {
    /* Use the in-memory touch on this page. */
  }
  return touch;
}
export function leadAttribution(formId, services = []) {
  if (!touch) captureTouch();
  return {
    ...Object.fromEntries(TRACKING_KEYS.map((key) => [key, touch[key] || ""])),
    landing_page: touch.landing_page,
    referrer: touch.referrer,
    submission_page: pagePath(window.location.href),
    form_id:
      formId || FORM_PAGES[pagePath(window.location.href)] || "legacy-inquiry",
    selected_services: services,
    attribution_version: 1,
  };
}
export function submissionKey(form) {
  const fingerprint = JSON.stringify([...new FormData(form).entries()]);
  if (
    !form.dataset.submissionKey ||
    formFingerprints.get(form) !== fingerprint
  ) {
    form.dataset.submissionKey = crypto.randomUUID();
    formFingerprints.set(form, fingerprint);
  }
  return form.dataset.submissionKey;
}

if (typeof window !== "undefined") {
  captureTouch();
  window.ColonnaLead = { attribution: leadAttribution, submissionKey };
}
