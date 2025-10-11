import { deleteArticleAction, updateArticleAction } from "@/article-actions";
import type { Article } from "@/article-service";
import { Authorize, Kilpi } from "@/kilpi.server";
import { revalidatePath } from "next/cache";
import { Button } from "./ui/button";

export type ManageArticleFormProps = {
  article: Article;
};

export function ManageArticleForm({ article }: ManageArticleFormProps) {
  return (
    <div className="flex flex-row flex-wrap items-center gap-2">
      {/* Update article button */}
      <Authorize
        policy={Kilpi.articles.update(article)}
        Pending={
          <Button disabled variant="secondary">
            Loading ...
          </Button>
        }
        Unauthorized={(d) => (
          <Button disabled variant="secondary">
            Not authorized to {article.isPublished ? "unpublish" : "publish"}: {d?.message}
          </Button>
        )}
      >
        <form
          action={async () => {
            "use server";
            await updateArticleAction({ id: article.id, isPublished: !article.isPublished });
            await revalidatePath(`/article/${article.id}`);
          }}
        >
          <Button type="submit" variant="secondary">
            {article.isPublished ? "Unpublish" : "Publish"}
          </Button>
        </form>
      </Authorize>

      {/* Delete article button */}
      <Authorize
        policy={Kilpi.articles.delete(article)}
        Pending={
          <Button disabled variant="ghost">
            Loading ...
          </Button>
        }
        Unauthorized={(d) => (
          <Button disabled variant="ghost">
            Not authorized to delete: {d?.message}
          </Button>
        )}
      >
        <form
          action={async () => {
            "use server";
            await deleteArticleAction({ id: article.id });
            await revalidatePath(`/article/${article.id}`);
          }}
        >
          <Button type="submit" variant="ghost">
            Delete article
          </Button>
        </form>
      </Authorize>
    </div>
  );
}
