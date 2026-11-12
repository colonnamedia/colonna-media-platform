import test from "node:test";
import assert from "node:assert/strict";
import { createClient } from "@supabase/supabase-js";
import { adminAuthOptions } from "../admin-app/session.js";
import { requireAdmin } from "../lib/crm/server.js";
const owner = "a7fbdb97-3fc6-45eb-8984-a32f476c674e";
const email = "colonnamedia@gmail.com";
function token(aal = "aal2", exp = Math.floor(Date.now() / 1000) + 3600) {
  return [
    Buffer.from('{"alg":"HS256","typ":"JWT"}').toString("base64url"),
    Buffer.from(JSON.stringify({ sub: owner, aal, exp, amr: [] })).toString(
      "base64url",
    ),
    Buffer.alloc(32).toString("base64url"),
  ].join(".");
}
function tabStorage() {
  const values = new Map();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key),
    values,
  };
}
test("real auth SDK restores the tab session after refresh, renews expired tokens, retains MFA and clears sign-out", async () => {
  process.env.CRM_ADMIN_USER_ID = owner;
  const tab = tabStorage(),
    clients = [],
    calls = [];
  const user = {
    id: owner,
    email,
    email_confirmed_at: "2026-01-01T00:00:00Z",
    aud: "authenticated",
    role: "authenticated",
    factors: [],
  };
  const fetch = async (url, options = {}) => {
    const u = new URL(url);
    calls.push(u.pathname);
    assert.equal(u.origin, "https://admin-auth-test.example");
    if (u.pathname === "/auth/v1/user")
      return new Response(JSON.stringify(user), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    if (u.pathname === "/auth/v1/logout")
      return new Response("{}", {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    if (u.pathname === "/auth/v1/token") {
      assert.equal(u.searchParams.get("grant_type"), "refresh_token");
      return new Response(
        JSON.stringify({
          access_token: token(),
          refresh_token: "rotated-test-refresh",
          token_type: "bearer",
          expires_in: 3600,
          user,
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    }
    throw Error("Unexpected outbound auth call " + u.pathname);
  };
  const create = (storage = tab) => {
    const client = createClient("https://admin-auth-test.example", "test-key", {
      auth: adminAuthOptions(() => storage),
      global: { fetch },
    });
    clients.push(client);
    return client;
  };
  try {
    const first = create();
    assert.equal(
      (
        await first.auth.setSession({
          access_token: token(),
          refresh_token: "test-refresh",
        })
      ).error,
      null,
    );
    await first.auth.stopAutoRefresh();
    assert(tab.values.has("colonna-media-admin-session-v1"));
    const restored = create();
    const { data, error } = await restored.auth.getSession();
    assert.equal(error, null);
    assert.equal(data.session.user.id, owner);
    assert.equal(
      (await restored.auth.mfa.getAuthenticatorAssuranceLevel()).data
        .currentLevel,
      "aal2",
    );
    assert.equal(
      (
        await requireAdmin(
          { headers: { authorization: "Bearer " + data.session.access_token } },
          restored,
        )
      ).id,
      owner,
    );
    await restored.auth.stopAutoRefresh();
    const expired = JSON.parse(tab.getItem("colonna-media-admin-session-v1"));
    expired.access_token = token("aal2", Math.floor(Date.now() / 1000) - 60);
    expired.expires_at = Math.floor(Date.now() / 1000) - 60;
    tab.setItem("colonna-media-admin-session-v1", JSON.stringify(expired));
    const renewed = create();
    const session = (await renewed.auth.getSession()).data.session;
    assert.equal(session.refresh_token, "rotated-test-refresh");
    assert.equal(
      (await renewed.auth.mfa.getAuthenticatorAssuranceLevel()).data
        .currentLevel,
      "aal2",
    );
    assert(calls.includes("/auth/v1/token"));
    await renewed.auth.stopAutoRefresh();
    const otherTab = create(tabStorage());
    assert.equal((await otherTab.auth.getSession()).data.session, null);
    assert.equal((await renewed.auth.signOut({ scope: "local" })).error, null);
    assert.equal(tab.getItem("colonna-media-admin-session-v1"), null);
    assert.equal((await create().auth.getSession()).data.session, null);
    const unverified = create();
    await unverified.auth.setSession({
      access_token: token("aal1"),
      refresh_token: "aal1-test",
    });
    await assert.rejects(
      () =>
        requireAdmin(
          { headers: { authorization: "Bearer " + token("aal1") } },
          unverified,
        ),
      /Authenticator verification/,
    );
    assert(
      calls.every((path) =>
        ["/auth/v1/user", "/auth/v1/logout", "/auth/v1/token"].includes(path),
      ),
    );
  } finally {
    for (const client of clients) await client.auth.stopAutoRefresh();
  }
});
test("blocked session storage degrades to page memory and sign-out removes its fallback", () => {
  const options = adminAuthOptions(() => {
    throw Error("Storage denied");
  });
  assert.equal(options.persistSession, true);
  assert.equal(options.autoRefreshToken, true);
  options.storage.setItem("key", "token");
  assert.equal(options.storage.getItem("key"), "token");
  options.storage.removeItem("key");
  assert.equal(options.storage.getItem("key"), null);
  assert.equal(
    adminAuthOptions(() => {
      throw Error("Storage denied");
    }).storage.getItem("key"),
    null,
  );
});
