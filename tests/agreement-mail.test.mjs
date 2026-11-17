import test from "node:test";
import assert from "node:assert/strict";
import { agreementMail, mailFingerprint, AGREEMENT_FROM } from "../lib/crm/agreement-mail.js";
const token = "A".repeat(43);
const a = {
  id: "a7fbdb97-3fc6-45eb-8984-a32f476c674e",
  signed_at: "2026-11-17T13:00:00Z",
  snapshot: {
    title: "Social media agreement",
    client: { name: "Bud Client", business: "Example Magazine", email: "bud@example.test" },
    agreement_date: "2026-11-17", services: ["Social media management"],
    total_cents: 50000, payments: [{ label: "Setup", amount_cents: 50000, due: "Before work" }],
    job: { mode: "recurring", monthly_cents: 42500 },
    terms: "This is the complete specific agreement. <No HTML execution>.",
  },
};
test("agreement mail drafts distinguish owner test, client with owner copy, and signed notice", () => {
  const testMail = agreementMail(a, "test");
  assert.equal(testMail.from, AGREEMENT_FROM);
  assert.deepEqual(testMail.to, ["colonnamedia@gmail.com"]);
  assert.deepEqual(testMail.bcc, []);
  assert.match(testMail.subject, /^TEST/);
  assert.doesNotMatch(testMail.text, /sign#[A-Za-z0-9_-]{43}/);
  assert.match(testMail.text, /\$425\.00 per month/);
  assert.match(testMail.text, /complete specific agreement/);
  assert.doesNotMatch(testMail.html, /<No HTML execution>/);
  const client = agreementMail(a, "client", `https://www.colonnamedia.com/sign#${token}`);
  assert.deepEqual(client.to, ["bud@example.test"]);
  assert.deepEqual(client.bcc, ["colonnamedia@gmail.com"]);
  assert.match(client.text, new RegExp(`sign#${token}`));
  assert.match(client.text, /complete specific agreement/);
  assert.notEqual(mailFingerprint(client), mailFingerprint({ ...client, to: ["elsewhere@example.test"] }));
  assert.throws(() => agreementMail(a, "client", "https://example.test/sign#" + token));
  const signed = agreementMail(a, "signed");
  assert.deepEqual(signed.to, ["colonnamedia@gmail.com"]);
  assert.match(signed.text, /stored privately in the client's profile/);
  assert.doesNotMatch(signed.text, /sign#/);
});

test("owner-reviewed test and client emails require AAL2, exact draft approval and production delivery", async () => {
  const { leadDatabase, configureLeadTests, invoke, TOKEN, OWNER_ID } = await import("./helpers/lead-database.mjs");
  const { default: crm } = await import("../api/crm.js");
  const { hashToken } = await import("../lib/crm/server.js");
  configureLeadTests();
  const db = await leadDatabase();
  const originalFetch = globalThis.fetch;
  const oldVercelEnv = process.env.VERCEL_ENV;
  const sent = [];
  const liveToken = "B".repeat(43);
  try {
    await db.database.exec("drop trigger crm_agreement_guard on public.crm_agreements");
    await db.database.query("insert into public.crm_contacts(id,name,email,business,kind,stage) values($1,'Bud Client','bud@example.test','Example Magazine','client','won')", [OWNER_ID]);
    await db.database.query("insert into public.crm_jobs(id,contact_id,title,services,mode,status,start_date,end_date,scope,monthly_cents) values($1,$1,'Social media','[\"social-media\"]','recurring','planned','2026-11-17','','Eight posts.',42500)", [OWNER_ID]);
    await db.database.query("insert into public.crm_agreements(id,contact_id,job_id,title,agreement_date,total_cents,payments,terms,snapshot,status) values($1,$1,$1,$2,'2026-11-17',50000,$3,$4,$5,'draft')", [OWNER_ID, a.snapshot.title, JSON.stringify(a.snapshot.payments), a.snapshot.terms, JSON.stringify(a.snapshot)]);
    globalThis.fetch = async (url, options) => {
      if (String(url) === "https://api.resend.com/emails") {
        const message = JSON.parse(options.body);
        sent.push(message);
        return new Response(JSON.stringify({ id: "email-" + sent.length }), { status: 200, headers: { "Content-Type": "application/json" } });
      }
      return db.fetch(url, options);
    };
    const auth = { authorization: "Bearer " + TOKEN("aal2") };
    let response = await invoke(crm, { query: { action: "mail-preview" }, body: { id: OWNER_ID, kind: "test" }, headers: { authorization: "Bearer " + TOKEN("aal1") } });
    assert.equal(response.status, 403);
    response = await invoke(crm, { query: { action: "mail-preview" }, body: { id: OWNER_ID, kind: "test" }, headers: auth });
    assert.equal(response.status, 200);
    assert.deepEqual(response.payload.draft.to, ["colonnamedia@gmail.com"]);
    assert.equal(sent.length, 0);
    const preview = response.payload;
    response = await invoke(crm, { query: { action: "mail-send" }, body: { id: OWNER_ID, kind: "test", approved: true, fingerprint: "0".repeat(64) }, headers: auth });
    assert.equal(response.status, 400);
    process.env.VERCEL_ENV = "preview";
    response = await invoke(crm, { query: { action: "mail-send" }, body: { id: OWNER_ID, kind: "test", approved: true, fingerprint: preview.fingerprint }, headers: auth });
    assert.equal(response.status, 503);
    assert.equal(sent.length, 0);
    process.env.VERCEL_ENV = "production";
    response = await invoke(crm, { query: { action: "mail-send" }, body: { id: OWNER_ID, kind: "test", approved: true, fingerprint: preview.fingerprint }, headers: auth });
    assert.equal(response.status, 200);
    assert.equal(sent.length, 1);
    assert.deepEqual(sent[0].to, ["colonnamedia@gmail.com"]);
    await db.database.query("update public.crm_agreements set status='issued',token_hash=$2,expires_at=now()+interval '30 days' where id=$1", [OWNER_ID, hashToken(liveToken)]);
    response = await invoke(crm, { query: { action: "mail-preview" }, body: { id: OWNER_ID, kind: "client", token: liveToken }, headers: auth });
    assert.equal(response.status, 200);
    const clientPreview = response.payload;
    assert.deepEqual(clientPreview.draft.bcc, ["colonnamedia@gmail.com"]);
    assert.equal(sent.length, 1);
    response = await invoke(crm, { query: { action: "mail-send" }, body: { id: OWNER_ID, kind: "client", token: liveToken, approved: true, fingerprint: clientPreview.fingerprint }, headers: auth });
    assert.equal(response.status, 200);
    assert.deepEqual(sent[1].to, ["bud@example.test"]);
    assert.deepEqual(sent[1].bcc, ["colonnamedia@gmail.com"]);
    response = await invoke(crm, { query: { action: "mail-send" }, body: { id: OWNER_ID, kind: "client", token: liveToken, approved: true, fingerprint: clientPreview.fingerprint }, headers: auth });
    assert.equal(response.status, 409);
    assert.equal(sent.length, 2);
    await db.database.query("update public.crm_agreements set status='signed',signed_at=now(),pdf_path=$2 where id=$1", [OWNER_ID, `${OWNER_ID}/signed.pdf`]);
    response = await invoke(crm, { query: { action: "mail-preview" }, body: { id: OWNER_ID, kind: "signed" }, headers: auth });
    assert.equal(response.status, 200);
    const signedPreview = response.payload;
    assert.deepEqual(signedPreview.draft.to, ["colonnamedia@gmail.com"]);
    response = await invoke(crm, { query: { action: "mail-send" }, body: { id: OWNER_ID, kind: "signed", approved: true, fingerprint: signedPreview.fingerprint }, headers: auth });
    assert.equal(response.status, 200);
    assert.equal(sent.length, 3);
    assert.equal(sent[2].bcc, undefined);
    const events = await db.database.query("select event from public.crm_events where entity_id=$1", [OWNER_ID]);
    assert(events.rows.some((e) => e.event === "client_email_accepted"));
    assert(events.rows.some((e) => e.event === "signed_email_accepted"));
  } finally {
    globalThis.fetch = originalFetch;
    process.env.VERCEL_ENV = oldVercelEnv;
    await db.close();
  }
});
