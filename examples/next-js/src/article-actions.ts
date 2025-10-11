"use server";

import "server-only";

import { redirect } from "next/navigation";
import { z } from "zod";
import { ArticleService } from "./article-service";

/**
 * Wrapper for ArticleService.createArticle, redirects to the newly created article
 */
const createArticleAction_schema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
});
export async function createArticleAction(
  raw: z.infer<typeof createArticleAction_schema>,
) {
  const input = createArticleAction_schema.parse(raw);
  const id = await ArticleService.createArticle(input);
  redirect(`/article/${id}`);
}

/**
 * Wrapper for ArticleService.updateArticle
 */
const updateArticleAction_schema = z.object({
  id: z.string(),
  isPublished: z.boolean(),
});
export async function updateArticleAction(
  raw: z.infer<typeof updateArticleAction_schema>,
) {
  const input = updateArticleAction_schema.parse(raw);
  await ArticleService.updateArticle(input);
}

/**
 * Wrapper for ArticleService.deleteArticle
 */
const deleteArticleAction_schema = z.object({
  id: z.string(),
});
export async function deleteArticleAction(
  raw: z.infer<typeof deleteArticleAction_schema>,
) {
  const input = deleteArticleAction_schema.parse(raw);
  await ArticleService.deleteArticle(input.id);
}
