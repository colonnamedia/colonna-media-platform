import React, { useState, useEffect } from "react";
import { DEFAULT_LINKS } from "../lib/site/links-content.js";
import { linksSchema } from "../lib/site/links-schema.js";
import LinksPage from "../links-app/LinksPage.jsx";
export default function LinksEditor({ load, save }) {
  const [config, setConfig] = useState(null),
    [version, setVersion] = useState(0),
    [error, setError] = useState(""),
    [notice, setNotice] = useState(""),
    [busy, setBusy] = useState(false),
    [preview, setPreview] = useState(false);
  async function reload() {
    setError("");
    try {
      const data = await load();
      setConfig(data.config);
      setVersion(data.version);
    } catch (e) {
      setError(e.message);
    }
  }
  useEffect(() => {
    reload();
  }, []);
  if (!config)
    return (
      <section className="panel">
        <p>{error || "Loading your links page…"}</p>
        <button onClick={reload}>Reload</button>
      </section>
    );
  const set = (key, value) => {
    setConfig({ ...config, [key]: value });
    setNotice("");
  };
  const itemSet = (index, key, value) =>
    set(
      "items",
      config.items.map((item, i) =>
        i === index ? { ...item, [key]: value } : item,
      ),
    );
  function move(index, direction) {
    const items = [...config.items],
      target = index + direction;
    if (target < 0 || target >= items.length) return;
    [items[index], items[target]] = [items[target], items[index]];
    set("items", items);
  }
  async function submit(e) {
    e.preventDefault();
    setError("");
    setNotice("");
    const parsed = linksSchema.safeParse(config);
    if (!parsed.success) {
      setError(
        parsed.error.issues
          .map((issue) => issue.path.join(".") + " · " + issue.message)
          .join("\n"),
      );
      return;
    }
    setBusy(true);
    try {
      const data = await save({ config: parsed.data, version });
      setConfig(data.config);
      setVersion(data.version);
      setNotice(
        "Links page saved. The public page uses this order and content.",
      );
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  const field = (label, value, onChange, other = {}) => (
    <label className="field">
      <span>{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        {...other}
      />
    </label>
  );
  return (
    <>
      <section className="panel links-editor">
        <div className="panel-head">
          <div>
            <h2>Your social links page</h2>
            <p className="muted">
              Edit the content, thumbnails, and display order for /link-us.
            </p>
          </div>
          <button onClick={() => setPreview(!preview)}>
            {preview ? "Hide" : "Preview"} layout
          </button>
        </div>
        <form onSubmit={submit}>
          <fieldset disabled={busy}>
            <div className="form-grid">
              {field(
                "Page headline",
                config.title,
                (value) => set("title", value),
                { maxLength: 100, required: true },
              )}
              {field(
                "Introduction",
                config.intro,
                (value) => set("intro", value),
                { maxLength: 400 },
              )}
              {field(
                "Contact button label",
                config.contact_label,
                (value) => set("contact_label", value),
                { required: true },
              )}
              {field(
                "Contact destination",
                config.contact_url,
                (value) => set("contact_url", value),
                { required: true },
              )}
            </div>
            <h3>Service &amp; featured cards</h3>
            <p className="muted">
              Use site paths or HTTPS links. YouTube IDs add a video play
              treatment and open the video on YouTube.
            </p>
            {config.items.map((item, index) => (
              <section className="links-edit-card" key={item.id}>
                <div className="panel-head">
                  <h4>
                    {index + 1}. {item.title}
                  </h4>
                  <div className="actions">
                    <button
                      type="button"
                      aria-label={"Move " + item.title + " up"}
                      disabled={index === 0}
                      onClick={() => move(index, -1)}
                    >
                      ↑ Up
                    </button>
                    <button
                      type="button"
                      aria-label={"Move " + item.title + " down"}
                      disabled={index === config.items.length - 1}
                      onClick={() => move(index, 1)}
                    >
                      ↓ Down
                    </button>
                  </div>
                </div>
                <div className="form-grid">
                  {[
                    ["Title", "title"],
                    ["Description", "description"],
                    ["Button label", "label"],
                    ["Destination URL", "url"],
                    ["Thumbnail URL", "thumbnail"],
                    ["Image description", "alt"],
                    ["YouTube video ID (optional)", "youtube_id"],
                  ].map(([label, key]) => (
                    <React.Fragment key={key}>
                      {field(
                        label,
                        item[key],
                        (value) => itemSet(index, key, value),
                        {
                          required:
                            key !== "youtube_id" && key !== "description",
                        },
                      )}
                    </React.Fragment>
                  ))}
                </div>
                <div className="actions">
                  <label className="check">
                    <input
                      type="checkbox"
                      checked={item.enabled}
                      onChange={(e) =>
                        itemSet(index, "enabled", e.target.checked)
                      }
                    />
                    Visible
                  </label>
                  <label className="check">
                    <input
                      type="checkbox"
                      checked={item.featured}
                      onChange={(e) =>
                        itemSet(index, "featured", e.target.checked)
                      }
                    />
                    Featured
                  </label>
                  <button
                    type="button"
                    className="text-button"
                    onClick={() =>
                      set(
                        "items",
                        config.items.filter((_, i) => i !== index),
                      )
                    }
                  >
                    Remove card
                  </button>
                </div>
              </section>
            ))}
            <button
              type="button"
              disabled={config.items.length >= 24}
              onClick={() =>
                set("items", [
                  ...config.items,
                  {
                    ...DEFAULT_LINKS.items[0],
                    id: crypto.randomUUID(),
                    title: "New featured item",
                    featured: false,
                  },
                ])
              }
            >
              + Add card or video
            </button>
            <h3>Social profiles</h3>
            {config.socials.map((social, index) => (
              <div className="social-edit-row" key={index}>
                {field("Profile label", social.label, (value) =>
                  set(
                    "socials",
                    config.socials.map((s, i) =>
                      i === index ? { ...s, label: value } : s,
                    ),
                  ),
                )}
                {field("Profile URL", social.url, (value) =>
                  set(
                    "socials",
                    config.socials.map((s, i) =>
                      i === index ? { ...s, url: value } : s,
                    ),
                  ),
                )}
                <button
                  type="button"
                  aria-label={"Remove " + social.label}
                  onClick={() =>
                    set(
                      "socials",
                      config.socials.filter((_, i) => i !== index),
                    )
                  }
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              disabled={config.socials.length >= 8}
              onClick={() =>
                set("socials", [
                  ...config.socials,
                  {
                    label: "Profile",
                    url: "https://www.instagram.com/colonna_media/",
                  },
                ])
              }
            >
              + Add social profile
            </button>
            {error && (
              <p className="error" role="alert">
                {error}
              </p>
            )}
            {notice && (
              <p className="notice" role="status">
                {notice}
              </p>
            )}
            <div className="actions links-save">
              <button className="primary" type="submit">
                {busy ? "Saving…" : "Save links page"}
              </button>
              <button type="button" onClick={reload}>
                Reload saved content
              </button>
            </div>
          </fieldset>
        </form>
      </section>
      {preview && (
        <section
          className="links-inline-preview"
          aria-label="Social links layout preview"
        >
          <LinksPage config={config} preview />
        </section>
      )}
    </>
  );
}
