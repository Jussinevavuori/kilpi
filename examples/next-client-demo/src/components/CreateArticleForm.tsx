"use client";

import { createArticleAction } from "@/article-actions";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Textarea } from "./ui/textarea";

const formSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  content: z.string().min(1, { message: "Content is required" }),
});

export function CreateArticleForm() {
  const { executeAsync: createArticle, isPending } = useAction(createArticleAction);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      content: "",
    },
  });

  const handleSubmit = form.handleSubmit(async (values) => {
    await createArticle(values);
  });

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Your title..." {...field} />
              </FormControl>
              <FormDescription>Come up with a catchy title for your article.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Content</FormLabel>
              <FormControl>
                <Textarea placeholder="Your content..." className="h-[200px]" {...field} />
              </FormControl>
              <FormDescription>Write your article here.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button disabled={isPending} type="submit" className={isPending ? "animate-pulse" : ""}>
          {isPending ? "Creating article..." : "Create article"}
        </Button>
      </form>
    </Form>
  );
}
