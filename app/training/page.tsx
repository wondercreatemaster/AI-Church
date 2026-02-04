import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import TrainingClient from "./training-client";

export default function TrainingPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <div className="mb-6 flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/chat" aria-label="Back to chat">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="font-display text-2xl font-semibold text-orthodox-800">
              Add training data
            </h1>
            <p className="text-sm text-gray-500">
              Add text, PDFs, or web pages so the chatbot can use them in answers.
            </p>
          </div>
        </div>

        <TrainingClient />
      </div>
    </div>
  );
}
