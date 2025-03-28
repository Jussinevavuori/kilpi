import type { CollectionEntry } from "astro:content";
import { formatDate } from "date-fns/format";

export type BlogPostProps = {
  blog: CollectionEntry<"blog">;
};

export function BlogPost(props: BlogPostProps) {
  return (
    <div className="flex flex-col gap-4">
      {/* Recommended badge */}
      {props.blog.data.recommended && (
        <span className="inline-flex items-center justify-center rounded-full bg-lime-100 px-2 py-1 text-sm font-medium text-lime-800 w-fit">
          <span className="bg-lime-500 size-1.5 rounded-full !ml-1 !mr-2" />
          Recommended article
        </span>
      )}

      {/* Author and date */}
      <div className="flex items-center gap-2 flex-row">
        {props.blog.data.authorImage && (
          <img
            alt={props.blog.data.author}
            src={props.blog.data.authorImage}
            className="rounded-full size-6"
          />
        )}
        <span className="text-muted-foreground text-sm">By {props.blog.data.author}</span>
        <span className="text-muted-foreground text-sm">·</span>
        <span className="text-muted-foreground text-sm">
          {formatDate(props.blog.data.date, "EEEE, MMMM do yyyy")}
        </span>
      </div>

      {/* Title */}
      <div className="max-w-lg flex flex-col gap-2">
        <h2 className="text-2xl font-semibold tracking-tight leading-[1.2]">
          <a href={`/blog/${props.blog.id}`} className="hover:underline">
            {props.blog.data.title}
          </a>
        </h2>
        {props.blog.data.subtitle && (
          <h2 className="font-medium tracking-tight leading-[1.2]">{props.blog.data.subtitle}</h2>
        )}
      </div>

      {/* Summary */}
      <p className="text-sm max-w-lg">{props.blog.data.summary}</p>
    </div>
  );
}
