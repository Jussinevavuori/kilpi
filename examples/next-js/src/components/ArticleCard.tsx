import type { Article } from "@/article-service";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/utils/cn";
import Link from "next/link";

export type ArticleCardProps = {
  article: Article;
  snippetLength?: number;
};

const DEFAULT_SNIPPET_LENGTH = 160;

export function ArticleCard(props: ArticleCardProps) {
  const snippetLength = props.snippetLength ?? DEFAULT_SNIPPET_LENGTH;

  // Take first 100 characters of content
  const snippet =
    props.article.content.length >= snippetLength
      ? props.article.content.slice(0, snippetLength) + "..."
      : props.article.content;

  return (
    <Link href={`/article/${props.article.id}`}>
      <Card>
        <CardHeader>
          <CardTitle>{props.article.title}</CardTitle>
          <CardDescription>
            By {props.article.authorName} on{" "}
            {props.article.createdAt.toLocaleDateString()}
          </CardDescription>
        </CardHeader>
        <CardContent>{snippet}</CardContent>
        <CardFooter className="flex-row items-center gap-2">
          <div
            className={cn(
              "size-2 rounded-full",
              props.article.isPublished ? "bg-green-500" : "bg-slate-300",
            )}
          />

          <p className="text-muted-foreground text-sm">
            {props.article.isPublished ? "Published" : "Draft"}
          </p>
        </CardFooter>
      </Card>
    </Link>
  );
}
