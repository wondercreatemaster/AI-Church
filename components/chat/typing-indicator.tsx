"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Cross } from "lucide-react";

export function TypingIndicator() {
  return (
    <div className="flex justify-start mb-6 max-w-[85%] md:max-w-[75%]">
      {/* Bot Avatar */}
      <Avatar className="w-10 h-10 mr-3 border-2 border-orthodox-500 bg-white flex-shrink-0">
        <AvatarFallback className="bg-white">
          <Cross className="w-5 h-5 text-orthodox-600" />
        </AvatarFallback>
      </Avatar>

      {/* Typing Animation */}
      <Card className="bg-white text-gray-800 rounded-2xl rounded-tl-sm border border-gray-200 p-4 shadow-md">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "0ms" }} />
          <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "150ms" }} />
          <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "300ms" }} />
          <span className="ml-2 text-sm text-gray-500">Orthodox Chatbot is thinking...</span>
        </div>
      </Card>
    </div>
  );
}

