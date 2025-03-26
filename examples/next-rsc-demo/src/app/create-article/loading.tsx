export default function LoadingPage() {
  return (
    <main className="flex flex-col gap-8 w-full">
      <h1 className="text-3xl font-bold tracking-tight">Create new article</h1>

      <p className="text-muted-foreground animate-pulse">Loading...</p>
    </main>
  );
}
