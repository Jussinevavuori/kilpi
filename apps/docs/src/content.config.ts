import { docsLoader } from "@astrojs/starlight/loaders";
import { docsSchema } from "@astrojs/starlight/schema";
import { glob } from "astro/loaders";
import { defineCollection, z } from "astro:content";

export const collections = {
  /**
   * Starlight default docs collection
   */
  docs: defineCollection({ loader: docsLoader(), schema: docsSchema() }),

  /**
   * Custom blog collection from /content/blog markdown entries
   */
  blog: defineCollection({
    loader: glob({
      pattern: "**/*.(md|mdx)",
      base: "./src/content/blog",
    }),
    schema: z.object({
      title: z.string(),
      subtitle: z.string().optional(),
      author: z.string(),
      authorUrl: z.string().optional(),
      authorImage: z.string().url().optional(),
      date: z.date(),
      summary: z.string(),
      recommended: z.boolean().optional(),
    }),
  }),
};
