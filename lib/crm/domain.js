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
    .enum(["new", "contacted", "qualified", "proposal", "won"])
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
    project_cents: z.number().int().min(0).max(100000000).default(0),
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
    { label: percent === 100 ? "Full payment" : "Down payment", amount_cents: down, due: "Before work begins" },
    { label: "Final balance", amount_cents: total - down, due: "On delivery" },
  ].filter((p) => p.amount_cents > 0);
}
export function draftTerms(job, templates = [], agreementDate = nyDate()) {
  const serviceNames = job.services.map((s) => SERVICES[s]).join(", ");
  const scope = job.scope?.trim() || serviceNames;
  const schedule = job.start_date ? `Service starts ${job.start_date}.` : "The service start date will be confirmed in writing.";
  const payment = job.mode === "recurring"
    ? `The client agrees to pay ${money(job.monthly_cents)} per month for the recurring services described above. The service renews monthly and continues until cancelled in writing to colonnamedia@gmail.com, subject to the applicable cancellation terms. Any one-time setup charge and its payment schedule are shown in the payment summary. Automatic card payments require separate payment authorization at checkout.`
    : "This is a one-time service. The client agrees to pay the project total according to the payment schedule shown in this agreement. It does not create a recurring subscription.";
  const extras = job.services.map((key) => templates.find((t) => t.key === key)?.body?.trim()).filter(Boolean);
  const master = templates.find((t) => t.key === "master")?.body?.trim();
  return [
    "Provider: Colonna Media LLC, Anthony Colonna.",
    `Agreement date\n${agreementDate}`,
    `Services\n${scope}`,
    `Schedule\n${schedule} ${job.end_date ? `Target completion/end: ${job.end_date}.` : job.mode === "recurring" ? "Ongoing with no fixed end date." : "Completion will be coordinated with the client."}`,
    `Payment\n${payment}`,
    ...extras,
    master || "General terms\nThe client agrees to provide the access, materials, information, and approvals reasonably needed for the agreed services. Changes outside the agreed scope and any additional charges require approval in writing. Refund eligibility, cancellation, rescheduling, delivery, and usage rights are governed by Colonna Media LLC’s Service and Payment Terms and any specific terms agreed in writing for this engagement. Specific terms in this signed agreement control if they conflict with the general terms.",
    "Service and Payment Terms\nhttps://colonnamedia.com/service-payment-terms",
    "Electronic acceptance\nBy signing, the client accepts the services, pricing, payment schedule, and terms of this agreement, including the linked Service and Payment Terms, and consents to electronic records and signatures. Signing this agreement does not itself charge a card or authorize automatic card payments. Questions or cancellation requests: colonnamedia@gmail.com.",
  ].join("\n\n");
}
export function updateAgreementDate(terms, oldDate, newDate) {
  return terms.replace(`Agreement date\n${oldDate}`, `Agreement date\n${newDate}`);
}
