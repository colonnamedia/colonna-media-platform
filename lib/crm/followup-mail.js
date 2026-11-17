import { createHash } from "node:crypto";
import { FOLLOWUP_TEMPLATES } from "./followup-content.js";
import { OWNER_EMAIL } from "./server.js";

const escape = (value) => String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
export const FOLLOWUP_FROM = "Colonna Media LLC <hello@colonnamedia.com>";

export function followupMail(contact, service, kind) {
  const template = FOLLOWUP_TEMPLATES[service];
  if (!template || !["test", "client"].includes(kind)) throw Error("Unknown follow-up email");
  const firstName = String(contact.name || "").trim().split(/\s+/)[0].replace(/[\r\n]/g, "") || "there";
  const subject = `${kind === "test" ? "TEST — " : ""}${template.subject}`;
  const paragraphs = [
    `Hi ${firstName},`,
    template.opening,
    template.question,
    "If your plans have changed, no problem. I am here whenever the timing is right.",
    "Just reply to this email with a few details or any questions, and we can take it from there.",
    "Anthony\nColonna Media LLC",
  ];
  const text = `${kind === "test" ? `TEST ONLY — prepared for ${contact.name} <${contact.email}>. No client email was sent.\n\n` : ""}${paragraphs.join("\n\n")}`;
  const html = `<!doctype html><html lang="en"><body style="margin:0;padding:0;background:#f3f5fb;font-family:Arial,Helvetica,sans-serif;color:#171c38"><table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#f3f5fb"><tr><td align="center" style="padding:28px 16px"><table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;background:#fff;border-radius:20px;overflow:hidden;border:1px solid #e0e5f0"><tr><td style="background:#1659dc;padding:22px 30px"><img src="https://www.colonnamedia.com/colonna-email-logo.png" width="190" alt="Colonna Media" style="display:block;max-width:100%;height:auto;background:#fff;border-radius:10px;padding:7px"></td></tr>${kind === "test" ? `<tr><td style="background:#fff5c9;padding:12px 30px;color:#171c38;font-size:14px;font-weight:bold">TEST ONLY · To ${escape(contact.name)} &lt;${escape(contact.email)}&gt; · Client not emailed</td></tr>` : ""}<tr><td style="padding:34px 30px 18px"><p style="margin:0 0 10px;color:#1659dc;font-size:12px;font-weight:bold;letter-spacing:2px;text-transform:uppercase">A note from Anthony</p><h1 style="margin:0 0 25px;font-size:28px;line-height:1.2;color:#171c38">${escape(template.subject)}</h1>${paragraphs.slice(0, 5).map((p) => `<p style="font-size:16px;line-height:1.65;margin:0 0 20px">${escape(p)}</p>`).join("")}<p style="font-size:16px;line-height:1.6;margin:26px 0">Anthony<br>Colonna Media LLC</p><a href="mailto:${OWNER_EMAIL}?subject=${encodeURIComponent(`Re: ${template.subject}`)}" style="display:inline-block;background:#f02e52;color:#fff;text-decoration:none;font-size:15px;font-weight:bold;padding:15px 23px;border-radius:30px">Reply with your details</a></td></tr><tr><td style="padding:18px 30px 26px;border-top:1px solid #e8ebf2;color:#646d82;font-size:12px;line-height:1.5">Colonna Media LLC · Pittsburgh, PA<br><a href="https://www.colonnamedia.com" style="color:#1659dc">colonnamedia.com</a> · <a href="mailto:${OWNER_EMAIL}" style="color:#1659dc">${OWNER_EMAIL}</a></td></tr></table></td></tr></table></body></html>`;
  return { from: FOLLOWUP_FROM, to: [kind === "test" ? OWNER_EMAIL : contact.email], bcc: kind === "client" ? [OWNER_EMAIL] : [], reply_to: OWNER_EMAIL, subject, text, html };
}

export const followupFingerprint = (draft) => createHash("sha256").update(JSON.stringify(draft)).digest("hex");
