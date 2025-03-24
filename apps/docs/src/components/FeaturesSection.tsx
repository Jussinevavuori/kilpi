import {
  BicepsFlexedIcon,
  BrainCircuitIcon,
  CodeIcon,
  DatabaseZapIcon,
  FingerprintIcon,
  GlobeLockIcon,
  LaptopIcon,
  Loader2Icon,
  MonitorSmartphoneIcon,
  NotebookTabsIcon,
  PlugZapIcon,
  PuzzleIcon,
  SearchCodeIcon,
  ShieldCheckIcon,
  ToyBrickIcon,
  UnplugIcon,
} from "lucide-react";
import { FullWidthSection } from "./FullWidthSection";

const FEATURES = [
  {
    title: "Framework agnostic",
    description:
      "Bring any framework. Kilpi works seamlessly with your existing tech stack, with or without an existing integration.",
    Icon: PlugZapIcon,
  },
  {
    title: "Server-first authorization",
    description:
      "Kilpi is designed for server-first applications and runs all authorizations on the server for security.",
    Icon: DatabaseZapIcon,
  },
  {
    title: "Any auth provider",
    description:
      "Better-auth, Next-auth, Lucia, Auth0, Clerk or rolled your own? We support all auth providers via the Subject API.",
    Icon: FingerprintIcon,
  },
  {
    title: "Policies as code",
    description:
      "Implement policies in type-safe TypeScript for better maintainability, readability and the most flexible authorization API.",
    Icon: CodeIcon,
  },
  {
    title: "Async policies",
    description:
      "All policies are functions, allowing you to fetch data from your database, API, or any other source.",
    Icon: Loader2Icon,
  },
  {
    title: "All authorization models",
    description:
      "Supports RBAC, ABAC, ReBAC and any authorization model as simple or as complex as you need.",
    Icon: BicepsFlexedIcon,
  },
  {
    title: "Protected queries",
    description:
      "Wrap your queries in a protective layer to ensure no-one can ever access data without authorization (optional).",
    Icon: PuzzleIcon,
  },
  {
    title: "Plugin API & Library",
    description:
      "Extend Kilpi with ready-made & custom plugins to fit your use case. See below for list of plugins.",
    Icon: UnplugIcon,
  },
  {
    title: "Developer-friendly API",
    description:
      "Clean, simple, and intuitive API designed with developer experience in mind. We aim to make authorization a one-liner.",
    Icon: BrainCircuitIcon,
  },
  {
    title: "Hassle-free type-safety",
    description:
      "Minimal type definitions. Maximal inference. Type-safe everything. Subject narrowing. We promise the best TypeScript authorization experience.",
    Icon: SearchCodeIcon,
  },
  {
    title: "Production tested",
    description:
      "Battle-tested in production environments to ensure reliability and validate the design.",
    Icon: ShieldCheckIcon,
  },
];

const ROADMAP = [
  {
    title: "Audit plugin",
    description: "Track and log authorization decisions for compliance and debugging.",
    Icon: NotebookTabsIcon,
  },
  {
    title: "Authorization endpoint",
    description: "A secure server endpoint for requesting authorization decisions.",
    Icon: GlobeLockIcon,
  },
  {
    title: "Specialized RBAC API",
    description: "An improved way to define your policies for Role-Based Access Control systems.",
    Icon: LaptopIcon,
  },
  {
    title: "Client-side authorization",
    description:
      "A new API for using Kilpi on the client-side by connecting to the authorization endpoint to request authorization decisions.",
    Icon: LaptopIcon,
  },
  {
    title: "Client-only authorization",
    description: "An alternative API for client-only SPAs who don't require a server.",
    Icon: MonitorSmartphoneIcon,
  },
  {
    title: "More pre-made plugins",
    description: "More features and support for even more frameworks, libraries and services.",
    Icon: ToyBrickIcon,
  },
];

export function FeaturesSection() {
  return (
    <FullWidthSection id="features">
      <div className="flex flex-col gap-4">
        <h2 className="text-3xl text-center font-bold tracking-tight sm:text-4xl">
          Your authorization layer with everything your need.
        </h2>

        <p className="max-w-xl text-center !mx-auto text-muted-foreground">
          Designed to solve real problems for real applications, Kilpi was born after solving the
          same problem time after time, for client after client.
        </p>
      </div>

      <div
        className="grid grid-cols-1 gap-8"
        style={{
          gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
        }}
      >
        {FEATURES.map((feature, index) => (
          <div key={index} className="flex flex-col gap-2">
            <feature.Icon className="size-5 text-accent-500" />
            <h3 className="text-2xl font-bold tracking-tight">{feature.title}</h3>
            <p className="text-sm text-muted-foreground">{feature.description}</p>
          </div>
        ))}
      </div>

      <hr />

      <h2 className="text-xl font-semibold text-center tracking-tight">
        With much more on the roadmap...
      </h2>

      <div
        className="grid grid-cols-1 gap-8"
        style={{
          gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
        }}
      >
        {ROADMAP.map((feature, index) => (
          <div key={index} className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <feature.Icon className="size-5 text-accent-500" />
              <p className="w-fit px-2 text-sm font-medium rounded-full bg-amber-500/20">
                Upcoming
              </p>
            </div>

            <h3 className="text-2xl font-bold tracking-tight">{feature.title}</h3>
            <p className="text-sm text-muted-foreground">{feature.description}</p>
          </div>
        ))}
      </div>
    </FullWidthSection>
  );
}
