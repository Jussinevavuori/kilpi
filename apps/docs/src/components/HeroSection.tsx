import { ArrowRightIcon, GithubIcon } from "lucide-react";
import { Button } from "./Button";
import { CodeBlock } from "./CodeBlock";
import { DefaultSection } from "./DefaultSection";

export function HeroSection() {
  return (
    <DefaultSection id="hero" className="py-20">
      <div className="flex flex-col items-center gap-8 text-center">
        {/* Header text */}
        <div className="flex flex-col gap-4">
          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
            Authorization made simple
          </h1>
          <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
            Kilpi is the open-source TypeScript authorization library designed for developers who
            need flexible, powerful, and intuitive authorization.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mt-6">
          <Button asChild size="lg" variant="default">
            <a href="/getting-started/introduction">
              Get started
              <ArrowRightIcon className="h-4 w-4" />
            </a>
          </Button>
          <Button asChild size="lg" variant="outline" className="gap-2">
            <a
              href="https://github.com/jussinevavuori/kilpi"
              target="_blank"
              rel="noopener noreferrer"
            >
              <GithubIcon className="h-4 w-4" />
              Star on GitHub
            </a>
          </Button>
        </div>

        {/* Code examples */}
        <div className="flex flex-col gap-4">
          <p className="text-muted-foreground">Make your authorization a one-liner.</p>
          <CodeBlock language="tsx" content={`await Kilpi.authorize("docs:update", doc);`} />
          <CodeBlock
            language="tsx"
            content={`
							<Access to="docs:update" on={doc}>
							  <EditDocumentButton doc={doc} />
							</Access>
							`}
          />
          <CodeBlock language="tsx" content={`if (await Kilpi.isAuthorized("docs:create"))`} />
          <CodeBlock language="tsx" content={`const doc = await getDocument.protect();`} />
        </div>

        {/* Credits */}
        <p className="text-sm text-muted-foreground">
          Designed and created by{" "}
          <a
            href="https://jussinevavuori.com"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            Jussi Nevavuori
          </a>{" "}
          with ❤️ in Brisbane & Helsinki
        </p>
      </div>
    </DefaultSection>
  );
}
