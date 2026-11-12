import { z } from "zod";
import { safePublicURL } from "./links-content.js";
const text = z.string().trim();
const url = text
  .max(2048)
  .refine(
    safePublicURL,
    "Use a site path beginning with / or a secure https:// link.",
  );
const optionalURL = z.union([z.literal(""), url]);
export const linksSchema = z
  .object({
    brand_name: text.min(1).max(80).default("Colonna Media"),
    kicker: text.max(120).default("Pittsburgh · Creative & marketing support"),
    logo: optionalURL.default("/assets/img/colonna-logo-full.png"),
    hero_image: optionalURL.default(""),
    hero_alt: text.max(200).default(""),
    theme: z.enum(["light", "blue", "dark"]).default("light"),
    title: text.min(1).max(100),
    intro: text.max(400),
    contact_label: text.min(1).max(80),
    contact_url: url,
    socials: z
      .array(
        z
          .object({
            label: text.min(1).max(40),
            url: optionalURL,
            enabled: z.boolean().default(true),
          })
          .superRefine((s, ctx) => {
            if (s.enabled && !safePublicURL(s.url))
              ctx.addIssue({
                code: "custom",
                path: ["url"],
                message: "Add a profile URL or turn visibility off.",
              });
          }),
      )
      .max(8),
    items: z
      .array(
        z
          .object({
            id: text
              .min(1)
              .max(100)
              .regex(/^[a-zA-Z0-9_-]+$/),
            title: text.min(1).max(100),
            description: text.max(300),
            label: text.min(1).max(80),
            url: optionalURL,
            thumbnail: optionalURL,
            alt: text.max(200),
            layout: z.enum(["link", "card", "hero"]).default("card"),
            image_fit: z.enum(["cover", "contain"]).default("cover"),
            image_position: z
              .enum(["top", "center", "bottom"])
              .default("center"),
            aspect: z
              .enum(["landscape", "square", "portrait"])
              .default("landscape"),
            playback: z.enum(["link", "embed"]).default("link"),
            enabled: z.boolean(),
            featured: z.boolean(),
            youtube_id: z
              .string()
              .regex(/^$|^[A-Za-z0-9_-]{11}$/)
              .default(""),
          })
          .superRefine((item, ctx) => {
            if (item.enabled && !item.youtube_id && !safePublicURL(item.url))
              ctx.addIssue({
                code: "custom",
                path: ["url"],
                message: "Add a destination or turn visibility off.",
              });
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
