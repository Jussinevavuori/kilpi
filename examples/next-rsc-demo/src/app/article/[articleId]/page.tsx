import { ManageArticleForm } from "@/components/ManageArticleForm";
import { ArticleService } from "@/data-layer/articleService";
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
    <article className="flex flex-col gap-8 max-w-lg mx-auto w-full">
      <h1 className="text-3xl font-bold tracking-tight">{article.title}</h1>

      <p className="text-sm">
        By <span className="font-medium">{article.authorName}</span> on{" "}
        <span className="font-medium">{article.createdAt.toLocaleDateString()}</span>
      </p>

      <p>{article.content}</p>

      <div className="flex flex-row gap-2 items-center">
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
