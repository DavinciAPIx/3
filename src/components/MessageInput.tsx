
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";
import { useTranslation } from "react-i18next";

interface MessageInputProps {
  onSendMessage: (message: string) => Promise<void>;
  loading: boolean;
}

const MessageInput = ({ onSendMessage, loading }: MessageInputProps) => {
  const [newMessage, setNewMessage] = useState("");
  const { t } = useTranslation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || loading) return;

    const messageContent = newMessage.trim();
    setNewMessage(""); // Clear input immediately for better UX
    
    try {
      await onSendMessage(messageContent);
    } catch (error) {
      // Restore message on error
      setNewMessage(messageContent);
    }
  };

  return (
    <div className="flex-shrink-0 p-3 border-t bg-white">
      <form onSubmit={handleSubmit} className="flex gap-2 items-center">
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder={t("mailbox.typeMessage")}
          disabled={loading}
          className="flex-1"
          autoFocus
        />
        <Button 
          type="submit" 
          size="sm" 
          disabled={loading || !newMessage.trim()}
          className="flex-shrink-0"
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
};

export default MessageInput;
