import { db, configured, check } from "../lib/crm/server.js";
import { DEFAULT_LINKS } from "../lib/site/links-content.js";
import { linksSchema } from "../lib/site/links-schema.js";
export default async function handler(req, res) {
  res.setHeader("Cache-Control", "public, max-age=0, must-revalidate");
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }
  try {
    if (!configured()) return res.status(200).json({ config: DEFAULT_LINKS });
    const record = check(
      await db()
        .from("crm_site_content")
        .select("config")
        .eq("key", "links")
        .maybeSingle(),
    );
    return res
      .status(200)
      .json({ config: linksSchema.parse(record?.config || DEFAULT_LINKS) });
  } catch {
    // The public page can still display its curated defaults during a database outage.
    return res.status(200).json({ config: DEFAULT_LINKS });
  }
}
