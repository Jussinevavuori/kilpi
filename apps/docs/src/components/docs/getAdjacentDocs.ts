import type { CollectionEntry } from "astro:content";
import type { SidebarFolder } from "./getSidebar";

/**
 * In-order tree traversal of sidebar.
 */
export function getAdjacentDocs(sidebar: SidebarFolder, currentDoc: CollectionEntry<"docs">) {
  // Collect all documents in the sidebar in order
  const docs: CollectionEntry<"docs">[] = [];

  // Recursive, in-order depth-first traversal function
  function traverse(folder: SidebarFolder) {
    for (const child of folder.children) {
      if ("doc" in child) docs.push(child.doc);
      else traverse(child);
    }
  }

  // Traverse the sidebar from the root
  traverse(sidebar);

  // Find the current document in the list
  const currentIndex = docs.findIndex((doc) => doc.id === currentDoc.id);

  // Return the adjacent documents if any
  return {
    prev: currentIndex > 0 ? docs[currentIndex - 1] : undefined,
    next: currentIndex < docs.length - 1 ? docs[currentIndex + 1] : undefined,
  };
}
