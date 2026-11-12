import { attributionSource } from "./attribution.js";
import { nyDate, SERVICES } from "../crm/domain.js";
export const LEAD_STAGES = [
  ["new", "Inquiries received"],
  ["contacted", "Contacted"],
  ["qualified", "Qualified"],
  ["proposal", "Proposal sent"],
  ["won", "Won"],
];
export const stageRank = (inquiry) =>
  Math.max(
    0,
    ...[
      inquiry.stage,
      ...(inquiry.stage_history || []).map((event) => event.stage),
    ].map((stage) => LEAD_STAGES.findIndex(([id]) => id === stage)),
  );
export function inquiryServices(inquiry) {
  if (inquiry.service_ids?.length) return inquiry.service_ids;
  return Object.entries(SERVICES)
    .filter(
      ([id, name]) =>
        (inquiry.services || "").toLowerCase().includes(name.toLowerCase()) ||
        (inquiry.services || "").toLowerCase().includes(id),
    )
    .map(([id]) => id);
}
export function filterInquiries(inquiries, filters) {
  return inquiries.filter((inquiry) => {
    const date = nyDate(new Date(inquiry.created_at));
    return (
      (!filters.from || date >= filters.from) &&
      (!filters.to || date <= filters.to) &&
      (filters.archive === "all" ||
        Boolean(inquiry.archived_at) === (filters.archive === "archived")) &&
      (!filters.page ||
        (inquiry.submission_page || inquiry.page || "") === filters.page) &&
      (!filters.service ||
        inquiryServices(inquiry).includes(filters.service)) &&
      (!filters.campaign ||
        (inquiry.utm_campaign || "") === filters.campaign) &&
      (!filters.source || attributionSource(inquiry) === filters.source)
    );
  });
}
export function funnel(inquiries) {
  return LEAD_STAGES.map(([stage, label], index) => ({
    stage,
    label,
    count: inquiries.filter((inquiry) => stageRank(inquiry) >= index).length,
  }));
}
export function groupedFunnel(inquiries, dimension) {
  const groups = new Map();
  for (const inquiry of inquiries) {
    const values =
      dimension === "service"
        ? inquiryServices(inquiry).length
          ? inquiryServices(inquiry).map((id) => SERVICES[id])
          : ["Not recorded"]
        : [
            dimension === "campaign"
              ? inquiry.utm_campaign || "Not recorded"
              : inquiry.submission_page || inquiry.page || "Not recorded",
          ];
    for (const value of values)
      groups.set(value, [...(groups.get(value) || []), inquiry]);
  }
  return [...groups]
    .map(([label, rows]) => ({
      label,
      counts: funnel(rows).map((item) => item.count),
    }))
    .sort(
      (a, b) => b.counts[0] - a.counts[0] || a.label.localeCompare(b.label),
    );
}
export function inquiriesCSV(inquiries) {
  const keys = [
    "id",
    "contact_id",
    "created_at",
    "name",
    "email",
    "services",
    "stage",
    "archived_at",
    "submission_page",
    "form_id",
    "landing_page",
    "referrer",
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
    "project_type",
    "message",
  ];
  const cell = (value) => {
    let s = String(value ?? "");
    if (/^\s*[=+@\-]/.test(s) || /^[\t\r\n]/.test(s)) s = "'" + s;
    return '"' + s.replaceAll('"', '""') + '"';
  };
  return [
    keys,
    ...inquiries.map((inquiry) =>
      keys.map((key) =>
        key === "stage" ? inquiry.stage || "new" : inquiry[key],
      ),
    ),
  ]
    .map((row) => row.map(cell).join(","))
    .join("\r\n");
}
