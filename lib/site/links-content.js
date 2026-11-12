export const DEFAULT_LINKS = {
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
      title: "Photography",
      description:
        "Headshots, brand portraits, products, and the people behind your business.",
      label: "See the photography",
      url: "/photography",
      thumbnail: "/assets/img/marketing-photography-cafe.webp",
      alt: "Two café employees holding coffee behind the counter",
      enabled: true,
      featured: true,
      youtube_id: "",
    },
    {
      id: "google-ads",
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
