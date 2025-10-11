import { ArticleService } from "@/article-service";
import { Kilpi } from "@/kilpi.server";
import { ArticleCard } from "./ArticleCard";

export async function ArticlesList() {
  const { subject } = await Kilpi.always().authorize().assert();

  const articles = await ArticleService.listArticles.authorized({
    isAdmin: subject?.role === "admin",
    userId: subject?.id,
  });

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
