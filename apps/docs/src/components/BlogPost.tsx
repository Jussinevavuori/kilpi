import type { CollectionEntry } from "astro:content";
import { formatDate } from "date-fns/format";

export type BlogPostProps = {
  blog: CollectionEntry<"blog">;
};

export function BlogPost(props: BlogPostProps) {
  return (
    <a
      href={`/blog/${props.blog.id}`}
      className="flex flex-col gap-2 border rounded-lg p-4 hover:outline"
    >
      <span className="text-muted-foreground text-sm">
        {formatDate(props.blog.data.date, "EEEE, MMMM do yyyy")}
      </span>
      <h2 className="text-xl font-semibold tracking-tight leading-[1.2]">
        {props.blog.data.title}
      </h2>
      {props.blog.data.subtitle && (
        <h2 className="font-medium tracking-tight leading-[1.2]">{props.blog.data.subtitle}</h2>
      )}
      <div className="flex items-center gap-2 flex-row">
        {props.blog.data.authorImage && (
          <img
            alt={props.blog.data.author}
            src={props.blog.data.authorImage}
            className="rounded-full size-6"
          />
        )}
        <span className="text-muted-foreground text-sm">By {props.blog.data.author}</span>
      </div>

      <hr className="!my-2" />

      <p className="text-sm">{props.blog.data.summary}</p>
    </a>
  );
}
