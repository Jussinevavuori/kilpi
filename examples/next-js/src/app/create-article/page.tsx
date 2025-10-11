import { CreateArticleForm } from "@/components/CreateArticleForm";
import { Kilpi } from "@/kilpi.server";
import { headers } from "next/headers";

export default async function CreateArticlePage() {
  await headers();

  // Ensure user is authorized to create articles
  await Kilpi.articles.create().authorize().assert();

  return (
    <main className="flex w-full flex-col gap-8">
      <h1 className="text-3xl font-bold tracking-tight">Create new article</h1>

      <CreateArticleForm />
    </main>
  );
}
