
import { Button } from "@/components/ui/button";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { X, Car } from "lucide-react";

interface ChatHeaderProps {
  ownerName: string;
  carTitle?: string;
  onClose: () => void;
}

const ChatHeader = ({ ownerName, carTitle, onClose }: ChatHeaderProps) => {
  return (
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 flex-shrink-0">
      <div className="flex flex-col">
        <CardTitle className="text-sm font-medium">Chat with {ownerName}</CardTitle>
        {carTitle && (
          <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
            <Car className="h-3 w-3" />
            <span>{carTitle}</span>
          </div>
        )}
      </div>
      <Button variant="ghost" size="sm" onClick={onClose}>
        <X className="h-4 w-4" />
      </Button>
    </CardHeader>
  );
};

export default ChatHeader;
