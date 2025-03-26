"use server";

import "server-only";

import { ActionClient } from "@/next-safe-action-client";
import { redirect } from "next/navigation";
import { z } from "zod";
import { ArticleService } from "./articleService";

/**
 * Wrapper for ArticleService.createArticle, redirects to the newly created article
 */
export const createArticleAction = ActionClient.schema(
  z.object({
    title: z.string().min(1),
    content: z.string().min(1),
  }),
).action(async ({ parsedInput }) => {
  const id = await ArticleService.createArticle(parsedInput);
  redirect(`/article/${id}`);
});

/**
 * Wrapper for ArticleService.updateArticle
 */
export const updateArticleAction = ActionClient.schema(
  z.object({
    id: z.string(),
    isPublished: z.boolean(),
  }),
).action(async ({ parsedInput }) => {
  await ArticleService.updateArticle(parsedInput);
});

/**
 * Wrapper for ArticleService.deleteArticle
 */
export const deleteArticleAction = ActionClient.schema(
  z.object({
    id: z.string(),
  }),
).action(async ({ parsedInput }) => {
  await ArticleService.deleteArticle(parsedInput.id);
});
