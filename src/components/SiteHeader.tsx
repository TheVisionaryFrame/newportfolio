import { useState } from "react";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { YOUTUBE_CHANNEL_URL } from "@/data/videos";

type SiteHeaderProps = {
  /** When true, About points at the homepage hash section. */
  awayFromHome?: boolean;
};

export function SiteHeader({ awayFromHome = false }: SiteHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const aboutHref = awayFromHome ? "/#about" : "#about";

  return (
    <header className="site-header">
      <div className="site-header-pill">
        <Link to="/" className="flex min-w-0 items-center gap-2.5" aria-label="The Visionary Frame home">
          <span className="site-logo">
            <img src="/logo.jpg" alt="" width={34} height={34} decoding="async" />
          </span>
          <span className="truncate text-xs font-semibold uppercase tracking-[0.2em]">The Visionary Frame</span>
        </Link>
        <nav className="hidden items-center gap-6 text-xs font-medium uppercase tracking-[0.12em] md:flex" aria-label="Main navigation">
          <Link className="nav-link" to="/videos">
            Videos
          </Link>
          <a className="nav-link" href={aboutHref}>
            About
          </a>
          <Link className="nav-link" to="/contact">
            Contact
          </Link>
        </nav>
        <Button asChild size="sm" className="hidden rounded-full bg-foreground px-4 text-background hover:bg-foreground/80 md:inline-flex">
          <a href={YOUTUBE_CHANNEL_URL} target="_blank" rel="noopener noreferrer">
            YouTube channel <ArrowUpRight />
          </a>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0 rounded-full md:hidden"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X /> : <Menu />}
        </Button>
      </div>
      {menuOpen ? (
        <nav className="site-header-menu md:hidden" aria-label="Mobile navigation">
          <Link className="mobile-nav-link" to="/videos" onClick={() => setMenuOpen(false)}>
            Videos
          </Link>
          <a className="mobile-nav-link" href={aboutHref} onClick={() => setMenuOpen(false)}>
            About
          </a>
          <Link className="mobile-nav-link" to="/contact" onClick={() => setMenuOpen(false)}>
            Contact
          </Link>
          <a
            className="mobile-nav-link"
            href={YOUTUBE_CHANNEL_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setMenuOpen(false)}
          >
            YouTube channel
          </a>
        </nav>
      ) : null}
    </header>
  );
}
