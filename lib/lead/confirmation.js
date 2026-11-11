const escapeHtml = (value = "") =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

export function confirmationSubject(firstName = "") {
  return `Thanks${firstName ? ", " + firstName : ""} — I got your request`;
}

export function confirmationText({ firstName = "" }) {
  return `Hi${firstName ? " " + firstName : ""},

Thanks for reaching out! I received your request and will review the details. I'll get back to you in a few moments.

While you wait, follow Colonna Media for recent work, behind-the-scenes photography, and marketing ideas:

Instagram: https://www.instagram.com/colonna_media
Facebook: https://www.facebook.com/share/1CsudL19rX/?mibextid=wwXIfr

Talk soon,
Anthony Colonna
Colonna Media
(412) 439-5452`;
}

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

export function confirmationHtml({ firstName = "", serviceIds = [], message = "", business = "" }) {
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
  const forLine = business ? ` from <strong>${escapeHtml(business)}</strong>` : "";

  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Thanks for reaching out to Colonna Media</title></head>
<body style="margin:0;padding:0;background:#eef1f7;">
<div style="display:none;max-height:0;overflow:hidden;">Thanks${firstName ? ", " + escapeHtml(firstName) : ""}! Anthony received your request and will get back to you in a few moments.</div>
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
      <p style="font-size:16px;line-height:25px;color:#434961;margin:16px 0 0 0;">Thanks for reaching out${forLine}. I received your request and will review the details. I'll get back to you in a few moments. You'll hear from me directly.</p>
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
        <p style="font-size:14px;line-height:22px;color:#434961;margin:8px 0 12px 0;">Follow us for recent work, behind-the-scenes photography, and marketing ideas.</p>
        <a href="https://www.instagram.com/colonna_media" style="display:inline-block;margin:0 8px 8px 0;padding:9px 14px;border-radius:999px;background:#171c38;color:#fff;font-size:13px;font-weight:bold;text-decoration:none;">Instagram</a>
        <a href="https://www.facebook.com/share/1CsudL19rX/?mibextid=wwXIfr" style="display:inline-block;margin:0 0 8px 0;padding:9px 14px;border-radius:999px;background:#1659dc;color:#fff;font-size:13px;font-weight:bold;text-decoration:none;">Facebook</a>
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

