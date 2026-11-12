import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import vm from "node:vm";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { JSDOM } from "jsdom";
import { build } from "esbuild";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import leadHandler from "../api/send-email.js";
import crmHandler from "../api/crm.js";
import linksHandler from "../api/links.js";
import { captureLead, allRows } from "../lib/crm/server.js";
import { normalizeAttribution } from "../lib/lead/validate.js";
import { filterInquiries, funnel, inquiriesCSV } from "../lib/lead/report.js";
import { linksSchema } from "../lib/site/links-schema.js";
import { DEFAULT_LINKS, safePublicURL } from "../lib/site/links-content.js";
import {
  leadDatabase,
  configureLeadTests,
  invoke,
  sampleLead,
  OWNER_ID,
  ORIGIN,
  TOKEN,
} from "./helpers/lead-database.mjs";

test("five live form entry points → API → transactional PostgreSQL → protected admin payload → display", async () => {
  const db = await leadDatabase();
  configureLeadTests();
  const savedFetch = globalThis.fetch;
  globalThis.fetch = db.fetch;
  try {
    const bundle = await build({
      entryPoints: ["assets/lead-attribution.js"],
      bundle: true,
      format: "iife",
      write: false,
    });
    const tracker = bundle.outputFiles[0].text;
    for (const [file, id, service] of [
      ["contact.html", "cform", "website"],
      ["start.html", "lpform", "google-ads"],
      ["web-design-ads.html", "web-design-inquiry", "website"],
      ["google-ads-management.html", "google-ads-inquiry", "google-ads"],
      ["photography.html", "photography-inquiry", "photography"],
    ]) {
      const html = await fs.readFile(file, "utf8");
      const dom = new JSDOM(html, {
        url:
          ORIGIN +
          "/" +
          file.replace(".html", "") +
          "?utm_source=google&utm_medium=cpc&utm_campaign=qa-" +
          service +
          "&utm_content=creative-a&utm_term=local&gclid=qa-click&fbclid=qa-fb",
        referrer: "https://www.google.com/",
        runScripts: "outside-only",
      });
      const win = dom.window;
      Object.defineProperty(win.crypto, "randomUUID", { value: randomUUID });
      let requestBody, response;
      win.fetch = async (url, options) => {
        assert.equal(url, "/api/send-email");
        requestBody = JSON.parse(options.body);
        response = await invoke(leadHandler, {
          body: requestBody,
          headers: { referer: win.location.href },
        });
        return new Response(JSON.stringify(response.payload), {
          status: response.status,
          headers: { "Content-Type": "application/json" },
        });
      };
      win.IntersectionObserver = class {
        observe() {}
        unobserve() {}
      };
      win.matchMedia = () => ({ matches: false });
      win.eval(tracker);
      win.leadAttribution = win.ColonnaLead.attribution;
      win.submissionKey = win.ColonnaLead.submissionKey;
      const script = await fs.readFile(
        file === "start.html" || file === "contact.html"
          ? "assets/app.js"
          : "assets/ad-pages.js",
        "utf8",
      );
      win.eval(script.replace(/^import[^\n]*\n/gm, ""));
      if (file === "start.html")
        for (const match of html.matchAll(
          /<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g,
        ))
          if (match[1].includes("var form=document.getElementById('lpform')"))
            win.eval(match[1].replace(/^import[^\n]*\n/gm, ""));
      const form = win.document.getElementById(id);
      assert(form, file + " form");
      form.querySelector('[name="name"]').value = "QA " + service;
      form.querySelector('[name="email"]').value = "shared@example.test";
      const message = form.querySelector('[name="message"]');
      if (message)
        message.value =
          "The visitor’s exact message. Source: this is my own sentence.";
      form
        .querySelectorAll('[name="services"]')
        .forEach((box) => (box.checked = box.value === service));
      const type = form.querySelector('[name="project_type"]');
      if (type) type.selectedIndex = 1;
      db.state.failDatabase = true;
      form.dispatchEvent(
        new win.Event("submit", { bubbles: true, cancelable: true }),
      );
      for (let i = 0; i < 150 && !response; i++)
        await new Promise((resolve) => setTimeout(resolve, 10));
      assert.equal(response?.status, 503, file + " outage");
      await new Promise((resolve) => setTimeout(resolve, 0));
      assert.match(form.textContent, /could not|couldn.t/i);
      assert.equal(form.querySelector("button[type=submit]").disabled, false);
      const retryKey = requestBody.submission_key;
      response = undefined;
      db.state.failDatabase = false;
      form.dispatchEvent(
        new win.Event("submit", { bubbles: true, cancelable: true }),
      );
      for (let i = 0; i < 150 && !response; i++)
        await new Promise((resolve) => setTimeout(resolve, 10));
      assert.equal(response?.status, 200, file + JSON.stringify(response));
      assert.equal(requestBody.submission_key, retryKey);
      assert.equal(requestBody.attribution.utm_campaign, "qa-" + service);
      assert.equal(
        requestBody.message,
        "The visitor’s exact message. Source: this is my own sentence.",
      );
      assert.match(form.textContent, /request was sent|inquiry was sent/i);
      const record = (
        await db.database.query(
          "select * from public.crm_inquiries where submission_key=$1",
          [requestBody.submission_key],
        )
      ).rows[0];
      assert.equal(record.submission_page, "/" + file.replace(".html", ""));
      assert.equal(record.form_id, requestBody.attribution.form_id);
      assert.equal(record.gclid, "qa-click");
      assert.equal(record.fbclid, "qa-fb");
      assert.equal(record.utm_content, "creative-a");
      assert.equal(record.utm_term, "local");
      assert.deepEqual(record.service_ids, [service]);
      assert.equal(record.message, requestBody.message);
      assert(record.contact_id);
      // Retries use the same key and receive a success without another inquiry or email.
      assert.equal(
        (await invoke(leadHandler, { body: requestBody })).status,
        200,
      );
      assert.equal(
        (
          await db.database.query(
            "select count(*)::int as count from public.crm_inquiries where submission_key=$1",
            [requestBody.submission_key],
          )
        ).rows[0].count,
        1,
      );
      dom.window.close();
    }
    const inquiries = (
      await db.database.query(
        "select * from public.crm_inquiries order by created_at",
      )
    ).rows;
    assert.equal(inquiries.length, 5);
    assert.equal(new Set(inquiries.map((i) => i.contact_id)).size, 1);
    const list = await invoke(crmHandler, {
      method: "GET",
      query: { action: "list" },
      headers: { authorization: "Bearer " + TOKEN("aal2") },
    });
    assert.equal(list.status, 200, JSON.stringify(list));
    assert.equal(list.payload.inquiries.length, 5);
    assert.equal(list.payload.contacts.length, 1);
    await fs.mkdir("tmp", { recursive: true });
    await build({
      entryPoints: ["admin-app/Attribution.jsx"],
      bundle: true,
      platform: "node",
      format: "esm",
      outfile: "tmp/qa-attribution.mjs",
      external: ["react"],
    });
    const { default: Report } = await import("../tmp/qa-attribution.mjs");
    const rendered = renderToStaticMarkup(
      React.createElement(Report, {
        inquiries: list.payload.inquiries,
        onStage: () => {},
      }),
    );
    assert(rendered.includes("qa-photography"));
    assert(rendered.includes("photography-inquiry"));
    assert(rendered.includes("qa-click"));
    assert(!rendered.includes("conversion rate"));
    assert.equal(db.state.externalRequests.length, 0);
  } finally {
    globalThis.fetch = savedFetch;
    await db.close();
  }
});

test("repeat and concurrent submissions preserve owner state; failure rolls back contact and inquiry", async () => {
  const db = await leadDatabase();
  configureLeadTests();
  const fetch = globalThis.fetch;
  globalThis.fetch = db.fetch;
  try {
    await captureLead(sampleLead(), ["website"]);
    await db.database.exec(
      "update public.crm_contacts set notes='Owner notes',stage='qualified',archived_at=now(),source='Owner source' where email='lead@example.test'",
    );
    await Promise.all(
      Array.from({ length: 8 }, () =>
        captureLead(sampleLead({ email: "LEAD@example.test" }), [
          "photography",
        ]),
      ),
    );
    let contacts = (
      await db.database.query("select * from public.crm_contacts")
    ).rows;
    assert.equal(contacts.length, 1);
    assert.equal(contacts[0].notes, "Owner notes");
    assert.equal(contacts[0].stage, "qualified");
    assert(contacts[0].archived_at);
    assert.equal(contacts[0].source, "Owner source");
    assert.equal(
      (
        await db.database.query(
          "select count(*)::int as n from public.crm_inquiries",
        )
      ).rows[0].n,
      9,
    );
    const broken = sampleLead({ email: "rollback@example.test", name: null });
    assert.equal(await captureLead(broken, ["website"]), false);
    assert.equal(
      (
        await db.database.query(
          "select count(*)::int as n from public.crm_contacts where email='rollback@example.test'",
        )
      ).rows[0].n,
      0,
    );
  } finally {
    globalThis.fetch = fetch;
    await db.close();
  }
});

test("protected stage changes, cumulative cohorts, archive state, CSV and link content concurrency", async () => {
  const db = await leadDatabase();
  configureLeadTests();
  const fetch = globalThis.fetch;
  globalThis.fetch = db.fetch;
  try {
    const saved = await captureLead(sampleLead(), ["website"]);
    const base = { headers: { authorization: "Bearer " + TOKEN("aal2") } };
    assert.equal(
      (
        await invoke(crmHandler, {
          ...base,
          query: { action: "inquiry-stage" },
          body: { id: saved.id, stage: "won" },
        })
      ).status,
      200,
    );
    let record = (
      await db.database.query(
        "select * from public.crm_inquiries where id=$1",
        [saved.id],
      )
    ).rows[0];
    assert.equal(record.stage, "won");
    assert.equal(record.archived_at, null);
    assert.equal(record.stage_history.length, 1);
    assert.deepEqual(
      funnel([record]).map((row) => row.count),
      [1, 1, 1, 1, 1],
    );
    assert.equal(
      (
        await invoke(crmHandler, {
          query: { action: "inquiry-stage" },
          body: { id: saved.id, stage: "new" },
        })
      ).status,
      401,
    );
    assert.equal(
      (
        await invoke(crmHandler, {
          ...base,
          headers: { authorization: "Bearer " + TOKEN("aal1") },
          query: { action: "inquiry-stage" },
          body: { id: saved.id, stage: "new" },
        })
      ).status,
      403,
    );
    assert.equal(
      (
        await invoke(crmHandler, {
          ...base,
          headers: { ...base.headers, origin: "https://attacker.example" },
          query: { action: "links-save" },
          body: { config: DEFAULT_LINKS, version: 0 },
        })
      ).status,
      403,
    );
    const first = await invoke(crmHandler, {
      ...base,
      query: { action: "links-save" },
      body: { config: DEFAULT_LINKS, version: 0 },
    });
    assert.equal(first.status, 200, JSON.stringify(first));
    assert.equal(first.payload.version, 1);
    const config = {
      ...DEFAULT_LINKS,
      title: "Updated from protected controls",
    };
    assert.equal(
      (
        await invoke(crmHandler, {
          ...base,
          query: { action: "links-save" },
          body: { config, version: 0 },
        })
      ).status,
      409,
    );
    assert.equal(
      (
        await invoke(crmHandler, {
          ...base,
          query: { action: "links-save" },
          body: { config, version: 1 },
        })
      ).status,
      200,
    );
    assert.equal(
      (await invoke(linksHandler, { method: "GET" })).payload.config.title,
      config.title,
    );
    const csv = inquiriesCSV([
      {
        ...record,
        name: '   =HYPERLINK("unsafe")',
        message: 'a,"b"\nnext line',
      },
    ]);
    assert(csv.includes("'   =HYPERLINK"));
    assert(csv.includes('a,""b""\nnext line'));
    assert.equal(
      filterInquiries([record], {
        archive: "current",
        campaign: "qa-campaign",
        page: "/contact",
        service: "website",
      }).length,
      1,
    );
    assert.equal(filterInquiries([record], { archive: "archived" }).length, 0);
    assert.equal(
      (
        await db.database.query(
          "select count(*)::int as n from public.crm_events",
        )
      ).rows[0].n,
      3,
    );
    for (const url of [
      "javascript:alert(1)",
      "//evil.example",
      "/%2fevil.example",
      "https://user:password@evil.example",
      "/\\evil.example",
    ])
      assert.equal(safePublicURL(url), false, url);
    assert(
      !linksSchema.safeParse({
        ...DEFAULT_LINKS,
        contact_url: "javascript:alert(1)",
      }).success,
    );
    await db.database.query(
      "insert into public.crm_jobs(contact_id,title,services,mode,status,start_date,scope) values($1,'Active work','[\"website\"]','one-time','active','2026-01-01','QA job')",
      [saved.contact_id],
    );
    assert.equal(
      (
        await invoke(crmHandler, {
          ...base,
          query: { action: "archive" },
          body: { entity: "contact", id: saved.contact_id, archived: true },
        })
      ).status,
      409,
    );
    assert.equal(
      (
        await invoke(crmHandler, {
          ...base,
          query: { action: "archive" },
          body: { entity: "inquiry", id: saved.id, archived: true },
        })
      ).status,
      200,
    );
    assert(
      (
        await db.database.query(
          "select archived_at from public.crm_inquiries where id=$1",
          [saved.id],
        )
      ).rows[0].archived_at,
    );
    assert.equal(
      (
        await invoke(crmHandler, {
          ...base,
          query: { action: "archive" },
          body: { entity: "inquiry", id: saved.id, archived: false },
        })
      ).status,
      200,
    );
    const privileges = (
      await db.database.query(
        "select has_table_privilege('anon','public.crm_site_content','select') as anon_read, has_table_privilege('authenticated','public.crm_site_content','update') as user_write, has_function_privilege('anon','public.crm_capture_inquiry(jsonb,jsonb)','execute') as public_capture",
      )
    ).rows[0];
    assert.deepEqual(privileges, {
      anon_read: false,
      user_write: false,
      public_capture: false,
    });
    assert.equal(db.state.externalRequests.length, 0);
  } finally {
    globalThis.fetch = fetch;
    await db.close();
  }
});

test("attribution survives service → contact navigation and storage failure degrades safely", async () => {
  const result = await build({
    entryPoints: ["assets/lead-attribution.js"],
    bundle: true,
    format: "iife",
    write: false,
  });
  const script = result.outputFiles[0].text;
  const first = new JSDOM("", {
    url:
      ORIGIN +
      "/google-meta-ads-pittsburgh?utm_source=meta&utm_campaign=summer&gclid=first",
    referrer: "https://www.facebook.com/",
    runScripts: "outside-only",
  });
  first.window.eval(script);
  const saved = first.window.sessionStorage.getItem("colonna-lead-touch-v1");
  const second = new JSDOM("", {
    url: ORIGIN + "/contact?service=meta-ads",
    referrer: ORIGIN + "/google-meta-ads-pittsburgh",
    runScripts: "outside-only",
  });
  second.window.sessionStorage.setItem("colonna-lead-touch-v1", saved);
  second.window.eval(script);
  const value = second.window.ColonnaLead.attribution("contact-inquiry", [
    "meta-ads",
  ]);
  assert.equal(value.landing_page, "/google-meta-ads-pittsburgh");
  assert.equal(value.submission_page, "/contact");
  assert.equal(value.utm_campaign, "summer");
  assert.equal(value.referrer, "https://www.facebook.com/");
  Object.defineProperty(second.window, "sessionStorage", {
    get() {
      throw Error("blocked");
    },
  });
  assert.doesNotThrow(() => second.window.eval(script));
  assert.throws(() =>
    normalizeAttribution({ utm_campaign: "x".repeat(501) }, { headers: {} }),
  );
  first.window.close();
  second.window.close();
});
