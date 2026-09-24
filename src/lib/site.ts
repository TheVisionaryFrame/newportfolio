/** Canonical origin for absolute SEO URLs (sitemap, OG, JSON-LD). Update when a custom domain is connected. */
import { YOUTUBE_CHANNEL_URL } from "@/data/videos";

export const SITE_URL = "https://thevisionaryframe.com";

export const SITE_NAME = "The Visionary Frame";

export const SITE_DESCRIPTION =
  "The Visionary Frame is an independent YouTube channel and video portfolio for video journalism, essays, investigations, and documentary storytelling exploring India's challenges and the craft of seeing.";

export const SITE_KEYWORDS = [
  "The Visionary Frame",
  "YouTube channel",
  "video journalism",
  "video essays",
  "investigations",
  "documentary",
  "creator portfolio",
  "independent content creator",
  "India",
  "storytelling",
  "Visionaryframe",
].join(", ");

export { YOUTUBE_CHANNEL_URL };

export const INSTAGRAM_URL = "https://www.instagram.com/thevisionaryframe/";
export const CONTACT_EMAIL = "thevisionaryframe@gmail.com";

export const OG_IMAGE_PATH = "/logo.jpg";
export const OG_IMAGE_URL = `${SITE_URL}${OG_IMAGE_PATH}`;

export function absoluteUrl(path = "/") {
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${normalized}`;
}

export function buildSiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        name: SITE_NAME,
        url: SITE_URL,
        description: SITE_DESCRIPTION,
        inLanguage: "en",
        publisher: { "@id": `${SITE_URL}/#organization` },
      },
      {
        "@type": ["Organization", "Person"],
        "@id": `${SITE_URL}/#organization`,
        name: SITE_NAME,
        url: SITE_URL,
        description: SITE_DESCRIPTION,
        email: CONTACT_EMAIL,
        image: absoluteUrl("/about-profile.jpg"),
        logo: {
          "@type": "ImageObject",
          url: OG_IMAGE_URL,
        },
        sameAs: [YOUTUBE_CHANNEL_URL, INSTAGRAM_URL],
      },
    ],
  };
}
