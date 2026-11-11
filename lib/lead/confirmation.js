const instagram = "https://www.instagram.com/colonna_media";
const facebook = "https://www.facebook.com/share/1CsudL19rX/?mibextid=wwXIfr";

export const confirmationSubject = "Thanks for reaching out to Colonna Media";

export const confirmationText = `Hi,

Thanks for reaching out to Colonna Media! We received your request and will take a look at the details. I'll get back to you in a few moments.

While you wait, you can see our latest work and behind-the-scenes updates on Instagram and Facebook:

Instagram: ${instagram}
Facebook: ${facebook}

Talk soon,
Anthony Colonna
Colonna Media
(412) 439-5452`;

export const confirmationHtml = `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${confirmationSubject}</title></head>
<body style="margin:0;padding:0;background:#eef1f7;font-family:Arial,Helvetica,sans-serif;color:#171c38;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#eef1f7;"><tr><td align="center" style="padding:24px 12px;">
  <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="width:100%;max-width:600px;background:#fff;border-radius:18px;overflow:hidden;">
    <tr><td style="background:#171c38;color:#fff;padding:24px 32px;font-size:22px;font-weight:bold;">Colonna <span style="color:#aab3d1;font-weight:normal;">Media</span></td></tr>
    <tr><td style="height:6px;background:#ffd33d;font-size:0;line-height:6px;">&nbsp;</td></tr>
    <tr><td style="padding:32px 32px 8px;"><h1 style="font-size:28px;line-height:34px;margin:0;">Thanks for reaching out!</h1>
      <p style="font-size:16px;line-height:25px;color:#434961;">We received your request and will take a look at the details. I'll get back to you in a few moments.</p>
      <p style="font-size:16px;line-height:25px;color:#434961;">While you wait, you can see our latest work and behind-the-scenes updates on Instagram and Facebook:</p>
      <p><a href="${instagram}" style="display:inline-block;margin:0 8px 8px 0;padding:12px 18px;border-radius:999px;background:#171c38;color:#fff;font-weight:bold;text-decoration:none;">Follow on Instagram</a>
      <a href="${facebook}" style="display:inline-block;margin:0 0 8px 0;padding:12px 18px;border-radius:999px;background:#1659dc;color:#fff;font-weight:bold;text-decoration:none;">Follow on Facebook</a></p>
      <p style="font-size:16px;line-height:25px;color:#434961;">Talk soon,<br><strong>Anthony Colonna</strong><br>Colonna Media<br><a href="tel:+14124395452" style="color:#1659dc;">(412) 439-5452</a></p>
    </td></tr>
  </table>
  <p style="max-width:560px;font-size:12px;line-height:18px;color:#798096;padding:10px 12px;">You received this because you submitted a form on colonnamedia.com. You can reply to this email with anything you'd like to add.</p>
</td></tr></table></body></html>`;
