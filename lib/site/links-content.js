export const DEFAULT_LINKS = {
  brand_name: "Colonna Media",
  kicker: "Pittsburgh · Creative & marketing support",
  logo: "/assets/img/colonna-logo-full.png",
  hero_image: "",
  hero_alt: "A small business team planning their next project",
  theme: "light",
  title: "Your next move starts here.",
  intro:
    "Websites, ads, social media, photography, and video. Pick what you need and work directly with Anthony.",
  contact_label: "Tell Anthony what you need",
  contact_url: "/contact",
  socials: [
    { label: "Instagram", url: "https://www.instagram.com/colonna_media/" },
    { label: "Facebook", url: "https://www.facebook.com/colonnamedia" },
  ],
  items: [
    {
      id: "website",
      layout: "hero",
      title: "Custom web design",
      description: "A clear, fast website built around your business.",
      label: "Explore website design",
      url: "/website-design-pittsburgh",
      thumbnail: "/assets/img/marketing-website.webp",
      alt: "Business owner reviewing a website design",
      enabled: true,
      featured: true,
      youtube_id: "",
    },
    {
      id: "photography",
      layout: "link",
      title: "Photography",
      description:
        "Headshots, brand portraits, products, and the people behind your business.",
      label: "See the photography",
      url: "/photography",
      thumbnail: "/assets/img/marketing-photography-cafe.webp",
      alt: "Two café employees holding coffee behind the counter",
      enabled: true,
      featured: false,
      youtube_id: "",
    },
    {
      id: "google-ads",
      layout: "link",
      title: "Google Ads",
      description: "Get in front of people searching for your services.",
      label: "Explore Google Ads",
      url: "/google-ads-management",
      thumbnail: "/assets/img/marketing-google-cafe.webp",
      alt: "Business owner reviewing an advertising campaign",
      enabled: true,
      featured: false,
      youtube_id: "",
    },
    {
      id: "meta-ads",
      layout: "link",
      title: "Meta Ads",
      description: "Reach your audience on Facebook and Instagram.",
      label: "Explore Meta Ads",
      url: "/google-meta-ads-pittsburgh",
      thumbnail: "/assets/img/marketing-store-planning.webp",
      alt: "Small business team discussing campaign plans",
      enabled: true,
      featured: false,
      youtube_id: "",
    },
    {
      id: "social-media",
      layout: "link",
      title: "Social media management",
      description: "Show up consistently with content that fits your business.",
      label: "Explore social media",
      url: "/social-media-management-pittsburgh",
      thumbnail: "/assets/img/marketing-team-hero.webp",
      alt: "Team planning social media content",
      enabled: true,
      featured: false,
      youtube_id: "",
    },
    {
      id: "video",
      layout: "link",
      title: "Video",
      description:
        "Brand stories, short clips, and creative for your next campaign.",
      label: "Plan a video project",
      url: "/contact?service=videography",
      thumbnail: "/assets/img/marketing-video-studio.webp",
      alt: "Video crew filming a Pilates session",
      enabled: true,
      featured: false,
      youtube_id: "",
    },
  ],
};
export function safePublicURL(value) {
  if (typeof value !== "string" || /[\u0000-\u0020\\]/.test(value))
    return false;
  let decoded;
  try {
    decoded = decodeURIComponent(value);
  } catch {
    return false;
  }
  if (/[\\\u0000-\u001f]/.test(decoded)) return false;
  if (
    value.startsWith("/") &&
    !value.startsWith("//") &&
    !decoded.startsWith("//")
  )
    return true;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password;
  } catch {
    return false;
  }
}
export function videoURL(item) {
  return item.youtube_id
    ? `https://www.youtube.com/watch?v=${item.youtube_id}`
    : item.url;
}

export function platformInfo(value) {
  try {
    const u = new URL(value),
      host = u.hostname.toLowerCase().replace(/^www\./, "");
    let id = "";
    if (["youtube.com", "m.youtube.com", "youtu.be"].includes(host)) {
      id =
        host === "youtu.be"
          ? u.pathname.split("/")[1]
          : u.searchParams.get("v") ||
            u.pathname.match(/^\/(?:shorts|embed|live)\/([\w-]+)/)?.[1] ||
            "";
      return {
        name: "YouTube",
        id: /^[\w-]{11}$/.test(id) ? id : "",
        video: !!id,
      };
    }
    if (["tiktok.com", "vm.tiktok.com", "vt.tiktok.com"].includes(host))
      return {
        name: "TikTok",
        id: u.pathname.match(/\/video\/(\d{10,25})/)?.[1] || "",
        video: true,
      };
    if (["instagram.com", "instagr.am"].includes(host))
      return { name: "Instagram", video: /^\/(reel|p|tv)\//.test(u.pathname) };
    if (["threads.com", "threads.net"].includes(host))
      return { name: "Threads", video: /\/post\//.test(u.pathname) };
    if (host === "facebook.com" || host === "fb.watch")
      return {
        name: "Facebook",
        video: /\/reel\/|\/videos\/|fb.watch/.test(value),
      };
    return { name: host, video: false };
  } catch {
    return { name: "Colonna Media", video: false };
  }
}

export function embedURL(item) {
  const info = platformInfo(videoURL(item));
  if (info.name === "YouTube" && info.id)
    return `https://www.youtube-nocookie.com/embed/${info.id}?autoplay=1`;
  if (info.name === "TikTok" && info.id)
    return `https://www.tiktok.com/player/v1/${info.id}?autoplay=1`;
  return "";
}
