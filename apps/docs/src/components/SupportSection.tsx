import { DefaultSection } from "./DefaultSection";

export function SupportSection() {
  const HREF = "https://www.buymeacoffee.com/nevavuoriji";

  return (
    <DefaultSection id="support" className="py-16 items-center text-center gap-4">
      <a href={HREF} target="_blank">
        <img
          src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png"
          alt="Buy Me A Coffee"
          className="h-[60px] w-[217px]"
        />
      </a>
      <p className="text-sm text-muted-foreground">
        Help{" "}
        <a className="underline" href={HREF}>
          support development
        </a>{" "}
        for the price of a coffee.{" "}
        <a href="/getting-started/support" className="underline">
          Read more.
        </a>
      </p>
    </DefaultSection>
  );
}
