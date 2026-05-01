import { useState, useEffect, useRef } from "react";
import { useMessages } from "@/hooks/useMessages";
import { useAuth } from "@/contexts/auth-context-definition";
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
import { Send, Loader2, MessageSquare, ArrowLeft } from "lucide-react";
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
      <DialogContent className="fixed z-[100] sm:max-w-[450px] h-[85vh] sm:h-[600px] my-auto flex flex-col p-0 gap-0 overflow-hidden shadow-2xl border-none rounded-2xl">
        <DialogHeader className="p-4 border-b border-border/40 bg-background/80 backdrop-blur-xl sticky top-0 z-10 flex flex-row items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="sm:hidden -ml-2" 
            onClick={() => onOpenChange(false)}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <DialogTitle className="flex items-center gap-3 flex-1">
            <Avatar className="h-10 w-10 border border-border/50 shadow-sm">
              <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-bold">
                {receiverName[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-bold leading-none">{receiverName}</span>
              {listingName ? (
                <span className="text-[10px] text-muted-foreground line-clamp-1 mt-1 font-medium bg-secondary/10 text-secondary-foreground px-1.5 py-0.5 rounded-full w-fit">
                  Listing: {listingName}
                </span>
              ) : (
                <span className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> Online
                </span>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden relative bg-muted/30">
          {/* Chat Background Pattern */}
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(#000 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
          
          <ScrollArea className="h-full px-4 py-6">
            <div className="space-y-6 pb-4 relative z-10">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                  <Loader2 className="h-8 w-8 animate-spin text-primary/40" />
                  <p className="text-xs text-muted-foreground font-medium">Loading history...</p>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center px-10">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4 shadow-inner">
                    <MessageSquare className="h-8 w-8 text-muted-foreground/40" />
                  </div>
                  <h3 className="text-sm font-bold mb-1">Start a conversation</h3>
                  <p className="text-xs text-muted-foreground max-w-[200px]">
                    Discuss details, negotiate prices, or ask about {listingName ? "this listing" : "produce"}.
                  </p>
                </div>
              ) : (
                messages.map((msg, i) => {
                  const isOwn = msg.sender_id === user?.id;
                  const showAvatar = !isOwn && (i === 0 || messages[i - 1].sender_id !== msg.sender_id);
                  
                  return (
                    <div
                      key={msg.id}
                      className={`flex gap-2 ${isOwn ? "justify-end" : "justify-start"}`}
                    >
                      {!isOwn && (
                        <div className="w-8 flex-shrink-0 flex flex-col justify-end">
                          {showAvatar && (
                            <Avatar className="h-8 w-8 border border-border/50">
                              <AvatarFallback className="text-[10px] bg-muted text-muted-foreground">
                                {receiverName[0]}
                              </AvatarFallback>
                            </Avatar>
                          )}
                        </div>
                      )}
                      
                      <div className={`flex flex-col ${isOwn ? "items-end" : "items-start"} max-w-[75%]`}>
                        <div
                          className={`px-4 py-2.5 text-sm shadow-sm transition-all ${
                            isOwn
                              ? "bg-primary text-primary-foreground rounded-2xl rounded-tr-sm"
                              : "bg-background border border-border/50 text-foreground rounded-2xl rounded-tl-sm"
                          }`}
                        >
                          <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                        </div>
                        <span
                          className={`text-[9px] mt-1 px-1 font-medium text-muted-foreground/60 select-none`}
                        >
                          {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={scrollRef} className="h-2" />
            </div>
          </ScrollArea>
        </div>

        <div className="p-3 sm:p-4 border-t border-border/40 bg-background/80 backdrop-blur-md sticky bottom-0 z-20">
          <form onSubmit={handleSendMessage} className="flex gap-2 items-end">
            <Input
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-1 min-h-[44px] max-h-32 py-3 bg-muted/30 border-border/50 focus:bg-background focus-visible:ring-primary shadow-inner resize-none rounded-xl"
              autoFocus
            />
            <Button 
              type="submit" 
              size="icon" 
              className="h-11 w-11 shrink-0 rounded-xl shadow-soft hover:shadow-glow transition-all"
              disabled={sending || !newMessage.trim()}
            >
              {sending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ChatDialog;
