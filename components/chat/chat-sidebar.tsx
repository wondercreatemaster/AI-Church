"use client";

import { Plus, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface ChatSidebarProps {
  onNewConversation?: () => void;
  onSelectConversation?: (conversation: any) => void;
  selectedConversationId?: string;
  conversations?: any[];
  isLoading?: boolean;
}

export function ChatSidebar({ 
  onNewConversation, 
  onSelectConversation, 
  selectedConversationId,
  conversations = [],
  isLoading = false
}: ChatSidebarProps) {
  return (
    <div className="w-full md:w-64 lg:w-72 h-full bg-white md:border-r border-gray-200 p-4 flex flex-col">
      {/* New Conversation Button */}
      <Button
        className="w-full mb-4 bg-byzantine-500 hover:bg-byzantine-600"
        onClick={onNewConversation}
      >
        <Plus className="mr-2 h-4 w-4" />
        New Conversation
      </Button>

      <Separator className="mb-4" />

      {/* Recent Conversations */}
      <div className="flex-1 overflow-hidden">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Recent Conversations
        </h3>

        <ScrollArea className="h-[calc(100vh-200px)]">
          <div className="space-y-2">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-byzantine-500" />
              </div>
            ) : conversations.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">
                No conversations yet
              </p>
            ) : (
              conversations.map((conversation) => (
              <button
                key={conversation.id}
                onClick={() => onSelectConversation?.(conversation)}
                className={`group w-full p-3 rounded-lg text-left transition-all hover:bg-gray-100 ${
                  selectedConversationId === conversation.id
                    ? "bg-byzantine-50 border-l-4 border-byzantine-500"
                    : ""
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <h4 className="text-sm font-medium text-gray-900 truncate flex-1 pr-2">
                    {conversation.title}
                  </h4>
                  <button
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Handle delete
                    }}
                  >
                    <Trash2 className="h-3 w-3 text-gray-400 hover:text-red-500" />
                  </button>
                </div>
                <p className="text-xs text-gray-500">
                  Stage: {conversation.stage} • {new Date(conversation.lastMessageAt || conversation.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </button>
            )))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}

