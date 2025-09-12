import Link from "next/link";

export default function NotFoundPage() {
  return (
    <main className="flex flex-col gap-16 min-h-[70vh]">
      <div className="flex flex-col gap-4">
        <h1 className="text-5xl font-bold tracking-tight">Not found</h1>
        <p className="text-muted-foreground">
          Could not find the page you were looking for. Return{" "}
          <Link className="underline" href="/">
            home
          </Link>
          .
        </p>
      </div>
    </main>
  );
}
