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

  const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
  const { name, email, business_name, service_needed, message, website } = body;

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
          <p><strong>Service:</strong> ${escapeHtml(service_needed || "Not specified")}</p>
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
