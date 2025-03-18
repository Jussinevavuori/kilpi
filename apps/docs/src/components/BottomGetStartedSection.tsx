import { ArrowRightIcon } from "lucide-react";
import { Button } from "./Button";
import { FullWidthSection } from "./FullWidthSection";

export function BottomGetStartedSection() {
  return (
    <FullWidthSection id="bottom-get-started">
      <div className="flex flex-col gap-4">
        <h2 className="text-3xl text-center font-bold tracking-tight sm:text-4xl">
          Ready to Get Started?
        </h2>

        <p className="max-w-xl text-center !mx-auto text-muted-foreground">
          Dive into our comprehensive documentation and start implementing Kilpi
          in your project today.
        </p>
      </div>

      <Button asChild size="lg" className="gap-2 w-fit !mx-auto">
        <a href="/getting-started/introduction">
          Read the Docs
          <ArrowRightIcon className="h-4 w-4" />
        </a>
      </Button>
    </FullWidthSection>
  );
}
