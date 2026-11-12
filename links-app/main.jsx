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
  return <LinksPage config={config} />;
}
createRoot(document.getElementById("root")).render(<PublicLinks />);
