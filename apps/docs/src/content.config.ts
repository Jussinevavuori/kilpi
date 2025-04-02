import { glob } from "astro/loaders";
import { defineCollection, z } from "astro:content";

export const collections = {
  /**
   * Custom docs collection from /content/docs markdown entries
   */
  docs: defineCollection({
    loader: glob({
      pattern: "**/*.(md|mdx)",
      base: "./docs",
    }),
    schema: z.object({
      title: z.string(),
      description: z.string().optional(),
      draft: z.boolean().optional(),
      sidebar: z
        .object({
          order: z.number().optional(),
          badge: z.string().optional(),
          label: z.string().optional(),
          order: z.number().optional(),
        })
        .optional(),
    }),
  }),
  /**
   * Custom blog collection from /content/blog markdown entries
   */
  blog: defineCollection({
    loader: glob({
      pattern: "**/*.(md|mdx)",
      base: "./blog",
    }),
    schema: z.object({
      title: z.string(),
      subtitle: z.string().optional(),
      draft: z.boolean().optional(),
      author: z.string(),
      authorUrl: z.string().optional(),
      authorImage: z.string().url().optional(),
      date: z.date(),
      summary: z.string(),
      recommended: z.boolean().optional(),
    }),
  }),
};
