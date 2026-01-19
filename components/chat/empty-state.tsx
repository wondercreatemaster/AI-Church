"use client";

import { Button } from "@/components/ui/button";
import { MessageCircle, ChevronRight } from "lucide-react";
import { suggestedQuestions } from "@/lib/mock-data";

interface EmptyStateProps {
  onQuestionClick: (question: string) => void;
}

export function EmptyState({ onQuestionClick }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-4">
      <MessageCircle className="w-16 h-16 text-gray-300 mb-6" />
      
      <h2 className="text-2xl font-display font-semibold text-gray-700 mb-2">
        Start Your Journey
      </h2>
      
      <p className="text-gray-500 mb-8 max-w-md">
        Ask any question about Orthodox Christianity, or let me guide you through understanding the Faith.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-4xl w-full">
        {suggestedQuestions.map((question, index) => (
          <Button
            key={index}
            variant="outline"
            size="lg"
            className="justify-between text-left h-auto py-3 px-4 hover:border-byzantine-500 hover:bg-byzantine-50 transition-all"
            onClick={() => onQuestionClick(question)}
          >
            <span className="text-sm">{question}</span>
            <ChevronRight className="h-4 w-4 ml-2 flex-shrink-0" />
          </Button>
        ))}
      </div>
    </div>
  );
}

