import test from "node:test";
import assert from "node:assert/strict";
import {
  paymentPlan,
  agreementSchema,
  jobSchema,
  effectiveJobStatus,
  isActiveJob,
  nyDate,
} from "../lib/crm/domain.js";
import {
  requireAdmin,
  hashToken,
  newToken,
  assertOrigin,
} from "../lib/crm/server.js";
import handler from "../api/crm.js";
const id = "a7fbdb97-3fc6-45eb-8984-a32f476c674e";
process.env.CRM_ADMIN_USER_ID = id;
const job = {
  contact_id: id,
  title: "Website",
  services: ["website"],
  mode: "one-time",
  status: "active",
  start_date: "2026-11-01",
  end_date: "2026-11-10",
  auto_close: true,
};
test("50% down and custom phase schedules preserve cents", () => {
  for (let c = 1; c < 100000; c += 137) {
    const p = paymentPlan(c);
    assert.equal(
      p.reduce((s, p) => s + p.amount_cents, 0),
      c,
    );
  }
  assert.deepEqual(
    paymentPlan(70000).map((p) => p.amount_cents),
    [35000, 35000],
  );
});
test("reject mismatched installments, accept three phases and recurring with no setup fee", () => {
  const a = {
    contact_id: id,
    job_id: id,
    title: "Website agreement",
    agreement_date: "2026-11-10",
    total_cents: 70000,
    payments: [
      { label: "Deposit", amount_cents: 35000, due: "Before work" },
      { label: "Design", amount_cents: 17500, due: "After design approval" },
      { label: "Delivery", amount_cents: 17500, due: "On delivery" },
    ],
    terms: "Terms ".repeat(30),
  };
  assert.equal(agreementSchema.parse(a).payments.length, 3);
  assert.throws(() => agreementSchema.parse({ ...a, total_cents: 71000 }));
  assert.equal(
    agreementSchema.parse({ ...a, total_cents: 0, payments: [] }).total_cents,
    0,
  );
});
test("one-time work closes after its date, recurring and paused work do not auto-close", () => {
  assert.equal(effectiveJobStatus(job, "2026-11-10"), "active");
  assert.equal(effectiveJobStatus(job, "2026-11-11"), "completed");
  assert.equal(isActiveJob(job, "2026-10-31"), false);
  assert.equal(
    isActiveJob({ ...job, mode: "recurring", auto_close: false }, "2027-01-01"),
    true,
  );
  assert.equal(isActiveJob({ ...job, status: "paused" }, "2026-11-05"), false);
});
test("Eastern date boundary and invalid job periods", () => {
  assert.equal(nyDate(new Date("2026-11-11T02:00:00Z")), "2026-11-10");
  assert.throws(() => jobSchema.parse({ ...job, end_date: "2026-10-01" }));
  assert.throws(() => jobSchema.parse({ ...job, mode: "recurring" }));
  assert.throws(() => jobSchema.parse({ ...job, end_date: "" }));
});
const user = {
  id,
  email: "colonnamedia@gmail.com",
  email_confirmed_at: "2026-11-01T00:00:00Z",
};
const mock = (u, level = "aal2") => ({
  auth: {
    getUser: async () => ({ data: { user: u } }),
    mfa: {
      getAuthenticatorAssuranceLevel: async () => ({
        data: { currentLevel: level },
      }),
    },
  },
});
test("server rejects no login, wrong owner, unconfirmed email and AAL1 even if UI is bypassed", async () => {
  await assert.rejects(requireAdmin({ headers: {} }, mock(user)), {
    status: 401,
  });
  const req = { headers: { authorization: "Bearer verified-by-supabase" } };
  await assert.rejects(requireAdmin(req, mock(user, "aal1")), { status: 403 });
  await assert.rejects(
    requireAdmin(req, mock({ ...user, id: "someone-else" })),
    { status: 403 },
  );
  await assert.rejects(
    requireAdmin(req, mock({ ...user, email_confirmed_at: null })),
    { status: 403 },
  );
  assert.equal((await requireAdmin(req, mock(user))).id, id);
});
test("cross-origin mutation rejected; signing tokens high entropy and hashed", () => {
  assert.throws(
    () =>
      assertOrigin({
        method: "POST",
        headers: { origin: "https://attacker.test" },
      }),
    { status: 403 },
  );
  assert.doesNotThrow(() =>
    assertOrigin({
      method: "POST",
      headers: { origin: "https://www.colonnamedia.com" },
    }),
  );
  const a = newToken(),
    b = newToken();
  assert.notEqual(a, b);
  assert.equal(a.length, 43);
  assert.equal(hashToken(a).length, 64);
  assert.notEqual(hashToken(a), hashToken(b));
});
test("unconfigured API fails closed without revealing internals", async () => {
  let status, payload;
  const res = {
    setHeader() {},
    status(s) {
      status = s;
      return this;
    },
    json(p) {
      payload = p;
      return this;
    },
  };
  await handler({ method: "GET", query: { action: "list" }, headers: {} }, res);
  assert.equal(status, 503);
  assert.equal(payload.error, "CRM setup is not complete");
});
