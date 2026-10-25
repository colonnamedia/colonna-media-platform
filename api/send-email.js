const escapeHtml = (value = "") =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const resendKey = process.env.RESEND_API_KEY || process.env.VITE_RESEND_API_KEY;
  if (!resendKey) {
    console.error("RESEND_API_KEY is not configured");
    return res.status(500).json({ error: "Email service is not configured" });
  }

  let body;
  try { body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {}); } catch { return res.status(400).json({error:"Invalid request"}); }
  if (!body || typeof body !== "object" || Array.isArray(body)) return res.status(400).json({error:"Invalid request"});
  const { name, email, business_name, service_needed, message, website, phone, location, website_url, timing, services } = body;
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
          <hr>
          <p><strong>Message:</strong></p>
          <p>${escapeHtml(cleanMessage || "No message provided.").replaceAll("\n", "<br>")}</p>
        `,
      }),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      console.error("Resend error", data);
      return res.status(502).json({ error: "Email delivery failed" });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Contact form error", error);
    return res.status(500).json({ error: "Unable to send message" });
  }
}
