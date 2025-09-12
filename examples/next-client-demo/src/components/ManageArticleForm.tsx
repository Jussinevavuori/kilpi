"use client";

import { Article } from "@/article-service";
import { ClientAccess } from "@/kilpi.client";
import { Button } from "./ui/button";

export type ManageArticleFormProps = {
  article: Article;

  updateArticle: () => Promise<void>;
  deleteArticle: () => Promise<void>;
};

export function ManageArticleForm({ article, ...props }: ManageArticleFormProps) {
  return (
    <div className="flex flex-row items-center gap-2">
      {/* Update article button */}
      <ClientAccess
        to="articles:update"
        on={article}
        Loading={
          <Button disabled variant="secondary">
            Loading ...
          </Button>
        }
        Error={
          <Button disabled variant="secondary">
            Error checking access
          </Button>
        }
        Unauthorized={
          <Button disabled variant="secondary">
            Not authorized to {article.isPublished ? "unpublish" : "publish"}
          </Button>
        }
      >
        <form action={props.updateArticle}>
          <Button type="submit" variant="secondary">
            {article.isPublished ? "Unpublish" : "Publish"}
          </Button>
        </form>
      </ClientAccess>

      {/* Delete article button */}
      <ClientAccess
        to="articles:delete"
        on={article}
        Loading={
          <Button disabled variant="ghost">
            Loading ...
          </Button>
        }
        Error={
          <Button disabled variant="ghost">
            Error checking access
          </Button>
        }
        Unauthorized={
          <Button disabled variant="ghost">
            Not authorized to delete
          </Button>
        }
      >
        <form action={props.deleteArticle}>
          <Button type="submit" variant="ghost">
            Delete article
          </Button>
        </form>
      </ClientAccess>
    </div>
  );
}
