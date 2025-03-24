import { DefaultSection } from "./DefaultSection";

export type BlogContainerProps = {
  children: React.ReactNode;
};

export function BlogContainer({ children }: BlogContainerProps) {
  return (
    <DefaultSection>
      <article>{children}</article>
    </DefaultSection>
  );
}
