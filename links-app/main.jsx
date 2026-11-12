import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import LinksPage from "./LinksPage.jsx";
import { DEFAULT_LINKS } from "../lib/site/links-content.js";
import "../assets/lead-attribution.js";
function PublicLinks() {
  const [config, setConfig] = useState(DEFAULT_LINKS);
  useEffect(() => {
    fetch("/api/links")
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (data?.config) setConfig(data.config);
      })
      .catch(() => {});
  }, []);
  useEffect(() => {
    document.title = `${config.title} | ${config.brand_name || "Colonna Media"}`;
    for (const selector of [
      'meta[name="description"]',
      'meta[property="og:description"]',
    ]) {
      document.querySelector(selector)?.setAttribute("content", config.intro);
    }
    document
      .querySelector('meta[property="og:title"]')
      ?.setAttribute("content", document.title);
  }, [config.title, config.brand_name, config.intro]);
  return <LinksPage config={config} />;
}
createRoot(document.getElementById("root")).render(<PublicLinks />);
