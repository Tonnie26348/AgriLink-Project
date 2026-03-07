import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/auth-context-definition";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Search, Loader2, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { formatDistanceToNow } from "date-fns";
import ChatDialog from "@/components/marketplace/ChatDialog";

interface Conversation {
  other_user_id: string;
  other_user_name: string;
  last_message: string;
  last_message_at: string;
  unread_count: number;
}

interface ConversationItem {
  id: string;
  content: string;
  created_at: string;
  sender_id: string;
  receiver_id: string;
  is_read: boolean;
  sender: { full_name: string } | null;
  receiver: { full_name: string } | null;
}

const Inbox = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedChat, setSelectedChat] = useState<{ id: string; name: string } | null>(null);

  const fetchConversations = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('messages')
        .select(`
          id,
          content,
          created_at,
          sender_id,
          receiver_id,
          is_read,
          sender:profiles!messages_sender_id_fkey (full_name),
          receiver:profiles!messages_receiver_id_fkey (full_name)
        `)
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const convMap = new Map<string, Conversation>();
      
      (data as unknown as ConversationItem[]).forEach((msg) => {
        const otherId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
        const otherName = msg.sender_id === user.id 
          ? (msg.receiver?.full_name || "User") 
          : (msg.sender?.full_name || "User");
        
        if (!convMap.has(otherId)) {
          convMap.set(otherId, {
            other_user_id: otherId,
            other_user_name: otherName,
            last_message: msg.content,
            last_message_at: msg.created_at,
            unread_count: (!msg.is_read && msg.receiver_id === user.id) ? 1 : 0
          });
        } else if (!msg.is_read && msg.receiver_id === user.id) {
          const existing = convMap.get(otherId)!;
          existing.unread_count += 1;
        }
      });

      setConversations(Array.from(convMap.values()));
    } catch (err) {
      console.error("Error fetching conversations:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchConversations();
      
      const channel = supabase
        .channel('inbox-updates')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, () => {
          fetchConversations();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user, fetchConversations]);

  const filteredConversations = conversations.filter(c => 
    c.other_user_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.last_message.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-muted/30 pt-16">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-display font-bold text-foreground flex items-center gap-3">
                <MessageSquare className="w-8 h-8 text-primary" />
                Messages
              </h1>
              <p className="text-muted-foreground">Manage your conversations with farmers and buyers</p>
            </div>
          </div>

          <Card className="border-border/50 shadow-soft overflow-hidden">
            <div className="p-4 border-b bg-card">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <ScrollArea className="h-[600px]">
              {loading && conversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                  <Loader2 className="h-8 w-8 animate-spin text-primary/40" />
                  <p className="text-sm text-muted-foreground">Loading your messages...</p>
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center px-10">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                    <MessageSquare className="h-8 w-8 text-muted-foreground/20" />
                  </div>
                  <h3 className="text-lg font-bold mb-1">No conversations found</h3>
                  <p className="text-sm text-muted-foreground">
                    {searchQuery ? "No results for your search." : "Start a chat from the marketplace or your orders."}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-border/50">
                  {filteredConversations.map((conv) => (
                    <div
                      key={conv.other_user_id}
                      onClick={() => setSelectedChat({ id: conv.other_user_id, name: conv.other_user_name })}
                      className="p-4 hover:bg-muted/50 cursor-pointer transition-colors flex items-center gap-4 relative group"
                    >
                      <Avatar className="h-12 w-12 border border-border/50">
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {conv.other_user_name[0]}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-bold text-sm truncate">{conv.other_user_name}</h3>
                          <span className="text-[10px] text-muted-foreground">
                            {formatDistanceToNow(new Date(conv.last_message_at), { addSuffix: true })}
                          </span>
                        </div>
                        <p className={`text-sm truncate ${conv.unread_count > 0 ? "font-semibold text-foreground" : "text-muted-foreground"}`}>
                          {conv.last_message}
                        </p>
                      </div>

                      {conv.unread_count > 0 && (
                        <Badge className="bg-primary text-primary-foreground h-5 min-w-5 flex items-center justify-center rounded-full p-0 text-[10px]">
                          {conv.unread_count}
                        </Badge>
                      )}
                      
                      <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity ml-2" />
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </Card>
        </div>
      </main>

      {selectedChat && (
        <ChatDialog
          open={!!selectedChat}
          onOpenChange={(open) => !open && setSelectedChat(null)}
          receiverId={selectedChat.id}
          receiverName={selectedChat.name}
        />
      )}
      
      <Footer />
    </div>
  );
};

export default Inbox;
