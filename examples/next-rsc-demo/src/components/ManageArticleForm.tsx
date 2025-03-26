import { deleteArticleAction, updateArticleAction } from "@/data-layer/articleActions";
import { Article } from "@/data-layer/articleService";
import { Access } from "@/kilpi";
import { forceRevalidateCurrentPage } from "@/utils/forceRevalidateCurrentPage";
import { Button } from "./ui/button";

export type ManageArticleFormProps = {
  article: Article;
};

export function ManageArticleForm(props: ManageArticleFormProps) {
  return (
    <div className="flex flex-row gap-2 items-center">
      {/* Update article button */}
      <Access
        to="articles:update"
        on={props.article}
        Loading={
          <Button disabled variant="secondary">
            Loading ...
          </Button>
        }
        Unauthorized={
          <Button disabled variant="secondary">
            Not authorized to {props.article.isPublished ? "unpublish" : "publish"}
          </Button>
        }
      >
        <form
          onSubmit={async () => {
            "use server";
            await updateArticleAction({
              id: props.article.id,
              isPublished: !props.article.isPublished,
            });
            await forceRevalidateCurrentPage();
          }}
        >
          <Button type="submit" variant="secondary">
            {props.article.isPublished ? "Unpublish" : "Publish"}
          </Button>
        </form>
      </Access>

      {/* Delete article button */}
      <Access
        to="articles:delete"
        on={props.article}
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
          onSubmit={async () => {
            "use server";
            await deleteArticleAction({ id: props.article.id });
            await forceRevalidateCurrentPage();
          }}
        >
          <Button type="submit" variant="ghost">
            Delete article
          </Button>
        </form>
      </Access>
    </div>
  );
}
