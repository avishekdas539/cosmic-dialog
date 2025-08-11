import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Paperclip, Send, Heading1, Bold, Italic, Code, List, Link as LinkIcon, Image as ImageIcon, Sparkles } from "lucide-react";

interface ChatInputProps {
  value: string;
  onChange: (val: string) => void;
  onSend: () => void;
  disabled?: boolean;
}

export default function ChatInput({ value, onChange, onSend, disabled }: ChatInputProps) {
  const append = useCallback((snippet: string) => {
    onChange((value || "") + snippet);
  }, [onChange, value]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      if (!disabled) onSend();
    }
  };

  return (
    <div className="mt-4 rounded-2xl bg-background/60 backdrop-blur p-3 shadow-elevated">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-1.5">
          <Button variant="ghost" size="icon" className="hover-scale" aria-label="Attach">
            <Paperclip className="h-4 w-4" />
          </Button>
          <Separator orientation="vertical" className="h-5" />
          <Button variant="ghost" size="icon" onClick={() => append("\n# ")} aria-label="Heading 1">
            <Heading1 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => append("**bold** ")} aria-label="Bold">
            <Bold className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => append("_italics_ ")} aria-label="Italic">
            <Italic className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => append("`code` ")} aria-label="Inline code">
            <Code className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => append("\n- item ")} aria-label="List">
            <List className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => append("[text](url)")} aria-label="Link">
            <LinkIcon className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => append("![](image-url)")} aria-label="Image">
            <ImageIcon className="h-4 w-4" />
          </Button>
        </div>
        <Button variant="secondary" size="sm" onClick={() => append("\n> Polish: ")} aria-label="Sparkle format" className="hover-scale">
          <Sparkles className="mr-2 h-4 w-4" />
          Enhance
        </Button>
      </div>

      <div className="mt-3 grid grid-cols-[1fr_auto] items-end gap-2">
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Message Cosmic Dialog… (⌘/Ctrl + Enter to send)"
          className="min-h-[96px] resize-y focus-visible:ring-2 focus-visible:ring-ring"
          onKeyDown={onKeyDown}
          disabled={disabled}
          aria-busy={disabled}
        />
        <Button
          size="icon"
          className="rounded-full hover-scale"
          onClick={onSend}
          disabled={disabled}
          aria-label="Send message"
          title="Send (⌘/Ctrl + Enter)"
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
