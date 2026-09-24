import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";

import { DitherImage } from "@/components/ui/dither-image";
import { cn } from "@/lib/utils";

const WORDMARK = "The Visionary Frame";
const PIXEL_SIZE = 4;
const LEVELS = 3;
const DITHER_PALETTE = ["#141414", "#6b6b6b", "#d8d8d4", "#f4f4f0"];
const MAX_PARTICLES = 1100;
const LUMA_THRESHOLD = 0.18;
const SCATTER_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
const RETURN_EASE: [number, number, number, number] = [0.23, 1, 0.32, 1];

type Particle = {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  scatterX: number;
  scatterY: number;
  rotate: number;
};

function wordmarkHeight(width: number) {
  if (width < 520) return 168;
  if (width < 860) return 210;
  return 248;
}

function wordmarkFontSize(width: number, height: number, twoLine: boolean) {
  if (twoLine) return Math.min(height * 0.34, width / 8.4);
  return Math.min(height * 0.42, width / 13.4);
}

async function createWordmarkSrc(width: number, height: number) {
  if (typeof document !== "undefined" && document.fonts?.ready) {
    await document.fonts.ready;
  }

  const canvas = document.createElement("canvas");
  const scale = 2;
  canvas.width = Math.max(1, Math.round(width * scale));
  canvas.height = Math.max(1, Math.round(height * scale));
  const context = canvas.getContext("2d");
  if (!context) return "";

  context.scale(scale, scale);
  context.fillStyle = "#141414";
  context.fillRect(0, 0, width, height);
  context.fillStyle = "#f4f4f0";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.letterSpacing = "-0.06em";

  const twoLine = width < 720;
  const fontSize = wordmarkFontSize(width, height, twoLine);
  context.font = `600 ${fontSize}px "DM Sans", sans-serif`;

  if (twoLine) {
    const lineGap = fontSize * 0.98;
    context.fillText("The Visionary", width / 2, height / 2 - lineGap / 2);
    context.fillText("Frame", width / 2, height / 2 + lineGap / 2);
  } else {
    context.fillText(WORDMARK, width / 2, height / 2);
  }

  return canvas.toDataURL("image/png");
}

function sampleDitherDots(canvas: HTMLCanvasElement, displayWidth: number, displayHeight: number): Particle[] {
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context || canvas.width === 0 || canvas.height === 0) return [];

  const { data } = context.getImageData(0, 0, canvas.width, canvas.height);
  const stepX = Math.max(1, Math.round((canvas.width / displayWidth) * PIXEL_SIZE));
  const stepY = Math.max(1, Math.round((canvas.height / displayHeight) * PIXEL_SIZE));
  const candidates: Omit<Particle, "id" | "scatterX" | "scatterY" | "rotate">[] = [];

  for (let py = 0; py < canvas.height; py += stepY) {
    for (let px = 0; px < canvas.width; px += stepX) {
      const offset = (py * canvas.width + px) * 4;
      const r = data[offset] ?? 0;
      const g = data[offset + 1] ?? 0;
      const b = data[offset + 2] ?? 0;
      const luma = (r * 0.2126 + g * 0.7152 + b * 0.0722) / 255;
      if (luma < LUMA_THRESHOLD) continue;
      candidates.push({
        x: (px / canvas.width) * displayWidth,
        y: (py / canvas.height) * displayHeight,
        size: PIXEL_SIZE,
        color: `rgb(${r} ${g} ${b})`,
      });
    }
  }

  const stride = Math.max(1, Math.ceil(candidates.length / MAX_PARTICLES));
  return candidates
    .filter((_, index) => index % stride === 0)
    .map((dot, id) => {
      const angle = Math.random() * Math.PI * 2;
      const distance = 28 + Math.random() * 96;
      return {
        ...dot,
        id,
        scatterX: Math.cos(angle) * distance,
        scatterY: Math.sin(angle) * distance,
        rotate: (Math.random() - 0.5) * 48,
      };
    });
}

export function FooterDitherWordmark({ className }: { className?: string }) {
  const shouldReduceMotion = useReducedMotion();
  const frameRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 1100, height: 248 });
  const [src, setSrc] = useState("");
  const [hovered, setHovered] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const node = frameRef.current;
    if (!node) return;
    const apply = (width: number) => {
      const nextWidth = Math.max(320, Math.round(width));
      const nextHeight = wordmarkHeight(nextWidth);
      setSize((current) =>
        current.width === nextWidth && current.height === nextHeight
          ? current
          : { width: nextWidth, height: nextHeight },
      );
    };
    apply(node.clientWidth);
    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width;
      if (width) apply(width);
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let cancelled = false;
    setParticles([]);
    void createWordmarkSrc(size.width, size.height).then((dataUrl) => {
      if (!cancelled) setSrc(dataUrl);
    });
    return () => {
      cancelled = true;
    };
  }, [size.height, size.width]);

  const handleReady = useCallback(
    (canvas: HTMLCanvasElement) => {
      setParticles(sampleDitherDots(canvas, size.width, size.height));
    },
    [size.height, size.width],
  );

  const scattered = hovered && !shouldReduceMotion && particles.length > 0;
  const showParticles = particles.length > 0 && !shouldReduceMotion;
  const transition = useMemo(
    () =>
      shouldReduceMotion
        ? { duration: 0 }
        : {
            duration: scattered ? 0.55 : 0.68,
            ease: scattered ? SCATTER_EASE : RETURN_EASE,
          },
    [scattered, shouldReduceMotion],
  );

  return (
    <div
      ref={frameRef}
      role="img"
      aria-label={WORDMARK}
      tabIndex={0}
      className={cn("relative w-full cursor-crosshair overflow-hidden bg-ink outline-none", className)}
      style={{ height: size.height }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
    >
      {src ? (
        <DitherImage
          src={src}
          alt=""
          algorithm="bayer"
          pixelSize={PIXEL_SIZE}
          levels={LEVELS}
          palette={DITHER_PALETTE}
          width={size.width}
          height={size.height}
          onReady={handleReady}
          className={cn(
            "rounded-none bg-ink",
            showParticles ? "pointer-events-none opacity-0" : "opacity-100",
          )}
        />
      ) : null}
      {showParticles ? (
        <div aria-hidden="true" className="absolute inset-0">
          {particles.map((dot) => (
            <motion.span
              key={dot.id}
              className="absolute block rounded-[1px]"
              style={{
                left: dot.x,
                top: dot.y,
                width: dot.size,
                height: dot.size,
                backgroundColor: dot.color,
              }}
              animate={
                scattered
                  ? { x: dot.scatterX, y: dot.scatterY, rotate: dot.rotate, opacity: 0.72 }
                  : { x: 0, y: 0, rotate: 0, opacity: 1 }
              }
              transition={transition}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
