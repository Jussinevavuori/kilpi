import { cn } from "@/utils/cn";
import type { CollectionEntry } from "astro:content";
import { ChevronDownIcon } from "lucide-react";
import { useState } from "react";
import { DocsSidebarDocument } from "./DocsSidebarDocument";
import type { SidebarFolder } from "./getSidebar";

export type DocsSidebarFolderProps = {
  folder: SidebarFolder;
  currentDoc?: CollectionEntry<"docs">;
};

export function DocsSidebarFolder(props: DocsSidebarFolderProps) {
  const [isExpanded, setIsExpanded] = useState(
    props.currentDoc?.id.includes(`${props.folder.id}/`) ?? false,
  );

  // Render children: Folders rendered recursively, documents rendered with DocsSidebarDocument
  const Children = (
    <ul className="flex flex-col">
      {props.folder.children.map((item) => (
        <li key={"id" in item ? item.id : item.doc.id}>
          {"doc" in item ? (
            <DocsSidebarDocument item={item} />
          ) : (
            <DocsSidebarFolder currentDoc={props.currentDoc} folder={item} />
          )}
        </li>
      ))}
    </ul>
  );

  if (props.folder.isRoot) {
    return Children;
  }

  return (
    <div>
      <button
        onClick={() => setIsExpanded((prev) => !prev)}
        className="flex h-8 w-full cursor-pointer items-center justify-between gap-2 text-sm font-semibold"
      >
        {props.folder.name}
        <ChevronDownIcon className={cn("transition-transform", !isExpanded ? "-rotate-90" : "")} />
      </button>

      {isExpanded && <div className="border-l pl-4">{Children}</div>}
    </div>
  );
}
