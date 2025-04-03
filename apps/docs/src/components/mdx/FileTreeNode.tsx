import { cn } from "@/utils/cn";
import { ChevronRightIcon, FileIcon } from "lucide-react";
import { useState } from "react";
import type { FileTreeNode } from "./FileTree.astro";

export type FileTreeNodeProps = {
  node: FileTreeNode;
};

export function FileTreeNode({ node }: FileTreeNodeProps) {
  // Open state
  const [open, setOpen] = useState(true);

  // Get name (only first part of name before whitespace)
  const name = node.name.split(" ")[0].trim();

  // Get comment (separated by whitespace from name)
  const comment = node.name.split(" ").slice(1).join(" ").trim();

  // Is considered file if has any file extension at end of name
  const isFile = name.match(/\.[a-zA-Z]+$/);

  return (
    <div>
      {isFile ? (
        <div className="hover:bg-muted-fg/10 flex items-center gap-2 text-nowrap rounded px-1 font-mono">
          <FileIcon />
          <span>{name}</span>
          {comment ? <span className="opacity-50">{comment}</span> : null}
        </div>
      ) : (
        <div className="flex flex-col gap-1">
          <button
            className="hover:bg-muted-fg/10 flex items-center gap-2 rounded px-1 font-mono"
            onClick={() => setOpen((prev) => !prev)}
          >
            <ChevronRightIcon
              className={cn("transition-transform duration-100", open ? "rotate-90" : "")}
            />
            <span>{name}</span>
          </button>

          <ul
            className={cn(
              "border-muted-fg/30 ml-3 flex flex-col gap-1 border-l pl-3",
              open ? "" : "hidden",
            )}
          >
            {node.children.map((child) => (
              <li key={child.name}>
                <FileTreeNode node={child} />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
