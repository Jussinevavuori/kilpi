import { cn } from "@/utils/cn";
import type { SidebarFolder } from "../docs/getSidebar";

export type MobileNavFolderProps = {
  folder: SidebarFolder;
  linkClassName: (className?: string) => string;
};

export function MobileNavFolder(props: MobileNavFolderProps) {
  return (
    <div>
      {props.folder.level > 0 && (
        <p className="text-muted-fg flex h-8 items-center text-xs font-medium">
          {props.folder.name}
        </p>
      )}

      {props.folder.children.map((child) =>
        "children" in child ? (
          <div key={child.id} className={cn("flex flex-col", child.level > 1 ? "pl-4" : "")}>
            <MobileNavFolder folder={child} key={child.id} linkClassName={props.linkClassName} />
          </div>
        ) : (
          <a href={`/docs/${child.doc.id}`} key={child.doc.id} className={props.linkClassName()}>
            {child.doc.data.sidebar?.label || child.doc.data.title}
          </a>
        ),
      )}
    </div>
  );
}
