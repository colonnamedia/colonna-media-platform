import base44 from "@base44/vite-plugin";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { dirname, resolve } from "node:path";
import { readFileSync } from "node:fs";
import { LINKS_IMAGE_ASSETS } from "./lib/site/links-content.js";
import { fileURLToPath } from "node:url";

const rootDir = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  logLevel: "error",
  plugins: [
    base44({
      legacySDKImports: process.env.BASE44_LEGACY_SDK_IMPORTS === "true",
      hmrNotifier: true,
      navigationNotifier: true,
      analyticsTracker: true,
      visualEditAgent: true,
    }),
    react(),
    {
      name: "stable-links-thumbnails",
      generateBundle() {
        for (const thumbnail of LINKS_IMAGE_ASSETS) {
          this.emitFile({
            type: "asset",
            fileName: thumbnail.slice(1),
            source: readFileSync(resolve(rootDir, "." + thumbnail)),
          });
        }
      },
    },
  ],
  build: {
    rollupOptions: {
      input: {
        main: resolve(rootDir, "index.html"),
        "link-us": resolve(rootDir, "link-us.html"),
        ...(process.env.VITE_REVIEW_PREVIEW === "true" ||
        process.env.VERCEL_ENV === "preview"
          ? { review: resolve(rootDir, "review.html") }
          : {}),
        admin: resolve(rootDir, "admin.html"),
        sign: resolve(rootDir, "sign.html"),
        services: resolve(rootDir, "services.html"),
        work: resolve(rootDir, "work.html"),
        about: resolve(rootDir, "about.html"),
        contact: resolve(rootDir, "contact.html"),
        clients: resolve(rootDir, "clients.html"),
        "startup-marketing-pittsburgh": resolve(
          rootDir,
          "startup-marketing-pittsburgh.html",
        ),
        "small-business-marketing-pittsburgh": resolve(
          rootDir,
          "small-business-marketing-pittsburgh.html",
        ),
        "business-photography-pittsburgh": resolve(
          rootDir,
          "business-photography-pittsburgh.html",
        ),
        "business-videography-pittsburgh": resolve(
          rootDir,
          "business-videography-pittsburgh.html",
        ),
        "website-design-pittsburgh": resolve(
          rootDir,
          "website-design-pittsburgh.html",
        ),
        "social-media-management-pittsburgh": resolve(
          rootDir,
          "social-media-management-pittsburgh.html",
        ),
        "google-meta-ads-pittsburgh": resolve(
          rootDir,
          "google-meta-ads-pittsburgh.html",
        ),
        "google-ads-launch-offer": resolve(
          rootDir,
          "google-ads-launch-offer.html",
        ),
        "web-design-ads": resolve(rootDir, "web-design-ads.html"),
        "google-ads-management": resolve(rootDir, "google-ads-management.html"),
        photography: resolve(rootDir, "photography.html"),
        "marketing-systems-pittsburgh": resolve(
          rootDir,
          "marketing-systems-pittsburgh.html",
        ),
        start: resolve(rootDir, "start.html"),
      },
    },
  },
});
