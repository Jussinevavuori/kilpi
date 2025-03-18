import { cn } from "@/utils/cn";
import dedent from "dedent";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/cjs/styles/prism";

export type CodeBlockProps = {
  content: string;
  language: string;
  className?: string;
  lineNumbers?: boolean;
};

const ONE_DARK_BG_COLOR = "#282c34";

export function CodeBlock(props: CodeBlockProps) {
  return (
    <div
      className={cn(
        "relative rounded-lg overflow-hidden shadow-lg border border-gray-700 my-4 bg-gray-800",
        props.className,
      )}
      style={{ backgroundColor: ONE_DARK_BG_COLOR }}
    >
      <SyntaxHighlighter
        language={props.language}
        style={oneDark}
        showLineNumbers={props.lineNumbers}
        customStyle={{ margin: 0, padding: "1rem" }}
        lineNumberStyle={{ color: "#999", marginRight: "1rem" }}
      >
        {dedent(props.content)}
      </SyntaxHighlighter>
    </div>
  );
}
