import { CreateArticleForm } from "@/components/CreateArticleForm";
import { Kilpi } from "@/kilpi";
import { headers } from "next/headers";

export default async function CreateArticlePage() {
  await headers();

  // Ensure user is authorized to create articles
  await Kilpi.authorize("articles:create");

  return (
    <main className="flex flex-col gap-8 w-full">
      <h1 className="text-3xl font-bold tracking-tight">Create new article</h1>

      <CreateArticleForm />
    </main>
  );
}
