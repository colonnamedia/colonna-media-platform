import {
  contactSchema,
  jobSchema,
  agreementSchema,
  SERVICES,
  isActiveJob,
} from "../lib/crm/domain.js";
import {
  db,
  configured,
  requireAdmin,
  check,
  body,
  assertOrigin,
  headers,
  fail,
  audit,
  allRows,
  newToken,
  hashToken,
} from "../lib/crm/server.js";
import { linksSchema } from "../lib/site/links-schema.js";
import { DEFAULT_LINKS } from "../lib/site/links-content.js";
import { z } from "zod";
import { agreementMail, mailFingerprint } from "../lib/crm/agreement-mail.js";
import { createTestSigningToken, verifyTestSigningToken } from "../lib/crm/test-signing.js";
import { FOLLOWUP_TEMPLATES } from "../lib/crm/followup-content.js";
import { followupMail, followupFingerprint } from "../lib/crm/followup-mail.js";
export default async function handler(req, res) {
  headers(res);
  try {
    const action = String(req.query.action || "");
    if (action === "config" && req.method === "GET")
      return res.status(200).json({
        configured: configured(),
        url: configured() ? process.env.CRM_SUPABASE_URL : null,
        key: configured() ? process.env.CRM_SUPABASE_PUBLISHABLE_KEY : null,
        email: "colonnamedia@gmail.com",
      });
    if (!["GET", "POST"].includes(req.method))
      return res.status(405).json({ error: "Method not allowed" });
    assertOrigin(req);
    const client = db();
    const actor = await requireAdmin(req, client);
    if (action === "list" && req.method === "GET") {
      const [contacts, jobs, agreements, inquiries, payments, templates, agreementEvents, followupEvents] =
        await Promise.all([
          allRows(client, "crm_contacts").then((data) => ({ data })),
          client
            .from("crm_jobs")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(5000),
          client
            .from("crm_agreements")
            .select(
              "id,contact_id,job_id,title,status,created_at,signed_at,expires_at,pdf_path,snapshot,terms_reviewed",
            )
            .order("created_at", { ascending: false })
            .limit(5000),
          allRows(client, "crm_inquiries").then((data) => ({ data })),
          client
            .from("crm_payments")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(5000),
          client.from("crm_templates").select("*"),
          client.from("crm_events").select("entity_id,event,created_at").eq("entity", "agreement").in("event", ["client_email_accepted", "signed_email_accepted"]).order("created_at", { ascending: false }).limit(5000),
          client.from("crm_events").select("entity_id,event,created_at,details").eq("entity", "contact").in("event", ["followup_test_email_accepted", "followup_email_accepted"]).order("created_at", { ascending: false }).limit(5000),
        ]);
      return res.status(200).json({
        contacts: check(contacts),
        jobs: check(jobs),
        agreements: check(agreements),
        inquiries: check(inquiries),
        payments: check(payments),
        templates: check(templates),
        agreement_events: check(agreementEvents),
        followup_events: check(followupEvents),
      });
    }
    if (action === "links" && req.method === "GET") {
      const record = check(
        await client
          .from("crm_site_content")
          .select("config,version")
          .eq("key", "links")
          .maybeSingle(),
      );
      return res
        .status(200)
        .json(record || { config: DEFAULT_LINKS, version: 0 });
    }
    if (action === "events" && req.method === "GET") {
      const id = z.string().uuid().parse(req.query.id);
      return res
        .status(200)
        .json(
          check(
            await client
              .from("crm_events")
              .select("*")
              .eq("entity_id", id)
              .order("created_at"),
          ),
        );
    }
    if (action === "pdf" && req.method === "GET") {
      const id = z.string().uuid().parse(req.query.id);
      const a = check(
        await client
          .from("crm_agreements")
          .select("pdf_path")
          .eq("id", id)
          .single(),
      );
      if (!a.pdf_path)
        throw Object.assign(new Error("Signed PDF is not available yet"), {
          status: 404,
        });
      const { data, error } = await client.storage
        .from("crm-agreements")
        .download(a.pdf_path);
      if (error) throw Error("Download failed");
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="agreement-${id}.pdf"`,
      );
      return res.status(200).send(Buffer.from(await data.arrayBuffer()));
    }
    if (req.method !== "POST")
      return res.status(405).json({ error: "Method not allowed" });
    const input = body(req);
    if (action === "inquiry-stage") {
      const { id, stage } = z
        .object({
          id: z.string().uuid(),
          stage: z.enum(["new", "contacted", "qualified", "proposal", "won"]),
        })
        .parse(input);
      return res
        .status(200)
        .json(
          check(
            await client.rpc("crm_set_inquiry_stage", {
              inquiry_id: id,
              next_stage: stage,
              owner_id: actor.id,
            }),
          ),
        );
    }
    if (action === "links-save") {
      const config = linksSchema.parse(input.config);
      const version = z.number().int().nonnegative().parse(input.version);
      const result = await client.rpc("crm_save_links", {
        content: config,
        expected_version: version,
        owner_id: actor.id,
      });
      if (result.error?.code === "40001")
        return res
          .status(409)
          .json({ error: "Content changed. Reload before saving." });
      return res.status(200).json(check(result));
    }
    if (action === "archive") {
      const { entity, id, archived } = z
        .object({
          entity: z.enum(["contact", "inquiry"]),
          id: z.string().uuid(),
          archived: z.boolean(),
        })
        .parse(input);
      const table = entity === "contact" ? "crm_contacts" : "crm_inquiries";
      if (entity === "contact" && archived) {
        const jobs = check(
          await client
            .from("crm_jobs")
            .select("status,mode,start_date,end_date,auto_close")
            .eq("contact_id", id),
        );
        if (jobs.some((job) => isActiveJob(job)))
          throw Object.assign(
            new Error(
              "Finish or pause active jobs before archiving this contact.",
            ),
            { status: 409 },
          );
      }
      const result = check(
        await client
          .from(table)
          .update({ archived_at: archived ? new Date().toISOString() : null })
          .eq("id", id)
          .select("id,archived_at")
          .single(),
      );
      await audit(
        client,
        entity,
        result.id,
        archived ? "archived" : "restored",
        actor.id,
      );
      return res.status(200).json(result);
    }
    if (action === "template") {
      const t = z
        .object({
          key: z.enum(["master", ...Object.keys(SERVICES)]),
          body: z.string().trim().min(20).max(50000),
        })
        .parse(input);
      check(
        await client
          .from("crm_templates")
          .upsert({ ...t, updated_at: new Date().toISOString() }),
      );
      return res.status(200).json({ ok: true });
    }
    if (action === "followup-preview" || action === "followup-send") {
      const params = z.object({
        contact_id: z.string().uuid(),
        service: z.enum(Object.keys(FOLLOWUP_TEMPLATES)),
        kind: z.enum(["test", "client"]),
        fingerprint: z.string().regex(/^[a-f0-9]{64}$/).optional(),
        approved: z.literal(true).optional(),
      }).parse(input);
      const contact = check(await client.from("crm_contacts").select("id,name,email,business,archived_at").eq("id", params.contact_id).single());
      if (contact.archived_at) throw Object.assign(new Error("Restore this contact before sending a follow-up."), { status: 409 });
      z.string().email().parse(contact.email);
      const draft = followupMail(contact, params.service, params.kind);
      const fingerprint = followupFingerprint(draft);
      if (action === "followup-preview") return res.status(200).json({ draft, fingerprint, template: FOLLOWUP_TEMPLATES[params.service].label });
      if (!params.approved || params.fingerprint !== fingerprint)
        throw Object.assign(new Error("Review the full follow-up email, recipients, and sending account before approving this send."), { status: 400 });
      if (process.env.VERCEL_ENV !== "production" || !process.env.RESEND_API_KEY)
        throw Object.assign(new Error("Follow-up email delivery is unavailable in this environment"), { status: 503 });
      const sent = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json", ...(params.kind === "client" ? { "Idempotency-Key": `followup-${contact.id}-${params.service}-${fingerprint}` } : {}) },
        body: JSON.stringify({ ...draft, ...(draft.bcc.length ? {} : { bcc: undefined }) }),
      });
      const result = await sent.json().catch(() => ({}));
      if (!sent.ok || !result.id) throw Object.assign(new Error("Email provider did not accept this follow-up. Check the draft and retry."), { status: 502 });
      try {
        await audit(client, "contact", contact.id, params.kind === "test" ? "followup_test_email_accepted" : "followup_email_accepted", actor.id, {
          provider_id: result.id, service: params.service, to: draft.to, bcc: draft.bcc, subject: draft.subject,
        });
      } catch (error) {
        console.error("Follow-up email accepted but audit failed", result.id, error);
      }
      return res.status(200).json({ accepted: true, provider_id: result.id });
    }
    if (action === "contact" || action === "job") {
      const table = action === "contact" ? "crm_contacts" : "crm_jobs";
      const data = (action === "contact" ? contactSchema : jobSchema).parse(
        input,
      );
      let result;
      if (input.id) {
        const id = z.string().uuid().parse(input.id);
        result = check(
          await client.from(table).update(data).eq("id", id).select().single(),
        );
      } else
        result = check(await client.from(table).insert(data).select().single());
      await audit(
        client,
        action,
        result.id,
        input.id ? "updated" : "created",
        actor.id,
      );
      return res.status(200).json(result);
    }
    if (action === "agreement") {
      const data = agreementSchema.parse(input);
      const contact = check(
        await client
          .from("crm_contacts")
          .select("*")
          .eq("id", data.contact_id)
          .single(),
      );
      const job = check(
        await client
          .from("crm_jobs")
          .select("*")
          .eq("id", data.job_id)
          .eq("contact_id", contact.id)
          .single(),
      );
      if (
        data.total_cents === 0 &&
        (job.mode !== "recurring" || job.monthly_cents <= 0)
      )
        throw Object.assign(
          new Error("A positive project total or recurring fee is required"),
          { status: 400 },
        );
      const snapshot = {
        title: data.title,
        agreement_date: data.agreement_date,
        client: {
          name: contact.name,
          email: contact.email,
          business: contact.business,
        },
        job,
        services: job.services.map((s) => SERVICES[s]),
        total_cents: data.total_cents,
        payments: data.payments,
        terms: data.terms,
      };
      const saved = check(
        await client
          .from("crm_agreements")
          .insert({ ...data, snapshot, status: "draft" })
          .select("id")
          .single(),
      );
      await audit(client, "agreement", saved.id, "draft_created", actor.id);
      return res.status(200).json(saved);
    }
    if (action === "agreement-review") {
      const id = z.string().uuid().parse(input.id);
      const a = check(await client.from("crm_agreements").select("id,status,snapshot").eq("id", id).single());
      if (a.status !== "draft") throw Object.assign(new Error("Only saved drafts can be confirmed for sending."), { status: 409 });
      if (/\[[^\]]+\]|DRAFT —|Specify /i.test(a.snapshot.terms))
        throw Object.assign(new Error("This draft contains unfinished wording. Create a corrected draft before sending."), { status: 400 });
      check(await client.from("crm_agreements").update({ terms_reviewed: true }).eq("id", id).eq("status", "draft").select("id").single());
      await audit(client, "agreement", id, "wording_reviewed", actor.id);
      return res.status(200).json({ ok: true });
    }
    if (action === "issue") {
      const id = z.string().uuid().parse(input.id);
      const a = check(
        await client
          .from("crm_agreements")
          .select("*")
          .eq("id", id)
          .single(),
      );
      if (!["draft", "issued"].includes(a.status))
        throw Object.assign(new Error("This agreement can no longer be sent."), { status: 409 });
      if (!a.terms_reviewed)
        throw Object.assign(
          new Error("Review and confirm the saved agreement wording before sending to the client."),
          { status: 400 },
        );
      if (/\[[^\]]+\]|DRAFT —|Specify /i.test(a.snapshot.terms))
        throw Object.assign(new Error("This draft contains unfinished wording. Create a corrected draft before sending."), { status: 400 });
      const previous = check(await client.from("crm_events").select("id").eq("entity_id", id).eq("event", "client_email_accepted").limit(1));
      if (previous.length) throw Object.assign(new Error("The client email was already accepted for delivery."), { status: 409 });
      const token = newToken();
      const expires = new Date(Date.now() + 30 * 86400000).toISOString();
      check(
        await client
          .from("crm_agreements")
          .update({
            status: "issued",
            token_hash: hashToken(token),
            expires_at: expires,
          })
          .eq("id", id)
          .eq("status", a.status)
          .select("id")
          .single(),
      );
      await audit(client, "agreement", id, a.status === "draft" ? "link_created" : "link_renewed", actor.id, {
        expires_at: expires,
      });
      return res.status(200).json({
        url: `${process.env.CRM_PUBLIC_ORIGIN || "https://www.colonnamedia.com"}/sign#${token}`,
      });
    }
    if (action === "mail-preview" || action === "mail-send") {
      const params = z.object({
        id: z.string().uuid(),
        kind: z.enum(["test", "client", "signed"]),
        token: z.string().max(200).optional(),
        fingerprint: z.string().regex(/^[a-f0-9]{64}$/).optional(),
        approved: z.literal(true).optional(),
      }).parse(input);
      const a = check(await client.from("crm_agreements").select("*").eq("id", params.id).single());
      if (params.kind === "test" && a.status !== "draft" ||
          params.kind === "client" && a.status !== "issued" ||
          params.kind === "signed" && (a.status !== "signed" || !a.pdf_path))
        throw Object.assign(new Error("Agreement status changed. Refresh and review it again."), { status: 409 });
      let signingURL = "";
      if (params.kind === "test") {
        const testToken = action === "mail-preview" ? createTestSigningToken(a.id) : params.token;
        if (verifyTestSigningToken(testToken) !== a.id)
          throw Object.assign(new Error("Test signing link is invalid"), { status: 404 });
        signingURL = `https://www.colonnamedia.com/sign-test#${testToken}`;
      } else if (params.kind === "client") {
        if (!params.token || hashToken(params.token) !== a.token_hash || new Date(a.expires_at) <= new Date())
          throw Object.assign(new Error("Signing link is unavailable. Create a new agreement revision."), { status: 409 });
        signingURL = `https://www.colonnamedia.com/sign#${params.token}`;
      }
      const draft = agreementMail(a, params.kind, signingURL);
      const fingerprint = mailFingerprint(draft);
      if (action === "mail-preview") return res.status(200).json({ draft, fingerprint, ...(params.kind === "test" ? { test_token: signingURL.split("#")[1] } : {}) });
      if (!params.approved || params.fingerprint !== fingerprint)
        throw Object.assign(new Error("Review the full email, recipients, and sending account before approving this send."), { status: 400 });
      if (process.env.VERCEL_ENV !== "production" || !process.env.RESEND_API_KEY)
        throw Object.assign(new Error("Agreement email delivery is unavailable in this environment"), { status: 503 });
      if (params.kind !== "test") {
        const previous = check(await client.from("crm_events").select("id").eq("entity_id", a.id).eq("event", `${params.kind}_email_accepted`).limit(1));
        if (previous.length) throw Object.assign(new Error("This email was already accepted for delivery. Refresh the agreement record."), { status: 409 });
      }
      const sent = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json", ...(params.kind === "test" ? {} : { "Idempotency-Key": `agreement-${params.kind}-${a.id}-${fingerprint}` }) },
        body: JSON.stringify({ ...draft, ...(draft.bcc.length ? {} : { bcc: undefined }) }),
      });
      const result = await sent.json().catch(() => ({}));
      if (!sent.ok || !result.id) throw Object.assign(new Error("Email provider did not accept this email. Check the draft and retry."), { status: 502 });
      try {
        await audit(client, "agreement", a.id, `${params.kind}_email_accepted`, actor.id, {
          provider_id: result.id, to: draft.to, bcc: draft.bcc,
        });
      } catch (error) {
        console.error("Agreement email accepted but audit failed", result.id, error);
      }
      return res.status(200).json({ accepted: true, provider_id: result.id });
    }
    if (action === "revoke") {
      const id = z.string().uuid().parse(input.id);
      check(
        await client
          .from("crm_agreements")
          .update({ status: "revoked", token_hash: null })
          .eq("id", id)
          .in("status", ["draft", "issued"])
          .select("id")
          .single(),
      );
      await audit(client, "agreement", id, "revoked", actor.id);
      return res.status(200).json({ ok: true });
    }
    if (action === "payment") {
      const p = z
        .object({
          contact_id: z.string().uuid(),
          job_id: z.string().uuid(),
          amount_cents: z.number().int().positive(),
          label: z.string().trim().min(1).max(200),
          reference: z.string().max(300),
          paid_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        })
        .parse(input);
      check(
        await client
          .from("crm_jobs")
          .select("id")
          .eq("id", p.job_id)
          .eq("contact_id", p.contact_id)
          .single(),
      );
      const record = check(
        await client.from("crm_payments").insert(p).select().single(),
      );
      await audit(client, "payment", record.id, "manually_recorded", actor.id);
      return res.status(200).json(record);
    }
    return res.status(404).json({ error: "Action not found" });
  } catch (e) {
    return fail(res, e);
  }
}
