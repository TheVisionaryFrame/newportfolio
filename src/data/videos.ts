export const YOUTUBE_CHANNEL_URL = "https://www.youtube.com/@Visionaryframe";

export const videos = [
  {
    number: "01",
    category: "Latest video",
    videoId: "yHCZ1oVugXE",
    title: "India’s Future at Risk: Why Talent is Not Respected",
    description: "An investigation into talent, opportunity, and the forces shaping India’s future.",
    publishedAt: "2024-12-22",
    views: 6034,
  },
  {
    number: "02",
    category: "Investigation",
    videoId: "VRF3js9Vtcg",
    title: "The Dark Truth Behind India’s Massive Data Leak",
    description: "A closer look at the cybersecurity failures putting personal data at risk.",
    publishedAt: "2025-04-12",
    views: 3659,
  },
  {
    number: "03",
    category: "Documentary",
    videoId: "l-YxQdNJHp0",
    title: "Rail Disasters: Money, Lies and Lost Lives",
    description: "A documentary about rail safety, ambition, and the human cost of weak systems.",
    publishedAt: "2025-08-08",
    views: 1043,
  },
  {
    number: "04",
    category: "Explainer",
    videoId: "QpTHpnVq6VY",
    title: "Divide & Rule 2.0? British Legacy & EWS Scam Exposed",
    description: "An explainer on the legacy of division, caste, and the questions around EWS.",
    publishedAt: "2025-02-18",
    views: 560,
  },
] as const;

export type Video = (typeof videos)[number];

export function youtubeWatchUrl(videoId: string) {
  return `https://www.youtube.com/watch?v=${videoId}`;
}

/** True 16:9 frame (maxres). Falls back callers can use hqdefault if needed. */
export function youtubeThumbUrl(videoId: string) {
  return `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`;
}

export function formatVideoDate(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${date}T12:00:00`));
}

export function formatVideoViews(views: number) {
  return `${views.toLocaleString("en-US")} views`;
}
