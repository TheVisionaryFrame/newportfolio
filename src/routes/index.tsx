import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { ArrowUpRight, Check, Volume2, VolumeX } from "lucide-react";
import { createFileRoute } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/SiteHeader";
import {
  formatVideoDate,
  formatVideoViews,
  videos,
  youtubeThumbUrl,
  youtubeWatchUrl,
} from "@/data/videos";
import { absoluteUrl } from "@/lib/site";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "The Visionary Frame" },
      {
        name: "description",
        content:
          "The Visionary Frame is an independent YouTube channel about video, photography, and the craft of seeing.",
      },
      { property: "og:title", content: "The Visionary Frame" },
      {
        property: "og:description",
        content: "Independent videos, field notes, and conversations about the craft of seeing.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: absoluteUrl("/") }],
  }),
  component: Index,
});

function Index() {
  const [subscribed, setSubscribed] = useState(false);
  const [email, setEmail] = useState("");

  return (
    <main className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      <section id="top" className="overflow-hidden border-b border-border bg-ink">
        {/* Keep the full hero stage before the stats bar so stats begin below the initial viewport. */}
        <div className="hero-stage relative">
          <HeroVideo />
          <div className="site-shell hero-stage relative z-10 flex flex-col justify-end py-20 md:py-28">
            <div className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
              <div>
                <p className="eyebrow mb-7 text-paper/70">Independent Content Creator</p>
                <h1 className="max-w-4xl text-balance text-[clamp(3.7rem,10vw,9.5rem)] font-semibold leading-[0.86] tracking-[-0.07em] text-paper">
                  See more.
                  <br />
                  <span className="text-paper/55">Feel more.</span>
                </h1>
              </div>
              <div className="max-w-sm lg:justify-self-end">
                <p className="text-lg leading-8 text-paper">
                  <strong className="font-semibold">
                    Exploring India’s Challenges. Inspiring Change. Amplifying Voices.
                  </strong>
                </p>
                <p className="mt-3 text-base leading-7 text-paper/80">
                  Stories, insights, and discussions on India’s society, economy, education,
                  inequality, talent, and the forces shaping our future.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Button asChild className="rounded-none bg-paper text-ink hover:bg-paper/80">
                    <a href="#work">
                      Explore the work <ArrowUpRight />
                    </a>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="rounded-none border-paper/70 bg-transparent text-paper hover:bg-paper hover:text-ink"
                  >
                    <a href="#about">About the channel</a>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div
          className="relative z-10 border-t border-paper/15 bg-ink"
          aria-label="Channel statistics"
        >
          <div className="site-shell grid divide-y divide-paper/15 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            <Stat end={438} label="Subscribers" />
            <Stat end={17207} label="Views to date" />
            <Stat end={14} label="Videos published" />
          </div>
        </div>
      </section>

      <section id="work" className="site-shell border-b border-border py-20 md:py-28">
        <div className="mb-10 flex items-end justify-between gap-6">
          <div>
            <p className="eyebrow mb-3">Selected work</p>
            <h2 className="section-title">Latest videos</h2>
          </div>
          <span className="hidden text-xs text-muted-foreground sm:block">01 — 04</span>
        </div>
        <article className="featured-video mb-5 grid overflow-hidden rounded-3xl border border-border md:grid-cols-[1.15fr_0.85fr]">
          <a
            className="video-embed-frame block"
            href={youtubeWatchUrl(videos[0].videoId)}
            target="_blank"
            rel="noreferrer"
            aria-label={`Watch ${videos[0].title} on YouTube`}
          >
            <img
              src={youtubeThumbUrl(videos[0].videoId)}
              alt={`${videos[0].title} YouTube thumbnail`}
              loading="lazy"
              decoding="async"
            />
          </a>
          <div className="flex flex-col justify-between bg-background p-6 md:p-10">
            <div>
              <p className="eyebrow mb-5">{videos[0].category}</p>
              <h3 className="max-w-xl text-3xl font-semibold tracking-[-0.05em] md:text-5xl">
                {videos[0].title}
              </h3>
              <p className="mt-5 max-w-md text-base leading-7 text-muted-foreground">
                {videos[0].description}
              </p>
            </div>
            <div className="mt-12 border-t border-border pt-5">
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs uppercase tracking-[0.12em] text-muted-foreground">
                <span>Published {formatVideoDate(videos[0].publishedAt)}</span>
                <span>{formatVideoViews(videos[0].views)}</span>
              </div>
              <Button
                asChild
                variant="link"
                className="mt-5 h-auto gap-2 p-0 text-xs uppercase tracking-[0.12em] text-foreground"
              >
                <a href={youtubeWatchUrl(videos[0].videoId)} target="_blank" rel="noreferrer">
                  Watch on YouTube <ArrowUpRight />
                </a>
              </Button>
            </div>
          </div>
        </article>
        <div className="grid gap-5 md:grid-cols-3">
          {videos.slice(1).map((video) => (
            <article
              key={video.videoId}
              className="episode-card group overflow-hidden rounded-3xl border border-border bg-background"
            >
              <a
                className="video-embed-frame block"
                href={youtubeWatchUrl(video.videoId)}
                target="_blank"
                rel="noreferrer"
                aria-label={`Watch ${video.title} on YouTube`}
              >
                <img
                  src={youtubeThumbUrl(video.videoId)}
                  alt={`${video.title} YouTube thumbnail`}
                  loading="lazy"
                  decoding="async"
                />
              </a>
              <div className="p-5">
                <p className="eyebrow mb-3">
                  {video.number} / {video.category}
                </p>
                <h3 className="text-2xl font-semibold tracking-[-0.04em]">{video.title}</h3>
                <p className="mt-2 min-h-12 text-sm leading-6 text-muted-foreground">
                  {video.description}
                </p>
                <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4 text-xs uppercase tracking-[0.1em] text-muted-foreground">
                  <span>{formatVideoDate(video.publishedAt)}</span>
                  <span>{formatVideoViews(video.views)}</span>
                </div>
                <Button
                  asChild
                  variant="link"
                  className="mt-5 h-auto gap-2 p-0 text-xs uppercase tracking-[0.12em] text-foreground hover:text-muted-foreground"
                >
                  <a href={youtubeWatchUrl(video.videoId)} target="_blank" rel="noreferrer">
                    Watch on YouTube <ArrowUpRight />
                  </a>
                </Button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="about" className="site-shell border-b border-border py-20 md:py-28">
        <div className="grid gap-12 md:grid-cols-[0.7fr_1.3fr] md:gap-20">
          <AboutProfileImage />
          <div>
            <p className="max-w-3xl text-3xl font-medium leading-tight tracking-[-0.04em] md:text-5xl">
              Follow thevisionaryframe for updates, insights, and meaningful discussions. Subscribe
              and join our growing community.
            </p>
            <div className="mt-10 grid gap-8 border-t border-border pt-8 sm:grid-cols-2">
              <div>
                <p className="eyebrow mb-3">What we make</p>
                <p className="text-sm leading-6 text-muted-foreground">
                  Stories, insights, and ideas that inspire change.
                </p>
              </div>
              <div>
                <p className="eyebrow mb-3">Where to find us</p>
                <p className="text-sm leading-6 text-muted-foreground">Youtube and my socials</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="contact" className="site-shell py-20 md:py-28">
        <div className="grid gap-10 md:grid-cols-[1fr_1fr] md:items-end">
          <div>
            <p className="eyebrow mb-3">Stay close</p>
            <h2 className="section-title max-w-xl">New videos, when they are ready.</h2>
          </div>
          <div className="md:w-full md:max-w-md md:justify-self-end">
            {subscribed ? (
              <div
                role="status"
                className="flex items-center gap-3 rounded-xl border border-border bg-muted/45 px-5 py-4 text-sm text-foreground"
              >
                <Check className="size-4 shrink-0" aria-hidden />
                You&apos;re on the list. Thank you.
              </div>
            ) : (
              <form
                className="flex flex-col gap-3 sm:flex-row sm:items-stretch"
                onSubmit={(event) => {
                  event.preventDefault();
                  if (email.trim()) setSubscribed(true);
                }}
              >
                <label className="sr-only" htmlFor="subscribe-email">
                  Your email address
                </label>
                <input
                  id="subscribe-email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  type="email"
                  name="email"
                  autoComplete="email"
                  required
                  placeholder="Your email address"
                  className="h-12 min-w-0 flex-1 rounded-xl border border-border bg-muted/30 px-4 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/80 focus-visible:border-foreground/40 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                />
                <Button
                  type="submit"
                  className="h-12 shrink-0 rounded-xl bg-paper px-5 text-xs font-medium uppercase tracking-[0.12em] text-ink hover:bg-paper/85 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  Subscribe
                  <ArrowUpRight className="size-3.5" aria-hidden />
                </Button>
              </form>
            )}
            <p className="mt-4 text-xs leading-5 text-muted-foreground">
              Occasional notes on videos, process, and what we&apos;re paying attention to.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

const ABOUT_TILT_MAX_DEG = 8;
const ABOUT_TILT_LERP = 0.16;

function AboutProfileImage() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const target = useRef({ rx: 0, ry: 0 });
  const current = useRef({ rx: 0, ry: 0 });
  const rafId = useRef(0);
  const animating = useRef(false);
  const enabled = useRef(false);

  useEffect(() => {
    const mqReduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mqHover = window.matchMedia("(hover: hover) and (pointer: fine)");

    const syncEnabled = () => {
      enabled.current = !mqReduce.matches && mqHover.matches;
      if (!enabled.current) {
        target.current = { rx: 0, ry: 0 };
        startAnim();
      }
    };

    syncEnabled();
    mqReduce.addEventListener("change", syncEnabled);
    mqHover.addEventListener("change", syncEnabled);

    return () => {
      cancelAnimationFrame(rafId.current);
      animating.current = false;
      mqReduce.removeEventListener("change", syncEnabled);
      mqHover.removeEventListener("change", syncEnabled);
    };
  }, []);

  const applyTransform = (rx: number, ry: number) => {
    const img = imgRef.current;
    if (!img) return;
    img.style.transform = `rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg)`;
  };

  const startAnim = () => {
    if (animating.current) return;
    animating.current = true;

    const tick = () => {
      const c = current.current;
      const t = target.current;
      c.rx += (t.rx - c.rx) * ABOUT_TILT_LERP;
      c.ry += (t.ry - c.ry) * ABOUT_TILT_LERP;

      if (Math.abs(c.rx - t.rx) < 0.02 && Math.abs(c.ry - t.ry) < 0.02) {
        c.rx = t.rx;
        c.ry = t.ry;
        applyTransform(c.rx, c.ry);
        animating.current = false;
        return;
      }

      applyTransform(c.rx, c.ry);
      rafId.current = requestAnimationFrame(tick);
    };

    rafId.current = requestAnimationFrame(tick);
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!enabled.current || !wrapRef.current) return;
    const rect = wrapRef.current.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const nx = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
    const ny = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
    // Opposite of cursor offset: cursor pushes that corner away from the viewer.
    target.current = {
      rx: -ny * ABOUT_TILT_MAX_DEG,
      ry: nx * ABOUT_TILT_MAX_DEG,
    };
    startAnim();
  };

  const onPointerLeave = () => {
    target.current = { rx: 0, ry: 0 };
    startAnim();
  };

  return (
    <div
      ref={wrapRef}
      className="flex h-full w-full items-stretch self-stretch [perspective:900px]"
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
    >
      <img
        ref={imgRef}
        src="/about-profile.jpg"
        alt="The Visionary Frame creator"
        width={560}
        height={560}
        decoding="async"
        className="aspect-square h-full w-full rounded-full object-cover will-change-transform [transform-style:preserve-3d]"
      />
    </div>
  );
}

function CountUp({ end, duration = 1600 }: { end: number; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [val, setVal] = useState(0);
  const started = useRef(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting && !started.current) {
            started.current = true;
            const start = performance.now();
            const tick = (now: number) => {
              const p = Math.min((now - start) / duration, 1);
              const eased = 1 - Math.pow(1 - p, 3);
              setVal(Math.round(end * eased));
              if (p < 1) requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
            obs.disconnect();
          }
        }
      },
      { threshold: 0.4 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [end, duration]);
  return <span ref={ref}>{val.toLocaleString("en-US")}</span>;
}

function Stat({ end, label }: { end: number; label: string }) {
  return (
    <div className="flex items-baseline justify-center gap-3 px-4 py-5 sm:px-8 sm:py-6">
      <span className="text-3xl font-semibold tracking-[-0.06em] text-paper tabular-nums md:text-4xl">
        <CountUp end={end} />
      </span>
      <span className="text-[0.65rem] uppercase tracking-[0.14em] text-paper/50">{label}</span>
    </div>
  );
}

function HeroVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = true;
    const play = video.play();
    if (play && typeof play.catch === "function") {
      play.catch(() => {
        /* Autoplay can be blocked; mute toggle still works once user interacts. */
      });
    }
  }, []);

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setMuted(video.muted);
    if (!video.paused) return;
    void video.play().catch(() => {
      /* noop */
    });
  };

  return (
    <>
      <div className="hero-video" aria-hidden="true">
        <video ref={videoRef} src="/hero.mp4" autoPlay muted loop playsInline preload="auto" />
      </div>
      <div className="hero-overlay" aria-hidden="true" />
      <button
        type="button"
        onClick={toggleMute}
        aria-label={muted ? "Unmute featured video" : "Mute featured video"}
        className="hero-mute-btn"
      >
        {muted ? <VolumeX className="size-5" /> : <Volume2 className="size-5" />}
      </button>
    </>
  );
}
