import React from "react";
import brandLogo from "../assets/img/colonna-logo-full.png";
import {
  DEFAULT_LINKS,
  safePublicURL,
  videoURL,
} from "../lib/site/links-content.js";
import "./style.css";
function destination(url) {
  return url.startsWith("/")
    ? {}
    : { target: "_blank", rel: "noopener noreferrer" };
}
export default function LinksPage({ config = DEFAULT_LINKS, preview = false }) {
  const items = config.items.filter(
    (item) =>
      item.enabled &&
      safePublicURL(videoURL(item)) &&
      safePublicURL(item.thumbnail),
  );
  return (
    <main className="links-page">
      {preview && (
        <div className="links-preview-label">
          Design preview · sample content
        </div>
      )}
      <header className="links-intro">
        <a href="/" aria-label="Colonna Media home">
          <img
            className="links-logo"
            src={brandLogo}
            alt="Colonna Media"
            width="300"
            height="144"
          />
        </a>
        <span className="links-kicker">
          Pittsburgh · Creative &amp; marketing support
        </span>
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
      </header>
      <section
        className="links-cards"
        aria-label="Explore Colonna Media services"
      >
        {items.map((item) => (
          <article
            className={"links-card" + (item.featured ? " links-featured" : "")}
            key={item.id}
          >
            <a
              href={videoURL(item)}
              {...destination(videoURL(item))}
              className="links-card-image"
              aria-label={item.title}
            >
              <img
                src={item.thumbnail}
                alt={item.alt}
                width="720"
                height="450"
                loading="lazy"
                decoding="async"
              />
              {item.youtube_id && (
                <span className="links-play" aria-hidden="true">
                  ▶
                </span>
              )}
            </a>
            <div className="links-card-body">
              {item.featured && (
                <span className="links-feature-label">Featured</span>
              )}
              <h2>{item.title}</h2>
              <p>{item.description}</p>
              <a href={videoURL(item)} {...destination(videoURL(item))}>
                {item.label}
                <span aria-hidden="true"> ↗</span>
              </a>
            </div>
          </article>
        ))}
      </section>
      <footer className="links-footer">
        <h2>Follow the work</h2>
        <nav aria-label="Social profiles">
          {config.socials
            .filter((s) => safePublicURL(s.url))
            .map((s) => (
              <a
                key={s.label + s.url}
                href={s.url}
                {...destination(s.url)}
                aria-label={"Colonna Media on " + s.label}
              >
                {s.label} ↗
              </a>
            ))}
        </nav>
        <a href="/contact">Contact Anthony</a>
        <p>© {new Date().getFullYear()} Colonna Media LLC · Pittsburgh, PA</p>
      </footer>
    </main>
  );
}
