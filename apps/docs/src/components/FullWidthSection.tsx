import { cn } from "@/utils/cn";

export type FullWidthSectionProps = {
  innerClassName?: string;
} & React.HTMLAttributes<HTMLDivElement>;

export function FullWidthSection({
  children,
  className,
  innerClassName,
  ...sectionProps
}: FullWidthSectionProps) {
  return (
    <section
      className={cn(
        "py-32 bg-sl-gray-7 relative w-screen left-1/2 -translate-x-1/2",
        className,
      )}
      {...sectionProps}
    >
      <div
        className={cn(
          "max-w-[var(--sl-content-width)] !mx-auto flex flex-col gap-16 px-[var(--sl-content-pad-x)]",
          innerClassName,
        )}
      >
        {children}
      </div>
    </section>
  );
}
