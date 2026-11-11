import React, { useState, useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
import { createClient } from "@supabase/supabase-js";
import {
  Users,
  BriefcaseBusiness,
  FileSignature,
  LayoutDashboard,
  Search,
  Plus,
  LogOut,
  ArrowUpRight,
  ShieldCheck,
  SlidersHorizontal,
  Inbox,
  X,
  Download,
  ClipboardList,
  Settings2,
} from "lucide-react";
import {
  SERVICES,
  money,
  paymentPlan,
  draftTerms,
  nyDate,
  effectiveJobStatus,
  isActiveJob,
} from "../lib/crm/domain.js";
import "./style.css";
let auth;
const empty = {
  contacts: [],
  jobs: [],
  agreements: [],
  inquiries: [],
  payments: [],
  templates: [],
};
const escapeCSV = (v) => '"' + String(v ?? "").replaceAll('"', '""') + '"';
async function request(action, data) {
  const session = await auth.auth.getSession();
  const r = await fetch(`/api/crm?action=${action}`, {
    method: data ? "POST" : "GET",
    headers: {
      Authorization: `Bearer ${session.data.session?.access_token || ""}`,
      ...(data ? { "Content-Type": "application/json" } : {}),
    },
    body: data ? JSON.stringify(data) : undefined,
  });
  if (!r.ok) throw Error((await r.json()).error || "Request failed");
  return r.headers.get("content-type")?.includes("application/pdf")
    ? r.blob()
    : r.json();
}
function download(blob, name) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}
const Label = ({ title, children }) => (
  <label className="field">
    <span>{title}</span>
    {children}
  </label>
);
function Input({ label, ...props }) {
  return (
    <Label title={label}>
      <input {...props} />
    </Label>
  );
}
function Select({ label, options, ...props }) {
  return (
    <Label title={label}>
      <select {...props}>
        {options.map((o) => (
          <option key={o.value ?? o} value={o.value ?? o}>
            {o.label ?? o}
          </option>
        ))}
      </select>
    </Label>
  );
}
function Modal({ title, children, close }) {
  return (
    <div
      className="overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="modal"
      >
        <div className="modal-head">
          <h2>{title}</h2>
          <button aria-label="Close" className="icon" onClick={close}>
            <X />
          </button>
        </div>
        {children}
      </section>
    </div>
  );
}
function Services({ value, onChange }) {
  return (
    <div className="service-options">
      {Object.entries(SERVICES).map(([id, label]) => (
        <label key={id}>
          <input
            type="checkbox"
            checked={value.includes(id)}
            onChange={(e) =>
              onChange(
                e.target.checked
                  ? [...value, id]
                  : value.filter((s) => s !== id),
              )
            }
          />
          {label}
        </label>
      ))}
    </div>
  );
}
function Banner({ children }) {
  return children ? (
    <div className="notice" role="status">
      {children}
    </div>
  ) : null;
}
function Login({ config, onReady }) {
  const [email, setEmail] = useState(config.email),
    [password, setPassword] = useState(""),
    [factor, setFactor] = useState(null),
    [code, setCode] = useState(""),
    [qr, setQr] = useState(""),
    [secret, setSecret] = useState(""),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  async function inspect() {
    const {
      data: { session },
    } = await auth.auth.getSession();
    if (!session) return;
    if (session.user.email?.toLowerCase() !== config.email) {
      await auth.auth.signOut();
      throw Error("This account is restricted to " + config.email);
    }
    const { data: aal, error } =
      await auth.auth.mfa.getAuthenticatorAssuranceLevel();
    if (error) throw error;
    if (aal.currentLevel === "aal2") {
      await onReady();
      return;
    }
    const { data: fs, error: fe } = await auth.auth.mfa.listFactors();
    if (fe) throw fe;
    const existing = fs.totp.find((f) => f.status === "verified");
    if (existing) {
      setFactor(existing.id);
      return;
    }
    // Resume an interrupted setup by replacing only an unverified TOTP factor.
    for (const f of fs.totp.filter((f) => f.status === "unverified"))
      await auth.auth.mfa.unenroll({ factorId: f.id });
    const { data, error: ee } = await auth.auth.mfa.enroll({
      factorType: "totp",
      friendlyName: "Colonna Media admin",
      issuer: "Colonna Media",
    });
    if (ee) throw ee;
    setFactor(data.id);
    setQr(data.totp.qr_code);
    setSecret(data.totp.secret);
  }
  useEffect(() => {
    if (config.configured) inspect().catch((e) => setError(e.message));
  }, []);
  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      if (factor) {
        const { error } = await auth.auth.mfa.challengeAndVerify({
          factorId: factor,
          code,
        });
        if (error) throw error;
        await onReady();
      } else {
        const { error } = await auth.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        setPassword("");
        await inspect();
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="login">
      <div className="login-story">
        <Brand />
        <div>
          <div className="eyebrow">YOUR BUSINESS, CONNECTED</div>
          <h1>
            A clear view.
            <br />A better next move.
          </h1>
          <p>
            Clients, projects, and agreements.
            <br />
            All together in your private studio.
          </p>
        </div>
        <small>COLONNA MEDIA LLC · PITTSBURGH</small>
      </div>
      <div className="login-form">
        <ShieldCheck size={32} />
        <p className="eyebrow">PRIVATE WORKSPACE</p>
        <h2>
          {!config.configured
            ? "Your studio is being connected"
            : factor
              ? "Verify your sign-in"
              : "Welcome back, Anthony."}
        </h2>
        <p className="muted">
          {!config.configured
            ? "Database and owner account setup must be completed before client information can be saved."
            : factor
              ? "Use the six-digit code from Google Authenticator."
              : "Sign in to manage your clients and work."}
        </p>
        {config.configured ? (
          <form onSubmit={submit}>
            {!factor ? (
              <>
                <Input
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="username"
                />
                <Input
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
              </>
            ) : (
              <>
                {qr && (
                  <>
                    <img
                      className="qr"
                      src={
                        qr.startsWith("data:")
                          ? qr
                          : `data:image/svg+xml;utf8,${encodeURIComponent(qr)}`
                      }
                      alt="Scan this QR code in Google Authenticator"
                    />
                    <p className="muted">
                      On this phone? Enter this setup key manually in Google
                      Authenticator:
                    </p>
                    <code className="setup-key">{secret}</code>
                    <p className="muted">
                      Keep your authenticator account backed up. Recovery
                      requires owner verification through Supabase.
                    </p>
                  </>
                )}
                <Input
                  label="Authenticator code"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  required
                />
              </>
            )}
            <Banner>{error}</Banner>
            <button className="primary wide" disabled={busy}>
              {busy
                ? "Verifying…"
                : factor
                  ? "Verify & enter studio"
                  : "Continue"}
            </button>
            {factor && (
              <button
                type="button"
                className="text-button"
                onClick={async () => {
                  await auth.auth.signOut();
                  setFactor(null);
                  setQr("");
                  setSecret("");
                }}
              >
                Use another sign-in
              </button>
            )}
          </form>
        ) : (
          <div className="setup-note">
            Owner account
            <br />
            <strong>colonnamedia@gmail.com</strong>
            <p>No client data is stored in this browser.</p>
          </div>
        )}
      </div>
    </main>
  );
}
function Brand() {
  return (
    <div className="brand">
      <span className="brand-mark">
        C<span />
      </span>
      <span>
        Colonna <b>Media</b>
        <small>CLIENT STUDIO</small>
      </span>
    </div>
  );
}
function ContactForm({ initial, onSave }) {
  const [v, set] = useState({
    name: "",
    email: "",
    business: "",
    phone: "",
    website: "",
    kind: "lead",
    stage: "new",
    services: [],
    source: "Manual entry",
    notes: "",
    follow_up: "",
    marketing_consent: false,
    ...initial,
  });
  const update = (k, x) => set({ ...v, [k]: x });
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave(v);
      }}
    >
      <div className="form-grid">
        {["name", "email", "business", "phone", "website"].map((k) => (
          <Input
            key={k}
            label={k[0].toUpperCase() + k.slice(1)}
            type={k === "email" ? "email" : "text"}
            required={["name", "email"].includes(k)}
            value={v[k]}
            onChange={(e) => update(k, e.target.value)}
          />
        ))}
        <Select
          label="Contact type"
          options={["lead", "client"]}
          value={v.kind}
          onChange={(e) => update("kind", e.target.value)}
        />
        <Select
          label="Lead stage"
          options={["new", "contacted", "qualified", "proposal", "won", "lost"]}
          value={v.stage}
          onChange={(e) => update("stage", e.target.value)}
        />
        <Input
          label="Source"
          value={v.source}
          onChange={(e) => update("source", e.target.value)}
        />
        <Input
          label="Follow-up date"
          type="date"
          value={v.follow_up}
          onChange={(e) => update("follow_up", e.target.value)}
        />
      </div>
      <h3>Services of interest</h3>
      <Services value={v.services} onChange={(s) => update("services", s)} />
      <Label title="Notes">
        <textarea
          rows={4}
          value={v.notes}
          onChange={(e) => update("notes", e.target.value)}
        />
      </Label>
      <label className="check">
        <input
          type="checkbox"
          checked={v.marketing_consent}
          onChange={(e) => update("marketing_consent", e.target.checked)}
        />
        Marketing email consent recorded
      </label>
      <div className="actions">
        <button className="primary">Save contact</button>
      </div>
    </form>
  );
}
function JobForm({ initial, contacts, onSave }) {
  const [v, set] = useState({
    contact_id: contacts[0]?.id || "",
    title: "",
    services: [],
    mode: "one-time",
    status: "planned",
    start_date: nyDate(),
    end_date: "",
    auto_close: false,
    scope: "",
    monthly_cents: 0,
    ...initial,
  });
  const update = (k, x) => set({ ...v, [k]: x });
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave(v);
      }}
    >
      <div className="form-grid">
        <Select
          label="Client"
          options={contacts.map((c) => ({
            value: c.id,
            label: c.business || c.name,
          }))}
          value={v.contact_id}
          onChange={(e) => update("contact_id", e.target.value)}
          required
        />
        <Input
          label="Job title"
          required
          value={v.title}
          onChange={(e) => update("title", e.target.value)}
        />
        <Select
          label="Service type"
          options={["one-time", "recurring"]}
          value={v.mode}
          onChange={(e) =>
            set({ ...v, mode: e.target.value, auto_close: false })
          }
        />
        <Select
          label="Status"
          options={["planned", "active", "paused", "completed", "cancelled"]}
          value={v.status}
          onChange={(e) => update("status", e.target.value)}
        />
        <Input
          label="Start date"
          type="date"
          required
          value={v.start_date}
          onChange={(e) => update("start_date", e.target.value)}
        />
        <Input
          label="Completion / end date"
          type="date"
          min={v.start_date}
          value={v.end_date}
          onChange={(e) => update("end_date", e.target.value)}
        />
        {v.mode === "recurring" && (
          <Input
            label="Monthly management fee ($)"
            type="number"
            min="0"
            step="0.01"
            value={v.monthly_cents / 100}
            onChange={(e) =>
              update("monthly_cents", Math.round(Number(e.target.value) * 100))
            }
          />
        )}
      </div>
      <h3>Services included</h3>
      <Services value={v.services} onChange={(s) => update("services", s)} />
      <Label title="Scope, deliverables, platforms / accounts, revisions">
        <textarea
          rows={6}
          required
          value={v.scope}
          onChange={(e) => update("scope", e.target.value)}
        />
      </Label>
      {v.mode === "one-time" && (
        <label className="check">
          <input
            type="checkbox"
            checked={v.auto_close}
            onChange={(e) => update("auto_close", e.target.checked)}
          />
          Mark completed after the end date (Eastern time)
        </label>
      )}
      <p className="muted">
        A client is active while at least one job is active. Recurring services
        stay active until you pause, complete, or cancel them. Signing an
        agreement does not automatically start a job.
      </p>
      <div className="actions">
        <button className="primary">Save job</button>
      </div>
    </form>
  );
}
function AgreementForm({ jobs, contacts, templates, onSave }) {
  const [jobId, setJob] = useState(jobs[0]?.id || ""),
    [title, setTitle] = useState("Service agreement"),
    [date, setDate] = useState(nyDate()),
    [total, setTotal] = useState(700),
    [percent, setPercent] = useState(50),
    [payments, setPayments] = useState(paymentPlan(70000)),
    [terms, setTerms] = useState(""),
    [reviewed, setReviewed] = useState(false),
    [preview, setPreview] = useState(false);
  const job = jobs.find((j) => j.id === jobId);
  const contact = contacts.find((c) => c.id === job?.contact_id);
  function generate() {
    if (!job) return;
    const text = draftTerms(job, templates);
    setTerms(text);
    setReviewed(false);
  }
  useEffect(() => {
    generate();
  }, [jobId]);
  if (!jobs.length)
    return (
      <p>
        Add a client and job first so the agreement connects to the correct
        project.
      </p>
    );
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave({
          contact_id: contact.id,
          job_id: jobId,
          title,
          agreement_date: date,
          total_cents: Math.round(total * 100),
          payments,
          terms,
          terms_reviewed: reviewed,
        });
      }}
    >
      <div className="form-grid">
        <Select
          label="Job / client"
          options={jobs.map((j) => ({
            value: j.id,
            label: `${contacts.find((c) => c.id === j.contact_id)?.name || "Client"} — ${j.title}`,
          }))}
          value={jobId}
          onChange={(e) => setJob(e.target.value)}
        />
        <Input
          label="Agreement title"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <Input
          label="Agreement date"
          type="date"
          required
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <Input
          label="One-time project / setup total ($)"
          type="number"
          min="0"
          step="0.01"
          required
          value={total}
          onChange={(e) => setTotal(Number(e.target.value))}
        />
      </div>
      {job.mode === "recurring" && (
        <Banner>
          Recurring fee: {money(job.monthly_cents)}/month. State billing dates,
          initial service period, term, renewal, and cancellation in the
          agreement below. The installment total here is for one-time work or
          setup.
        </Banner>
      )}
      <div className="split-heading">
        <h3>Payment schedule</h3>
        <div className="inline">
          <label>
            Down payment %{" "}
            <input
              className="short"
              type="number"
              min="0"
              max="100"
              value={percent}
              onChange={(e) => setPercent(Number(e.target.value))}
            />
          </label>
          <button
            type="button"
            onClick={() =>
              setPayments(paymentPlan(Math.round(total * 100), percent))
            }
          >
            Apply split
          </button>
        </div>
      </div>
      {payments.map((p, i) => (
        <div className="payment-row" key={i}>
          <Input
            label="Payment / phase"
            value={p.label}
            required
            onChange={(e) =>
              setPayments(
                payments.map((x, n) =>
                  n === i ? { ...x, label: e.target.value } : x,
                ),
              )
            }
          />
          <Input
            label="Amount ($)"
            type="number"
            min="0.01"
            step="0.01"
            required
            value={p.amount_cents / 100}
            onChange={(e) =>
              setPayments(
                payments.map((x, n) =>
                  n === i
                    ? {
                        ...x,
                        amount_cents: Math.round(Number(e.target.value) * 100),
                      }
                    : x,
                ),
              )
            }
          />
          <Input
            label="Due date, milestone, or service period"
            value={p.due}
            required
            onChange={(e) =>
              setPayments(
                payments.map((x, n) =>
                  n === i ? { ...x, due: e.target.value } : x,
                ),
              )
            }
          />
          <button
            aria-label="Remove installment"
            type="button"
            onClick={() => setPayments(payments.filter((_, n) => n !== i))}
          >
            ×
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() =>
          setPayments([
            ...payments,
            { label: "Milestone payment", amount_cents: 0, due: "" },
          ])
        }
      >
        + Add phase / installment
      </button>
      <p
        className={
          payments.reduce((s, p) => s + p.amount_cents, 0) !==
          Math.round(total * 100)
            ? "error-text"
            : "muted"
        }
      >
        Scheduled {money(payments.reduce((s, p) => s + p.amount_cents, 0))} of{" "}
        {money(Math.round(total * 100))}
      </p>
      <div className="split-heading">
        <h3>Agreement wording</h3>
        <button type="button" onClick={generate}>
          Load template sections
        </button>
      </div>
      <textarea
        aria-label="Agreement terms"
        rows={15}
        value={terms}
        onChange={(e) => {
          setTerms(e.target.value);
          setReviewed(false);
        }}
        required
      />
      <label className="check">
        <input
          type="checkbox"
          checked={reviewed}
          onChange={(e) => setReviewed(e.target.checked)}
        />
        I reviewed the complete scope, payment, cancellation, refund, and
        service terms and removed all placeholders.
      </label>
      <div className="actions">
        <button type="button" onClick={() => setPreview(!preview)}>
          Preview complete agreement
        </button>
        <button className="primary">Save agreement draft</button>
      </div>
      {preview && (
        <div className="agreement-preview">
          <AgreementView
            snapshot={{
              title,
              agreement_date: date,
              client: contact,
              services: job.services.map((s) => SERVICES[s]),
              job,
              total_cents: Math.round(total * 100),
              payments,
              terms,
            }}
          />
        </div>
      )}
    </form>
  );
}
function AgreementView({ snapshot: s }) {
  return (
    <>
      <p className="eyebrow">COLONNA MEDIA LLC</p>
      <h1>{s.title}</h1>
      <p>
        {s.agreement_date} · {s.client.name}
        {s.client.business ? " / " + s.client.business : ""}
        <br />
        {s.client.email}
      </p>
      <div className="summary-box">
        <strong>{s.services.join(" · ")}</strong>
        <h2>
          {money(s.total_cents)} <small>one-time total</small>
        </h2>
        {s.payments.map((p, i) => (
          <div className="payment-summary" key={i}>
            <span>
              {p.label}
              <small>{p.due}</small>
            </span>
            <strong>{money(p.amount_cents)}</strong>
          </div>
        ))}
        {s.job.mode === "recurring" && (
          <p>
            Recurring management:{" "}
            <strong>{money(s.job.monthly_cents)} / month</strong>
          </p>
        )}
      </div>
      <div className="terms">{s.terms}</div>
    </>
  );
}
function App() {
  const [config, setConfig] = useState(null),
    [ready, setReady] = useState(false),
    [data, setData] = useState(empty),
    [tab, setTab] = useState("Overview"),
    [q, setQ] = useState(""),
    [service, setService] = useState(""),
    [stage, setStage] = useState(""),
    [kind, setKind] = useState(""),
    [activity, setActivity] = useState(""),
    [due, setDue] = useState(false),
    [modal, setModal] = useState(null),
    [message, setMessage] = useState(""),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [selected, setSelected] = useState(null);
  useEffect(() => {
    fetch("/api/crm?action=config")
      .then((r) => r.json())
      .then((c) => {
        setConfig(c);
        if (c.configured)
          auth = createClient(c.url, c.key, {
            auth: {
              persistSession: false,
              autoRefreshToken: true,
              detectSessionInUrl: false,
            },
          });
      })
      .catch(() => {
        if (import.meta.env.DEV)
          setConfig({ configured: false, email: "colonnamedia@gmail.com" });
        else setError("Unable to connect to the admin service.");
      });
  }, []);
  const today = nyDate();
  const getContact = (id) => data.contacts.find((c) => c.id === id);
  const clientJobs = (id) => data.jobs.filter((j) => j.contact_id === id);
  const activeClient = (id) => clientJobs(id).some((j) => isActiveJob(j));
  async function refresh() {
    setData(await request("list"));
  }
  async function enter() {
    await refresh();
    setReady(true);
  }
  async function act(fn) {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await fn();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  const save = (action, v) =>
    act(async () => {
      await request(action, v);
      await refresh();
      setModal(null);
      setMessage("Saved successfully.");
    });
  const contacts = data.contacts.filter(
    (c) =>
      (!q ||
        [c.name, c.business, c.email, c.notes].some((v) =>
          v?.toLowerCase().includes(q.toLowerCase()),
        )) &&
      (!service ||
        c.services.includes(service) ||
        clientJobs(c.id).some((j) => j.services.includes(service))) &&
      (!stage || c.stage === stage) &&
      (!kind || c.kind === kind) &&
      (!activity ||
        (activity === "active" ? activeClient(c.id) : !activeClient(c.id))) &&
      (!due || (c.follow_up && c.follow_up <= today)),
  );
  const jobs = data.jobs.filter(
    (j) =>
      (!q ||
        [
          j.title,
          getContact(j.contact_id)?.name,
          getContact(j.contact_id)?.business,
          j.scope,
        ].some((v) => v?.toLowerCase().includes(q.toLowerCase()))) &&
      (!service || j.services.includes(service)) &&
      (!activity || (activity === "active" ? isActiveJob(j) : !isActiveJob(j))),
  );
  if (!config)
    return (
      <main className="loading">
        <Brand />
        <p>{error || "Opening your studio…"}</p>
      </main>
    );
  if (!ready) return <Login config={config} onReady={enter} />;
  const nav = [
    ["Overview", LayoutDashboard],
    ["Contacts", Users],
    ["Jobs", BriefcaseBusiness],
    ["Agreements", FileSignature],
    ["Inquiries", Inbox],
    ["Templates", ClipboardList],
    ["Settings", Settings2],
  ];
  const stats = [
    [
      "Active clients",
      data.contacts.filter((c) => activeClient(c.id)).length,
      "Clients with work in progress",
    ],
    [
      "Active jobs",
      data.jobs.filter((j) => isActiveJob(j)).length,
      "One-time & recurring services",
    ],
    [
      "Awaiting signature",
      data.agreements.filter(
        (a) => a.status === "issued" && a.expires_at > new Date().toISOString(),
      ).length,
      "Agreements ready for review",
    ],
    [
      "Follow-ups due",
      data.contacts.filter((c) => c.follow_up && c.follow_up <= today).length,
      "Keep the conversation moving",
    ],
  ];
  function exportContacts() {
    const rows = [
      [
        "Name",
        "Business",
        "Email",
        "Phone",
        "Type",
        "Stage",
        "Activity",
        "Services",
        "Follow up",
        "Marketing consent",
      ],
      ...contacts.map((c) => [
        c.name,
        c.business,
        c.email,
        c.phone,
        c.kind,
        c.stage,
        activeClient(c.id) ? "active" : "inactive",
        c.services.map((s) => SERVICES[s]).join("; "),
        c.follow_up,
        c.marketing_consent ? "yes" : "no",
      ]),
    ];
    download(
      new Blob(
        [
          rows
            .map((r) =>
              r
                .map((v) =>
                  escapeCSV(/^[=+@\-\t\r]/.test(String(v)) ? "'" + v : v),
                )
                .join(","),
            )
            .join("\r\n"),
        ],
        { type: "text/csv" },
      ),
      "colonna-contacts.csv",
    );
  }
  function contactTable(items) {
    return (
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Client / lead</th>
              <th>Services</th>
              <th>Stage</th>
              <th>Activity</th>
              <th>Follow-up</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {items.map((c) => (
              <tr key={c.id}>
                <td>
                  <button
                    className="contact-name"
                    onClick={() => setSelected(c.id)}
                  >
                    {c.business || c.name}
                  </button>
                  <small>
                    {c.name} · {c.email}
                  </small>
                </td>
                <td>
                  <div className="tags">
                    {c.services.map((s) => (
                      <span key={s}>{SERVICES[s]}</span>
                    ))}
                  </div>
                </td>
                <td>
                  <span className="pill">
                    {c.kind} / {c.stage}
                  </span>
                </td>
                <td>
                  <span
                    className={"pill " + (activeClient(c.id) ? "green" : "")}
                  >
                    {activeClient(c.id) ? "Active" : "Inactive"}
                  </span>
                </td>
                <td>{c.follow_up || "—"}</td>
                <td>
                  <button
                    className="text-button"
                    onClick={() => setModal({ type: "contact", value: c })}
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!items.length && (
          <Empty
            title="Your next connection starts here."
            text="Add a lead or client, or adjust your filters."
          />
        )}
      </div>
    );
  }
  return (
    <div className="studio">
      <aside>
        <Brand />
        <div className="workspace-label">WORKSPACE</div>
        <nav>
          {nav.map(([name, Icon]) => (
            <button
              key={name}
              className={tab === name ? "selected" : ""}
              onClick={() => {
                setTab(name);
                setQ("");
              }}
            >
              <Icon size={19} />
              {name}
              {name === "Inquiries" && data.inquiries.length > 0 && (
                <span className="nav-count">{data.inquiries.length}</span>
              )}
            </button>
          ))}
        </nav>
        <div className="side-bottom">
          <div className="avatar">AC</div>
          <div>
            Anthony Colonna<small>Owner · Private access</small>
          </div>
          <button
            aria-label="Sign out"
            className="icon"
            onClick={async () => {
              await auth.auth.signOut();
              setReady(false);
              setData(empty);
            }}
          >
            <LogOut size={17} />
          </button>
        </div>
      </aside>
      <main className="workspace">
        <header className="topbar">
          <span>
            Colonna Media <span className="muted">/ {tab}</span>
          </span>
          <div className="actions">
            <button className="text-button" onClick={() => act(refresh)}>
              Refresh
            </button>
            <span className="secure">
              <ShieldCheck size={15} />
              Two-factor protected
            </span>
          </div>
        </header>
        <div className="content">
          <div className="page-heading">
            <div>
              <p className="eyebrow">CLIENT STUDIO</p>
              <h1>{tab === "Overview" ? "Your work, in focus." : tab}</h1>
              <p className="muted">
                {tab === "Overview"
                  ? "A little clarity for everything you have going on."
                  : tab === "Contacts"
                    ? "Every relationship. One clear view."
                    : tab === "Jobs"
                      ? "Track each service, project, and ongoing commitment."
                      : tab === "Agreements"
                        ? "Clear terms. Specific scope. A preserved signed record."
                        : tab === "Templates"
                          ? "Reusable wording for your master agreement and selected services."
                          : "Your private Colonna Media workspace."}
              </p>
            </div>
            <div className="actions">
              {tab === "Contacts" && (
                <button onClick={exportContacts}>
                  <Download size={16} />
                  Export filtered
                </button>
              )}
              {!["Settings", "Templates"].includes(tab) && (
                <button
                  className="primary"
                  onClick={() =>
                    setModal({
                      type:
                        tab === "Jobs"
                          ? "job"
                          : tab === "Agreements"
                            ? "agreement"
                            : "contact",
                    })
                  }
                >
                  <Plus size={18} />
                  {tab === "Jobs"
                    ? "New job"
                    : tab === "Agreements"
                      ? "New agreement"
                      : "Add contact"}
                </button>
              )}
            </div>
          </div>
          <Banner>{message}</Banner>
          {error && (
            <div className="error" role="alert">
              {error}
            </div>
          )}
          {busy && <p role="status">Saving…</p>}
          {tab === "Overview" && (
            <>
              <div className="stats">
                {stats.map(([label, value, desc], i) => (
                  <article key={label}>
                    <span className={"stat-icon s" + i}>
                      {i === 0 ? (
                        <Users />
                      ) : i === 1 ? (
                        <BriefcaseBusiness />
                      ) : i === 2 ? (
                        <FileSignature />
                      ) : (
                        <ClipboardList />
                      )}
                    </span>
                    <p>{label}</p>
                    <strong>{value}</strong>
                    <small>{desc}</small>
                  </article>
                ))}
              </div>
              <div className="overview-grid">
                <section className="panel">
                  <div className="panel-head">
                    <h2>Work in progress</h2>
                    <button
                      className="text-button"
                      onClick={() => setTab("Jobs")}
                    >
                      View jobs <ArrowUpRight size={16} />
                    </button>
                  </div>
                  {data.jobs
                    .filter((j) => isActiveJob(j))
                    .slice(0, 6)
                    .map((j) => (
                      <div className="work-item" key={j.id}>
                        <div className="job-icon">
                          <BriefcaseBusiness size={19} />
                        </div>
                        <div>
                          <strong>{j.title}</strong>
                          <small>
                            {getContact(j.contact_id)?.business ||
                              getContact(j.contact_id)?.name}{" "}
                            · {j.services.map((s) => SERVICES[s]).join(", ")}
                          </small>
                        </div>
                        <span className="pill green">
                          {j.mode === "recurring" ? "Ongoing" : "Active"}
                        </span>
                      </div>
                    ))}
                  {!data.jobs.some((j) => isActiveJob(j)) && (
                    <Empty
                      title="Make room for good work."
                      text="Your active jobs will appear here."
                    />
                  )}
                </section>
                <section className="panel accent-panel">
                  <p className="eyebrow">FROM SCOPE TO SIGNATURE</p>
                  <h2>
                    Start with a<br />
                    clear agreement.
                  </h2>
                  <p>
                    Select services, set your payment schedule, and give your
                    client a simple place to sign.
                  </p>
                  <button onClick={() => setModal({ type: "agreement" })}>
                    Create agreement <ArrowUpRight size={17} />
                  </button>
                  <FileSignature className="accent-art" size={90} />
                </section>
              </div>
              <section className="panel">
                <div className="panel-head">
                  <h2>Recent contacts</h2>
                  <button
                    className="text-button"
                    onClick={() => setTab("Contacts")}
                  >
                    View all <ArrowUpRight size={16} />
                  </button>
                </div>
                {contactTable(data.contacts.slice(0, 5))}
              </section>
            </>
          )}
          {["Contacts", "Jobs"].includes(tab) && (
            <>
              <div className="filters">
                <div className="search">
                  <Search size={17} />
                  <input
                    aria-label="Search contacts or jobs"
                    placeholder="Search name, business, email, or project…"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                  />
                </div>
                <select
                  aria-label="Service filter"
                  value={service}
                  onChange={(e) => setService(e.target.value)}
                >
                  <option value="">All services</option>
                  {Object.entries(SERVICES).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v}
                    </option>
                  ))}
                </select>
                <select
                  aria-label="Activity filter"
                  value={activity}
                  onChange={(e) => setActivity(e.target.value)}
                >
                  <option value="">All activity</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
                {tab === "Contacts" && (
                  <>
                    <select
                      aria-label="Contact type filter"
                      value={kind}
                      onChange={(e) => setKind(e.target.value)}
                    >
                      <option value="">Leads & clients</option>
                      <option value="lead">Leads</option>
                      <option value="client">Clients</option>
                    </select>
                    <select
                      aria-label="Lead stage filter"
                      value={stage}
                      onChange={(e) => setStage(e.target.value)}
                    >
                      <option value="">All stages</option>
                      {[
                        "new",
                        "contacted",
                        "qualified",
                        "proposal",
                        "won",
                        "lost",
                      ].map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                    <label className="check">
                      <input
                        type="checkbox"
                        checked={due}
                        onChange={(e) => setDue(e.target.checked)}
                      />
                      Follow-ups due
                    </label>
                  </>
                )}
              </div>
              {tab === "Contacts" ? (
                <section className="panel">{contactTable(contacts)}</section>
              ) : (
                <div className="jobs-grid">
                  {jobs.map((j) => (
                    <article className="panel job-card" key={j.id}>
                      <div className="split-heading">
                        <span
                          className={"pill " + (isActiveJob(j) ? "green" : "")}
                        >
                          {effectiveJobStatus(j)}
                        </span>
                        <span className="muted">{j.mode}</span>
                      </div>
                      <h2>{j.title}</h2>
                      <p>
                        {getContact(j.contact_id)?.business ||
                          getContact(j.contact_id)?.name}
                      </p>
                      <div className="tags">
                        {j.services.map((s) => (
                          <span key={s}>{SERVICES[s]}</span>
                        ))}
                      </div>
                      <p className="muted">
                        {j.start_date} → {j.end_date || "Ongoing"}
                      </p>
                      {j.mode === "recurring" && (
                        <h3>
                          {money(j.monthly_cents)} <small>/ month</small>
                        </h3>
                      )}
                      <div className="actions">
                        <button
                          onClick={() => setModal({ type: "job", value: j })}
                        >
                          Edit job
                        </button>
                        <button
                          onClick={() =>
                            setModal({ type: "payment", value: j })
                          }
                        >
                          Record payment
                        </button>
                      </div>
                    </article>
                  ))}
                  {!jobs.length && (
                    <Empty
                      title="No jobs in this view."
                      text="Add your first project or change the filters."
                    />
                  )}
                </div>
              )}
            </>
          )}
          {tab === "Agreements" && (
            <section className="panel">
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Agreement</th>
                      <th>Client</th>
                      <th>Status</th>
                      <th>Total</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.agreements.map((a) => (
                      <tr key={a.id}>
                        <td>
                          <strong>{a.title}</strong>
                          <small>{a.snapshot.agreement_date}</small>
                        </td>
                        <td>
                          {a.snapshot.client.business || a.snapshot.client.name}
                        </td>
                        <td>
                          <span
                            className={
                              "pill " + (a.status === "signed" ? "green" : "")
                            }
                          >
                            {a.status === "issued" &&
                            a.expires_at < new Date().toISOString()
                              ? "expired"
                              : a.status}
                          </span>
                        </td>
                        <td>{money(a.snapshot.total_cents)}</td>
                        <td>
                          <div className="actions">
                            <button
                              onClick={() =>
                                setModal({ type: "view", value: a })
                              }
                            >
                              Review
                            </button>
                            {a.status === "draft" && (
                              <button
                                onClick={() =>
                                  act(async () => {
                                    const r = await request("issue", {
                                      id: a.id,
                                    });
                                    await refresh();
                                    setModal({ type: "link", value: r.url });
                                  })
                                }
                              >
                                Create signing link
                              </button>
                            )}
                            {["draft", "issued"].includes(a.status) && (
                              <button
                                onClick={() =>
                                  setModal({ type: "revoke", value: a })
                                }
                              >
                                Revoke
                              </button>
                            )}
                            {a.status === "signed" && (
                              <button
                                onClick={() =>
                                  act(async () =>
                                    download(
                                      await request("pdf&id=" + a.id),
                                      `signed-agreement-${a.id}.pdf`,
                                    ),
                                  )
                                }
                              >
                                PDF
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {!data.agreements.length && (
                  <Empty
                    title="Clear agreements start here."
                    text="Add a client and job, then create their agreement."
                  />
                )}
              </div>
            </section>
          )}
          {tab === "Inquiries" && (
            <section className="panel">
              <div className="panel-head">
                <h2>Website inquiries</h2>
                <span className="muted">
                  Original submissions are preserved
                </span>
              </div>
              {data.inquiries.map((i) => (
                <div className="inquiry" key={i.id}>
                  <div>
                    <strong>
                      {i.name} {i.business && " / " + i.business}
                    </strong>
                    <small>
                      {i.email} ·{" "}
                      {new Date(i.created_at).toLocaleString("en-US", {
                        timeZone: "America/New_York",
                      })}
                    </small>
                    <p>{i.services}</p>
                    <p className="terms">{i.message}</p>
                  </div>
                  <button
                    onClick={() => {
                      const existing = data.contacts.find(
                        (c) => c.email.toLowerCase() === i.email.toLowerCase(),
                      );
                      if (existing) {
                        setSelected(existing.id);
                        return;
                      }
                      setModal({
                        type: "contact",
                        value: {
                          name: i.name,
                          email: i.email,
                          business: i.business,
                          phone: i.phone,
                          website: i.website_url,
                          source: "Website " + i.page,
                          notes: i.message,
                          services: Object.entries(SERVICES)
                            .filter(([, v]) => i.services.includes(v))
                            .map(([k]) => k),
                        },
                      });
                    }}
                  >
                    {data.contacts.some(
                      (c) => c.email.toLowerCase() === i.email.toLowerCase(),
                    )
                      ? "View contact"
                      : "Add to CRM"}
                  </button>
                </div>
              ))}
              {!data.inquiries.length && (
                <Empty
                  title="Ready for your next inquiry."
                  text="New website submissions will appear here after the database is connected. Existing Google Sheet leads can be imported separately."
                />
              )}
            </section>
          )}
          {tab === "Templates" && (
            <section className="panel template-list">
              <Banner>
                Review reusable terms before use. Each agreement preserves its
                own copy; changing a template never changes earlier agreements.
              </Banner>
              {[
                { key: "master", label: "Master agreement" },
                ...Object.entries(SERVICES).map(([key, label]) => ({
                  key,
                  label,
                })),
              ].map((t) => (
                <div className="work-item" key={t.key}>
                  <ClipboardList size={20} />
                  <div>
                    <strong>{t.label}</strong>
                    <small>
                      {data.templates.find((x) => x.key === t.key)
                        ? "Custom wording saved"
                        : "Uses the built-in draft prompts"}
                    </small>
                  </div>
                  <button
                    onClick={() =>
                      setModal({
                        type: "template",
                        value: {
                          key: t.key,
                          label: t.label,
                          body:
                            data.templates.find((x) => x.key === t.key)?.body ||
                            "",
                        },
                      })
                    }
                  >
                    Edit wording
                  </button>
                </div>
              ))}
            </section>
          )}
          {tab === "Settings" && (
            <section className="panel settings">
              <h2>Private workspace</h2>
              <dl>
                <dt>Owner</dt>
                <dd>colonnamedia@gmail.com</dd>
                <dt>Authentication</dt>
                <dd>
                  Password + Google Authenticator (TOTP), enforced on the server
                </dd>
                <dt>Database</dt>
                <dd>Dedicated Supabase PostgreSQL project</dd>
                <dt>Signed agreements</dt>
                <dd>
                  Private PDF storage with agreement snapshots and acceptance
                  records
                </dd>
                <dt>Payments</dt>
                <dd>
                  Manual tracking. Recording a payment does not charge a card.
                </dd>
                <dt>Email</dt>
                <dd>
                  No email sending is enabled in this admin. Review and share
                  signing links manually. Future email drafts require your
                  approval.
                </dd>
                <dt>Client activity</dt>
                <dd>
                  Active if any job is active and its start date has arrived.
                  One-time jobs with auto-completion become completed the day
                  after their end date (Eastern time). Recurring jobs require an
                  explicit status change.
                </dd>
              </dl>
            </section>
          )}
        </div>
      </main>
      {modal && (
        <Modal
          title={
            {
              contact: modal.value?.id ? "Edit contact" : "New contact",
              job: modal.value?.id ? "Edit job" : "New job",
              agreement: "Create agreement",
              view: "Agreement record",
              link: "Signing link created",
              payment: "Record a received payment",
              template: "Template wording",
              revoke: "Revoke this agreement?",
            }[modal.type]
          }
          close={() => setModal(null)}
        >
          <fieldset disabled={busy}>
            <Banner>{error}</Banner>
            {modal.type === "contact" && (
              <ContactForm
                initial={modal.value}
                onSave={(v) => save("contact", v)}
              />
            )}{" "}
            {modal.type === "job" &&
              (data.contacts.length ? (
                <JobForm
                  initial={modal.value}
                  contacts={data.contacts}
                  onSave={(v) => save("job", v)}
                />
              ) : (
                <p>Add a contact first.</p>
              ))}
            {modal.type === "agreement" && (
              <AgreementForm
                jobs={data.jobs}
                contacts={data.contacts}
                templates={data.templates}
                onSave={(v) => save("agreement", v)}
              />
            )}{" "}
            {modal.type === "view" && (
              <>
                <AgreementView snapshot={modal.value.snapshot} />
                <p className="muted">
                  Status: {modal.value.status}
                  {modal.value.signed_at
                    ? " · Signed " +
                      new Date(modal.value.signed_at).toLocaleString("en-US", {
                        timeZone: "America/New_York",
                      })
                    : ""}
                </p>
                <button
                  onClick={() =>
                    act(async () => {
                      const events = await request(
                        "events&id=" + modal.value.id,
                      );
                      setMessage(
                        events
                          .map(
                            (e) =>
                              `${e.event}: ${new Date(e.created_at).toLocaleString()}`,
                          )
                          .join(" · "),
                      );
                      setModal(null);
                    })
                  }
                >
                  View activity record
                </button>
              </>
            )}
            {modal.type === "link" && (
              <>
                <p>
                  Copy this private link for the intended client. Anyone with
                  the link can access the agreement, so share it directly. It
                  expires after 30 days and stops working once signed or
                  revoked.
                </p>
                <Input
                  label="Private signing link — shown once"
                  readOnly
                  value={modal.value}
                />
                <button
                  className="primary"
                  onClick={() =>
                    act(async () => {
                      await navigator.clipboard.writeText(modal.value);
                      setMessage("Signing link copied.");
                    })
                  }
                >
                  Copy link
                </button>
                <p className="muted">
                  No email has been sent. If the link is lost, revoke this
                  agreement and create a new draft.
                </p>
              </>
            )}
            {modal.type === "payment" && (
              <PaymentForm
                job={modal.value}
                onSave={(v) => save("payment", v)}
              />
            )}{" "}
            {modal.type === "template" && (
              <TemplateForm
                initial={modal.value}
                onSave={(v) => save("template", v)}
              />
            )}{" "}
            {modal.type === "revoke" && (
              <>
                <p>
                  The client’s link will stop working. The agreement record will
                  be kept.
                </p>
                <button
                  className="primary"
                  onClick={() =>
                    act(async () => {
                      await request("revoke", { id: modal.value.id });
                      await refresh();
                      setModal(null);
                      setMessage("Agreement revoked.");
                    })
                  }
                >
                  Revoke agreement
                </button>
              </>
            )}
          </fieldset>
        </Modal>
      )}
      {selected && getContact(selected) && (
        <Modal title="Client profile" close={() => setSelected(null)}>
          <Profile
            contact={getContact(selected)}
            jobs={clientJobs(selected)}
            agreements={data.agreements.filter(
              (a) => a.contact_id === selected,
            )}
            payments={data.payments.filter((p) => p.contact_id === selected)}
            edit={() => {
              setModal({ type: "contact", value: getContact(selected) });
              setSelected(null);
            }}
            addJob={() => {
              setModal({ type: "job", value: { contact_id: selected } });
              setSelected(null);
            }}
          />
        </Modal>
      )}
    </div>
  );
}
function Empty({ title, text }) {
  return (
    <div className="empty">
      <SlidersHorizontal size={27} />
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  );
}
function Profile({ contact: c, jobs, agreements, payments, edit, addJob }) {
  return (
    <>
      <h2>{c.business || c.name}</h2>
      <p>
        {c.name} · {c.email}
        <br />
        {c.phone}
        <br />
        {c.website}
      </p>
      <div className="actions">
        <button onClick={edit}>Edit contact</button>
        <button className="primary" onClick={addJob}>
          Add job
        </button>
      </div>
      <h3>Notes</h3>
      <p className="terms">{c.notes || "No notes yet."}</p>
      <h3>Jobs & services</h3>
      {jobs.map((j) => (
        <div className="work-item" key={j.id}>
          <div>
            <strong>{j.title}</strong>
            <small>{j.services.map((s) => SERVICES[s]).join(", ")}</small>
          </div>
          <span className="pill">{effectiveJobStatus(j)}</span>
        </div>
      ))}
      <h3>Agreements</h3>
      {agreements.map((a) => (
        <p key={a.id}>
          {a.title} · {a.status} · {money(a.snapshot.total_cents)}
        </p>
      ))}
      <h3>Payments recorded</h3>
      {payments.map((p) => (
        <p key={p.id}>
          {p.paid_date} · {p.label} · {money(p.amount_cents)} · {p.reference}
        </p>
      ))}
      {!payments.length && <p className="muted">No payments recorded.</p>}
    </>
  );
}
function PaymentForm({ job, onSave }) {
  const [v, set] = useState({
    contact_id: job.contact_id,
    job_id: job.id,
    label: "Down payment",
    amount_cents: 0,
    paid_date: nyDate(),
    reference: "",
  });
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave(v);
      }}
    >
      <p>{job.title}. Record only a payment already received.</p>
      <Input
        label="Payment / phase"
        required
        value={v.label}
        onChange={(e) => set({ ...v, label: e.target.value })}
      />
      <Input
        label="Amount received ($)"
        required
        type="number"
        min="0.01"
        step="0.01"
        onChange={(e) =>
          set({ ...v, amount_cents: Math.round(Number(e.target.value) * 100) })
        }
      />
      <Input
        label="Date received"
        required
        type="date"
        value={v.paid_date}
        onChange={(e) => set({ ...v, paid_date: e.target.value })}
      />
      <Input
        label="Invoice / processor transaction reference"
        value={v.reference}
        onChange={(e) => set({ ...v, reference: e.target.value })}
      />
      <button className="primary">Record payment</button>
    </form>
  );
}
function TemplateForm({ initial, onSave }) {
  const [text, set] = useState(initial.body);
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave({ key: initial.key, body: text });
      }}
    >
      <p>
        {initial.label}. Master wording is combined with the job scope and
        selected service sections. Pricing, installments, client details, and
        recurring fee appear above the terms automatically.
      </p>
      <textarea
        aria-label="Reusable wording"
        rows={16}
        required
        value={text}
        onChange={(e) => set(e.target.value)}
      />
      <div className="actions">
        <button className="primary">Save template</button>
      </div>
    </form>
  );
}
function Signing() {
  const [record, setRecord] = useState(null),
    [error, setError] = useState(""),
    [name, setName] = useState(""),
    [consent, setConsent] = useState(false),
    [busy, setBusy] = useState(false),
    [done, setDone] = useState(false),
    [pdf, setPdf] = useState(null);
  const canvas = useRef(null),
    drawing = useRef(false),
    marked = useRef(false),
    token = useRef(location.hash.slice(1));
  useEffect(() => {
    document.title = "Review & sign | Colonna Media";
    history.replaceState(null, "", location.pathname);
    fetch("/api/sign", { headers: { "X-Signing-Token": token.current } })
      .then(async (r) => {
        const j = await r.json();
        if (!r.ok) throw Error(j.error);
        setRecord(j);
      })
      .catch((e) => setError(e.message));
  }, []);
  function point(e) {
    const r = canvas.current.getBoundingClientRect();
    return [
      ((e.clientX - r.left) * canvas.current.width) / r.width,
      ((e.clientY - r.top) * canvas.current.height) / r.height,
    ];
  }
  function start(e) {
    e.preventDefault();
    drawing.current = true;
    canvas.current.setPointerCapture(e.pointerId);
    const ctx = canvas.current.getContext("2d");
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#171c38";
    ctx.beginPath();
    ctx.moveTo(...point(e));
  }
  function move(e) {
    if (!drawing.current) return;
    e.preventDefault();
    const ctx = canvas.current.getContext("2d");
    ctx.lineTo(...point(e));
    ctx.stroke();
    marked.current = true;
  }
  async function submit(e) {
    e.preventDefault();
    if (!marked.current) {
      setError("Please draw your signature.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const r = await fetch("/api/sign", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Signing-Token": token.current,
        },
        body: JSON.stringify({
          name,
          consent,
          signature: canvas.current.toDataURL("image/png"),
        }),
      });
      if (!r.ok) throw Error((await r.json()).error);
      const blob = await r.blob();
      setPdf(blob);
      setDone(true);
      download(blob, "colonna-media-signed-agreement.pdf");
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="signing">
      <header>
        <Brand />
        <span className="muted">Private agreement</span>
      </header>
      <article>
        {done ? (
          <>
            <ShieldCheck size={42} />
            <h1>Thank you, {name}.</h1>
            <p>Your agreement has been signed and saved.</p>
            <button
              className="primary"
              onClick={() =>
                download(pdf, "colonna-media-signed-agreement.pdf")
              }
            >
              Download your signed agreement
            </button>
            <p>
              Keep this PDF for your records. Contact colonnamedia@gmail.com if
              you need another copy.
            </p>
          </>
        ) : record ? (
          <>
            <AgreementView snapshot={record.snapshot} />
            <form onSubmit={submit}>
              <h2>Your signature</h2>
              <Input
                label="Full legal name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
              />
              <Label title="Draw your signature with your finger or mouse">
                <canvas
                  ref={canvas}
                  width="900"
                  height="220"
                  onPointerDown={start}
                  onPointerMove={move}
                  onPointerUp={() => (drawing.current = false)}
                  onPointerCancel={() => (drawing.current = false)}
                />
              </Label>
              <button
                type="button"
                onClick={() => {
                  canvas.current.getContext("2d").clearRect(0, 0, 900, 220);
                  marked.current = false;
                }}
              >
                Clear signature
              </button>
              <label className="check">
                <input
                  type="checkbox"
                  required
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                />
                I have read and agree to this complete agreement, consent to
                electronic records and signatures, and intend my drawn signature
                to sign it.
              </label>
              <Banner>{error}</Banner>
              <button className="primary wide" disabled={busy}>
                {busy
                  ? "Saving your signed agreement…"
                  : "Sign agreement & download copy"}
              </button>
              <p className="muted">
                Signing does not charge your card. Your signature, acceptance
                time, IP address, and browser information will be retained with
                this agreement.
              </p>
            </form>
          </>
        ) : (
          <p role="status">{error || "Opening your agreement…"}</p>
        )}
      </article>
      <footer>Colonna Media LLC · colonnamedia@gmail.com</footer>
    </main>
  );
}
createRoot(document.getElementById("root")).render(
  location.pathname.startsWith("/sign") ? <Signing /> : <App />,
);
