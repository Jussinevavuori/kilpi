import type { CollectionEntry } from "astro:content";
import { BlogPost } from "./BlogPost";
import { DefaultSection } from "./DefaultSection";

export type BlogsSectionProps = {
  blogs: Array<CollectionEntry<"blog">>;
};

export function BlogsSection(props: BlogsSectionProps) {
  return (
    <DefaultSection>
      <div className="flex flex-col gap-8">My blogs</div>

      <div>
        {props.blogs.map((blog) => (
          <a key={blog.id} href={`/blog/${blog.id}`}>
            <BlogPost blog={blog} />
          </a>
        ))}
      </div>
    </DefaultSection>
  );
}
