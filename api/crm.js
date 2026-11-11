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
  newToken,
  hashToken,
} from "../lib/crm/server.js";
import { z } from "zod";
export default async function handler(req, res) {
  headers(res);
  try {
    const action = String(req.query.action || "");
    if (action === "config" && req.method === "GET")
      return res
        .status(200)
        .json({
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
      const [contacts, jobs, agreements, inquiries, payments, templates] =
        await Promise.all([
          client
            .from("crm_contacts")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(5000),
          client
            .from("crm_jobs")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(5000),
          client
            .from("crm_agreements")
            .select(
              "id,contact_id,job_id,title,status,created_at,signed_at,expires_at,pdf_path,snapshot",
            )
            .order("created_at", { ascending: false })
            .limit(5000),
          client
            .from("crm_inquiries")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(5000),
          client
            .from("crm_payments")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(5000),
          client.from("crm_templates").select("*"),
        ]);
      return res
        .status(200)
        .json({
          contacts: check(contacts),
          jobs: check(jobs),
          agreements: check(agreements),
          inquiries: check(inquiries),
          payments: check(payments),
          templates: check(templates),
        });
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
    if (action === "archive") {
      const { entity, id, archived } = z.object({
        entity: z.enum(["contact", "inquiry"]),
        id: z.string().uuid(),
        archived: z.boolean(),
      }).parse(input);
      const table = entity === "contact" ? "crm_contacts" : "crm_inquiries";
      if (entity === "contact" && archived) {
        const jobs = check(await client.from("crm_jobs").select("status,mode,start_date,end_date,auto_close").eq("contact_id", id));
        if (jobs.some((job) => isActiveJob(job)))
          throw Object.assign(new Error("Finish or pause active jobs before archiving this contact."), { status: 409 });
      }
      const result = check(await client.from(table)
        .update({ archived_at: archived ? new Date().toISOString() : null })
        .eq("id", id).select("id,archived_at").single());
      await audit(client, entity, result.id, archived ? "archived" : "restored", actor.id);
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
    if (action === "issue") {
      const id = z.string().uuid().parse(input.id);
      const a = check(
        await client
          .from("crm_agreements")
          .select("*")
          .eq("id", id)
          .eq("status", "draft")
          .single(),
      );
      if (
        !a.terms_reviewed ||
        /\[[^\]]+\]|DRAFT —|Specify /i.test(a.snapshot.terms)
      )
        throw Object.assign(
          new Error(
            "Complete the placeholder terms and confirm review before creating a signing link",
          ),
          { status: 400 },
        );
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
          .eq("status", "draft")
          .select("id")
          .single(),
      );
      await audit(client, "agreement", id, "link_created", actor.id, {
        expires_at: expires,
      });
      return res
        .status(200)
        .json({
          url: `${process.env.CRM_PUBLIC_ORIGIN || "https://www.colonnamedia.com"}/sign#${token}`,
        });
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
