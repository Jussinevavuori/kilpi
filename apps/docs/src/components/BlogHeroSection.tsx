import { DefaultSection } from "./DefaultSection";

export function BlogHeroSection() {
  return (
    <DefaultSection id="blog-hero" className="py-20">
      <div className="flex flex-col gap-8">
        {/* Header text */}
        <div className="flex flex-col gap-4">
          <h1 className="text-4xl font-bold tracking-tight">Articles</h1>
          <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
            Latest news, updates, and tutorials from Kilpi.
          </p>
        </div>
      </div>
    </DefaultSection>
  );
}
