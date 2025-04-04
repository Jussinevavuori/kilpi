import { Content, Root, Trigger } from "@radix-ui/react-collapsible";
import { ChevronRightIcon } from "lucide-react";

export type CollapsibleProps = {
  children?: React.ReactNode;
  defaultOpen?: boolean;
  title: string;
};

export function Collapsible(props: CollapsibleProps) {
  return (
    <Root
      defaultOpen={props.defaultOpen}
      className="bg-muted-bg/30 shadow-fg/5 mt-4 rounded border shadow-lg"
    >
      <Trigger className="group/trigger flex w-full cursor-pointer items-center gap-2 p-4 text-left">
        <p className="text-sm font-semibold">{props.title}</p>

        <ChevronRightIcon className="ml-auto group-data-[state=open]/trigger:rotate-90" />
      </Trigger>
      <Content>
        <hr />
        <div className="p-4">{props.children}</div>
      </Content>
    </Root>
  );
}
