import { useState, useEffect, useRef } from "react";
import { useMessages } from "@/hooks/useMessages";
import { useAuth } from "@/contexts/auth-context-definition";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, Loader2, MessageSquare } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  receiverId: string;
  receiverName: string;
  listingId?: string;
  listingName?: string;
}

const ChatDialog = ({
  open,
  onOpenChange,
  receiverId,
  receiverName,
  listingId,
  listingName,
}: ChatDialogProps) => {
  const { user } = useAuth();
  const { messages, loading, sendMessage, markAsRead } = useMessages(receiverId);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    if (open && messages.length > 0) {
      const unreadMessageIds = messages
        .filter((m) => !m.is_read && m.receiver_id === user?.id)
        .map((m) => m.id);
      
      if (unreadMessageIds.length > 0) {
        markAsRead(unreadMessageIds);
      }
    }
  }, [open, messages, user?.id, markAsRead]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    const success = await sendMessage(newMessage, listingId);
    if (success) {
      setNewMessage("");
    }
    setSending(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px] h-[85vh] sm:h-[600px] flex flex-col p-0 gap-0 overflow-hidden shadow-2xl">
        <DialogHeader className="p-4 border-b bg-background/95 backdrop-blur-sm sticky top-0 z-10">
          <DialogTitle className="flex items-center gap-3">
            <Avatar className="h-9 w-9 border border-border/50">
              <AvatarFallback className="bg-primary/10 text-primary">{receiverName[0]}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-bold leading-tight">{receiverName}</span>
              {listingName && (
                <span className="text-[10px] text-muted-foreground line-clamp-1">
                  Topic: {listingName}
                </span>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 px-4 py-6">
          <div className="space-y-4 pb-4">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-primary/40" />
                <p className="text-xs text-muted-foreground">Loading conversation...</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center px-10">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                  <MessageSquare className="h-6 w-6 text-muted-foreground/40" />
                </div>
                <h3 className="text-sm font-semibold mb-1">No messages yet</h3>
                <p className="text-xs text-muted-foreground">
                  Send a message to start a conversation about this listing.
                </p>
              </div>
            ) : (
              messages.map((msg) => {
                const isOwn = msg.sender_id === user?.id;
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                        isOwn
                          ? "bg-primary text-primary-foreground rounded-tr-none"
                          : "bg-muted text-foreground rounded-tl-none"
                      }`}
                    >
                      <p className="leading-relaxed">{msg.content}</p>
                      <span
                        className={`text-[9px] mt-1.5 block font-medium opacity-60 ${
                          isOwn ? "text-right" : "text-left"
                        }`}
                      >
                        {formatDistanceToNow(new Date(msg.created_at), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={scrollRef} className="h-2" />
          </div>
        </ScrollArea>

        <div className="p-4 border-t bg-muted/30 sticky bottom-0">
          <form onSubmit={handleSendMessage} className="flex gap-2 items-center">
            <Input
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-1 bg-background border-border/50 focus-visible:ring-primary shadow-sm"
              autoFocus
            />
            <Button 
              type="submit" 
              size="icon" 
              className="h-10 w-10 shrink-0 shadow-soft"
              disabled={sending || !newMessage.trim()}
            >
              {sending ? (
                <Loader2 className="h-4 h-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ChatDialog;
