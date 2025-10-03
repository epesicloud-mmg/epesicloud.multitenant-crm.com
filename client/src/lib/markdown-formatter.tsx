import { ReactNode } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Component to render markdown content with proper styling
export function MarkdownRenderer({ content }: { content: string }): ReactNode {
  return (
    <ReactMarkdown
      className="prose prose-sm dark:prose-invert max-w-none"
      remarkPlugins={[remarkGfm]}
      components={{
        // Custom styling for markdown elements
        h1: ({ children }) => <h1 className="text-lg font-bold mb-2 text-foreground">{children}</h1>,
        h2: ({ children }) => <h2 className="text-base font-semibold mb-2 text-foreground">{children}</h2>,
        h3: ({ children }) => <h3 className="text-sm font-medium mb-1 text-foreground">{children}</h3>,
        p: ({ children }) => <p className="mb-2 text-sm text-muted-foreground leading-relaxed">{children}</p>,
        ul: ({ children }) => <ul className="mb-2 ml-4 list-disc text-sm text-muted-foreground space-y-1">{children}</ul>,
        ol: ({ children }) => <ol className="mb-2 ml-4 list-decimal text-sm text-muted-foreground space-y-1">{children}</ol>,
        li: ({ children }) => <li className="leading-relaxed">{children}</li>,
        strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
        em: ({ children }) => <em className="italic text-muted-foreground">{children}</em>,
        code: ({ children }) => (
          <code className="px-1 py-0.5 mx-1 text-xs bg-muted text-muted-foreground rounded font-mono">
            {children}
          </code>
        ),
        pre: ({ children }) => (
          <pre className="mb-2 p-3 bg-muted text-muted-foreground rounded text-xs overflow-x-auto">
            {children}
          </pre>
        ),
        blockquote: ({ children }) => (
          <blockquote className="mb-2 pl-4 border-l-2 border-muted-foreground/20 text-sm text-muted-foreground italic">
            {children}
          </blockquote>
        ),
        a: ({ children, href }) => (
          <a
            href={href}
            className="text-primary underline hover:text-primary/80 transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            {children}
          </a>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
}

// Hook to format text as markdown for AI responses
export function useMarkdownFormatter() {
  const formatAsMarkdown = (text: string): string => {
    // Ensure the text is properly formatted as markdown
    if (!text) return text;

    // Add markdown formatting if it's missing
    let formatted = text;

    // Ensure proper line breaks for lists
    formatted = formatted.replace(/•\s/g, '\n• ');
    formatted = formatted.replace(/\*\s(?!\*)/g, '\n* ');

    // Ensure proper spacing around headers
    formatted = formatted.replace(/#{1,3}\s(.+)/g, '\n$&\n');

    // Clean up multiple newlines
    formatted = formatted.replace(/\n{3,}/g, '\n\n');

    return formatted.trim();
  };

  return { formatAsMarkdown };
}