import { z } from "zod";
export const SERVICES = {
  website: "Website design",
  "social-media": "Social media management",
  "google-ads": "Google Ads",
  "meta-ads": "Meta Ads",
  photography: "Photography",
  videography: "Videography",
  consulting: "Marketing consulting",
  automations: "Automations & systems",
};
const text = z.string().trim().max(2000);
const date = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine(
    (v) =>
      !Number.isNaN(Date.parse(v)) && new Date(v).toISOString().startsWith(v),
  );
const optionalDate = z.union([date, z.literal("")]).default("");
export const contactSchema = z.object({
  name: text.min(1).max(120),
  email: z
    .string()
    .trim()
    .email()
    .max(254)
    .transform((v) => v.toLowerCase()),
  business: text.default(""),
  phone: text.max(100).default(""),
  website: text.default(""),
  kind: z.enum(["lead", "client"]).default("lead"),
  stage: z
    .enum(["new", "contacted", "qualified", "proposal", "won", "lost"])
    .default("new"),
  services: z
    .array(z.enum(Object.keys(SERVICES)))
    .max(8)
    .default([]),
  source: text.default("Manual entry"),
  notes: z.string().max(10000).default(""),
  follow_up: optionalDate,
  marketing_consent: z.boolean().default(false),
});
export const jobSchema = z
  .object({
    contact_id: z.string().uuid(),
    title: text.min(1).max(200),
    services: z
      .array(z.enum(Object.keys(SERVICES)))
      .min(1)
      .max(8),
    mode: z.enum(["one-time", "recurring"]),
    status: z.enum(["planned", "active", "paused", "completed", "cancelled"]),
    start_date: optionalDate,
    end_date: optionalDate,
    auto_close: z.boolean().default(false),
    scope: z.string().max(20000).default(""),
    monthly_cents: z.number().int().min(0).max(100000000).default(0),
  })
  .superRefine((v, c) => {
    if (v.status === "active" && !v.start_date)
      c.addIssue({
        code: "custom",
        message: "Set a start date before making a job active",
      });
    if (v.end_date && !v.start_date)
      c.addIssue({
        code: "custom",
        message: "Set a start date before the end date",
      });
    if (v.end_date && v.end_date < v.start_date)
      c.addIssue({
        code: "custom",
        message: "End date must be on or after the start date",
      });
    if (v.auto_close && !v.end_date)
      c.addIssue({
        code: "custom",
        message: "An end date is required for automatic completion",
      });
    if (v.mode === "recurring" && v.auto_close)
      c.addIssue({
        code: "custom",
        message: "Recurring services must be ended explicitly",
      });
  });
const installment = z.object({
  label: text.min(1).max(200),
  amount_cents: z.number().int().positive().max(100000000),
  due: text.min(1).max(500),
});
export const agreementSchema = z
  .object({
    contact_id: z.string().uuid(),
    job_id: z.string().uuid(),
    title: text.min(1).max(200),
    agreement_date: date,
    total_cents: z.number().int().min(0).max(100000000),
    payments: z.array(installment).min(0).max(20),
    terms: z.string().trim().min(100).max(50000),
    terms_reviewed: z.boolean().default(false),
  })
  .superRefine((v, c) => {
    if (v.payments.reduce((s, p) => s + p.amount_cents, 0) !== v.total_cents)
      c.addIssue({
        code: "custom",
        message:
          "Installments must add up exactly to the one-time project total",
      });
  });
export const signSchema = z.object({
  name: z.string().trim().min(2).max(120),
  consent: z.literal(true),
  signature: z
    .string()
    .max(400000)
    .regex(/^data:image\/png;base64,[A-Za-z0-9+/=]+$/),
});
export const money = (cents) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
    cents / 100,
  );
export function nyDate(now = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}
export function effectiveJobStatus(job, today = nyDate()) {
  if (
    job.status === "active" &&
    job.mode === "one-time" &&
    job.auto_close &&
    job.end_date &&
    job.end_date < today
  )
    return "completed";
  return job.status;
}
export function isActiveJob(job, today = nyDate()) {
  return effectiveJobStatus(job, today) === "active" && Boolean(job.start_date) && job.start_date <= today;
}
export function paymentPlan(total, percent = 50) {
  const down = Math.round((total * percent) / 100);
  return [
    { label: "Down payment", amount_cents: down, due: "Before work begins" },
    { label: "Final balance", amount_cents: total - down, due: "On delivery" },
  ].filter((p) => p.amount_cents > 0);
}
export function draftTerms(job, templates = []) {
  const specifics = {
    website:
      "Website design: Specify page count, features, hosting/domain responsibility, included revisions, launch criteria, and when source files and ownership transfer.",
    "social-media":
      "Social media: Specify platforms, posts per billing period, content supplied by each party, approval deadlines, account access, minimum term, renewal, and cancellation notice.",
    "google-ads":
      "Google Ads: Specify setup versus ongoing management, campaign scope, reporting frequency, management fee, and ad budget paid separately to Google. Results are not guaranteed.",
    "meta-ads":
      "Meta Ads: Specify setup versus ongoing management, platforms, creative, reporting frequency, management fee, and ad budget paid separately to Meta. Results are not guaranteed.",
    photography:
      "Photography: Specify session date/location/duration, image count, selection and editing, delivery timing, rescheduling, and usage/license rights. Specify any release separately.",
    videography:
      "Videography: Specify shoot schedule, final video count/length/formats, editing rounds, delivery, music licensing, raw-footage treatment, and usage rights.",
    consulting:
      "Consulting: Specify sessions, written deliverables, timing, client responsibilities, and exclusions.",
    automations:
      "Automations: Specify workflows, supported integrations, third-party fees, handoff, maintenance, and ongoing support.",
  };
  const standard = `DRAFT — complete and review before issuing\n\nProvider: Colonna Media LLC, Anthony Colonna.\n\nScope and deliverables\n${job.scope || "[Describe the work and acceptance criteria]"}\n\n${job.services.map((s) => templates.find((t) => t.key === s)?.body || specifics[s]).join("\n\n")}\n\nSchedule\nStart: ${job.start_date}. ${job.end_date ? `Target completion/end: ${job.end_date}.` : "Ongoing until ended under the agreed cancellation terms."}\n\nPayment\nThe one-time price and installments shown above apply. ${job.mode === "recurring" ? `Recurring management fee: ${money(job.monthly_cents)} per month. Specify first billing date, billing period, term, renewal, cancellation notice, and whether fees are billed in advance.` : "Final balance is due on delivery unless a different milestone is listed."}\n\nClient responsibilities\n[Specify access, materials, feedback deadlines, and the effect of client delays.]\n\nRevisions and changes\n[Specify included revisions, approval process, and pricing for work outside scope.]\n\nCancellation, refunds, and delivery\n[Specify treatment of work already performed, cancellation, refunds, delivery evidence, and final acceptance.]\n\nOwnership and licensing\n[Specify ownership, permitted usage, and any payment conditions for transfer.]\n\nQuestions or concerns\nContact colonnamedia@gmail.com about the project or billing.\n\nElectronic acceptance\nThe signer consents to electronic records and signatures and intends their drawn signature to accept this complete agreement. Signing does not by itself authorize future card charges; any recurring payment authorization must be obtained separately.`;
  const master = templates.find((t) => t.key === "master")?.body;
  return master
    ? standard
        .replace("DRAFT — complete and review before issuing\n\n", "")
        .replace(
          /Client responsibilities[\s\S]*?Electronic acceptance/,
          master + "\n\nElectronic acceptance",
        )
    : standard;
}
