import { PGlite } from "@electric-sql/pglite";
import fs from "node:fs/promises";
import { randomUUID } from "node:crypto";
export const OWNER_ID = "a7fbdb97-3fc6-45eb-8984-a32f476c674e";
export const ORIGIN = "https://www.colonnamedia.com";
export const TOKEN = (aal) =>
  [
    Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString(
      "base64url",
    ),
    Buffer.from(
      JSON.stringify({
        sub: OWNER_ID,
        aal,
        exp: Math.floor(Date.now() / 1000) + 3600,
        amr: [],
      }),
    ).toString("base64url"),
    Buffer.alloc(32).toString("base64url"),
  ].join(".");
export async function leadDatabase() {
  const database = new PGlite();
  await database.exec(
    "create role anon; create role authenticated; create role service_role; create schema extensions; create schema storage; create table storage.buckets(id text,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);",
  );
  let schema = await fs.readFile(
    new URL("../../database/crm-schema.sql", import.meta.url),
    "utf8",
  );
  schema = schema.replace(
    "create extension if not exists pgcrypto with schema extensions;",
    "",
  );
  await database.exec(schema);
  await database.exec(
    await fs.readFile(
      new URL("../../database/crm-unique-contact-email.sql", import.meta.url),
      "utf8",
    ),
  );
  await database.exec(
    await fs.readFile(
      new URL("../../database/crm-attribution-links.sql", import.meta.url),
      "utf8",
    ),
  );
  await database.exec("grant usage on schema public to service_role;");
  const state = { externalRequests: [], failDatabase: false };
  const reply = (body, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { "Content-Type": "application/json" },
    });
  const functions = {
    crm_capture_inquiry: ["payload", "selected_services"],
    crm_set_inquiry_stage: ["inquiry_id", "next_stage", "owner_id"],
    crm_save_links: ["content", "expected_version", "owner_id"],
  };
  async function fetchDatabase(url, options = {}) {
    const target = new URL(String(url));
    if (target.origin !== "https://crm-test.example") {
      state.externalRequests.push(String(url));
      throw Error("Outbound network is disabled in lead tests");
    }
    if (target.pathname === "/auth/v1/user") {
      const authorization =
        new Headers(options.headers).get("Authorization") || "";
      if (!authorization.includes("Bearer "))
        return reply({ message: "Not signed in" }, 401);
      return reply({
        id: OWNER_ID,
        email: "colonnamedia@gmail.com",
        email_confirmed_at: "2026-01-01T00:00:00Z",
        aud: "authenticated",
        role: "authenticated",
        factors: [],
      });
    }
    if (state.failDatabase)
      return reply({ code: "08006", message: "Simulated outage" }, 503);
    try {
      const fn = target.pathname.split("/rest/v1/rpc/")[1];
      if (fn) {
        if (!Object.hasOwn(functions, fn))
          return reply({ message: "Unknown RPC" }, 404);
        const args = JSON.parse(options.body || "{}"),
          keys = functions[fn];
        const params = keys.map((key) =>
          ["payload", "selected_services", "content"].includes(key)
            ? JSON.stringify(args[key])
            : args[key],
        );
        const result = await database.query(
          `select to_jsonb(public.${fn}(${keys.map((_, i) => "$" + (i + 1)).join(",")})) as result`,
          params,
        );
        return reply(result.rows[0].result);
      }
      const table = target.pathname.split("/rest/v1/")[1];
      if (!/^crm_[a-z_]+$/.test(table))
        return reply({ message: "Unknown table" }, 404);
      if (["PATCH", "POST"].includes(options.method)) {
        const data = JSON.parse(options.body || "{}");
        const keys = Object.keys(data);
        if (keys.some((key) => !/^[a-z_]+$/.test(key)))
          throw Error("Invalid mutation column");
        const values = keys.map((key) =>
          typeof data[key] === "object" && data[key] !== null
            ? JSON.stringify(data[key])
            : data[key],
        );
        let sql;
        if (options.method === "POST") {
          sql = `insert into public.${table}(${keys.join(",")}) values(${keys.map((_, i) => "$" + (i + 1)).join(",")}) returning *`;
        } else {
          const id = target.searchParams.get("id")?.replace(/^eq\./, "");
          values.push(id);
          sql = `update public.${table} set ${keys.map((key, i) => key + "=$" + (i + 1)).join(",")} where id=$${values.length} returning *`;
        }
        const changed = await database.query(sql, values);
        return reply(
          new Headers(options.headers)
            .get("Accept")
            ?.includes("vnd.pgrst.object")
            ? changed.rows[0]
            : changed.rows,
        );
      }
      let query = "select * from public." + table,
        values = [],
        where = [];
      for (const [key, value] of target.searchParams) {
        if (!/^[a-z_]+$/.test(key)) throw Error("Invalid column");
        if (value.startsWith("eq.")) {
          values.push(value.slice(3));
          where.push(key + "=$" + values.length);
        }
      }
      if (where.length) query += " where " + where.join(" and ");
      query +=
        " order by " +
        (["crm_site_content", "crm_templates"].includes(table)
          ? "key"
          : "created_at desc,id");
      const headers = new Headers(options.headers),
        range = headers.get("range");
      let from = 0,
        to = 999999;
      if (range) {
        [from, to] = range.split("-").map(Number);
      } else {
        from = Number(target.searchParams.get("offset") || 0);
        to = from + Number(target.searchParams.get("limit") || 1000000) - 1;
      }
      query += ` offset ${from} limit ${Math.max(0, to - from + 1)}`;
      const result = await database.query(query, values);
      if (headers.get("Accept")?.includes("vnd.pgrst.object"))
        return reply(result.rows[0] || null);
      return reply(result.rows);
    } catch (error) {
      return reply(
        { code: error.code || "XX000", message: error.message },
        400,
      );
    }
  }
  return {
    database,
    state,
    fetch: fetchDatabase,
    close: () => database.close(),
  };
}
export function configureLeadTests() {
  process.env.CRM_SUPABASE_URL = "https://crm-test.example";
  process.env.CRM_SUPABASE_PUBLISHABLE_KEY = "local-test-publishable";
  process.env.CRM_SUPABASE_SECRET_KEY = "local-test-secret";
  process.env.CRM_ADMIN_USER_ID = OWNER_ID;
  process.env.CRM_PUBLIC_ORIGIN = ORIGIN;
  process.env.LEAD_DELIVERY_DISABLED = "true";
  process.env.RESEND_API_KEY = "delivery-must-never-be-called";
  process.env.LEAD_AUTOREPLY_ENABLED = "true";
  process.env.LEAD_AUTOREPLY_FROM = "Colonna Media <hello@colonnamedia.com>";
  process.env.LEADS_SHEET_URL = "https://sheet-test.example";
  process.env.LEADS_SHEET_TOKEN = "must-not-be-used";
}
export async function invoke(
  handler,
  { method = "POST", query = {}, body, headers = {} } = {},
) {
  let status = 200,
    payload,
    responseHeaders = {};
  const req = { method, query, body, headers: { origin: ORIGIN, ...headers } };
  const res = {
    setHeader: (key, value) => (responseHeaders[key] = value),
    status(code) {
      status = code;
      return this;
    },
    json(data) {
      payload = data;
      return this;
    },
    send(data) {
      payload = data;
      return this;
    },
  };
  await handler(req, res);
  return { status, payload, headers: responseHeaders };
}
export const sampleLead = (overrides = {}) => ({
  name: "QA Sender",
  email: "lead@example.test",
  business: "QA Company",
  phone: "",
  services: "Website Design",
  location: "",
  website_url: "",
  timing: "",
  followup: "",
  message: "Please refresh our website.",
  page: "/contact",
  submission_page: "/contact",
  landing_page: "/web-design-ads",
  form_id: "contact-inquiry",
  submission_key: randomUUID(),
  project_type: "",
  referrer: "https://www.google.com/",
  utm_source: "google",
  utm_medium: "cpc",
  utm_campaign: "qa-campaign",
  utm_content: "creative-a",
  utm_term: "website design",
  gclid: "qa-click",
  gbraid: "",
  wbraid: "",
  fbclid: "",
  msclkid: "",
  ttclid: "",
  li_fat_id: "",
  attribution_version: 1,
  ...overrides,
});
