// @ts-check
import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
import expressiveCode from "astro-expressive-code";
import { defineConfig } from "astro/config";

// https://astro.build/config
export default defineConfig({
  site: "https://kilpi.vercel.app",
  integrations: [react(), expressiveCode(), mdx()],
  vite: { plugins: [tailwindcss()] },
});
