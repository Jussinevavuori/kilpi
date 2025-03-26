import { ArticleService } from "@/data-layer/articleService";
import { ArticleCard } from "./ArticleCard";

export async function ArticlesList() {
  const articles = await ArticleService.listArticles.protect();

  return (
    <div
      className="grid gap-8"
      style={{
        gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
      }}
    >
      {articles.map((article) => (
        <ArticleCard key={article.id} article={article} />
      ))}
    </div>
  );
}
