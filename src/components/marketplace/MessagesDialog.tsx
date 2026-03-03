import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ConversationList from "@/components/marketplace/ConversationList";
import ChatDialog from "@/components/marketplace/ChatDialog";
import { MessageSquare } from "lucide-react";

interface MessagesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const MessagesDialog = ({ open, onOpenChange }: MessagesDialogProps) => {
  const [selectedChatUser, setSelectedChatUser] = useState<{ id: string; name: string } | null>(null);
  const [chatOpen, setChatOpen] = useState(false);

  const handleSelectConversation = (userId: string, userName: string) => {
    setSelectedChatUser({ id: userId, name: userName });
    setChatOpen(true);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary" />
              Your Conversations
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <ConversationList onSelectConversation={handleSelectConversation} />
          </div>
        </DialogContent>
      </Dialog>

      {selectedChatUser && (
        <ChatDialog
          open={chatOpen}
          onOpenChange={setChatOpen}
          receiverId={selectedChatUser.id}
          receiverName={selectedChatUser.name}
        />
      )}
    </>
  );
};

export default MessagesDialog;
