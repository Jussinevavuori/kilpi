import { ArticlesList } from "@/components/ArticlesList";
import { Suspense } from "react";

export default async function Home() {
  return (
    <main className="flex flex-col gap-16">
      <div className="flex flex-col gap-4">
        <h1 className="text-5xl font-bold tracking-tight">All articles</h1>
        <p className="text-muted-foreground">
          Read up on the latest mocked events to stay up to date.
        </p>
      </div>

      <Suspense
        fallback={<p className="text-muted-foreground animate-pulse">Loading articles...</p>}
      >
        <ArticlesList />
      </Suspense>
    </main>
  );
}
