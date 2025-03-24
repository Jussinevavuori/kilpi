import { cn } from "@/utils/cn";

export type DefaultSectionProps = React.HTMLAttributes<HTMLDivElement> & {
  enableDefaultStyles?: boolean;
};

export function DefaultSection({
  children,
  className,
  enableDefaultStyles,
  ...sectionProps
}: DefaultSectionProps) {
  return (
    <section
      className={cn(
        "max-w-[var(--sl-content-width)] !mx-auto flex flex-col gap-16 px-[var(--sl-content-pad-x)]",
        enableDefaultStyles ? "" : "not-content",
        className,
      )}
      {...sectionProps}
    >
      {children}
    </section>
  );
}
