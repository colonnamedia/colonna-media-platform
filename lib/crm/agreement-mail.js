import { createHash } from "node:crypto";
import { money } from "./domain.js";
import { OWNER_EMAIL } from "./server.js";

const escape = (s) => String(s ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
export const AGREEMENT_FROM = "Colonna Media LLC <hello@colonnamedia.com>";
export function agreementMail(agreement, kind, url = "") {
  const s = agreement.snapshot;
  if (!["test", "client", "signed"].includes(kind)) throw Error("Invalid email type");
  if (kind === "client" && !/^https:\/\/www\.colonnamedia\.com\/sign#[A-Za-z0-9_-]{43}$/.test(url)) throw Error("Invalid signing link");
  const first = s.client.name.trim().split(/\s+/)[0] || "there";
  const safeTitle = s.title.replace(/[\r\n]+/g, " ");
  const safeName = s.client.name.replace(/[\r\n]+/g, " ");
  const summary = [
    s.title,
    `Client: ${s.client.name}${s.client.business ? ` / ${s.client.business}` : ""}`,
    `Agreement date: ${s.agreement_date}`,
    `Services: ${s.services.join(", ")}`,
    `One-time total: ${money(s.total_cents)}`,
    ...s.payments.map((p) => `${p.label}: ${money(p.amount_cents)} — ${p.due}`),
    ...(s.job.mode === "recurring" ? [`Recurring fee: ${money(s.job.monthly_cents)} per month, subject to the agreement terms.`] : []),
    "",
    "Agreement terms:",
    s.terms,
  ].join("\n");
  let subject, text, to, bcc = [];
  if (kind === "test") {
    subject = `TEST — ${safeTitle} for ${safeName}`;
    to = [OWNER_EMAIL];
    text = `TEST ONLY — sent to you, not the client. This is a review copy of the saved agreement. It contains no signing link.\n\nOpen the owner-only signing page preview to check the text and signature box:\nhttps://www.colonnamedia.com/admin?agreement-preview=${agreement.id}\n\n${summary}\n\nReview the saved draft in your admin before sending a client invitation.`;
  } else if (kind === "client") {
    subject = `Your ${safeTitle} from Colonna Media LLC`;
    to = [s.client.email];
    bcc = [OWNER_EMAIL];
    text = `Hi ${first},\n\nYour agreement with Colonna Media LLC is ready to review and sign. Please read the full agreement before signing.\n\nOpen your private signing link:\n${url}\n\nThis link expires after 30 days and can be used only once. If you have questions, reply to this email or contact colonnamedia@gmail.com.\n\nAnthony\nColonna Media LLC\n\nAgreement summary and full terms for your reference:\n\n${summary}`;
  } else {
    subject = `Signed agreement saved — ${safeName}`;
    to = [OWNER_EMAIL];
    text = `${s.client.name} signed ${s.title} on ${agreement.signed_at}. The signed PDF is stored privately in the client's profile under Agreements.\n\nOpen the protected admin: https://www.colonnamedia.com/admin\n\nAgreement ID: ${agreement.id}\nClient: ${s.client.email}`;
  }
  const html = `<div style="font:16px/1.6 Arial,sans-serif;color:#171c38;max-width:680px;margin:auto;padding:24px"><div style="border-top:8px solid #1659dc;background:#f7f8fc;border-radius:16px;padding:28px"><strong style="color:#1659dc">COLONNA MEDIA LLC</strong><h1 style="font-size:24px;line-height:1.25">${escape(subject)}</h1><div style="white-space:pre-wrap;overflow-wrap:anywhere">${escape(text)}</div></div></div>`;
  return { from: AGREEMENT_FROM, to, bcc, reply_to: OWNER_EMAIL, subject, text, html };
}
export const mailFingerprint = (draft) => createHash("sha256").update(JSON.stringify(draft)).digest("hex");
