// @ts-check
import react from "@astrojs/react";
import starlight from "@astrojs/starlight";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";
import starlightThemeBlack from "starlight-theme-black";

// https://astro.build/config
export default defineConfig({
  site: "https://kilpi.vercel.app",

  integrations: [
    /**
     * Starlight integration for documentation
     */
    starlight({
      // Customize site
      favicon: "favicon.ico",
      title: "🛡️ Kilpi",
      tagline: "The modern authorization framework for TypeScript",
      social: {
        github: "https://github.com/jussinevavuori/kilpi",
        blueSky: "https://bsky.app/profile/jussinevavuori.com",
      },
      customCss: ["./src/styles/docs.css"],

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
          label: "Installation",
          autogenerate: { directory: "installation" },
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
          label: "Plugins",
          autogenerate: { directory: "plugins" },
        },
        {
          label: "Advanced",
          autogenerate: { directory: "advanced" },
        },
      ],

      /**
       * Custom theme
       */
      plugins: [
        starlightThemeBlack({
          navLinks: [
            {
              label: "Docs",
              link: "/getting-started/introduction",
            },
          ],
          footerText: [
            "Designed & created with ❤️ by [Jussi Nevavuori](https://www.jussinevavuori.com) in Brisbane & Helsinki. ",
            "Source code available on [GitHub](https://www.github.com/jussinevavuori/kilpi).",
            "All code is licensed under the [MIT License](https://opensource.org/licenses/MIT).",
          ].join(" "),
        }),
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
