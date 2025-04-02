import type { SidebarDocument } from "./getSidebar";

export type DocsSidebarDocumentProps = {
  item: SidebarDocument;
};

export function DocsSidebarDocument(props: DocsSidebarDocumentProps) {
  return (
    <a
      href={`/docs/${props.item.doc.id}`}
      className="group/dsd relative flex h-8 items-center text-sm"
    >
      <span className="bg-accent/30 absolute inset-y-0 -left-px w-px -translate-x-4 opacity-0 transition group-hover/dsd:opacity-100 group-hover/dsd:duration-0" />
      {props.item.doc.data.sidebar?.label || props.item.doc.data.title}
    </a>
  );
}
