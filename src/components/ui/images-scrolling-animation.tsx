import { ArrowUpRight } from "lucide-react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

import { cn } from "@/lib/utils";

export type ImagesScrollingAnimationItem = {
  title: string;
  src: string;
  href?: string;
  alt?: string;
  eyebrow?: string;
  description?: string;
  meta?: string;
};

type ImagesScrollingAnimationProps = {
  items?: ImagesScrollingAnimationItem[];
  className?: string;
};

const fallbackItems: ImagesScrollingAnimationItem[] = [
  {
    title: "Cinematic field notes",
    src: "/logo.jpg",
    alt: "The Visionary Frame logo",
    eyebrow: "Featured story",
    description: "A focused card layout for visual stories.",
  },
];

export function ImagesScrollingAnimation({
  items = fallbackItems,
  className,
}: ImagesScrollingAnimationProps) {
  const prefersReducedMotion = useReducedMotion();
  const listRef = useRef<HTMLDivElement>(null);
  const safeItems = items.length > 0 ? items : fallbackItems;
  const { scrollYProgress } = useScroll({
    target: listRef,
    offset: ["start start", "end end"],
  });

  return (
    <div ref={listRef} className={cn("flex flex-col", className)}>
      {safeItems.map((item, index) => (
        <StackCard
          key={`${item.title}-${index}`}
          item={item}
          index={index}
          total={safeItems.length}
          isLast={index === safeItems.length - 1}
          progress={scrollYProgress}
          reducedMotion={Boolean(prefersReducedMotion)}
        />
      ))}
    </div>
  );
}

function StackCard({
  item,
  index,
  total,
  isLast,
  progress,
  reducedMotion,
}: {
  item: ImagesScrollingAnimationItem;
  index: number;
  total: number;
  isLast: boolean;
  progress: ReturnType<typeof useScroll>["scrollYProgress"];
  reducedMotion: boolean;
}) {
  const activeIndex = useTransform(progress, (value) => value * Math.max(total - 1, 1));
  const scale = useTransform(activeIndex, (active) => {
    if (reducedMotion) return 1;
    const distance = Math.min(Math.abs(active - index), 1);
    return 1 - distance * 0.48;
  });
  const y = useTransform(activeIndex, (active) => {
    if (reducedMotion) return 0;
    const passed = Math.min(Math.max(active - index, 0), 1);
    return -passed * 40;
  });

  const card = (
    <motion.article
      style={reducedMotion ? undefined : { scale, y }}
      className="group flex w-full origin-top flex-col overflow-hidden rounded-[1.5rem] border border-border bg-ink shadow-[0_36px_120px_-70px_var(--color-paper)] md:rounded-[2rem]"
    >
      <div className="flex items-center justify-center bg-ink p-4 sm:p-6 md:p-8">
        <img
          src={item.src}
          alt={item.alt ?? item.title}
          loading="lazy"
          decoding="async"
          className="max-h-[52vh] w-full rounded-lg object-contain sm:rounded-xl"
        />
      </div>

      <div className="bg-ink px-5 py-5 sm:px-8 sm:py-6 md:px-10">
        {item.eyebrow ? <p className="eyebrow mb-2 text-paper/70">{item.eyebrow}</p> : null}
        <h3 className="text-pretty text-2xl font-semibold leading-tight tracking-[-0.04em] text-paper sm:text-3xl md:text-4xl">
          {item.title}
        </h3>
        {item.description ? (
          <p className="mt-3 text-sm leading-6 text-paper/70 md:text-base md:leading-7">
            {item.description}
          </p>
        ) : null}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t border-paper/15 pt-4">
          {item.meta ? (
            <p className="text-xs uppercase tracking-[0.12em] text-paper/55">{item.meta}</p>
          ) : null}
          <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-paper">
            {item.href ? "Watch on YouTube" : "View story"}
            <ArrowUpRight className="size-3.5" />
          </span>
        </div>
      </div>
    </motion.article>
  );

  const framed = item.href ? (
    <a
      href={item.href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Watch on YouTube: ${item.title}`}
      className="block text-inherit no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      {card}
    </a>
  ) : (
    card
  );

  return (
    <div className={isLast ? "relative" : "relative pb-[6vh]"} style={{ zIndex: index + 1 }}>
      <div className="sticky top-[calc(var(--header-height)+0.75rem)]">{framed}</div>
    </div>
  );
}
