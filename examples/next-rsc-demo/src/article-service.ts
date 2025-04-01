import "server-only";

import { db } from "@/db";
import { Kilpi } from "@/kilpi";
import { ClientSafeError } from "@/next-safe-action-client";
import { nanoid } from "nanoid";
import { z } from "zod";

/**
 * Schema for validating articles.
 */
export const articleSchema = z.object({
  id: z.string(),
  userId: z.string(),
  title: z.string(),
  content: z.string(),
  createdAt: z.coerce.date(),
  isPublished: z.coerce.boolean(),

  authorName: z.string(),
});

/**
 * Export type of article.
 */
export type Article = z.infer<typeof articleSchema>;

/**
 * Simple data-layer to interact with articles.
 */
export const ArticleService = {
  /**
   * List all articles using a protected query.
   *
   * https://kilpi.vercel.app/docs/guides/protecting-queries/
   */
  listArticles: Kilpi.query(
    async () => {
      const sql = `
			SELECT
				articles.*,
				user.name as authorName
			FROM
				articles
			INNER JOIN
				user
			ON
				articles.userId = user.id;
		`;

      // Query articles with author name from user table
      const articles = await db.query(sql).all();

      // Parse articles and return
      return articles.map((article) => articleSchema.parse(article));
    },
    {
      // Return only articles which the user is allowed to read using Kilpi.filter.
      // https://kilpi.vercel.app/docs/guides/protecting-queries/#using-kilpifilter
      async protector({ output: articles }) {
        return Kilpi.filter("articles:read", articles);
      },
    },
  ),

  /**
   * Get one article by ID using a protected query.
   *
   * https://kilpi.vercel.app/docs/guides/protecting-queries/
   */
  getArticleById: Kilpi.query(
    async (id: string) => {
      const sql = `
			SELECT
				articles.*,
				user.name as authorName
			FROM
				articles
			INNER JOIN
				user
			ON
				articles.userId = user.id
			WHERE
				articles.id = $id;
		`;

      // Query article with author name from user table
      const article = await db.query(sql).get({ $id: id });
      if (!article) return null;

      // Parse article and return
      return articleSchema.parse(article);
    },
    {
      // Ensure user has access using `.authorize()` (throws on unauthorized).
      async protector({ output: article }) {
        if (article) await Kilpi.authorize("articles:read", article);
        return article;
      },
    },
  ),

  /**
   * Create an article.
   */
  async createArticle(data: { title: string; content: string }) {
    const sql = `
			INSERT INTO
				articles (id, title, content, userId, createdAt, isPublished)
			VALUES
				($id, $title, $content, $userId, $createdAt, 0)
		`;

    // Authorize and get authorized user
    const user = await Kilpi.authorize("articles:create");

    // Get ID for article
    const id = nanoid();

    // Insert article
    await db.query(sql).run({
      $id: id,
      $title: data.title,
      $content: data.content,
      $userId: user.id,
      $createdAt: new Date().toISOString(),
    });

    // Return ID
    return id;
  },

  /**
   * Update article
   */
  async updateArticle(data: { id: string; isPublished: boolean }) {
    const sql = `
			UPDATE
				articles
			SET
				isPublished = $isPublished
			WHERE
				id = $id;
		`;

    // Get article
    const article = await this.getArticleById.protect(data.id);
    if (!article) throw new ClientSafeError("Article not found");

    // Authorize update on article
    await Kilpi.authorize("articles:update", article);

    // Update article
    await db.query(sql).run({
      $id: data.id,
      $isPublished: data.isPublished,
    });
  },

  /**
   * Delete article
   */
  async deleteArticle(id: string) {
    const sql = `
			DELETE FROM
				articles
			WHERE
				id = $id;
		`;

    // Get article
    const article = await this.getArticleById.protect(id);
    if (!article) throw new ClientSafeError("Article not found");

    // Authorize delete on article
    await Kilpi.authorize("articles:delete", article);

    // Delete article
    await db.query(sql).run({ $id: id });
  },
};
