import { captureLead } from '../lib/crm/server.js';
import { confirmationSubject, confirmationText, confirmationHtml } from '../lib/lead/confirmation.js';
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

// The customer acknowledgment is staged behind an explicit delivery switch.
// A verified sender and the owner's per-recipient approval rule are required first.
async function sendConfirmation(resendKey, to) {
  if (process.env.LEAD_AUTOREPLY_ENABLED !== "true" || !process.env.LEAD_AUTOREPLY_FROM) return;
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${resendKey}` },
      body: JSON.stringify({
        from: process.env.LEAD_AUTOREPLY_FROM,
        to: [to],
        reply_to: "colonnamedia@gmail.com",
        subject: confirmationSubject,
        text: confirmationText,
        html: confirmationHtml,
      }),
    });
    if (!response.ok) console.error("Confirmation email error", response.status);
  } catch (error) {
    console.error("Confirmation email failed", error);
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

  // Retain every valid submission and add first-time senders as CRM leads.
  const savedToCrm = await captureLead({name:cleanName,email:cleanEmail,business:String(business_name||''),phone:String(phone||''),services:selectedServices,location:String(location||''),website_url:String(website_url||''),timing:String(timing||''),followup:followupLabel,message:cleanMessage,page}, [...new Set(services || [])]).catch((error)=>{console.error("CRM lead capture failed",error);return false;});

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

  // Never report a successful form submission if it was not saved as a CRM lead.
  if (!savedToCrm) return res.status(503).json({ error: "Unable to save your request. Please try again." });

  // 2) Email the lead to Colonna Media.
  if (!resendKey) {
    console.error("RESEND_API_KEY is not configured");
    return (savedToSheet || savedToCrm)
      ? res.status(200).json({ success: true })
      : res.status(500).json({ error: "Email service is not configured" });
  }

  // Customer confirmation is independent of the internal notification.
  await sendConfirmation(resendKey, cleanEmail);

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

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Contact form error", error);
    return (savedToSheet || savedToCrm)
      ? res.status(200).json({ success: true })
      : res.status(500).json({ error: "Unable to send message" });
  }
}
