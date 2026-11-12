import React, { useState } from "react";
import { attributionSource, TRACKING_KEYS } from "../lib/lead/attribution.js";
import { SERVICES, nyDate } from "../lib/crm/domain.js";
import {
  LEAD_STAGES,
  filterInquiries,
  funnel,
  groupedFunnel,
  inquiriesCSV,
} from "../lib/lead/report.js";
export function InquirySource({ inquiry }) {
  return (
    <div className="inquiry-source">
      <div className="tags">
        <span>{attributionSource(inquiry)}</span>
        <span>Campaign · {inquiry.utm_campaign || "Not recorded"}</span>
        {inquiry.archived_at && <span>Archived</span>}
      </div>
      <p>
        <strong>
          {inquiry.submission_page || inquiry.page || "Page not recorded"}
        </strong>{" "}
        · {inquiry.form_id || "Legacy form"}
      </p>
      <details>
        <summary>Attribution details</summary>
        <dl className="attribution-details">
          {[
            ["Landing page", inquiry.landing_page],
            ["Referrer", inquiry.referrer],
            ["Project type", inquiry.project_type],
            ...TRACKING_KEYS.map((key) => [key, inquiry[key]]),
          ].map(([key, value]) => (
            <div key={key}>
              <dt>{key}</dt>
              <dd>{value || "Not recorded"}</dd>
            </div>
          ))}
        </dl>
      </details>
    </div>
  );
}
export function InquiryStage({ inquiry, onChange, disabled }) {
  return (
    <label className="field">
      <span>Inquiry stage</span>
      <select
        aria-label={"Inquiry stage for " + inquiry.name}
        value={inquiry.stage || "new"}
        disabled={disabled}
        onChange={(e) => onChange(inquiry.id, e.target.value)}
      >
        {LEAD_STAGES.map(([id, label]) => (
          <option key={id} value={id}>
            {label}
          </option>
        ))}
      </select>
    </label>
  );
}
export default function AttributionReport({ inquiries, onStage, busy }) {
  const [filters, setFilters] = useState({
    from: nyDate(new Date(Date.now() - 29 * 86400000)),
    to: nyDate(),
    page: "",
    service: "",
    campaign: "",
    source: "",
    archive: "current",
  });
  const [group, setGroup] = useState("page");
  const update = (key, value) => setFilters({ ...filters, [key]: value });
  const rows = filterInquiries(inquiries, filters),
    counts = funnel(rows),
    groups = groupedFunnel(rows, group);
  const options = (key) =>
    [
      ...new Set(
        inquiries
          .map((i) =>
            key === "source"
              ? attributionSource(i)
              : key === "page"
                ? i.submission_page || i.page
                : i.utm_campaign,
          )
          .filter(Boolean),
      ),
    ].sort();
  function exportRows() {
    const url = URL.createObjectURL(
      new Blob(["\uFEFF" + inquiriesCSV(rows)], {
        type: "text/csv;charset=utf-8",
      }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "colonna-inquiry-attribution.csv";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  }
  return (
    <div className="attribution-report">
      <section className="panel">
        <div className="panel-head">
          <div>
            <h2>Lead attribution &amp; funnel</h2>
            <p className="muted">
              Submission cohorts by received date · Eastern time
            </p>
          </div>
          <button onClick={exportRows}>Export filtered CSV</button>
        </div>
        <div className="attribution-filters">
          <label className="field">
            <span>From</span>
            <input
              type="date"
              value={filters.from}
              onChange={(e) => update("from", e.target.value)}
            />
          </label>
          <label className="field">
            <span>Through</span>
            <input
              type="date"
              value={filters.to}
              onChange={(e) => update("to", e.target.value)}
            />
          </label>
          {[
            ["page", "Submitting page"],
            ["campaign", "Campaign"],
            ["source", "Source"],
          ].map(([key, label]) => (
            <label className="field" key={key}>
              <span>{label}</span>
              <select
                value={filters[key]}
                onChange={(e) => update(key, e.target.value)}
              >
                <option value="">All {label.toLowerCase()}s</option>
                {options(key).map((value) => (
                  <option key={value}>{value}</option>
                ))}
              </select>
            </label>
          ))}
          <label className="field">
            <span>Service</span>
            <select
              value={filters.service}
              onChange={(e) => update("service", e.target.value)}
            >
              <option value="">All services</option>
              {Object.entries(SERVICES).map(([id, label]) => (
                <option key={id} value={id}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Archive</span>
            <select
              value={filters.archive}
              onChange={(e) => update("archive", e.target.value)}
            >
              <option value="current">Current inquiries</option>
              <option value="archived">Archived inquiries</option>
              <option value="all">Current + archived</option>
            </select>
          </label>
        </div>
        {filters.from && filters.to && filters.from > filters.to && (
          <p role="alert" className="error">
            The start date must be on or before the end date.
          </p>
        )}
        <div className="lead-funnel">
          {counts.map((item, index) => (
            <article key={item.stage}>
              <span>{item.label}</span>
              <strong>{item.count}</strong>
              <div className="funnel-track">
                <i
                  style={{
                    width:
                      (counts[0].count
                        ? (100 * item.count) / counts[0].count
                        : 0) + "%",
                    background: index === 4 ? "#13a977" : "#1659dc",
                  }}
                />
              </div>
            </article>
          ))}
        </div>
        <p className="muted">
          Each submission is a separate inquiry. Later stages count inquiries
          that have reached that stage or beyond, including recorded stage
          history. Contact profile stages remain separate.
        </p>
        <p className="archive-note">
          Visit data is not connected. This report shows submission and
          sales-stage counts. Campaigns and stages missing from older records
          are not inferred.
        </p>
      </section>
      <section className="panel">
        <div className="panel-head">
          <h2>Where inquiries progress</h2>
          <label className="field">
            <span>Group by</span>
            <select value={group} onChange={(e) => setGroup(e.target.value)}>
              <option value="page">Submitting page</option>
              <option value="service">Service</option>
              <option value="campaign">Campaign</option>
            </select>
          </label>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>
                  {group === "page"
                    ? "Page"
                    : group === "service"
                      ? "Service"
                      : "Campaign"}
                </th>
                {counts.map((item) => (
                  <th key={item.stage}>{item.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {groups.map((g) => (
                <tr key={g.label}>
                  <td>{g.label}</td>
                  {g.counts.map((count, i) => (
                    <td key={i}>{count}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!groups.length && (
          <p className="muted">No inquiries match these filters.</p>
        )}
        {group === "service" && (
          <p className="muted">
            An inquiry with multiple services appears once in each selected
            service.
          </p>
        )}
      </section>
      <section className="panel">
        <div className="panel-head">
          <h2>Matching inquiries</h2>
          <span className="muted">{rows.length} submissions</span>
        </div>
        {rows.map((inquiry) => (
          <div className="inquiry" key={inquiry.id}>
            <div>
              <strong>{inquiry.name}</strong>
              <small>
                {inquiry.email} · {nyDate(new Date(inquiry.created_at))}
              </small>
              <InquirySource inquiry={inquiry} />
              <p className="terms">{inquiry.message}</p>
            </div>
            <InquiryStage
              inquiry={inquiry}
              onChange={onStage}
              disabled={busy}
            />
          </div>
        ))}
      </section>
    </div>
  );
}
