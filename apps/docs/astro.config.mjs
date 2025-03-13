// @ts-check
import starlight from "@astrojs/starlight";
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
      social: {
        github: "https://github.com/jussinevavuori/kilpi",
      },

      // Configure sidebar
      sidebar: [
        {
          label: "Guides",
          autogenerate: { directory: "guides" },
        },
        {
          label: "Concepts",
          autogenerate: { directory: "concepts" },
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
              label: "@kilpi/react-client",
              autogenerate: { directory: "reference/react-client" },
            },
            {
              label: "@kilpi/next",
              autogenerate: { directory: "reference/next" },
            },
          ],
        },
      ],
    }),
  ],
});
