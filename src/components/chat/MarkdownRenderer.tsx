import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/atom-one-dark.css";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className }) => {
  return (
    <div className={className}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          a: ({ node, ...props }: any) => (
            <a {...props} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 hover:opacity-80 transition-opacity" />
          ),
          img: ({ node, ...props }: any) => (
            // eslint-disable-next-line jsx-a11y/alt-text
            <img {...props} loading="lazy" className="rounded-md" />
          ),
          code: (props: any) => {
            const { inline, children, ...rest } = props;
            const code = (
              // eslint-disable-next-line react/no-unknown-property
              <code
                className={
                  "rounded px-1.5 py-0.5 font-mono text-sm " +
                  (inline ? "bg-muted" : "")
                }
                {...rest}
              >
                {children}
              </code>
            );
            if (inline) return code;
            return (
              <pre className="overflow-x-auto rounded-md bg-muted p-3">
                {code}
              </pre>
            );
          },
        }}
        className="prose prose-sm sm:prose-base max-w-none dark:prose-invert"
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;
