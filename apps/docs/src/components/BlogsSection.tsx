import type { CollectionEntry } from "astro:content";
import { BlogPost } from "./BlogPost";
import { DefaultSection } from "./DefaultSection";

export type BlogsSectionProps = {
  blogs: Array<CollectionEntry<"blog">>;
};

export function BlogsSection(props: BlogsSectionProps) {
  return (
    <DefaultSection>
      {props.blogs.map((blog) => (
        <BlogPost key={blog.id} blog={blog} />
      ))}
    </DefaultSection>
  );
}
