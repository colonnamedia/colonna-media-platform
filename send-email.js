export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { name, email, business_name, service_needed, message } = req.body;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.VITE_RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: "Colonna Media <onboarding@resend.dev>",
      to: "colonnamedia@gmail.com",
      subject: `New Contact Inquiry — ${name}`,
      html: `
        <h2>New Contact Inquiry</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Business:</strong> ${business_name || "Not provided"}</p>
        <p><strong>Service:</strong> ${service_needed || "Not specified"}</p>
        <hr/>
        <p><strong>Message:</strong><br/>${message || "No message provided."}</p>
      `,
    }),
  });

  const data = await response.json();
  if (!response.ok) return res.status(500).json({ error: data });
  return res.status(200).json({ success: true });
}
