# Website inquiry confirmation

Every valid Colonna Media website inquiry is saved as a CRM lead and receives the designed confirmation in `lib/lead/confirmation.js` when both production variables are configured:

- `LEAD_AUTOREPLY_ENABLED=true`
- `LEAD_AUTOREPLY_FROM=Colonna Media <hello@colonnamedia.com>`

The sender domain must be verified for sending in Resend. Replies go to `colonnamedia@gmail.com`. The confirmation is independent of the internal owner notification; failures are logged by the Vercel function. Do not put the Resend API key in client code.

Anthony authorized automatic delivery of this specific confirmation to each valid form submitter. Other outbound messages continue to require his individual review and approval.
