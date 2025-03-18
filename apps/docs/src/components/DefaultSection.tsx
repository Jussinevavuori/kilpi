import { cn } from "@/utils/cn";

export type DefaultSectionProps = React.HTMLAttributes<HTMLDivElement>;

export function DefaultSection({
  children,
  className,
  ...sectionProps
}: DefaultSectionProps) {
  return (
    <section
      className={cn(
        "max-w-[var(--sl-content-width)] !mx-auto flex flex-col gap-16 px-[var(--sl-content-pad-x)]",
        className,
      )}
      {...sectionProps}
    >
      {children}
    </section>
  );
}
