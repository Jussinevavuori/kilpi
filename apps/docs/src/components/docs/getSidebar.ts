import { SIDEBAR_FOLDER_CONFIG } from "@/consts";
import { getCollection, type CollectionEntry } from "astro:content";

export type SidebarDocument = {
  doc: CollectionEntry<"docs">;
};

export type SidebarFolder = {
  children: (SidebarDocument | SidebarFolder)[];
  name?: string;
  id: string;
  path: string;
  level: number;
};

/**
 * Constructs a sidebar tree from a list of documents.
 */
export async function getSidebar() {
  // Fetch all documents
  const docs = await getCollection("docs", ({ data }) => {
    return import.meta.env.PROD ? data.draft !== true : true;
  });

  // Sidebar starts from a root node
  const sidebar: SidebarFolder = { children: [], id: "__root__", level: 0, path: "/" };

  // Add each document to the sidebar
  for (const doc of docs) {
    // The document ID represents the folders separated by "/", and finally the document file name.
    // We get all the folder IDs by splitting the document ID by "/" and removing the last element,
    const folderIds = doc.id.split("/").slice(0, -1);

    // Traverse the tree until the correct folder is found. Create all required folders in the path.
    const folder = folderIds.reduce((currentFolder, folderId) => {
      // Find folder by ID
      let foundFolder = currentFolder.children.find(
        (child) => "id" in child && child.id === folderId,
      ) as SidebarFolder | undefined;

      // Create folder if not found
      if (!foundFolder) {
        const name = SIDEBAR_FOLDER_CONFIG.find((_) => _.id === folderId)?.name;
        foundFolder = {
          children: [],
          id: folderId,
          level: currentFolder.level + 1,
          name,
          path: currentFolder.path + folderId + "/",
        };
        currentFolder.children.push(foundFolder);
      }

      return foundFolder;
    }, sidebar);

    // Add document to the folder
    folder.children.push({ doc });
  }

  // Get sorting score
  function score(item: SidebarDocument | SidebarFolder) {
    if ("doc" in item) {
      return item.doc.data.sidebar?.order ?? Infinity;
    } else {
      const index = SIDEBAR_FOLDER_CONFIG.findIndex((_) => _.id === item.id);
      return index === -1 ? Infinity : index;
    }
  }

  // Finally sort the sidebar tree recursively based on relative ordering in SIDEBAR_FOLDER_CONFIG
  function sortSidebarRecursive(folder: SidebarFolder) {
    // Sort children by their score
    folder.children.sort((a, b) => score(a) - score(b));
    // Continue recursion
    folder.children.forEach((child) => {
      if ("children" in child) sortSidebarRecursive(child as SidebarFolder);
    });
  }
  sortSidebarRecursive(sidebar);

  // Return the fully constructed sidebar tree
  return sidebar;
}
