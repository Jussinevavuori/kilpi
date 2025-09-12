import { deleteArticleAction, updateArticleAction } from "@/article-actions";
import { Article } from "@/article-service";
import { ClientAccess } from "@/kilpi.client";
import { revalidatePath } from "next/cache";
import { Button } from "./ui/button";

export type ManageArticleFormProps = {
  article: Article;
};

export function ManageArticleForm({ article }: ManageArticleFormProps) {
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
        Unauthorized={
          <Button disabled variant="secondary">
            Not authorized to {article.isPublished ? "unpublish" : "publish"}
          </Button>
        }
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
        Unauthorized={
          <Button disabled variant="ghost">
            Not authorized to delete
          </Button>
        }
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
      </ClientAccess>
    </div>
  );
}
