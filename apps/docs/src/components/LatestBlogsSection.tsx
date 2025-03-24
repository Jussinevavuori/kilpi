import type { CollectionEntry } from "astro:content";
import { BlogPost } from "./BlogPost";
import { DefaultSection } from "./DefaultSection";

export type LatestBlogsSectionProps = {
  blogs: Array<CollectionEntry<"blog">>;
};

export function LatestBlogsSection(props: LatestBlogsSectionProps) {
  return (
    <DefaultSection className="py-40" id="latest-blogs">
      <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Latest blog posts</h2>

      <div
        className="grid gap-4"
        style={{ gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))" }}
      >
        {props.blogs.slice(0, N_LATTEST_BLOGS).map((blog) => (
          <BlogPost key={blog.id} blog={blog} />
        ))}
      </div>

      <a href="/blog" className="underline font-medium">
        View all blog posts
      </a>
    </DefaultSection>
  );
}

const N_LATTEST_BLOGS = 3;
