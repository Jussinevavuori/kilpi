import { DefaultSection } from "./DefaultSection";
import { SvgLogos } from "./SvgLogos";

export const COMPONENTS = [
  {
    title: "React Server Components",
    Icon: SvgLogos.React,
    link: "/integrations/react-server-components",
  },
];

export const ADAPTERS = [
  {
    title: "Next",
    Icon: SvgLogos.Next,
    link: "/integrations/next",
  },
];

export function IntegrationsSection() {
  return (
    <DefaultSection id="integrations" className="py-40 flex flex-col gap-16">
      <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
        Ready-made integrations
      </h2>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h3 className="text-xl font-semibold">Components</h3>
          <p className="text-muted-foreground">
            Adapt your UI to your authorization policies.
          </p>
        </div>

        <div
          className="grid grid-cols-1 gap-4"
          style={{
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
          }}
        >
          {COMPONENTS.map((item, index) => (
            <a
              className="flex flex-col gap-2 rounded-lg border bg-card p-4 shadow-sm"
              key={index}
              href={item.link}
            >
              <div className="flex items-center gap-2">
                <item.Icon className="size-4" />
                <p className="font-semibold">{item.title}</p>
              </div>
            </a>
          ))}
          <div className="flex flex-col gap-2 rounded-lg border p-4 shadow-sm text-muted-foreground">
            And more to come...
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h3 className="text-xl font-semibold">Adapters</h3>
          <p className="text-muted-foreground">
            Configure Kilpi faster to work with your framework of choice.
          </p>
        </div>

        <div
          className="grid grid-cols-1 gap-4"
          style={{
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
          }}
        >
          {ADAPTERS.map((item, index) => (
            <a
              className="flex flex-col gap-2 rounded-lg border bg-card p-4 shadow-sm"
              key={index}
              href={item.link}
            >
              <div className="flex items-center gap-2">
                <item.Icon className="size-4" />
                <p className="font-semibold">{item.title}</p>
              </div>
            </a>
          ))}
          <div className="flex flex-col gap-2 rounded-lg border p-4 shadow-sm text-muted-foreground">
            And more to come...
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <h3 className="text-xl font-semibold">Couldn't find yours?</h3>
        <p className="text-muted-foreground max-w-xl">
          Kilpi is framework agnostic and can always be used without an adapter
          or a component library. You may also{" "}
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
