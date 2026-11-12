import test from "node:test";
import assert from "node:assert/strict";
import { EventEmitter } from "node:events";
import fs from "node:fs/promises";
import { build } from "esbuild";
import { JSDOM } from "jsdom";
import {
  DEFAULT_LINKS,
  platformInfo,
  embedURL,
} from "../lib/site/links-content.js";
import { linksSchema } from "../lib/site/links-schema.js";
import {
  previewURL,
  publicIPv4,
  htmlMetadata,
  getLinkPreview,
  fetchPublicText,
} from "../lib/site/link-preview.js";
import { decodeLinkImage } from "../lib/site/link-media.js";
import crmHandler from "../api/crm.js";
import linksHandler from "../api/links.js";
import {
  leadDatabase,
  configureLeadTests,
  invoke,
  ORIGIN,
  TOKEN,
} from "./helpers/lead-database.mjs";

test("Link Us previews accept supported URLs and never fetch private addresses or redirect targets", async () => {
  for (const ip of [
    "0.0.0.0",
    "10.1.2.3",
    "127.0.0.1",
    "169.254.169.254",
    "172.16.0.1",
    "192.168.0.1",
    "100.64.0.1",
    "198.18.1.1",
    "224.0.0.1",
    "::1",
    "::ffff:127.0.0.1",
  ])
    assert.equal(publicIPv4(ip), false, ip);
  assert.equal(publicIPv4("8.8.8.8"), true);
  for (const url of [
    "https://127.0.0.1/",
    "https://2130706433/",
    "https://[::1]/",
    "http://example.com",
    "https://user:pass@example.com",
    "https://metadata.internal/",
    "https://host.local/",
    "https://example.com:8443/",
  ])
    assert.throws(() => previewURL(url), undefined, url);
  assert.equal(previewURL("/photography").href, ORIGIN + "/photography");
  let requests = 0;
  await assert.rejects(
    fetchPublicText("https://public-site.com", {
      dns: async () => ["10.0.0.1"],
      send: () => {
        requests++;
      },
    }),
  );
  assert.equal(requests, 0);
  await assert.rejects(
    fetchPublicText("https://public-site.com", {
      dns: async () => ["8.8.8.8", "127.0.0.1"],
      send: () => {
        requests++;
      },
    }),
  );
  assert.equal(requests, 0);
  const send = (_url, options, callback) => {
    requests++;
    options.lookup("public-site.com", {}, (e, address, family) => {
      assert.equal(address, "8.8.8.8");
      assert.equal(family, 4);
    });
    const req = new EventEmitter();
    req.end = () => {
      const res = new EventEmitter();
      res.statusCode = 302;
      res.headers = { location: "https://127.0.0.1/" };
      res.resume = () => queueMicrotask(() => req.emit("close"));
      callback(res);
    };
    req.destroy = (e) => req.emit("error", e);
    return req;
  };
  await assert.rejects(
    fetchPublicText("https://public-site.com", {
      dns: async () => ["8.8.8.8"],
      send,
    }),
  );
  assert.equal(requests, 1);
  const og = htmlMetadata(
    '<meta content="A &amp; B" property="og:title"><meta name="description" content="A clear description"><meta property="og:image" content="/cover.jpg">',
    "https://public-site.com/post",
  );
  assert.deepEqual(og, {
    title: "A & B",
    description: "A clear description",
    thumbnail: "https://public-site.com/cover.jpg",
  });
  assert.equal(
    htmlMetadata(
      '<meta property="og:image" content="javascript:alert(1)">',
      "https://public-site.com",
    ).thumbnail,
    "",
  );
  let called = "";
  const yt = await getLinkPreview("https://youtu.be/abcdefghijk", {
    read: async (url) => {
      called = url;
      return {
        text: JSON.stringify({
          title: "Video title",
          thumbnail_url: "https://i.ytimg.com/vi/abcdefghijk/hqdefault.jpg",
          html: "<script>never execute</script>",
        }),
      };
    },
  });
  assert(called.startsWith("https://www.youtube.com/oembed?"));
  assert.equal(yt.title, "Video title");
  assert(!("html" in yt));
  assert.equal(yt.provider, "YouTube");
  const tiktok = await getLinkPreview(
    "https://www.tiktok.com/@example/video/6718335390845095173",
    {
      read: async (url) => {
        assert(url.startsWith("https://www.tiktok.com/oembed?"));
        return {
          text: JSON.stringify({
            title: "Coffee shop clip",
            thumbnail_url: "https://p16.tiktokcdn.com/cover.jpg",
          }),
        };
      },
    },
  );
  assert.equal(tiktok.thumbnail, "https://p16.tiktokcdn.com/cover.jpg");
  const blocked = await getLinkPreview("https://www.instagram.com/reel/abc/", {
    read: async () => {
      throw Error("403");
    },
  });
  assert.equal(blocked.thumbnail, "");
  assert(blocked.notice.includes("Upload"));
  assert.equal(
    platformInfo("https://www.threads.com/@name/post/abc").name,
    "Threads",
  );
  assert.equal(embedURL({ url: "https://www.instagram.com/reel/abc/" }), "");
  assert(
    embedURL({ url: "https://www.youtube.com/shorts/abcdefghijk" }).startsWith(
      "https://www.youtube-nocookie.com/",
    ),
  );
  assert(
    embedURL({
      url: "https://www.tiktok.com/@user/video/6718335390845095173",
    }).startsWith("https://www.tiktok.com/player/v1/"),
  );
});

test("Link Us owner API stores rich blocks, preserves old config, uploads only images and rejects unauthorized requests", async () => {
  const db = await leadDatabase();
  configureLeadTests();
  const savedFetch = globalThis.fetch;
  globalThis.fetch = db.fetch;
  try {
    await db.database.exec(
      await fs.readFile("database/crm-link-media.sql", "utf8"),
    );
    assert.equal(
      (
        await db.database.query(
          "select public from storage.buckets where id='crm-link-media'",
        )
      ).rows[0].public,
      true,
    );
    const base = {
      method: "POST",
      headers: { origin: ORIGIN, authorization: "Bearer " + TOKEN("aal2") },
    };
    for (const action of ["links-preview", "links-image"]) {
      assert.equal(
        (
          await invoke(crmHandler, {
            method: "POST",
            query: { action },
            headers: { origin: ORIGIN },
            body: {},
          })
        ).status,
        401,
      );
      assert.equal(
        (
          await invoke(crmHandler, {
            ...base,
            query: { action },
            headers: {
              origin: ORIGIN,
              authorization: "Bearer " + TOKEN("aal1"),
            },
            body: {},
          })
        ).status,
        403,
      );
      assert.equal(
        (
          await invoke(crmHandler, {
            ...base,
            query: { action },
            headers: {
              origin: "https://evil.example",
              authorization: base.headers.authorization,
            },
            body: {},
          })
        ).status,
        403,
      );
    }
    assert.equal(
      (
        await invoke(crmHandler, {
          ...base,
          query: { action: "links-preview" },
          body: { url: "https://127.0.0.1/" },
        })
      ).status,
      400,
    );
    const config = linksSchema.parse({
      ...DEFAULT_LINKS,
      theme: "blue",
      socials: [
        ...DEFAULT_LINKS.socials,
        { label: "Threads", url: "", enabled: false },
      ],
      items: [
        { ...DEFAULT_LINKS.items[0], layout: "hero", image_position: "top" },
        { ...DEFAULT_LINKS.items[1], layout: "link" },
        {
          ...DEFAULT_LINKS.items[5],
          playback: "embed",
          url: "https://youtu.be/abcdefghijk",
          youtube_id: "",
        },
      ],
    });
    assert.equal(
      (
        await invoke(crmHandler, {
          ...base,
          query: { action: "links-save" },
          body: { config, version: 0 },
        })
      ).status,
      200,
    );
    const publicConfig = (await invoke(linksHandler, { method: "GET" })).payload
      .config;
    assert.equal(publicConfig.theme, "blue");
    assert.equal(publicConfig.items[0].image_position, "top");
    assert.equal(publicConfig.socials[2].enabled, false);
    const legacy = { ...DEFAULT_LINKS };
    delete legacy.hero_image;
    delete legacy.logo;
    assert.equal(
      linksSchema.parse(legacy).logo,
      "/assets/img/colonna-logo-full.png",
    );
    assert(
      !linksSchema.safeParse({
        ...config,
        items: [
          { ...config.items[0], enabled: true, url: "javascript:alert(1)" },
        ],
      }).success,
    );
    assert(
      !linksSchema.safeParse({
        ...config,
        socials: [{ label: "Threads", url: "", enabled: true }],
      }).success,
    );
    assert.equal(
      (
        await invoke(crmHandler, {
          ...base,
          query: { action: "links-image" },
          body: {
            mime: "image/svg+xml",
            data: Buffer.from('<svg onload="alert(1)"></svg>').toString(
              "base64",
            ),
          },
        })
      ).status,
      400,
    );
    const image = await fs.readFile(
      "assets/img/marketing-photography-cafe.webp",
    );
    assert.equal(
      decodeLinkImage({ mime: "image/webp", data: image.toString("base64") })
        .mime,
      "image/webp",
    );
    const upload = await invoke(crmHandler, {
      ...base,
      query: { action: "links-image" },
      body: { mime: "image/webp", data: image.toString("base64") },
    });
    assert.equal(upload.status, 200, JSON.stringify(upload));
    assert(
      upload.payload.url.startsWith(
        "https://crm-test.example/storage/v1/object/public/crm-link-media/links/",
      ),
    );
    assert.equal(db.state.uploads.length, 1);
    assert.equal(db.state.externalRequests.length, 0);
  } finally {
    globalThis.fetch = savedFetch;
    await db.close();
  }
});

test("Link Us editor adds, reorders, fetches previews, edits hero and saves using the actual components", async () => {
  const result = await build({
    stdin: {
      contents: `import React from 'react';import {createRoot} from 'react-dom/client';import LinksEditor from './admin-app/LinksEditor.jsx';import {DEFAULT_LINKS} from './lib/site/links-content.js';createRoot(document.getElementById('root')).render(<LinksEditor load={async()=>({config:DEFAULT_LINKS,version:0})} save={async value=>{window.saved=value;return {...value,version:1}}} fetchPreview={async url=>({title:'Auto fetched title',thumbnail:'/assets/img/marketing-photography-cafe.webp',notice:'Preview found'})}/>);`,
      resolveDir: process.cwd(),
      loader: "jsx",
    },
    bundle: true,
    write: false,
    format: "iife",
    loader: { ".png": "dataurl", ".webp": "dataurl" },
    outfile: "test.js",
  });
  const dom = new JSDOM('<div id="root"></div>', {
    runScripts: "outside-only",
    url: ORIGIN,
    pretendToBeVisual: true,
  });
  const w = dom.window;
  w.eval(result.outputFiles.find((f) => f.path.endsWith(".js")).text);
  const wait = () => new Promise((r) => setTimeout(r, 50));
  await wait();
  const d = w.document;
  const button = (text) =>
    [...d.querySelectorAll("button")].find((b) => b.textContent === text);
  assert(button("+ Hero box"));
  button("+ Hero box").click();
  await wait();
  assert.equal(d.querySelectorAll(".links-edit-card").length, 7);
  const first = d.querySelector(".links-edit-card");
  first.querySelector(".link-fetch-row button").click();
  await wait();
  assert(first.textContent.includes("Auto fetched title"));
  const select = d.querySelector("select");
  select.value = "blue";
  select.dispatchEvent(new w.Event("change", { bubbles: true }));
  await wait();
  assert(d.querySelector(".links-theme-blue"));
  assert.equal(d.querySelectorAll('.links-layout-hero').length,1);
  const featureInputs=()=>[...d.querySelectorAll('.links-edit-card')].map(card=>card.querySelectorAll('input[type="checkbox"]')[1]);
  featureInputs()[1].click();await wait();
  assert.equal(d.querySelectorAll('.links-layout-hero').length,2);
  featureInputs()[0].click();await wait();
  assert.equal(d.querySelector('.links-cards article h2').textContent,'Photography');
  for(let i=0;i<6;i++){if(!featureInputs()[i].checked){featureInputs()[i].click();await wait();}}
  assert.equal(d.querySelectorAll('.links-layout-hero').length,6);
  assert.equal(d.querySelectorAll('.links-layout-link').length,0);
  for(let i=0;i<6;i++){featureInputs()[i].click();await wait();}
  assert.equal(d.querySelectorAll('.links-layout-hero').length,0);
  assert.equal(d.querySelectorAll('.links-layout-link').length,6);

  d.querySelector("form").dispatchEvent(
    new w.Event("submit", { bubbles: true, cancelable: true }),
  );
  await wait();
  assert(w.saved);
  assert.equal(w.saved.config.items.length, 7);
  assert.equal(w.saved.config.items[6].enabled, false);
  assert.equal(w.saved.config.theme, "blue");
  assert.equal(w.saved.config.items[0].title, "Auto fetched title");
  assert(!d.querySelector("iframe"));
  dom.window.close();
});
