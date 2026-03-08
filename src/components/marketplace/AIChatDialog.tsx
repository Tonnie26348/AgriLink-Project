import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, Loader2, Bot, Sparkles, X } from "lucide-react";

interface Message {
  role: "user" | "model";
  text: string;
}

interface AIChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialMessage?: string;
}

const AIChatDialog = ({ open, onOpenChange, initialMessage }: AIChatDialogProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([
        { role: "model", text: initialMessage || "Hello! I'm your AgriLink AI assistant. How can I help you today?" }
      ]);
    }
  }, [open, initialMessage, messages.length]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", text: userMessage }]);
    setLoading(true);

    try {
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      // Use explicit timeout for the fetch call
      const invokePromise = supabase.functions.invoke("ai-assistant", {
        body: { message: userMessage, history },
      });

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("AI Assistant is taking too long. Please try a shorter question.")), 30000)
      );

      const { data, error } = (await Promise.race([invokePromise, timeoutPromise])) as { 
        data: { success: boolean; text: string; error?: string } | null, 
        error: Error | null 
      };

      if (error) {
        throw new Error(error.message || "Connection failed");
      }

      if (!data || data.success === false) {
        throw new Error(data?.error || "AI Service failure");
      }

      setMessages(prev => [...prev, { role: "model", text: data.text }]);
    } catch (err) {
      console.error("AI Assistant Error:", err);
      const msg = err instanceof Error ? err.message : "I'm sorry, I encountered an error. Please try again.";
      setMessages(prev => [...prev, { role: "model", text: msg }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] h-[80vh] flex flex-col p-0 overflow-hidden shadow-2xl border-none">
        <DialogHeader className="p-4 border-b bg-secondary/10 backdrop-blur-xl flex flex-row items-center justify-between">
          <DialogTitle className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
              <Bot className="w-5 h-5 text-secondary-foreground" />
            </div>
            <div>
              <span className="text-sm font-bold">AgriLink Assistant</span>
              <p className="text-[10px] text-muted-foreground font-medium flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5 text-secondary" /> AI Powered
              </p>
            </div>
          </DialogTitle>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => onOpenChange(false)}>
            <X className="w-4 h-4" />
          </Button>
        </DialogHeader>

        <div className="flex-1 overflow-hidden relative bg-muted/20">
          <ScrollArea className="h-full px-4 py-6">
            <div className="space-y-4 pb-4">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`flex gap-3 max-w-[85%] ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                    {msg.role === "model" && (
                      <Avatar className="h-8 w-8 shrink-0 border border-secondary/20 shadow-sm">
                        <AvatarFallback className="bg-secondary/10 text-secondary text-[10px] font-bold">AI</AvatarFallback>
                      </Avatar>
                    )}
                    <div className={`px-4 py-2.5 rounded-2xl text-sm shadow-sm ${
                      msg.role === "user" 
                        ? "bg-secondary text-secondary-foreground rounded-tr-none" 
                        : "bg-background border border-border/50 text-foreground rounded-tl-none"
                    }`}>
                      <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                    </div>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="flex gap-3 max-w-[85%]">
                    <Avatar className="h-8 w-8 shrink-0 border border-secondary/20 shadow-sm">
                      <AvatarFallback className="bg-secondary/10 text-secondary text-[10px] font-bold">AI</AvatarFallback>
                    </Avatar>
                    <div className="bg-background border border-border/50 px-4 py-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-1">
                      <div className="w-1.5 h-1.5 bg-secondary rounded-full animate-bounce [animation-delay:-0.3s]" />
                      <div className="w-1.5 h-1.5 bg-secondary rounded-full animate-bounce [animation-delay:-0.15s]" />
                      <div className="w-1.5 h-1.5 bg-secondary rounded-full animate-bounce" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={scrollRef} />
            </div>
          </ScrollArea>
        </div>

        <div className="p-4 border-t bg-background">
          <form onSubmit={handleSend} className="flex gap-2">
            <Input
              placeholder="Ask anything about produce, prices..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 h-11 rounded-xl bg-muted/30 border-border/50 focus:bg-background transition-all"
              autoFocus
            />
            <Button 
              type="submit" 
              size="icon" 
              className="h-11 w-11 rounded-xl bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-soft"
              disabled={loading || !input.trim()}
            >
              <Send className="h-5 w-5" />
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AIChatDialog;
