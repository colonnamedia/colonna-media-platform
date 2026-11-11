# Website inquiry confirmation

Every valid Colonna Media website inquiry is saved as a CRM lead. The designed confirmation in `lib/lead/confirmation.js` is sent when both production variables are configured:

- `LEAD_AUTOREPLY_ENABLED=true`
- `LEAD_AUTOREPLY_FROM=Colonna Media <hello@colonnamedia.com>`

The sender domain is verified for sending in Resend. A live form test on November 11, 2026 delivered the designed confirmation from `hello@colonnamedia.com` to `colonnamedia@gmail.com`; the inquiry was also saved in the CRM. Replies go to `colonnamedia@gmail.com`. The confirmation is independent of the internal owner notification; failures are logged by the Vercel function. Do not put the Resend API key in client code.

Anthony authorized automatic delivery of this specific confirmation to each valid form submitter. Other outbound messages continue to require his individual review and approval.
