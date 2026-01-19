"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Save, UserPlus, LogIn } from "lucide-react";

interface SaveConversationBannerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDismissPermanently?: () => void;
}

export function SaveConversationBanner({ open, onOpenChange, onDismissPermanently }: SaveConversationBannerProps) {
  const router = useRouter();

  // Auto-close after 10 seconds
  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        onOpenChange(false);
      }, 10000); // 10 seconds

      return () => clearTimeout(timer);
    }
  }, [open, onOpenChange]);

  const handleSignUp = () => {
    onOpenChange(false);
    router.push("/signup");
  };

  const handleLogin = () => {
    onOpenChange(false);
    router.push("/login");
  };

  const handleDismiss = () => {
    onOpenChange(false);
    onDismissPermanently?.();
  };

  return (
    <Dialog open={open} onOpenChange={(open) => {
      if (!open) {
        handleDismiss();
      }
    }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-byzantine-400 to-byzantine-600 rounded-xl flex items-center justify-center shrink-0">
              <Save className="w-6 h-6 text-white" />
            </div>
            <DialogTitle className="text-2xl font-bold text-orthodox-700">
              💾 Save Your Conversation
            </DialogTitle>
          </div>
          <DialogDescription className="text-base text-gray-600 pt-2">
            Create a free account to save your conversations and access them anytime, anywhere! 
            Your spiritual journey matters, and we want to help you keep track of it.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 pt-4">
          <Button
            onClick={handleSignUp}
            size="lg"
            className="bg-byzantine-500 hover:bg-byzantine-600 text-white font-semibold"
          >
            <UserPlus className="w-5 h-5 mr-2" />
            Sign Up Now - It's Free!
          </Button>
          
          <Button
            onClick={handleLogin}
            variant="outline"
            size="lg"
            className="border-2 border-byzantine-300 text-byzantine-700 hover:bg-byzantine-50 font-semibold"
          >
            <LogIn className="w-5 h-5 mr-2" />
            Already Have an Account? Log In
          </Button>

          <Button
            onClick={handleDismiss}
            variant="ghost"
            className="text-gray-500 hover:text-gray-700"
          >
            Maybe Later
          </Button>
        </div>

        <div className="pt-4 border-t border-gray-200">
          <div className="text-xs text-gray-500 space-y-1">
            <p className="flex items-center gap-2">
              <span className="text-green-600">✓</span> Free forever - no credit card required
            </p>
            <p className="flex items-center gap-2">
              <span className="text-green-600">✓</span> Save unlimited conversations
            </p>
            <p className="flex items-center gap-2">
              <span className="text-green-600">✓</span> Access from any device
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
