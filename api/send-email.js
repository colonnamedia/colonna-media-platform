import { captureLead } from '../lib/crm/server.js';
const escapeHtml = (value = "") =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

// Save every lead to the "Colonna Media Website Leads" Google Sheet (via Apps Script web app).
// Needs LEADS_SHEET_URL and LEADS_SHEET_TOKEN set in Vercel. Never blocks the email if it fails.
async function saveLeadToSheet(lead) {
  const url = process.env.LEADS_SHEET_URL;
  const token = process.env.LEADS_SHEET_TOKEN;
  if (!url || !token) return false;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ ...lead, token }),
      redirect: "follow",
      signal: controller.signal,
    });
    clearTimeout(timer);
    const data = await response.json().catch(() => ({}));
    if (!data.ok) console.error("Lead sheet error", data.error || response.status);
    return Boolean(data.ok);
  } catch (error) {
    console.error("Lead sheet request failed", error);
    return false;
  }
}

// ---------- Thank-you email sent to the person who filled out the form ----------
const SERVICE_NEXT = {
  "website": ["Website design", "We'll talk about your goals, the pages you need, and how customers should reach you."],
  "photography": ["Photography", "We'll plan the shot list, location, and how you'll use the photos on your site and social."],
  "videography": ["Video", "We'll talk through the story, where the video will live, and what the shoot day looks like."],
  "google-ads": ["Google Ads setup", "We'll look at who you want to reach and the page your ads should send them to."],
  "meta-ads": ["Meta Ads setup", "We'll look at your audience on Facebook and Instagram and where your ads should lead."],
  "social-media": ["Social media", "We'll talk about your channels, your voice, and what you want posting to accomplish."],
  "consulting": ["Marketing plan", "We'll find the gaps in your marketing and pick the smartest next steps."],
  "automations": ["Automations & follow-up", "We'll map how leads reach you and where follow-up is falling through the cracks."],
};

function thankYouEmail({ firstName, serviceIds, message, business, followup }) {
  const nextLine = followup === "call"
    ? "I'll reach out shortly to set up your quick 15-minute call."
    : followup === "email"
      ? "I'll follow up by email with some ideas and next steps shortly."
      : "I'll personally follow up with you about it shortly.";
  const items = serviceIds.filter((id) => SERVICE_NEXT[id]);
  const rows = items.length
    ? items.map((id) => `
          <tr><td style="padding:0 0 12px 0;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f6f7fb;border:1px solid #dfe3ed;border-radius:12px;">
              <tr><td style="padding:14px 16px;font-family:Arial,Helvetica,sans-serif;">
                <div style="font-size:15px;font-weight:bold;color:#171c38;">&#10003;&nbsp; ${escapeHtml(SERVICE_NEXT[id][0])}</div>
                <div style="font-size:14px;line-height:21px;color:#434961;padding-top:4px;">${escapeHtml(SERVICE_NEXT[id][1])}</div>
              </td></tr>
            </table>
          </td></tr>`).join("")
    : `
          <tr><td style="padding:0 0 12px 0;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:22px;color:#434961;">
            We'll start by talking through what your business needs and where Colonna Media can help most.
          </td></tr>`;
  const quote = message
    ? `
      <tr><td style="padding:8px 32px 0 32px;font-family:Arial,Helvetica,sans-serif;">
        <div style="font-size:12px;font-weight:bold;letter-spacing:1px;text-transform:uppercase;color:#1659dc;padding-bottom:8px;">Your message</div>
        <div style="border-left:4px solid #ffd33d;padding:4px 0 4px 14px;font-size:14px;line-height:21px;color:#434961;font-style:italic;">${escapeHtml(message.slice(0, 600)).replaceAll("\n", "<br>")}${message.length > 600 ? "&hellip;" : ""}</div>
      </td></tr>`
    : "";
  const forLine = business ? ` for <strong>${escapeHtml(business)}</strong>` : "";

  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Thanks for reaching out to Colonna Media</title></head>
<body style="margin:0;padding:0;background:#eef1f7;">
<div style="display:none;max-height:0;overflow:hidden;">Thanks${firstName ? ", " + escapeHtml(firstName) : ""}! Anthony got your request and will follow up personally.</div>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#eef1f7;">
<tr><td align="center" style="padding:28px 12px;">
  <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="width:100%;max-width:600px;background:#ffffff;border-radius:18px;overflow:hidden;">
    <tr><td style="background:#171c38;padding:22px 32px;font-family:Arial,Helvetica,sans-serif;">
      <table role="presentation" cellspacing="0" cellpadding="0"><tr>
        <td valign="bottom" style="padding-right:3px;"><div style="width:5px;height:9px;background:#1659dc;border-radius:3px;"></div></td>
        <td valign="bottom" style="padding-right:3px;"><div style="width:5px;height:15px;background:#ffd33d;border-radius:3px;"></div></td>
        <td valign="bottom" style="padding-right:3px;"><div style="width:5px;height:22px;background:#13a977;border-radius:3px;"></div></td>
        <td valign="bottom" style="padding-right:3px;"><div style="width:5px;height:17px;background:#f3415c;border-radius:3px;"></div></td>
        <td valign="bottom" style="padding-right:10px;"><div style="width:5px;height:12px;background:#1659dc;border-radius:3px;"></div></td>
        <td style="font-size:20px;font-weight:bold;color:#ffffff;">Colonna <span style="color:#aab3d1;font-weight:normal;">Media</span></td>
      </tr></table>
    </td></tr>
    <tr><td style="height:6px;line-height:6px;font-size:0;background:#ffd33d;">&nbsp;</td></tr>
    <tr><td style="padding:36px 32px 8px 32px;font-family:Arial,Helvetica,sans-serif;">
      <div style="font-size:30px;line-height:36px;font-weight:bold;color:#171c38;">Thanks${firstName ? ", " + escapeHtml(firstName) : ""}!<br><span style="color:#1659dc;">Your request is in.</span></div>
      <p style="font-size:16px;line-height:25px;color:#434961;margin:16px 0 0 0;">I got your request${forLine}. ${nextLine} No sales team, no hand-offs — you'll hear from me directly.</p>
    </td></tr>
    <tr><td style="padding:24px 32px 4px 32px;font-family:Arial,Helvetica,sans-serif;">
      <div style="font-size:12px;font-weight:bold;letter-spacing:1px;text-transform:uppercase;color:#1659dc;padding-bottom:12px;">What we'll talk about</div>
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0">${rows}
      </table>
    </td></tr>
    ${quote}
    <tr><td style="padding:24px 32px 0 32px;font-family:Arial,Helvetica,sans-serif;">
      <div style="font-size:12px;font-weight:bold;letter-spacing:1px;text-transform:uppercase;color:#1659dc;padding-bottom:12px;">What happens next</div>
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
        <tr><td width="40" valign="top" style="padding-bottom:12px;"><div style="width:30px;height:30px;line-height:30px;border-radius:15px;background:#1659dc;color:#fff;text-align:center;font-weight:bold;font-size:14px;">1</div></td>
            <td style="padding-bottom:12px;font-size:15px;line-height:22px;color:#434961;"><strong style="color:#171c38;">I review your request</strong> and look at your current website or social so I come prepared.</td></tr>
        <tr><td width="40" valign="top" style="padding-bottom:12px;"><div style="width:30px;height:30px;line-height:30px;border-radius:15px;background:#f3415c;color:#fff;text-align:center;font-weight:bold;font-size:14px;">2</div></td>
            <td style="padding-bottom:12px;font-size:15px;line-height:22px;color:#434961;"><strong style="color:#171c38;">We talk it through</strong> &mdash; your goals, timing, and what you need.</td></tr>
        <tr><td width="40" valign="top"><div style="width:30px;height:30px;line-height:30px;border-radius:15px;background:#13a977;color:#fff;text-align:center;font-weight:bold;font-size:14px;">3</div></td>
            <td style="font-size:15px;line-height:22px;color:#434961;"><strong style="color:#171c38;">You get a clear quote</strong> with the scope and price spelled out before anything starts.</td></tr>
      </table>
    </td></tr>
    <tr><td align="center" style="padding:32px 32px 8px 32px;font-family:Arial,Helvetica,sans-serif;">
      <table role="presentation" cellspacing="0" cellpadding="0"><tr>
        <td style="border-radius:999px;background:#f3415c;"><a href="https://www.colonnamedia.com/work" style="display:inline-block;padding:14px 26px;font-size:15px;font-weight:bold;color:#ffffff;text-decoration:none;border-radius:999px;">See recent work &rarr;</a></td>
      </tr></table>
      <p style="font-size:14px;line-height:21px;color:#434961;margin:14px 0 0 0;">Want to talk sooner? Call <a href="tel:+14124395452" style="color:#1659dc;font-weight:bold;text-decoration:none;">(412) 439-5452</a></p>
    </td></tr>
    <tr><td style="padding:16px 32px 0 32px;font-family:Arial,Helvetica,sans-serif;">
      <div style="background:#f6f7fb;border:1px solid #dfe3ed;border-radius:12px;padding:18px 20px;">
        <div style="font-size:12px;font-weight:bold;letter-spacing:1px;text-transform:uppercase;color:#1659dc;">Stay connected</div>
        <p style="font-size:14px;line-height:22px;color:#434961;margin:8px 0 0 0;">Follow Colonna Media on <a href="https://www.instagram.com/colonna_media" style="color:#1659dc;font-weight:bold;">Instagram</a> and Facebook for recent work, behind-the-scenes photography, and marketing ideas.</p>
      </div>
    </td></tr>
    <tr><td style="padding:28px 32px 32px 32px;font-family:Arial,Helvetica,sans-serif;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-top:1px solid #dfe3ed;"><tr><td style="padding-top:20px;">
        <div style="font-size:15px;color:#171c38;font-weight:bold;">Anthony Colonna</div>
        <div style="font-size:14px;line-height:21px;color:#434961;">Colonna Media &middot; Pittsburgh, PA<br>
        <a href="https://www.colonnamedia.com" style="color:#1659dc;text-decoration:none;">colonnamedia.com</a> &middot; <a href="mailto:colonnamedia@gmail.com" style="color:#1659dc;text-decoration:none;">colonnamedia@gmail.com</a></div>
      </td></tr></table>
    </td></tr>
  </table>
  <div style="font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:18px;color:#8a90a6;padding:16px 12px 0 12px;max-width:560px;">You're receiving this because you sent a request on colonnamedia.com. Just reply to this email if you have anything to add.</div>
</td></tr></table>
</body></html>`;
}

// Sends the thank-you email. Until colonnamedia.com is verified in Resend, this only
// sends to the Colonna Media inbox (test mode). Set LEAD_AUTOREPLY_FROM after verifying,
// e.g. "Anthony at Colonna Media <hello@colonnamedia.com>".
async function sendThankYou(resendKey, { to, firstName, serviceIds, message, business, followup }) {
  const from = process.env.LEAD_AUTOREPLY_FROM;
  const testMode = !from;
  if (testMode && to.toLowerCase() !== "colonnamedia@gmail.com") return;
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${resendKey}` },
      body: JSON.stringify({
        from: from || "Colonna Media <onboarding@resend.dev>",
        to: [to],
        reply_to: "colonnamedia@gmail.com",
        subject: `Thanks${firstName ? ", " + firstName : ""} — I got your request`,
        html: thankYouEmail({ firstName, serviceIds, message, business, followup }),
      }),
    });
    if (!response.ok) console.error("Thank-you email error", await response.json().catch(() => ({})));
  } catch (error) {
    console.error("Thank-you email failed", error);
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const resendKey = process.env.RESEND_API_KEY || process.env.VITE_RESEND_API_KEY;

  let body;
  try { body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {}); } catch { return res.status(400).json({error:"Invalid request"}); }
  if (!body || typeof body !== "object" || Array.isArray(body)) return res.status(400).json({error:"Invalid request"});
  const { name, email, business_name, service_needed, message, website, phone, location, website_url, timing, services, followup } = body;
  const followupLabel = followup === "call" ? "Quick 15-minute call" : followup === "email" ? "Email me info" : "";
  const serviceLabels = {"photography":"Photography","videography":"Videography","social-media":"Social Media Management","consulting":"Marketing Consulting","automations":"Automations & Systems","google-ads":"Google Ads Setup","meta-ads":"Meta Ads Setup","website":"Website Design"};
  if (services !== undefined && (!Array.isArray(services) || services.length > 8 || services.some(id=>!Object.hasOwn(serviceLabels,id)))) return res.status(400).json({error:'Invalid service selection'});
  const selectedServices = [...new Set(services || [])].map(id=>serviceLabels[id]).join(', ') || String(service_needed || 'Not specified');
  if ([business_name,phone,location,website_url,timing,selectedServices].some(v=>String(v||'').length>500)) return res.status(400).json({error:'Submission is too long'});

  // Honeypot: accept bot submissions without sending email.
  if (website) return res.status(200).json({ success: true });

  const cleanName = String(name || "").trim();
  const cleanEmail = String(email || "").trim();
  const cleanMessage = String(message || "").trim();
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!cleanName || !emailPattern.test(cleanEmail)) {
    return res.status(400).json({ error: "Please enter a valid name and email address" });
  }

  if (cleanName.length > 120 || cleanEmail.length > 254 || cleanMessage.length > 5000) {
    return res.status(400).json({ error: "Submission is too long" });
  }

  let page = "";
  try { page = new URL(String(req.headers.referer || "")).pathname; } catch { page = ""; }

  // Preserve new inquiries in the private CRM as well as the existing Sheet.
  // This does not send an additional email or overwrite an existing client.
  const savedToCrm = await captureLead({name:cleanName,email:cleanEmail,business:String(business_name||''),phone:String(phone||''),services:selectedServices,location:String(location||''),website_url:String(website_url||''),timing:String(timing||''),followup:followupLabel,message:cleanMessage,page}).catch(()=>false);

  // 1) Store the lead in the Google Sheet first, so it's kept even if email has a problem.
  const savedToSheet = await saveLeadToSheet({
    name: cleanName,
    email: cleanEmail,
    phone: String(phone || ""),
    business: String(business_name || ""),
    services: selectedServices,
    location: String(location || ""),
    website_url: String(website_url || ""),
    timing: String(timing || ""),
    followup: followupLabel,
    message: cleanMessage,
    page,
  });

  // 2) Email the lead to Colonna Media.
  if (!resendKey) {
    console.error("RESEND_API_KEY is not configured");
    return (savedToSheet || savedToCrm)
      ? res.status(200).json({ success: true })
      : res.status(500).json({ error: "Email service is not configured" });
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendKey}`,
      },
      body: JSON.stringify({
        from: "Colonna Media Website <onboarding@resend.dev>",
        to: ["colonnamedia@gmail.com"],
        reply_to: cleanEmail,
        subject: `New Colonna Media inquiry — ${cleanName}`,
        html: `
          <h2>New Colonna Media Website Inquiry</h2>
          <p><strong>Name:</strong> ${escapeHtml(cleanName)}</p>
          <p><strong>Email:</strong> ${escapeHtml(cleanEmail)}</p>
          <p><strong>Business:</strong> ${escapeHtml(business_name || "Not provided")}</p>
          <p><strong>Service:</strong> ${escapeHtml(selectedServices)}</p>
          <p><strong>Phone:</strong> ${escapeHtml(phone || "Not provided")}</p>
          <p><strong>Location:</strong> ${escapeHtml(location || "Not provided")}</p>
          <p><strong>Business website:</strong> ${escapeHtml(website_url || "Not provided")}</p>
          <p><strong>Timing:</strong> ${escapeHtml(timing || "Not provided")}</p>
          <p><strong>Follow-up:</strong> ${escapeHtml(followupLabel || "No preference")}</p>
          <p><strong>Page:</strong> ${escapeHtml(page || "Unknown")}</p>
          <hr>
          <p><strong>Message:</strong></p>
          <p>${escapeHtml(cleanMessage || "No message provided.").replaceAll("\n", "<br>")}</p>
        `,
      }),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      console.error("Resend error", data);
      // The lead is still safe in the sheet, so tell the visitor it went through.
      return (savedToSheet || savedToCrm)
        ? res.status(200).json({ success: true })
        : res.status(502).json({ error: "Email delivery failed" });
    }

    await sendThankYou(resendKey, {
      to: cleanEmail,
      firstName: cleanName.split(/\s+/)[0].slice(0, 40),
      serviceIds: [...new Set(services || [])],
      message: cleanMessage.replace(/\n*Source: .*$/s, "").trim(),
      business: String(business_name || "").trim(),
      followup: followup === "call" || followup === "email" ? followup : "",
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Contact form error", error);
    return (savedToSheet || savedToCrm)
      ? res.status(200).json({ success: true })
      : res.status(500).json({ error: "Unable to send message" });
  }
}
