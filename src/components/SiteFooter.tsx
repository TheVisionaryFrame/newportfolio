import { Instagram, Mail, Youtube } from "lucide-react";

import { YOUTUBE_CHANNEL_URL } from "@/data/videos";

const GITHUB_PROFILE_URL = "https://github.com/Shiraken12T";

const SOCIAL_LINKS = [
  {
    label: "YouTube",
    href: YOUTUBE_CHANNEL_URL,
    external: true,
    icon: Youtube,
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/thevisionaryframe/",
    external: true,
    icon: Instagram,
  },
  {
    label: "Email",
    href: "mailto:thevisionaryframe@gmail.com",
    external: false,
    icon: Mail,
  },
] as const;

export function SiteFooter() {
  return (
    <footer className="site-footer border-t border-border bg-background text-foreground">
      <div className="site-shell flex flex-col gap-6 py-10 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em]">The Visionary Frame</p>
          <p className="mt-2 text-sm text-muted-foreground">Independent content creator</p>
          <p className="mt-3 text-sm text-muted-foreground">
            <a
              href={GITHUB_PROFILE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-4 transition-colors hover:text-foreground"
            >
              Site By Shiraken12T
            </a>
          </p>
        </div>
        <nav aria-label="Social links">
          <ul className="flex flex-wrap items-center gap-2 sm:gap-3">
            {SOCIAL_LINKS.map(({ label, href, external, icon: Icon }) => (
              <li key={label}>
                <a
                  href={href}
                  aria-label={label}
                  className="site-footer-link"
                  {...(external
                    ? { target: "_blank", rel: "noopener noreferrer" }
                    : {})}
                >
                  <Icon className="size-4" aria-hidden="true" />
                  <span className="sr-only">{label}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  );
}
