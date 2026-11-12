// First-party attribution for an inquiry, kept only for this browser tab/session.
// Store the first landing page once; record the page that actually submits the form.
const KEY = "colonna-lead-attribution-v1";
const params = new URLSearchParams(window.location.search);
const fields = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "gclid", "gbraid", "wbraid", "fbclid"];
const safePath = value => String(value || "").slice(0, 300);

export function captureAttribution() {
  try {
    const previous = JSON.parse(sessionStorage.getItem(KEY) || "null");
    const campaign = Object.fromEntries(fields.map(key => [key, (params.get(key) || "").slice(0, 300)]));
    const hasCampaign = Object.values(campaign).some(Boolean);
    const first = previous && !hasCampaign ? previous : {
      landing_page: safePath(window.location.pathname),
      referrer: String(document.referrer || "").slice(0, 500),
      ...campaign,
    };
    sessionStorage.setItem(KEY, JSON.stringify(first));
    return first;
  } catch {
    return { landing_page: safePath(window.location.pathname) };
  }
}

export function formAttribution(formId) {
  const first = captureAttribution();
  return { ...first, form_page: safePath(window.location.pathname), form_id: String(formId).slice(0, 100) };
}

captureAttribution();
