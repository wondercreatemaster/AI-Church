"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card } from "@/components/ui/card";
import { ArrowRight, Check } from "lucide-react";
import { beliefOptions } from "@/lib/mock-data";

interface BeliefSelectorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: (belief: string, denomination?: string) => void;
  allowSkip?: boolean;
}

export function BeliefSelectorDialog({
  open,
  onOpenChange,
  onComplete,
  allowSkip = false,
}: BeliefSelectorDialogProps) {
  const [selectedBelief, setSelectedBelief] = useState<string>("");
  const [denomination, setDenomination] = useState<string>("");

  const handleContinue = () => {
    if (selectedBelief) {
      onComplete(selectedBelief, denomination || undefined);
      onOpenChange(false);
    }
  };

  const handleSkip = () => {
    onComplete("unknown");
    onOpenChange(false);
  };

  const needsDenomination = selectedBelief === "protestant" || selectedBelief === "other";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl min-w-3xl max-h-[90vh] overflow-y-auto p-0">
        {/* Header with gradient background */}
        <div className="bg-gradient-to-r from-orthodox-600 to-orthodox-700 px-8 py-6 rounded-t-lg">
          <DialogHeader>
            <DialogTitle className="text-3xl font-display font-bold text-white mb-2">
              Your Faith Journey
            </DialogTitle>
            <DialogDescription className="text-white/90 text-base">
              Help us understand your background to provide relevant insights and personalized
              guidance.
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Content area */}
        <div className="px-8 py-6">
          <RadioGroup value={selectedBelief} onValueChange={setSelectedBelief}>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
              {beliefOptions.map((option) => (
                <Label
                  key={option.value}
                  htmlFor={option.value}
                  className="cursor-pointer group"
                >
                  <Card
                    className={`relative p-6 border-2 w-48 h-48 transition-all duration-300 rounded-2xl overflow-hidden ${
                      selectedBelief === option.value
                        ? "border-byzantine-500 bg-gradient-to-br from-byzantine-50 via-white to-byzantine-50 shadow-lg scale-105"
                        : "border-gray-200 bg-white hover:border-byzantine-300 hover:shadow-md hover:scale-102"
                    }`}
                  >
                    {/* Background decoration */}
                    <div className={`absolute -top-8 -right-8 w-24 h-24 rounded-full transition-all duration-300 ${
                      selectedBelief === option.value 
                        ? "bg-byzantine-200/40" 
                        : "bg-gray-100/40 group-hover:bg-byzantine-100/40"
                    }`} />
                    
                    <RadioGroupItem
                      value={option.value}
                      id={option.value}
                      className="sr-only"
                    />
                    
                    <div className="flex flex-col items-center text-center gap-3 relative z-10">
                      {/* Emoji container with better styling */}
                      <div className={`w-20 h-20 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                        selectedBelief === option.value
                          ? "bg-gradient-to-br from-byzantine-100 to-byzantine-200 shadow-md"
                          : "bg-gray-50 group-hover:bg-byzantine-50"
                      }`}>
                        <span className="text-4xl">{option.emoji}</span>
                      </div>
                      
                      {/* Label */}
                      <span
                        className={`text-base font-semibold transition-colors ${
                          selectedBelief === option.value
                            ? "text-byzantine-700"
                            : "text-gray-700 group-hover:text-byzantine-600"
                        }`}
                      >
                        {option.label}
                      </span>
                      
                      {/* Checkmark for selected state */}
                      {selectedBelief === option.value && (
                        <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-gradient-to-br from-byzantine-500 to-byzantine-600 flex items-center justify-center shadow-lg animate-in zoom-in duration-200">
                          <Check className="w-4 h-4 text-white" strokeWidth={3} />
                        </div>
                      )}
                    </div>
                  </Card>
                </Label>
              ))}
            </div>
          </RadioGroup>

          {/* Denomination input */}
          {needsDenomination && (
            <div className="mt-8 p-6 bg-gradient-to-br from-byzantine-50 to-white rounded-2xl border-2 border-byzantine-200 animate-in slide-in-from-top-2 duration-300">
              <Label htmlFor="denomination" className="text-base font-semibold text-orthodox-600 mb-3 block">
                Which denomination or tradition?
              </Label>
              <Input
                id="denomination"
                value={denomination}
                onChange={(e) => setDenomination(e.target.value)}
                placeholder="e.g., Baptist, Lutheran, Pentecostal..."
                className="w-full border-2 border-byzantine-200 focus:border-byzantine-500 rounded-xl py-3 px-4 text-base"
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-6 bg-gray-50 border-t flex flex-col md:flex-row gap-3 justify-between rounded-b-lg">
          {allowSkip && (
            <Button 
              variant="ghost" 
              onClick={handleSkip} 
              className="text-gray-600 hover:text-gray-800 hover:bg-gray-200"
            >
              Skip for now
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
          <Button
            onClick={handleContinue}
            disabled={!selectedBelief}
            className="bg-gradient-to-r from-byzantine-500 to-byzantine-600 hover:from-byzantine-600 hover:to-byzantine-700 text-white shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed px-8 py-6 text-base font-semibold w-full md:w-auto"
          >
            <Check className="mr-2 h-5 w-5" />
            Continue
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
