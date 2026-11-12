import { z } from "zod";
import { safePublicURL } from "./links-content.js";
const text = z.string().trim();
const url = text
  .max(2048)
  .refine(
    safePublicURL,
    "Use a site path beginning with / or a secure https:// link.",
  );
export const linksSchema = z
  .object({
    title: text.min(1).max(100),
    intro: text.max(400),
    contact_label: text.min(1).max(80),
    contact_url: url,
    socials: z.array(z.object({ label: text.min(1).max(40), url })).max(8),
    items: z
      .array(
        z.object({
          id: text
            .min(1)
            .max(100)
            .regex(/^[a-zA-Z0-9_-]+$/),
          title: text.min(1).max(100),
          description: text.max(300),
          label: text.min(1).max(80),
          url,
          thumbnail: url,
          alt: text.min(1).max(200),
          enabled: z.boolean(),
          featured: z.boolean(),
          youtube_id: z.string().regex(/^$|^[A-Za-z0-9_-]{11}$/),
        }),
      )
      .max(24),
  })
  .superRefine((config, ctx) => {
    if (
      new Set(config.items.map((item) => item.id)).size !== config.items.length
    )
      ctx.addIssue({ code: "custom", message: "Each card needs a unique ID." });
  });
