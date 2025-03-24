import type { CollectionEntry } from "astro:content";

export type BlogPostProps = {
  blog: CollectionEntry<"blog">;
};

export function BlogPost(props: BlogPostProps) {
  return (
    <div>
      <p>
        {props.blog.data.title} by {props.blog.data.author}
      </p>
    </div>
  );
}
