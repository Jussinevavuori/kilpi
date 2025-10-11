import "server-only";

import { db } from "@/db";
import { nanoid } from "nanoid";
import { z } from "zod";
import { Kilpi } from "./kilpi.server";

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
   * Note, for performance purposes, the "articles.read" policy is re-implemented
   * in the SQL query (and for security, re-checked in the `authorize` function).
   *
   * https://kilpi.vercel.app/docs/concepts/protected-queries/
   */
  listArticles: Kilpi.$query(
    async (query: { userId?: string; isAdmin?: boolean }) => {
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
					articles.isPublished = 1
					OR articles.userId = $userId
					OR ${query.isAdmin ? "1=1" : "0=1"};
			`;

      // Query articles with author name from user table
      const articles = await db
        .query(sql)
        .all({ $userId: query.userId || null });

      // Parse articles and return
      return articles.map((article) => articleSchema.parse(article));
    },
    {
      async authorize({ output: articles }) {
        // Ensure has access to all articles (throws on unauthorized)
        for (const article of articles) {
          await Kilpi.articles.read(article).authorize().assert();
        }
        return articles;
      },
    },
  ),

  /**
   * Get one article by ID using a protected query.
   *
   * https://kilpi.vercel.app/docs/concepts/protected-queries/
   */
  getArticleById: Kilpi.$query(
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
      async authorize({ output: article }) {
        if (article) await Kilpi.articles.read(article).authorize().assert();
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
    const { subject } = await Kilpi.articles.create().authorize().assert();

    // Get ID for article
    const id = nanoid();

    // Insert article
    await db.query(sql).run({
      $id: id,
      $title: data.title,
      $content: data.content,
      $userId: subject.id,
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
    const article = await this.getArticleById.authorized(data.id);
    if (!article) throw new Error("Article not found");

    // Authorize update on article
    await Kilpi.articles.update(article).authorize().assert();

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
    const article = await this.getArticleById.authorized(id);
    if (!article) throw new Error("Article not found");

    // Authorize delete on article
    await Kilpi.articles.delete(article).authorize().assert();

    // Delete article
    await db.query(sql).run({ $id: id });
  },
};
