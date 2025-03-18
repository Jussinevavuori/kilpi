// @ts-check
import react from "@astrojs/react";
import starlight from "@astrojs/starlight";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

// https://astro.build/config
export default defineConfig({
  site: "https://kilpi.vercel.app",

  integrations: [
    /**
     * Starlight integration for documentation
     */
    starlight({
      // Customize site
      title: "Kilpi",
      tagline: "The modern authorization framework for TypeScript",
      social: {
        github: "https://github.com/jussinevavuori/kilpi",
      },
      customCss: ["./src/styles/global.css"], // Tailwind

      // Configure sidebar
      sidebar: [
        {
          label: "Home",
          link: "/",
        },
        {
          label: "Getting started",
          autogenerate: { directory: "getting-started" },
        },
        {
          label: "Integrations",
          autogenerate: { directory: "integrations" },
        },
        {
          label: "Concepts",
          autogenerate: { directory: "concepts" },
        },
        {
          label: "Guides",
          autogenerate: { directory: "guides" },
        },
        {
          label: "Reference",
          items: [
            {
              label: "@kilpi/core",
              autogenerate: { directory: "reference/core" },
            },
            {
              label: "@kilpi/react-server",
              autogenerate: { directory: "reference/react-server" },
            },
            {
              label: "@kilpi/next",
              autogenerate: { directory: "reference/next" },
            },
          ],
        },
      ],
    }),

    /**
     * Enable React
     */
    react(),
  ],

  /**
   * Add Tailwind CSS
   */
  vite: {
    plugins: [tailwindcss()],
  },
});
