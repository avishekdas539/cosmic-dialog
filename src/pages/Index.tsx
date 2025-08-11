import { useEffect, useMemo, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import ChatMessage, { ChatRole } from "@/components/chat/ChatMessage";

interface ToolLog {
  id: string;
  tool: string;
  input: string;
  output?: string;
  status: "called" | "success" | "error";
  ts: string;
}

interface Message {
  id: string;
  role: ChatRole;
  content: string;
  ts: string;
  loading?: boolean;
}

const now = () => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

const detectTools = (text: string) => {
  const tools: { name: string; args: string }[] = [];
  if (/search|google|look\s?up/i.test(text)) tools.push({ name: "web.search", args: text });
  if (/calc|calculate|=|\d+\s*[+\-*/]/i.test(text)) tools.push({ name: "math.calculate", args: text.match(/[\d+\-*/().\s]+/g)?.join("") || text });
  if (/remember|note|save/i.test(text)) tools.push({ name: "memory.save", args: text });
  return tools;
};

const safeEval = (expr: string) => {
  try {
    const sanitized = expr.replace(/[^-()\d/*+.]/g, "");
    // eslint-disable-next-line no-new-func
    const fn = new Function(`return (${sanitized})`);
    const result = fn();
    return String(result);
  } catch {
    return "(demo) unable to compute";
  }
};

const Index = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: crypto.randomUUID(),
      role: "assistant",
      content: "Hello! I’m your planning + execution AI. Ask me anything — I’ll plan steps, call tools, and show my work.",
      ts: now(),
    },
  ]);
  const [input, setInput] = useState("");
  const [logs, setLogs] = useState<ToolLog[]>([]);
  const [showLogs, setShowLogs] = useState(true);
  const [busy, setBusy] = useState(false);
  const { toast } = useToast();
  const scrollRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length]);

  const canonical = useMemo(() => (typeof window !== "undefined" ? window.location.href : "https://example.com"), []);

  const handleMouse = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = headerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    el.style.setProperty("--x", `${x}%`);
    el.style.setProperty("--y", `${y}%`);
  };

  const runTools = async (tools: { name: string; args: string }[]) => {
    const results: string[] = [];
    for (const t of tools) {
      const id = crypto.randomUUID();
      setLogs((prev) => [
        { id, tool: t.name, input: t.args, status: "called", ts: now() },
        ...prev,
      ]);
      // simulate latency
      // eslint-disable-next-line no-await-in-loop
      await new Promise((r) => setTimeout(r, 450));

      let output = "(demo) complete";
      if (t.name === "web.search") output = `Searched the web for: "${t.args}" and compiled 3 results.`;
      if (t.name === "math.calculate") output = safeEval(t.args || "");
      if (t.name === "memory.save") output = "Saved a short note to local memory (demo).";

      setLogs((prev) =>
        prev.map((l) => (l.id === id ? { ...l, output, status: "success" } : l))
      );
      results.push(`- ${t.name}: ${output}`);
      toast({ title: `Tool finished: ${t.name}`, description: output });
    }
    return results.join("\n");
  };

  const onSend = async () => {
    const q = input.trim();
    if (!q || busy) return;
    setBusy(true);
    setInput("");

    const userMsg: Message = { id: crypto.randomUUID(), role: "user", content: q, ts: now() };
    setMessages((m) => [...m, userMsg]);

    const tools = detectTools(q);
    const plan = `Plan:\n1. Understand the request\n2. Use appropriate tools (${tools.map((t) => t.name).join(", ") || "none"})\n3. Compose a clear answer with references or steps`;
    const plannerMsg: Message = { id: crypto.randomUUID(), role: "planner", content: plan, ts: now() };
    setMessages((m) => [...m, plannerMsg]);

    // Show assistant typing while tools run
    const thinkingId = crypto.randomUUID();
    const thinkingMsg: Message = { id: thinkingId, role: "assistant", content: "", loading: true, ts: now() };
    setMessages((m) => [...m, thinkingMsg]);

    const toolSummary = await runTools(tools);
    const exec = `Execution Summary:\n${toolSummary || "- No tools were necessary"}`;
    const execMsg: Message = { id: crypto.randomUUID(), role: "executor", content: exec, ts: now() };
    setMessages((m) => [...m, execMsg]);

    const answer = `## Answer\n\nHere’s what I found and how to proceed:\n\n${toolSummary || "- No external calls required"}\n\n> Tip: You can use markdown — like **bold**, _italics_, lists, and code.\n\nExample code:\n\n\`\`\`ts\nfunction hello(name: string) {\n  return "Hello, " + name + "!";\n}\n\nconsole.log(hello("world"))\n\`\`\``;

    setMessages((m) => m.map((msg) => (msg.id === thinkingId ? { ...msg, content: answer, loading: false, ts: now() } : msg)));
    setBusy(false);
  };

  const clearAll = () => {
    setMessages([]);
    setLogs([]);
  };

  return (
    <div className="min-h-screen bg-app-gradient">
      <Helmet>
        <title>Cosmic Dialog — Futuristic AI Chat</title>
        <meta name="description" content="Futuristic Gemini-like AI chat with planning, execution, tool logs, and Markdown rendering." />
        <link rel="canonical" href={canonical} />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Cosmic Dialog",
            applicationCategory: "ChatApplication",
            description: "AI chat with planning, execution, tool logs, and Markdown rendering.",
            url: canonical,
          })}
        </script>
      </Helmet>

      <header
        ref={headerRef}
        onMouseMove={handleMouse}
        className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur interactive-spotlight"
      >
        <div className="mx-auto max-w-5xl px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-gradient-primary">Cosmic Dialog</h1>
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={() => setShowLogs((s) => !s)}>
              {showLogs ? "Hide" : "Show"} Logs
            </Button>
            <Button variant="outline" onClick={clearAll}>Clear</Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 grid grid-cols-1 lg:grid-cols-3 gap-4 py-6">
        <section className="lg:col-span-2">
          <Card className="shadow-elevated shadow-glow">
            <CardHeader>
              <CardTitle className="text-lg">Chat</CardTitle>
            </CardHeader>
            <Separator />
            <CardContent className="pt-4">
              <div ref={scrollRef as any} className="h-[52vh] sm:h-[60vh] overflow-hidden">
                <ScrollArea className="h-full pr-3">
                  <div className="space-y-3">
                    {messages.map((m) => (
                      <ChatMessage key={m.id} role={m.role} content={m.content} timestamp={m.ts} loading={m.loading} />
                    ))}
                  </div>
                </ScrollArea>
              </div>

              <div className="mt-4 rounded-xl border bg-card/70 p-3 backdrop-blur">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask anything. I’ll plan, execute tools, and answer with markdown."
                  className="min-h-[84px] resize-y"
                  disabled={busy}
                  aria-busy={busy}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      onSend();
                    }
                  }}
                />
                <div className="mt-3 flex items-center justify-end gap-2">
                  <Button variant="secondary" onClick={() => setInput((v) => v + "\n# ")}>H1</Button>
                  <Button variant="secondary" onClick={() => setInput((v) => v + "**bold** ")}>Bold</Button>
                  <Button onClick={onSend} className="hover-scale" disabled={busy}>{busy ? "Sending…" : "Send"}</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <aside className="lg:col-span-1">
          <Card className="shadow-elevated">
            <CardHeader>
              <CardTitle className="text-lg">Agent Console</CardTitle>
            </CardHeader>
            <Separator />
            <CardContent className="pt-4">
              {showLogs ? (
                <div className="h-[30vh] sm:h-[40vh] overflow-hidden">
                  <ScrollArea className="h-full pr-3">
                    <div className="space-y-3">
                      {logs.length === 0 && (
                        <div className="text-sm text-muted-foreground">No tool calls yet. Try asking to search, calculate, or remember.</div>
                      )}
                      {logs.map((l) => (
                        <div key={l.id} className="rounded-md border p-2 text-xs">
                          <div className="mb-1 flex items-center justify-between">
                            <span className="font-medium">{l.tool}</span>
                            <time className="text-muted-foreground">{l.ts}</time>
                          </div>
                          <div className="text-muted-foreground">input: {l.input}</div>
                          {l.output && <div>output: {l.output}</div>}
                          <div className="mt-1">
                            <span className={
                              l.status === "success"
                                ? "text-primary"
                                : l.status === "error"
                                ? "text-destructive"
                                : "text-foreground"
                            }>
                              {l.status.toUpperCase()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">Logs hidden.</div>
              )}
            </CardContent>
          </Card>
        </aside>
      </main>
    </div>
  );
};

export default Index;
