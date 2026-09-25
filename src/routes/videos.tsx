import { createFileRoute } from "@tanstack/react-router";

import { SiteHeader } from "@/components/SiteHeader";
import { ImagesScrollingAnimation } from "@/components/ui/images-scrolling-animation";
import {
  formatVideoDate,
  formatVideoViews,
  videos,
  youtubeThumbUrl,
  youtubeWatchUrl,
} from "@/data/videos";
import { absoluteUrl } from "@/lib/site";

export const Route = createFileRoute("/videos")({
  head: () => ({
    meta: [
      { title: "The Visionary Frame" },
      {
        name: "description",
        content: "All videos from The Visionary Frame YouTube channel.",
      },
      { property: "og:title", content: "The Visionary Frame" },
      {
        property: "og:description",
        content: "All videos from The Visionary Frame YouTube channel.",
      },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: absoluteUrl("/videos") }],
  }),
  component: VideosPage,
});

function VideosPage() {
  const animationItems = videos.map((video) => ({
    title: video.title,
    src: youtubeThumbUrl(video.videoId),
    href: youtubeWatchUrl(video.videoId),
    alt: `${video.title} YouTube thumbnail`,
    eyebrow: `${video.number} / ${video.category}`,
    description: video.description,
    meta: `${formatVideoDate(video.publishedAt)} · ${formatVideoViews(video.views)}`,
  }));

  return (
    <main className="min-h-screen bg-background text-foreground">
      <SiteHeader awayFromHome />

      <section className="site-shell border-b border-border pb-20 pt-10 md:pb-28 md:pt-14">
        <div className="mb-10 max-w-3xl md:mb-14">
          <p className="eyebrow mb-3">All videos</p>
          <h1 className="section-title">Videos</h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground">
            Stories that matter.
            <br />
            Ideas that inspire change.
          </p>
        </div>

        <ImagesScrollingAnimation items={animationItems} />
      </section>
    </main>
  );
}
