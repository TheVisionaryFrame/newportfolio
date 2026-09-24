// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

import { securityHeadersForViteDev } from "./src/lib/security-headers";

export default defineConfig({
  // Hard-pin Vercel outside Lovable builds. Lovable still uses its own
  // Cloudflare preset via LOVABLE_NITRO_PRESET.
  nitro: { preset: "vercel" },
  vite: {
    resolve: {
      // Keep hooks from app code and React DOM on the same React instance.
      dedupe: ["react", "react-dom"],
    },
    // Cover Vite-served assets in local dev (SSR responses use src/server.ts).
    server: {
      headers: securityHeadersForViteDev(),
    },
    // Avoid shipping JS source maps in production builds (reduces source disclosure).
    build: {
      sourcemap: false,
    },
  },
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
});
