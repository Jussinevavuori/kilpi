import { ArticleService } from "@/article-service";
import { ManageArticleForm } from "@/components/ManageArticleForm";
import { cn } from "@/utils/cn";
import { redirect } from "next/navigation";

export default async function ArticlePage(props: {
  params: Promise<{
    articleId: string;
  }>;
}) {
  // Get article ID and fetch article. Authorization happens when calling `.protect()` and this
  // page does not have to worry about who has access to which articles.
  const { articleId } = await props.params;
  const article = await ArticleService.getArticleById.protect(articleId);
  if (!article) redirect("/");

  return (
    <article className="mx-auto flex w-full max-w-lg flex-col gap-8">
      <h1 className="text-3xl font-bold tracking-tight">{article.title}</h1>

      <p className="text-sm">
        By <span className="font-medium">{article.authorName}</span> on{" "}
        <span className="font-medium">{article.createdAt.toLocaleDateString()}</span>
      </p>

      <p>{article.content}</p>

      <div className="flex flex-row items-center gap-2">
        <div
          className={cn(
            "size-2 rounded-full",
            article.isPublished ? "bg-green-500" : "bg-slate-300",
          )}
        />

        <p className="text-muted-foreground text-sm">
          {article.isPublished ? "Published" : "Draft"}
        </p>
      </div>

      <hr />
      <ManageArticleForm article={article} />
    </article>
  );
}
