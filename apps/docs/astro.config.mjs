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
    plugins: [tailwindcss()],
  },

  // Configure redirects
  redirects: {
    // Docs -> Introduction
    "/docs": "/docs/getting-started/introduction",
    // All [...docs] without /docs/ prefix to /docs/[...docs]
    ...Object.fromEntries(
      // Load all `.mdx` files from the `docs` directory
      Object.keys(await import.meta.glob("./docs/**/*.mdx")).map((path) => [
        // The path is e.g. `./docs/getting-started/introduction.mdx`
        // Map to: "/getting-started/introduction" -> "docs/getting-started/introduction"
        path.replace(".mdx", "").replace("./docs/", ""),
        path.replace(".mdx", "").replace("./docs/", "/docs/"),
      ]),
    ),
  },
});
