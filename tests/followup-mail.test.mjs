import test from "node:test";
import assert from "node:assert/strict";
import { followupMail, followupFingerprint } from "../lib/crm/followup-mail.js";
import { FOLLOWUP_TEMPLATES } from "../lib/crm/followup-content.js";

const contact = { name: "Emma <Sample>", email: "emma@example.test", business: "Emma Studio" };

test("service follow-ups are personalized, branded, and keep owner tests separate from client sends", () => {
  assert(Object.keys(FOLLOWUP_TEMPLATES).includes("photography"));
  const client = followupMail(contact, "photography", "client");
  assert.deepEqual(client.to, ["emma@example.test"]);
  assert.deepEqual(client.bcc, ["colonnamedia@gmail.com"]);
  assert.match(client.text, /headshots, your team at work, brand imagery/);
  assert.match(client.text, /Just reply to this email/);
  assert.match(client.html, /colonna-logo-full.png/);
  assert.match(client.html, /Reply with your details/);
  assert.doesNotMatch(client.html, /<Sample>/);
  const owner = followupMail(contact, "photography", "test");
  assert.deepEqual(owner.to, ["colonnamedia@gmail.com"]);
  assert.deepEqual(owner.bcc, []);
  assert.match(owner.subject, /^TEST/);
  assert.match(owner.text, /No client email was sent/);
  assert.notEqual(followupFingerprint(owner), followupFingerprint(client));
});

test("protected manual follow-up requires full draft approval and records separate test and client events", async () => {
  const { leadDatabase, configureLeadTests, invoke, TOKEN, OWNER_ID } = await import("./helpers/lead-database.mjs");
  const { default: crm } = await import("../api/crm.js");
  configureLeadTests();
  const db = await leadDatabase();
  const originalFetch = globalThis.fetch;
  const oldVercelEnv = process.env.VERCEL_ENV;
  const sent = [];
  try {
    await db.database.query("insert into public.crm_contacts(id,name,email,business,kind,stage) values($1,'Emma Goldstein','emma@example.test','Emma Studio','lead','qualified')", [OWNER_ID]);
    globalThis.fetch = async (url, options) => {
      if (String(url) === "https://api.resend.com/emails") {
        sent.push(JSON.parse(options.body));
        return new Response(JSON.stringify({ id: `followup-${sent.length}` }), { status: 200, headers: { "Content-Type": "application/json" } });
      }
      return db.fetch(url, options);
    };
    const auth = { authorization: "Bearer " + TOKEN("aal2") };
    let result = await invoke(crm, { query: { action: "followup-preview" }, body: { contact_id: OWNER_ID, service: "photography", kind: "test" }, headers: { authorization: "Bearer " + TOKEN("aal1") } });
    assert.equal(result.status, 403);
    result = await invoke(crm, { query: { action: "followup-preview" }, body: { contact_id: OWNER_ID, service: "photography", kind: "test" }, headers: auth });
    assert.equal(result.status, 200);
    assert.deepEqual(result.payload.draft.to, ["colonnamedia@gmail.com"]);
    assert.equal(sent.length, 0);
    const testPreview = result.payload;
    result = await invoke(crm, { query: { action: "followup-send" }, body: { contact_id: OWNER_ID, service: "photography", kind: "test", approved: true, fingerprint: "0".repeat(64) }, headers: auth });
    assert.equal(result.status, 400);
    process.env.VERCEL_ENV = "preview";
    result = await invoke(crm, { query: { action: "followup-send" }, body: { contact_id: OWNER_ID, service: "photography", kind: "test", approved: true, fingerprint: testPreview.fingerprint }, headers: auth });
    assert.equal(result.status, 503);
    assert.equal(sent.length, 0);
    process.env.VERCEL_ENV = "production";
    result = await invoke(crm, { query: { action: "followup-send" }, body: { contact_id: OWNER_ID, service: "photography", kind: "test", approved: true, fingerprint: testPreview.fingerprint }, headers: auth });
    assert.equal(result.status, 200);
    assert.deepEqual(sent[0].to, ["colonnamedia@gmail.com"]);
    result = await invoke(crm, { query: { action: "followup-preview" }, body: { contact_id: OWNER_ID, service: "photography", kind: "client" }, headers: auth });
    const clientPreview = result.payload;
    assert.deepEqual(clientPreview.draft.to, ["emma@example.test"]);
    assert.equal(sent.length, 1);
    result = await invoke(crm, { query: { action: "followup-send" }, body: { contact_id: OWNER_ID, service: "photography", kind: "client", approved: true, fingerprint: clientPreview.fingerprint }, headers: auth });
    assert.equal(result.status, 200);
    assert.deepEqual(sent[1].to, ["emma@example.test"]);
    assert.deepEqual(sent[1].bcc, ["colonnamedia@gmail.com"]);
    const events = await db.database.query("select event,details from public.crm_events where entity_id=$1 order by created_at", [OWNER_ID]);
    assert(events.rows.some((e) => e.event === "followup_test_email_accepted"));
    assert(events.rows.some((e) => e.event === "followup_email_accepted" && e.details.service === "photography"));
  } finally {
    globalThis.fetch = originalFetch;
    process.env.VERCEL_ENV = oldVercelEnv;
    await db.close();
  }
});
