import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth-context-definition";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Loader2, MessageSquare } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Conversation {
  other_user_id: string;
  other_user_name: string;
  last_message: string;
  last_message_at: string;
  unread_count: number;
}

interface ConversationRow {
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
  is_read: boolean;
  sender: { full_name: string | null } | null;
  receiver: { full_name: string | null } | null;
}

interface ConversationListProps {
  onSelectConversation: (userId: string, userName: string) => void;
}

const ConversationList = ({ onSelectConversation }: ConversationListProps) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchConversations = async () => {
      try {
        setLoading(true);
        
        // This is a complex query to get unique conversations with last message
        const { data, error } = await supabase
          .from("messages")
          .select(`
            *,
            sender:profiles!messages_sender_id_fkey (full_name),
            receiver:profiles!messages_receiver_id_fkey (full_name)
          `)
          .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
          .order("created_at", { ascending: false });

        if (error) throw error;

        const rows = (data as unknown as ConversationRow[]) || [];
        const conversationMap = new Map<string, Conversation>();

        rows.forEach((msg) => {
          const otherUserId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
          const otherUserName = msg.sender_id === user.id 
            ? msg.receiver?.full_name 
            : msg.sender?.full_name;

          if (!conversationMap.has(otherUserId)) {
            conversationMap.set(otherUserId, {
              other_user_id: otherUserId,
              other_user_name: otherUserName || "Unknown User",
              last_message: msg.content,
              last_message_at: msg.created_at,
              unread_count: (!msg.is_read && msg.receiver_id === user.id) ? 1 : 0,
            });
          } else {
            if (!msg.is_read && msg.receiver_id === user.id) {
              const conv = conversationMap.get(otherUserId)!;
              conv.unread_count += 1;
            }
          }
        });

        setConversations(Array.from(conversationMap.values()));
      } catch (error) {
        console.error("Error fetching conversations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();

    // Subscribe to new messages to refresh list
    const channel = supabase
      .channel("conversation_list")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        () => fetchConversations()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="text-center py-10 opacity-60">
        <MessageSquare className="h-10 w-10 mx-auto mb-2" />
        <p>No conversations yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {conversations.map((conv) => (
        <div
          key={conv.other_user_id}
          onClick={() => onSelectConversation(conv.other_user_id, conv.other_user_name)}
          className="flex items-center gap-4 p-3 rounded-xl hover:bg-muted/50 cursor-pointer transition-colors border border-transparent hover:border-border"
        >
          <Avatar className="h-12 w-12 border border-border">
            <AvatarFallback>{conv.other_user_name[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start mb-1">
              <h4 className="font-semibold text-sm truncate">{conv.other_user_name}</h4>
              <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                {formatDistanceToNow(new Date(conv.last_message_at), { addSuffix: true })}
              </span>
            </div>
            <p className="text-xs text-muted-foreground truncate">{conv.last_message}</p>
          </div>
          {conv.unread_count > 0 && (
            <Badge variant="default" className="h-5 min-w-5 flex items-center justify-center rounded-full p-0">
              {conv.unread_count}
            </Badge>
          )}
        </div>
      ))}
    </div>
  );
};

export default ConversationList;
