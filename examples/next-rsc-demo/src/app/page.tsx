import { ArticleCard } from "@/components/ArticleCard";
import { ArticleService } from "@/data-layer/articleService";

export default async function Home() {
  const articles = await ArticleService.listArticles.protect();

  return (
    <main className="flex flex-col gap-16">
      <div className="flex flex-col gap-4">
        <h1 className="text-5xl font-bold tracking-tight">All articles</h1>
        <p className="text-muted-foreground">
          Read up on the latest mocked events to stay up to date.
        </p>
      </div>

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
    </main>
  );
}
