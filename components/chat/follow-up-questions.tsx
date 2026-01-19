"use client";

import { Plus } from "lucide-react";

interface FollowUpQuestionsProps {
  questions: string[];
  onQuestionClick: (question: string) => void;
}

export function FollowUpQuestions({ questions, onQuestionClick }: FollowUpQuestionsProps) {
  if (!questions || questions.length === 0) {
    return null;
  }

  return (
    <div className="mt-4 w-full space-y-2">
      {questions.map((question, index) => (
        <button
          key={index}
          onClick={() => onQuestionClick(question)}
          className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left text-sm md:text-base text-gray-700 hover:text-byzantine-700 bg-gray-50 hover:bg-byzantine-50 border border-gray-200 hover:border-byzantine-300 rounded-lg transition-all group"
        >
          <span className="flex-1">{question}</span>
          <Plus className="w-5 h-5 flex-shrink-0 text-gray-400 group-hover:text-byzantine-600 transition-colors" />
        </button>
      ))}
    </div>
  );
}

