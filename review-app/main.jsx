import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import AttributionReport from "../admin-app/Attribution.jsx";
import LinksEditor from "../admin-app/LinksEditor.jsx";
import LinksPage, { PreviewImageContext } from "../links-app/LinksPage.jsx";
import { DEFAULT_LINKS } from "../lib/site/links-content.js";
import { linksSchema } from "../lib/site/links-schema.js";
import "../admin-app/style.css";
import "./style.css";
const now = new Date().toISOString();
const seed = [
  {
    id: "00000000-0000-4000-a000-000000000001",
    name: "Sample · Website inquiry",
    email: "website@example.test",
    created_at: now,
    services: "Website Design",
    service_ids: ["website"],
    stage: "won",
    utm_source: "google",
    utm_medium: "cpc",
    utm_campaign: "local-web-design",
    submission_page: "/web-design-ads",
    landing_page: "/web-design-ads",
    form_id: "web-design-inquiry",
    message: "Example only · We need a website refresh.",
    gclid: "sample-click-id",
    attribution_version: 1,
  },
  {
    id: "00000000-0000-4000-a000-000000000002",
    name: "Sample · Photography inquiry",
    email: "portrait@example.test",
    created_at: now,
    services: "Photography",
    service_ids: ["photography"],
    stage: "qualified",
    utm_source: "instagram",
    utm_medium: "paid_social",
    utm_campaign: "brand-photography",
    submission_page: "/photography",
    landing_page: "/photography",
    form_id: "photography-inquiry",
    message:
      "Example only · Headshots and branding photos for our small business.",
    attribution_version: 1,
  },
  {
    id: "00000000-0000-4000-a000-000000000003",
    name: "Sample · Contact referral",
    email: "social@example.test",
    created_at: now,
    services: "Social Media Management",
    service_ids: ["social-media"],
    stage: "contacted",
    utm_source: "facebook",
    utm_medium: "paid_social",
    utm_campaign: "social-support",
    submission_page: "/contact",
    landing_page: "/google-meta-ads-pittsburgh",
    form_id: "contact-inquiry",
    message: "Example only · I followed the service page to the contact form.",
    attribution_version: 1,
  },
  {
    id: "00000000-0000-4000-a000-000000000004",
    name: "Sample · Older inquiry",
    email: "older@example.test",
    created_at: now,
    services: "Google Ads Setup",
    service_ids: ["google-ads"],
    stage: "new",
    submission_page: "/google-ads-management",
    form_id: "google-ads-inquiry",
    message: "Example only · Attribution was not recorded.",
    attribution_version: 0,
    archived_at: now,
  },
];
function read(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) || fallback;
  } catch {
    return fallback;
  }
}
function Review() {
  const [previewImages, setPreviewImages] = useState(
    () => window.__previewImages || {},
  );
  const [tab, setTab] = useState("Links page"),
    [content, setContent] = useState(() =>
      read("cm-links-review-owner-images-v2", {
        config: DEFAULT_LINKS,
        version: 0,
      }),
    ),
    [inquiries, setInquiries] = useState(() =>
      read("cm-inquiries-review", seed),
    );
  const save = async (value) => {
    const config = linksSchema.parse(value.config);
    const saved = { config, version: content.version + 1 };
    setContent(saved);
    try {
      localStorage.setItem(
        "cm-links-review-owner-images-v2",
        JSON.stringify(saved),
      );
    } catch {}
    return saved;
  };
  const stage = (id, value) => {
    const next = inquiries.map((i) =>
      i.id === id
        ? {
            ...i,
            stage: value,
            stage_history: [
              ...(i.stage_history || []),
              { stage: value, at: new Date().toISOString() },
            ],
          }
        : i,
    );
    setInquiries(next);
    try {
      localStorage.setItem("cm-inquiries-review", JSON.stringify(next));
    } catch {}
  };
  return (
    <PreviewImageContext.Provider value={previewImages}>
      <div className="review-app">
        <header className="review-toolbar">
          <div>
            <strong>Colonna Media · Review preview</strong>
            <p>
              Sample data and browser-only edits · Link Us expansion is
              unpublished · email delivery disabled
            </p>
          </div>
          <nav aria-label="Review sections">
            {["Links page", "Social links editor", "Lead reporting", "Coverage"].map(
              (name) => (
                <button
                  key={name}
                  className={name === tab ? "primary" : ""}
                  onClick={() => setTab(name)}
                >
                  {name}
                </button>
              ),
            )}
          </nav>
        </header>
        {tab === "Links page" && <LinksPage config={content.config} preview />}
        {tab === "Social links editor" && (
          <main className="review-dashboard">
            <h1>Social links content studio</h1>
            <p className="muted">
              These are the controls integrated into the protected dashboard.
              Changes here affect sample content in this preview.
            </p>
            <LinksEditor
              load={async () => content}
              save={save}
              fetchPreview={async () => ({
                title: "Example preview title",
                thumbnail: "/assets/img/marketing-photography-cafe.webp",
                notice:
                  "Offline example only. The protected admin fetches the actual URL’s available preview.",
              })}
              uploadImage={async ({ mime, data }) => {
                const url = "/review-upload/" + crypto.randomUUID();
                setPreviewImages((images) => ({
                  ...images,
                  [url]: `data:${mime};base64,${data}`,
                }));
                return { url };
              }}
            />
          </main>
        )}
        {tab === "Lead reporting" && (
          <main className="review-dashboard">
            <AttributionReport inquiries={inquiries} onStage={stage} />
          </main>
        )}
        {tab === "Coverage" && (
          <main className="review-dashboard">
            <section className="panel">
              <h1>Pages &amp; inquiry forms covered</h1>
              <table>
                <thead>
                  <tr>
                    <th>Page</th>
                    <th>Form</th>
                    <th>Role</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    [
                      "/contact",
                      "contact-inquiry",
                      "Main inquiry form · multiple services",
                    ],
                    [
                      "/start",
                      "start-inquiry",
                      "Landing page inquiry form · multiple services",
                    ],
                    [
                      "/web-design-ads",
                      "web-design-inquiry",
                      "Website advertising landing page",
                    ],
                    [
                      "/google-ads-management",
                      "google-ads-inquiry",
                      "Google Ads advertising landing page",
                    ],
                    [
                      "/photography",
                      "photography-inquiry",
                      "Portfolio/service page with direct inquiry form",
                    ],
                    [
                      "/photography-ads",
                      "Redirect only",
                      "Permanent redirect to /photography",
                    ],
                    [
                      "/google-meta-ads-pittsburgh",
                      "Links to /contact",
                      "Service guide · selected service travels in the link",
                    ],
                    [
                      "/social-media-management-pittsburgh",
                      "Links to /contact",
                      "Service guide · social-media selection",
                    ],
                    [
                      "Other public service pages",
                      "Links to /contact or /start",
                      "Attribution retained during navigation",
                    ],
                    [
                      "/link-us",
                      "No inquiry form",
                      "Editable service and social link cards",
                    ],
                  ].map((row) => (
                    <tr key={row[0]}>
                      {row.map((value, i) => (
                        <td key={i}>{value}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="muted">
                The legacy React contact component is instrumented for
                compatibility, but the live Vercel /contact route uses the main
                HTML form.
              </p>
              <p className="notice">
                No visit-to-lead rates. Visit data is not connected. Production
                migration and deployment await your review.
              </p>
            </section>
          </main>
        )}
      </div>
    </PreviewImageContext.Provider>
  );
}
createRoot(document.getElementById("root")).render(<Review />);
