import type { CollectionEntry } from "astro:content";
import { BlogPost } from "./BlogPost";
import { DefaultSection } from "./DefaultSection";

export type BlogsSectionProps = {
  blogs: Array<CollectionEntry<"blog">>;
};

export function BlogsSection(props: BlogsSectionProps) {
  return (
    <DefaultSection>
      <div
        className="grid gap-4"
        style={{ gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))" }}
      >
        {props.blogs.map((blog) => (
          <BlogPost key={blog.id} blog={blog} />
        ))}
      </div>
    </DefaultSection>
  );
}
