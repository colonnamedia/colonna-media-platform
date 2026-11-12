const stages = ["new", "contacted", "qualified", "proposal", "won"];

export function funnelRows(inquiries, contacts, { days = 30, landing = "", campaign = "", now = Date.now() } = {}) {
  const since = days === "all" ? 0 : now - Number(days) * 86400000;
  const matching = inquiries.filter(i => !i.archived_at && new Date(i.created_at).getTime() >= since)
    .filter(i => !landing || (i.attribution?.landing_page || i.page || "Unknown") === landing)
    .filter(i => !campaign || (i.attribution?.utm_campaign || "") === campaign);
  const contactsByEmail = new Map(contacts.filter(c => !c.archived_at).map(c => [c.email.toLowerCase(), c]));
  const people = new Map();
  for (const inquiry of [...matching].sort((a, b) => new Date(a.created_at) - new Date(b.created_at))) {
    const email = inquiry.email.toLowerCase();
    // A person may inquire twice. Attribute them once, to their first inquiry in this view.
    if (people.has(email)) continue;
    const contact = contactsByEmail.get(email);
    const stage = contact?.kind === "client" ? "won" : contact?.stage || "new";
    const attribution = inquiry.attribution || {};
    const source = attribution.utm_source || (attribution.gclid || attribution.gbraid || attribution.wbraid ? "Google Ads" : attribution.fbclid ? "Meta" : "Unspecified");
    people.set(email, {
      email, name: inquiry.name, business: inquiry.business,
      landing: inquiry.attribution?.landing_page || inquiry.page || "Unknown",
      submitted: inquiry.attribution?.form_page || inquiry.page || "Unknown",
      source,
      campaign: inquiry.attribution?.utm_campaign || "Unspecified",
      service: inquiry.services, created_at: inquiry.created_at,
      stage: stages.includes(stage) ? stage : "new",
    });
  }
  return [...people.values()];
}

export function funnelCounts(rows) {
  return stages.map((stage, index) => ({
    stage, count: rows.filter(row => stages.indexOf(row.stage) >= index).length,
  }));
}
