import React, { useState } from "react";
import brandLogo from "../assets/img/colonna-logo-full.png";
import heroImage from "../assets/img/marketing-team-hero.webp";
import {
  DEFAULT_LINKS,
  safePublicURL,
  videoURL,
  platformInfo,
  embedURL,
} from "../lib/site/links-content.js";
import "./style.css";
export const PreviewImageContext = React.createContext({});
function destination(url) {
  return url.startsWith("/")
    ? {}
    : { target: "_blank", rel: "noopener noreferrer" };
}
function Picture({ src, alt = "", ...props }) {
  const [failed, setFailed] = useState(false);
  const previewImages = React.useContext(PreviewImageContext);
  src = previewImages[src] || src;
  if (
    !src ||
    (!safePublicURL(src) &&
      !/^data:image\/(png|webp|jpeg);base64,/.test(src)) ||
    failed
  )
    return (
      <span className="links-image-fallback" aria-hidden="true">
        CM<span>Creative &amp; marketing</span>
      </span>
    );
  return (
    <img
      src={src}
      alt={alt}
      onError={() => setFailed(true)}
      referrerPolicy="no-referrer"
      {...props}
    />
  );
}
function LinkCard({ item }) {
  const [playing, setPlaying] = useState(false);
  const url = videoURL(item),
    platform = platformInfo(url),
    embed = embedURL(item);
  const layout = item.featured
    ? "hero"
    : item.layout === "card"
      ? "card"
      : "link";
  const CompactTag = item.playback === "embed" && embed ? "button" : "a";
  const compactProps =
    CompactTag === "button"
      ? { type: "button", onClick: () => setPlaying(true) }
      : { href: url, ...destination(url) };
  const thumbnail = item.thumbnail || "";
  const image = (
    <>
      <Picture
        key={thumbnail}
        src={thumbnail}
        alt={item.alt}
        width="720"
        height="450"
        loading="lazy"
        decoding="async"
        style={{
          objectFit: item.image_fit || "cover",
          objectPosition: item.image_position || "center",
        }}
      />
      {platform.video && (
        <span className="links-play" aria-hidden="true">
          ▶
        </span>
      )}
    </>
  );
  return (
    <article
      className={`links-card links-layout-${layout} links-aspect-${item.aspect || "landscape"}${item.featured ? " links-featured" : ""}${playing ? " is-playing" : ""}`}
    >
      {((layout !== "link" && thumbnail) || playing) &&
        (playing && embed ? (
          <div className="links-player">
            <iframe
              src={embed}
              title={item.title + " video player"}
              allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
            />
            <button type="button" onClick={() => setPlaying(false)}>
              Close player
            </button>
          </div>
        ) : item.playback === "embed" && embed ? (
          <button
            type="button"
            className="links-card-image"
            aria-label={"Play " + item.title}
            onClick={() => setPlaying(true)}
          >
            {image}
          </button>
        ) : (
          <a
            className="links-card-image"
            href={url}
            {...destination(url)}
            aria-label={item.title}
          >
            {image}
          </a>
        ))}
      {layout === "link" && thumbnail && (
        <CompactTag
          className="links-compact-image"
          {...compactProps}
          aria-label={item.title}
        >
          <Picture
            key={thumbnail}
            src={thumbnail}
            alt={item.alt}
            width="88"
            height="88"
            loading="lazy"
            style={{
              objectFit: item.image_fit || "cover",
              objectPosition: item.image_position || "center",
            }}
          />
          {platform.video && (
            <span className="links-compact-play" aria-hidden="true">
              ▶
            </span>
          )}
        </CompactTag>
      )}
      <div className="links-card-body">
        <div className="links-card-meta">
          {item.featured && (
            <span className="links-feature-label">Featured</span>
          )}
          {!url.startsWith("/") && (
            <span className="links-platform">{platform.name}</span>
          )}
        </div>
        <h2>{item.title}</h2>
        {item.description && <p>{item.description}</p>}
        <a href={url} {...destination(url)}>
          {item.label}
          <span aria-hidden="true"> ↗</span>
        </a>
      </div>
    </article>
  );
}
export default function LinksPage({ config = DEFAULT_LINKS, preview = false }) {
  const visible = config.items.filter(
    (item) => item.enabled && safePublicURL(videoURL(item)),
  );
  const items = [
    ...visible.filter((item) => item.featured),
    ...visible.filter((item) => !item.featured),
  ];
  const logo =
    config.logo === "/assets/img/colonna-logo-full.png"
      ? brandLogo
      : config.logo;
  const cover =
    config.hero_image === "/assets/img/marketing-team-hero.webp"
      ? heroImage
      : config.hero_image;
  return (
    <main className={`links-page links-theme-${config.theme || "light"}`}>
      {preview && (
        <div className="links-preview-label">
          Design preview · sample content
        </div>
      )}
      <div className="links-shell">
        <header className="links-intro">
          {config.hero_image && safePublicURL(config.hero_image) && (
            <div className="links-cover">
              <Picture
                key={cover}
                src={cover}
                alt={config.hero_alt}
                width="1000"
                height="420"
                fetchpriority="high"
              />
            </div>
          )}
          <div className="links-profile">
            {logo && (
              <a
                href="/"
                aria-label={(config.brand_name || "Colonna Media") + " home"}
              >
                <Picture
                  key={logo}
                  src={logo}
                  className="links-logo"
                  alt={config.brand_name || "Colonna Media"}
                  width="300"
                  height="144"
                />
              </a>
            )}
            <span className="links-kicker">{config.kicker}</span>
            <h1>{config.title}</h1>
            <p>{config.intro}</p>
            {safePublicURL(config.contact_url) && (
              <a
                className="links-contact"
                href={config.contact_url}
                {...destination(config.contact_url)}
              >
                {config.contact_label} <span aria-hidden="true">→</span>
              </a>
            )}
            <nav className="links-profile-socials" aria-label="Social profiles">
              {config.socials
                .filter((s) => s.enabled !== false && safePublicURL(s.url))
                .map((s, index) => (
                  <a
                    key={index}
                    href={s.url}
                    {...destination(s.url)}
                    aria-label={
                      (config.brand_name || "Colonna Media") + " on " + s.label
                    }
                  >
                    {s.label}
                    <span aria-hidden="true"> ↗</span>
                  </a>
                ))}
            </nav>
          </div>
        </header>
        <section
          className="links-cards"
          aria-label="Explore links and featured projects"
        >
          {items.map((item) => (
            <LinkCard key={item.id + videoURL(item)} item={item} />
          ))}
        </section>
        <footer className="links-footer">
          <a href="/contact">Contact Anthony</a>
          <p>
            © {new Date().getFullYear()} {config.brand_name || "Colonna Media"}{" "}
            · Pittsburgh, PA
          </p>
        </footer>
      </div>
    </main>
  );
}
