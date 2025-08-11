import { cn } from "@/lib/utils";
import MarkdownRenderer from "./MarkdownRenderer";

export type ChatRole = "user" | "assistant" | "planner" | "executor" | "system";

export interface ChatMessageProps {
  role: ChatRole;
  content: string;
  timestamp?: string;
}

const roleLabel: Record<ChatRole, string> = {
  user: "You",
  assistant: "AI",
  planner: "Planner",
  executor: "Executor",
  system: "System",
};

export function ChatMessage({ role, content, timestamp }: ChatMessageProps) {
  const isUser = role === "user";
  const bubble = (
    <div
      className={cn(
        "rounded-xl border p-3 sm:p-4 shadow-sm backdrop-blur",
        "transition-transform duration-200 hover:scale-[1.01]",
        isUser
          ? "bg-primary/5 border-primary/30"
          : role === "planner"
          ? "bg-accent/40 border-accent/50"
          : role === "executor"
          ? "bg-secondary/40 border-secondary/50"
          : role === "system"
          ? "bg-muted border-muted"
          : "bg-card/80 border-border/50"
      )}
    >
      <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
        <span className="font-medium tracking-wide">{roleLabel[role]}</span>
        {timestamp && <time>{timestamp}</time>}
      </div>
      <MarkdownRenderer content={content} />
    </div>
  );

  return (
    <div className={cn("flex w-full gap-3", isUser ? "justify-end" : "justify-start")}
    >
      {bubble}
    </div>
  );
}

export default ChatMessage;
