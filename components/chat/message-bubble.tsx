"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Cross, User, ChevronRight } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { FollowUpQuestions } from "./follow-up-questions";
import { ChurchResults, ChurchResult } from "./church-results";
import { SourceReferences } from "./source-references";

interface MessageBubbleProps {
  message: {
    id: string;
    role: "user" | "assistant";
    content: string;
    timestamp: Date;
    followUpQuestions?: string[];
    hasMore?: boolean;
    sources?: string[];           // AI-retrieved sources from RAG
    userReferences?: string[];    // User-added/edited references
    churchResults?: {
      location: { lat: number; lng: number };
      churches: ChurchResult[];
      total: number;
    };
  };
  onQuestionClick?: (question: string) => void;
  onTellMeMore?: (messageContent: string) => void;
  onAddReference?: (messageId: string, ref: string) => void;
  onEditReference?: (messageId: string, index: number, newRef: string) => void;
  onDeleteReference?: (messageId: string, index: number) => void;
}

export function MessageBubble({ 
  message, 
  onQuestionClick, 
  onTellMeMore,
  onAddReference,
  onEditReference,
  onDeleteReference,
}: MessageBubbleProps) {
  const isUser = message.role === "user";
  const hasSources = (message.sources && message.sources.length > 0) || 
                     (message.userReferences && message.userReferences.length > 0);

  return (
    <div
      className={`flex mb-6 ${
        isUser ? "justify-end" : "justify-start"
      } max-w-[85%] md:max-w-[75%] ${isUser ? "ml-auto" : "mr-auto"}`}
    >
      {/* Bot Avatar (left) */}
      {!isUser && (
        <Avatar className="w-10 h-10 mr-3 border-2 border-orthodox-500 bg-white flex-shrink-0">
          <AvatarFallback className="bg-white">
            <Cross className="w-5 h-5 text-orthodox-600" />
          </AvatarFallback>
        </Avatar>
      )}

      {/* Message Content */}
      <div className="flex-1">
        <Card
          className={`p-4 shadow-md ${
            isUser
              ? "bg-byzantine-500 text-white rounded-2xl rounded-tr-sm border-none"
              : "bg-white text-gray-800 rounded-2xl rounded-tl-sm border border-gray-200"
          }`}
        >
          {isUser ? (
            <p className="text-sm md:text-base leading-relaxed whitespace-pre-wrap">
              {message.content}
            </p>
          ) : (
            <div className="prose prose-sm md:prose-base max-w-none prose-p:leading-relaxed prose-p:my-2 prose-headings:font-display prose-headings:text-orthodox-600 prose-strong:text-orthodox-700 prose-strong:font-semibold prose-ol:my-2 prose-ul:my-2 prose-li:my-1">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {message.content}
              </ReactMarkdown>
            </div>
          )}
        </Card>

        {/* Tell Me More Button (only when AI indicates more content available) */}
        {!isUser && message.hasMore && onTellMeMore && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onTellMeMore(message.content)}
            className="mt-2 text-byzantine-600 hover:text-byzantine-700 hover:bg-byzantine-50 border border-byzantine-200 rounded-full px-4"
          >
            <ChevronRight className="w-4 h-4 mr-1" />
            Tell me more
          </Button>
        )}

        {/* Church Results (only for assistant messages) */}
        {!isUser && message.churchResults && (
          <ChurchResults
            churches={message.churchResults.churches}
            location={message.churchResults.location}
            total={message.churchResults.total}
          />
        )}

        {/* Sources and References (only for assistant messages) */}
        {!isUser && (hasSources || onAddReference) && (
          <SourceReferences
            sources={message.sources}
            userReferences={message.userReferences}
            onAddReference={onAddReference ? (ref) => onAddReference(message.id, ref) : undefined}
            onEditReference={onEditReference ? (idx, ref) => onEditReference(message.id, idx, ref) : undefined}
            onDeleteReference={onDeleteReference ? (idx) => onDeleteReference(message.id, idx) : undefined}
            isEditable={!!onAddReference}
          />
        )}

        {/* Follow-up Questions (only for assistant messages) */}
        {!isUser && message.followUpQuestions && onQuestionClick && (
          <FollowUpQuestions
            questions={message.followUpQuestions}
            onQuestionClick={onQuestionClick}
          />
        )}

        {/* Timestamp */}
        <p
          className={`text-xs mt-2 ${
            isUser ? "text-right text-gray-500" : "text-left text-gray-500"
          }`}
        >
          {new Date(message.timestamp).toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true
          })}
        </p>
      </div>

      {/* User Avatar (right) */}
      {isUser && (
        <Avatar className="w-10 h-10 ml-3 bg-orthodox-500 flex-shrink-0">
          <AvatarFallback className="bg-orthodox-500 text-white">
            <User className="w-5 h-5" />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
