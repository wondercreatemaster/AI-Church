"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  exportConversationAsText,
  exportConversationAsJSON,
  downloadFile,
  generateFilename,
} from "@/lib/utils/export-conversation";
import { toast } from "sonner";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface Conversation {
  id?: string;
  title?: string;
  stage?: string;
  userBelief?: string;
  createdAt?: Date;
}

interface DownloadConversationButtonProps {
  messages: Message[];
  conversation?: Conversation;
  disabled?: boolean;
}

export function DownloadConversationButton({
  messages,
  conversation,
  disabled = false,
}: DownloadConversationButtonProps) {
  const handleDownloadText = () => {
    try {
      const content = exportConversationAsText(messages, conversation);
      const filename = generateFilename(conversation?.title, "txt");
      downloadFile(content, filename, "text/plain;charset=utf-8");
      toast.success("Conversation exported as text");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export conversation");
    }
  };

  const handleDownloadJSON = () => {
    try {
      const content = exportConversationAsJSON(messages, conversation);
      const filename = generateFilename(conversation?.title, "json");
      downloadFile(content, filename, "application/json;charset=utf-8");
      toast.success("Conversation exported as JSON");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export conversation");
    }
  };

  if (disabled || messages.length === 0) {
    return (
      <Button variant="ghost" size="icon" disabled>
        <Download className="h-5 w-5" />
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" title="Download conversation">
          <Download className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleDownloadText}>
          <Download className="mr-2 h-4 w-4" />
          Download as Text
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleDownloadJSON}>
          <Download className="mr-2 h-4 w-4" />
          Download as JSON
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

