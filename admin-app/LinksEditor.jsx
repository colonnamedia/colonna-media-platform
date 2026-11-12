import React, { useState, useEffect } from "react";
import {
  DEFAULT_LINKS,
  platformInfo,
  embedURL,
} from "../lib/site/links-content.js";
import { linksSchema } from "../lib/site/links-schema.js";
import LinksPage, { PreviewImageContext } from "../links-app/LinksPage.jsx";

function ImagePicker({ label, value, onChange, onUpload, disabled }) {
  const images = React.useContext(PreviewImageContext);
  return (
    <section className="social-image-picker" aria-label={label}>
      <div className="social-image-preview">
        {value ? (
          <img
            key={value}
            src={images[value] || value}
            alt={label + " selected image"}
            referrerPolicy="no-referrer"
          />
        ) : (
          <span>No image selected</span>
        )}
      </div>
      <div className="social-image-controls">
        <strong>{label}</strong>
        <p className="muted">
          Choose your own image. A blank image stays blank.
        </p>
        <div className="actions">
          <label
            className={
              "social-upload-button" + (disabled ? " is-disabled" : "")
            }
          >
            <span>{value ? "Replace photo" : "Upload photo"}</span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              disabled={disabled}
              onChange={(e) => {
                onUpload(e.target.files[0]);
                e.target.value = "";
              }}
              aria-label={"Upload " + label}
            />
          </label>
          {value && (
            <button
              type="button"
              onClick={() => onChange("")}
              aria-label={"Remove " + label}
            >
              Remove image
            </button>
          )}
        </div>
        <label className="field">
          <span>{label} URL (optional)</span>
          <input
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Upload above, or paste an image URL"
          />
        </label>
      </div>
    </section>
  );
}

async function imagePayload(file) {
  if (
    !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
    file.size > 12 * 1024 * 1024
  )
    throw new Error("Choose a JPEG, PNG, or WebP image under 12 MB.");
  const src = URL.createObjectURL(file);
  try {
    const image = await new Promise((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = () => reject(new Error("This image could not be opened."));
      i.src = src;
    });
    const scale = Math.min(1, 1600 / Math.max(image.width, image.height)),
      canvas = document.createElement("canvas");
    canvas.width = Math.round(image.width * scale);
    canvas.height = Math.round(image.height * scale);
    const context = canvas.getContext("2d");
    context.fillStyle = "#fff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    // Flatten and re-encode public display images; no original EXIF is uploaded.
    const data = canvas.toDataURL("image/webp", 0.86).split(",")[1];
    if (data.length > 2800000)
      throw new Error("Please choose a smaller image.");
    return { mime: "image/webp", data };
  } finally {
    URL.revokeObjectURL(src);
  }
}
export default function LinksEditor({ load, save, fetchPreview, uploadImage }) {
  const [previewCandidates, setPreviewCandidates] = useState({});
  const [config, setConfig] = useState(null),
    [version, setVersion] = useState(0),
    [error, setError] = useState(""),
    [notice, setNotice] = useState(""),
    [busy, setBusy] = useState(false),
    [preview, setPreview] = useState(true),
    [dirty, setDirty] = useState(false),
    [pending, setPending] = useState(""),
    [socialType, setSocialType] = useState("Threads");
  async function reload() {
    setError("");
    try {
      const data = await load();
      setConfig(linksSchema.parse(data.config));
      setVersion(data.version);
      setDirty(false);
    } catch (e) {
      setError(e.message);
    }
  }
  useEffect(() => {
    reload();
  }, []);
  useEffect(() => {
    if (!dirty) return;
    const warn = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);
  function update(fn) {
    setConfig((current) => (typeof fn === "function" ? fn(current) : fn));
    setDirty(true);
    setNotice("");
  }
  const set = (key, value) => update((c) => ({ ...c, [key]: value }));
  function itemPatch(id, patch) {
    update((c) => ({
      ...c,
      items: c.items.map((item) =>
        item.id === id ? { ...item, ...patch } : item,
      ),
    }));
  }
  function move(index, delta) {
    update((c) => {
      const items = [...c.items],
        to = index + delta;
      if (to < 0 || to >= items.length) return c;
      [items[index], items[to]] = [items[to], items[index]];
      return { ...c, items };
    });
  }
  async function submit(e) {
    e.preventDefault();
    setError("");
    setNotice("");
    const parsed = linksSchema.safeParse(config);
    if (!parsed.success) {
      setError(
        parsed.error.issues
          .map((i) => i.path.join(".") + " · " + i.message)
          .join("\n"),
      );
      return;
    }
    setBusy(true);
    try {
      const data = await save({ config: parsed.data, version });
      setConfig(linksSchema.parse(data.config));
      setVersion(data.version);
      setDirty(false);
      setNotice(
        "Link Us page saved. Your page now uses this content and order.",
      );
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  async function populate(item) {
    if (!fetchPreview) return;
    setPending(item.id);
    setError("");
    try {
      const result = await fetchPreview(item.url);
      setConfig((c) => ({
        ...c,
        items: c.items.map((i) =>
          i.id === item.id && i.url === item.url
            ? {
                ...i,
                title: result.title || i.title,
                description: result.description || i.description,
                youtube_id: "",
              }
            : i,
        ),
      }));
      setPreviewCandidates((c) => ({
        ...c,
        [item.id]: { ...result, destination: item.url },
      }));
      setDirty(true);
      setNotice(
        result.thumbnail
          ? "Link preview fetched. Your image was kept. Choose ‘Use fetched image’ only if you want to replace it."
          : result.notice,
      );
    } catch (e) {
      setError(e.message);
    } finally {
      setPending("");
    }
  }
  async function upload(file, key, id) {
    if (!file || !uploadImage) return;
    setPending(id || key);
    setError("");
    try {
      const result = await uploadImage(await imagePayload(file));
      if (id) itemPatch(id, { [key]: result.url });
      else set(key, result.url);
      setNotice("Image uploaded. Save the page to use it publicly.");
    } catch (e) {
      setError(e.message);
    } finally {
      setPending("");
    }
  }
  const field = (label, value, onChange, props = {}) => (
    <label className="field">
      <span>{label}</span>
      <input
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        {...props}
      />
    </label>
  );
  const select = (label, value, onChange, options) => (
    <label className="field">
      <span>{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map(([id, name]) => (
          <option key={id} value={id}>
            {name}
          </option>
        ))}
      </select>
    </label>
  );
  if (!config)
    return (
      <section className="panel">
        <p>{error || "Loading Link Us…"}</p>
        <button onClick={reload}>Reload</button>
      </section>
    );
  return (
    <div className={"link-us-workspace" + (preview ? " with-preview" : "")}>
      <section className="panel links-editor">
        <div className="panel-head">
          <div>
            <span className="links-admin-kicker">Your mini website</span>
            <h2>Social links</h2>
            <p className="muted">
              Build /link-us with your brand, featured content, and social
              profiles.
            </p>
            <a href="/link-us" target="_blank" rel="noopener noreferrer">
              Open public page ↗
            </a>
          </div>
          <button type="button" onClick={() => setPreview(!preview)}>
            {preview ? "Hide" : "Show"} preview
          </button>
        </div>
        <form onSubmit={submit}>
          <fieldset disabled={busy || !!pending}>
            <details className="link-editor-section" open>
              <summary>Brand &amp; hero</summary>
              <div className="form-grid">
                {field(
                  "Brand name",
                  config.brand_name,
                  (v) => set("brand_name", v),
                  { maxLength: 80, required: true },
                )}
                {field(
                  "Short eyebrow / location",
                  config.kicker,
                  (v) => set("kicker", v),
                  { maxLength: 120 },
                )}
                {field("Page headline", config.title, (v) => set("title", v), {
                  maxLength: 100,
                  required: true,
                })}
                {field(
                  "Short description",
                  config.intro,
                  (v) => set("intro", v),
                  { maxLength: 400 },
                )}
                {select("Page colors", config.theme, (v) => set("theme", v), [
                  ["light", "Light · white & blue"],
                  ["blue", "Colonna blue"],
                  ["dark", "Midnight"],
                ])}
                {field(
                  "Hero image description",
                  config.hero_alt,
                  (v) => set("hero_alt", v),
                  { maxLength: 200 },
                )}
                {field(
                  "Contact button label",
                  config.contact_label,
                  (v) => set("contact_label", v),
                  { maxLength: 80, required: true },
                )}
                {field(
                  "Contact destination",
                  config.contact_url,
                  (v) => set("contact_url", v),
                  { required: true },
                )}
              </div>
              <ImagePicker
                label="Logo"
                value={config.logo}
                onChange={(v) => set("logo", v)}
                onUpload={(file) => upload(file, "logo")}
                disabled={!uploadImage || !!pending}
              />
              <ImagePicker
                label="Page hero image"
                value={config.hero_image}
                onChange={(v) => set("hero_image", v)}
                onUpload={(file) => upload(file, "hero_image")}
                disabled={!uploadImage || !!pending}
              />
              <p className="muted">
                Clear an image URL to hide it. Uploads are optimized for the web
                and become public display images.
              </p>
            </details>
            <div className="link-section-head">
              <h3>Links &amp; featured content</h3>
              <span>{config.items.length}/24 blocks</span>
            </div>
            <p className="muted">
              Upload your own photos for thumbnails and featured boxes. Fetching
              a link preview keeps your image unchanged; you decide whether to
              use the fetched image. Check “Pin as featured” for a large
              promotion at the top.
            </p>
            {config.items.map((item, index) => (
              <details
                className="links-edit-card"
                key={item.id}
                open={config.items.length < 3 ? true : undefined}
              >
                <summary>
                  <span>
                    {index + 1}. {item.title}
                  </span>
                  <span className="link-block-status">
                    {item.featured
                      ? "Pinned · large featured box"
                      : item.layout === "link"
                        ? "Compact link"
                        : item.layout === "hero"
                          ? "Hero box"
                          : "Image card"}{" "}
                    · {item.enabled ? "Visible" : "Hidden"}
                  </span>
                </summary>
                <div className="actions link-order">
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
                <div className="link-fetch-row">
                  {field("Destination URL", item.url, (v) =>
                    itemPatch(item.id, { url: v, youtube_id: "" }),
                  )}
                  <button
                    type="button"
                    disabled={!fetchPreview || !item.url || !!pending}
                    onClick={() => populate(item)}
                  >
                    {pending === item.id ? "Working…" : "Fetch preview"}
                  </button>
                </div>
                {item.youtube_id && (
                  <p className="muted">
                    Legacy YouTube video ID: {item.youtube_id}. Change the
                    destination URL to replace it.
                  </p>
                )}
                <ImagePicker
                  label={item.featured ? "Featured image" : "Thumbnail"}
                  value={item.thumbnail}
                  onChange={(v) => itemPatch(item.id, { thumbnail: v })}
                  onUpload={(file) => upload(file, "thumbnail", item.id)}
                  disabled={!uploadImage || !!pending}
                />
                {previewCandidates[item.id]?.destination === item.url &&
                  previewCandidates[item.id]?.thumbnail && (
                    <div className="social-preview-choice">
                      <img
                        src={previewCandidates[item.id].thumbnail}
                        alt="Fetched link preview candidate"
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <p>
                          Optional image from this link. It will only replace
                          your photo if you choose it.
                        </p>
                        <button
                          type="button"
                          onClick={() =>
                            itemPatch(item.id, {
                              thumbnail: previewCandidates[item.id].thumbnail,
                              alt: previewCandidates[item.id].title || item.alt,
                            })
                          }
                        >
                          Use fetched image
                        </button>
                      </div>
                    </div>
                  )}
                <div className="form-grid">
                  {select(
                    "Regular card style (when not featured)",
                    item.layout === "card" ? "card" : "link",
                    (v) => itemPatch(item.id, { layout: v }),
                    [
                      ["link", "Compact link"],
                      ["card", "Image card"],
                    ],
                  )}
                  {field(
                    "Title",
                    item.title,
                    (v) => itemPatch(item.id, { title: v }),
                    { maxLength: 100, required: true },
                  )}
                  {field(
                    "Description",
                    item.description,
                    (v) => itemPatch(item.id, { description: v }),
                    { maxLength: 300 },
                  )}
                  {field(
                    "Button label",
                    item.label,
                    (v) => itemPatch(item.id, { label: v }),
                    { maxLength: 80, required: true },
                  )}
                  {field(
                    "Image description",
                    item.alt,
                    (v) => itemPatch(item.id, { alt: v }),
                    { maxLength: 200 },
                  )}
                  {select(
                    "Image shape",
                    item.aspect,
                    (v) => itemPatch(item.id, { aspect: v }),
                    [
                      ["landscape", "Landscape"],
                      ["square", "Square"],
                      ["portrait", "Portrait"],
                    ],
                  )}
                  {select(
                    "Image crop",
                    item.image_fit,
                    (v) => itemPatch(item.id, { image_fit: v }),
                    [
                      ["cover", "Fill the box"],
                      ["contain", "Show entire image"],
                    ],
                  )}
                  {select(
                    "Image focal point",
                    item.image_position,
                    (v) => itemPatch(item.id, { image_position: v }),
                    [
                      ["top", "Top"],
                      ["center", "Center"],
                      ["bottom", "Bottom"],
                    ],
                  )}
                  {select(
                    "Video behavior",
                    item.playback,
                    (v) => itemPatch(item.id, { playback: v }),
                    [
                      ["link", "Open original post"],
                      ["embed", "Click to play here · YouTube / TikTok"],
                    ],
                  )}
                </div>
                {item.playback === "embed" && !embedURL(item) && (
                  <p className="muted">
                    This {platformInfo(item.url).name} link opens the original
                    post. In-page playback is available for direct YouTube and
                    TikTok video URLs.
                  </p>
                )}
                <div className="actions">
                  <label className="check">
                    <input
                      type="checkbox"
                      checked={item.enabled}
                      onChange={(e) =>
                        itemPatch(item.id, { enabled: e.target.checked })
                      }
                    />{" "}
                    Visible
                  </label>
                  <label className="check">
                    <input
                      type="checkbox"
                      checked={item.featured}
                      onChange={(e) =>
                        itemPatch(item.id, { featured: e.target.checked })
                      }
                    />{" "}
                    Pin as featured · large box at top
                  </label>
                  <button
                    type="button"
                    className="text-button"
                    onClick={() =>
                      set(
                        "items",
                        config.items.filter((i) => i.id !== item.id),
                      )
                    }
                  >
                    Remove block
                  </button>
                </div>
              </details>
            ))}
            <div className="actions link-add-blocks">
              {[
                ["link", "Compact link"],
                ["card", "Image card"],
                ["hero", "Hero box"],
              ].map(([layout, label]) => (
                <button
                  type="button"
                  key={layout}
                  disabled={config.items.length >= 24}
                  onClick={() =>
                    set("items", [
                      ...config.items,
                      {
                        id: crypto.randomUUID(),
                        title: "New " + label.toLowerCase(),
                        description: "",
                        label: "Learn more",
                        url: "",
                        thumbnail: "",
                        alt: "",
                        enabled: false,
                        featured: layout === "hero",
                        layout: layout === "hero" ? "link" : layout,
                        image_fit: "cover",
                        image_position: "center",
                        aspect: "landscape",
                        playback: "link",
                        youtube_id: "",
                      },
                    ])
                  }
                >
                  + {label}
                </button>
              ))}
            </div>
            <details className="link-editor-section" open>
              <summary>Social profiles</summary>
              <p className="muted">
                Add only the profiles you use. Threads can stay hidden until you
                have an account.
              </p>
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
                  <label className="check">
                    <input
                      type="checkbox"
                      checked={social.enabled}
                      onChange={(e) =>
                        set(
                          "socials",
                          config.socials.map((s, i) =>
                            i === index
                              ? { ...s, enabled: e.target.checked }
                              : s,
                          ),
                        )
                      }
                    />{" "}
                    Visible
                  </label>
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
              <div className="actions">
                {select(
                  "Add a platform",
                  socialType,
                  setSocialType,
                  [
                    "Instagram",
                    "TikTok",
                    "YouTube",
                    "Threads",
                    "Facebook",
                    "LinkedIn",
                    "Other",
                  ].map((s) => [s, s]),
                )}
                <button
                  type="button"
                  disabled={config.socials.length >= 8}
                  onClick={() =>
                    set("socials", [
                      ...config.socials,
                      { label: socialType, url: "", enabled: false },
                    ])
                  }
                >
                  + Add profile
                </button>
              </div>
            </details>
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
                {busy ? "Saving…" : "Save Link Us page"}
              </button>
              <button
                type="button"
                onClick={() => {
                  if (
                    !dirty ||
                    window.confirm("Discard unsaved Link Us edits and reload?")
                  )
                    reload();
                }}
              >
                Reload saved content
              </button>
              <span className="muted" role="status">
                {pending
                  ? "Working…"
                  : dirty
                    ? "Unsaved changes"
                    : "Saved content"}
              </span>
            </div>
          </fieldset>
        </form>
      </section>
      {preview && (
        <aside
          className="link-us-preview"
          aria-label="Live mobile layout preview"
        >
          <div className="link-preview-heading">
            Live page preview <span>Unsaved changes appear here</span>
          </div>
          <div className="link-preview-phone">
            <LinksPage config={config} preview />
          </div>
        </aside>
      )}
    </div>
  );
}
