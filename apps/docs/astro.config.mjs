// @ts-check
import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import expressiveCode from "astro-expressive-code";
import { defineConfig } from "astro/config";

// https://astro.build/config
export default defineConfig({
  // Site metadata
  site: "https://kilpi.vercel.app",

  // Fully static docs
  output: "static",

  // Astro integrations
  integrations: [
    // Use React for interactive UI components
    react(),
    // Use expressive code for code blocks and syntax highlighting
    expressiveCode(),
    // Use mdx for authoring content
    mdx(),
    // Sitemap
    sitemap(),
  ],

  // Vite plugins
  vite: {
    plugins: [
      // Styling with TailwindCSS
      tailwindcss(),
    ],
  },
});
