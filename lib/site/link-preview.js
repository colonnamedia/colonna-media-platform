import { resolve4 } from "node:dns/promises";
import { request } from "node:https";
import { isIP } from "node:net";
import { safePublicURL, platformInfo } from "./links-content.js";

export function publicIPv4(address) {
  if (isIP(address) !== 4) return false;
  const [a, b, c] = address.split(".").map(Number);
  return !(
    a === 0 ||
    a === 10 ||
    a === 127 ||
    a >= 224 ||
    (a === 100 && b >= 64 && b <= 127) ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && (b === 0 || b === 168)) ||
    (a === 198 && (b === 18 || b === 19 || (b === 51 && c === 100))) ||
    (a === 203 && b === 0 && c === 113)
  );
}
export function previewURL(value, base = "https://www.colonnamedia.com") {
  if (typeof value !== "string" || value.length > 2048 || !safePublicURL(value))
    throw new Error("Use a public HTTPS link or a page on this site.");
  const url = new URL(value, base);
  if (
    url.protocol !== "https:" ||
    url.username ||
    url.password ||
    (url.port && url.port !== "443") ||
    isIP(url.hostname.replace(/^\[|\]$/g, "")) ||
    !url.hostname.includes(".") ||
    /\.(localhost|local|internal|test|invalid|example|arpa)$/.test(url.hostname)
  )
    throw new Error("This address cannot be previewed.");
  url.hash = "";
  return url;
}
// Only public IPv4 destinations. Every redirect is revalidated and the request is
// pinned to the DNS result, so a second lookup cannot redirect it into a private network.
export async function fetchPublicText(
  value,
  {
    dns = resolve4,
    send = request,
    deadline = Date.now() + 6500,
    redirects = 0,
  } = {},
) {
  const url = previewURL(value);
  if (redirects > 3 || Date.now() >= deadline)
    throw new Error("Preview timed out.");
  let timer;
  const addresses = await Promise.race([
    dns(url.hostname),
    new Promise((_, reject) => {
      timer = setTimeout(
        () => reject(new Error("Preview DNS timeout.")),
        Math.min(1500, deadline - Date.now()),
      );
    }),
  ]).finally(() => clearTimeout(timer));
  if (!addresses.length || !addresses.every(publicIPv4))
    throw new Error("This address cannot be previewed.");
  const response = await new Promise((resolve, reject) => {
    const req = send(
      url,
      {
        family: 4,
        headers: {
          "User-Agent": "ColonnaMedia-LinkPreview/1.0",
          Accept: "text/html,application/json",
          "Accept-Encoding": "identity",
        },
        lookup: (_host, options, callback) =>
          options?.all
            ? callback(null, [{ address: addresses[0], family: 4 }])
            : callback(null, addresses[0], 4),
      },
      (res) => {
        if ([301, 302, 303, 307, 308].includes(res.statusCode)) {
          res.resume();
          resolve({ redirect: res.headers.location });
          return;
        }
        if (res.statusCode < 200 || res.statusCode >= 300) {
          res.resume();
          reject(new Error("The provider did not return a public preview."));
          return;
        }
        if (
          !/text\/html|application\/(?:[^;]+\+)?json/i.test(
            res.headers["content-type"] || "",
          ) ||
          !["identity", ""].includes(res.headers["content-encoding"] || "")
        ) {
          res.resume();
          reject(new Error("This link has no readable preview."));
          return;
        }
        let size = 0;
        const chunks = [];
        res.on("data", (chunk) => {
          size += chunk.length;
          if (size > 512 * 1024) {
            res.destroy();
            reject(new Error("Preview is too large."));
          } else chunks.push(chunk);
        });
        res.on("end", () =>
          resolve({
            text: Buffer.concat(chunks).toString("utf8"),
            url: url.href,
          }),
        );
        res.on("error", reject);
      },
    );
    const timeout = setTimeout(
      () => req.destroy(new Error("Preview timed out.")),
      Math.max(1, deadline - Date.now()),
    );
    req.on("close", () => clearTimeout(timeout));
    req.on("error", reject);
    req.end();
  });
  if ("redirect" in response) {
    if (!response.redirect) throw new Error("Invalid redirect.");
    return fetchPublicText(new URL(response.redirect, url).href, {
      dns,
      send,
      deadline,
      redirects: redirects + 1,
    });
  }
  return response;
}
function decode(value = "") {
  return value
    .replace(/&#(x[0-9a-f]+|\d+);|&(amp|quot|apos|lt|gt);/gi, (_, n, named) => {
      if (n) {
        const code = parseInt(n.replace(/^x/i, ""), /^x/i.test(n) ? 16 : 10);
        return code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : "";
      }
      return { amp: "&", quot: '"', apos: "'", lt: "<", gt: ">" }[
        named.toLowerCase()
      ];
    })
    .replace(/\s+/g, " ")
    .trim();
}
export function htmlMetadata(html, base) {
  const meta = {};
  for (const tag of html.match(/<meta\b[^>]{0,16384}>/gi) || []) {
    const attrs = {};
    for (const m of tag.matchAll(
      /([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g,
    ))
      attrs[m[1].toLowerCase()] = decode(m[2] ?? m[3] ?? m[4]);
    const key = (attrs.property || attrs.name || "").toLowerCase();
    if (key && !meta[key]) meta[key] = attrs.content || "";
  }
  let thumbnail = "";
  try {
    const image = new URL(
      meta["og:image:secure_url"] ||
        meta["og:image"] ||
        meta["twitter:image"] ||
        "",
      base,
    ).href;
    if (
      (meta["og:image:secure_url"] ||
        meta["og:image"] ||
        meta["twitter:image"]) &&
      safePublicURL(image)
    )
      thumbnail = image;
  } catch {}
  return {
    title: (
      meta["og:title"] ||
      meta["twitter:title"] ||
      decode(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || "")
    ).slice(0, 100),
    description: (meta["og:description"] || meta.description || "").slice(
      0,
      300,
    ),
    thumbnail,
  };
}
export async function getLinkPreview(raw, { read = fetchPublicText } = {}) {
  const url = previewURL(raw).href,
    info = platformInfo(url);
  let result = {
    url,
    title: "",
    description: "",
    thumbnail: "",
    provider: info.name,
    video: info.video,
  };
  try {
    let endpoint = "";
    if (info.name === "YouTube" && info.id) {
      result.thumbnail = `https://i.ytimg.com/vi/${info.id}/hqdefault.jpg`;
      endpoint =
        "https://www.youtube.com/oembed?format=json&url=" +
        encodeURIComponent(url);
    } else if (info.name === "TikTok")
      endpoint = "https://www.tiktok.com/oembed?url=" + encodeURIComponent(url);
    if (endpoint) {
      const response = await read(endpoint),
        data = JSON.parse(response.text);
      result.title = String(data.title || "").slice(0, 100);
      if (safePublicURL(data.thumbnail_url))
        result.thumbnail = data.thumbnail_url;
    } else {
      const response = await read(url);
      result = {
        ...result,
        ...htmlMetadata(response.text, response.url || url),
      };
    }
  } catch {
    /* Providers can block automated access; manual content remains available. */
  }
  return {
    ...result,
    notice: result.thumbnail
      ? "Preview found. Review the title and image before saving."
      : "This provider did not supply an image. Upload a thumbnail or paste an image URL; your link will still work.",
  };
}
