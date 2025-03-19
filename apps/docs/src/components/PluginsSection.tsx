import { DefaultSection } from "./DefaultSection";
import { SvgLogos } from "./SvgLogos";

export const CATEGORIES = [
  {
    title: "Frameworks",
    description: "Adapt your UI to your authorization policies.",
    items: [
      {
        title: "React Server Components",
        description: "Automatic RSC scope and <Access /> component.",
        Icon: SvgLogos.React,
        link: "/plugins/react-server-components",
      },
    ],
  },
];

export function PluginsSection() {
  return (
    <DefaultSection id="plugins" className="py-40 flex flex-col gap-16">
      <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
        Plugins to fit your use case
      </h2>

      {CATEGORIES.map((category, categoryIndex) => (
        <div className="flex flex-col gap-4" key={categoryIndex}>
          <div className="flex flex-col gap-1">
            <h3 className="text-xl font-semibold">{category.title}</h3>
            <p className="text-muted-foreground">{category.description}</p>
          </div>

          <div
            className="grid grid-cols-1 gap-4"
            style={{
              gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            }}
          >
            {category.items.map((item, itemIndex) => (
              <a
                className="flex flex-col gap-2 rounded-lg border bg-card p-4 shadow-sm"
                key={itemIndex}
                href={item.link}
              >
                <div className="flex items-center gap-2">
                  <item.Icon className="size-4" />
                  <p className="font-semibold">{item.title}</p>
                </div>
                <p className="text-muted-foreground text-sm">
                  {item.description}
                </p>
              </a>
            ))}
            <div className="flex flex-col bg-muted/50 justify-center items-center gap-2 rounded-lg p-4 text-muted-foreground">
              And more to come...
            </div>
          </div>
        </div>
      ))}

      <div className="flex flex-col gap-1">
        <h3 className="text-xl font-semibold">Couldn't find yours?</h3>
        <p className="text-muted-foreground max-w-xl">
          Kilpi is framework agnostic and can always be used without any plugins
          or component libraries. You may also{" "}
          <a
            href="https://github.com/Jussinevavuor/kilpi/issues/new"
            className="underline"
          >
            request a new integration
          </a>{" "}
          or{" "}
          <a
            href="https://jussinevavuori.com#contact"
            className="underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            contact me
          </a>{" "}
          to request support.
        </p>
      </div>
    </DefaultSection>
  );
}
