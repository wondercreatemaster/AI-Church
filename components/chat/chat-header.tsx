"use client";

import { Cross, Menu, MoreVertical, MessageSquarePlus, Settings, Eye, MapPin, BookOpen, Info, Shield, UserCircle, GitCompare, MessageCircle, BookMarked, History, Mic, MessageSquare, Database } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import Link from "next/link";
import { ConversationStage } from "@/lib/mock-data";
import { UserMenu } from "./user-menu";
import { DownloadConversationButton } from "./download-conversation-button";

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

interface ChatHeaderProps {
  stage?: ConversationStage;
  onNewConversation?: () => void;
  onChangeBackground?: () => void;
  sidebarContent?: React.ReactNode;
  user?: {
    name?: string | null;
    email?: string | null;
    avatar?: string | null;
    selectedReligion?: string | null;
  };
  // Conversion tracking props
  opennessScore?: number;
  resistanceLevel?: number;
  conversionProgress?: {
    goalsAchieved: number;
    goalsTotal: number;
  };
  // Voice chat mode props
  chatMode?: "text" | "voice";
  onToggleChatMode?: () => void;
  // Download conversation props
  messages?: Message[];
  conversation?: Conversation;
  // Mobile menu state
  mobileMenuOpen?: boolean;
  onMobileMenuOpenChange?: (open: boolean) => void;
}

export function ChatHeader({ stage, onNewConversation, onChangeBackground, sidebarContent, user, opennessScore, resistanceLevel, conversionProgress, chatMode = "text", onToggleChatMode, messages = [], conversation, mobileMenuOpen = false, onMobileMenuOpenChange }: ChatHeaderProps) {
  const getConversionBadge = () => {
    // If no conversion data, show stage
    if (opennessScore === undefined && !stage) return null;

    // Show openness score if available
    if (opennessScore !== undefined) {
      const openness = opennessScore;
      let color = "bg-red-50 text-red-700 border-red-300";
      let label = "Resistant";

      if (openness >= 8) {
        color = "bg-green-50 text-green-700 border-green-300";
        label = "Very Open";
      } else if (openness >= 6) {
        color = "bg-emerald-50 text-emerald-700 border-emerald-300";
        label = "Receptive";
      } else if (openness >= 4) {
        color = "bg-yellow-50 text-yellow-700 border-yellow-300";
        label = "Neutral";
      } else if (openness >= 2) {
        color = "bg-orange-50 text-orange-700 border-orange-300";
        label = "Resistant";
      }

      return (
        <Badge variant="outline" className={`${color} px-3 py-1`}>
          <Shield className="w-4 h-4 mr-1" />
          {label} ({openness}/10)
        </Badge>
      );
    }

    // Fallback to stage if no conversion data
    if (!stage) return null;

    const stages = {
      A: { label: "Getting to Know You", icon: UserCircle, color: "bg-blue-50 text-blue-700 border-blue-300" },
      B: { label: "Understanding Differences", icon: GitCompare, color: "bg-amber-50 text-amber-700 border-amber-300" },
      C: { label: "Exploring Together", icon: MessageCircle, color: "bg-green-50 text-green-700 border-green-300" },
      D: { label: "Next Steps", icon: BookMarked, color: "bg-purple-50 text-purple-700 border-purple-300" },
    };

    const stageInfo = stages[stage];
    const StageIcon = stageInfo.icon;

    return (
      <Badge variant="outline" className={`${stageInfo.color} px-3 py-1`}>
        <StageIcon className="w-4 h-4 mr-1" />
        {stageInfo.label}
      </Badge>
    );
  };

  const getConversionProgressBadge = () => {
    if (!conversionProgress) return null;

    const { goalsAchieved, goalsTotal } = conversionProgress;
    if (goalsTotal === 0) return null;

    const percentage = Math.round((goalsAchieved / goalsTotal) * 100);
    let color = "bg-gray-50 text-gray-700 border-gray-300";

    if (percentage >= 75) {
      color = "bg-green-50 text-green-700 border-green-300";
    } else if (percentage >= 50) {
      color = "bg-yellow-50 text-yellow-700 border-yellow-300";
    } else if (percentage >= 25) {
      color = "bg-orange-50 text-orange-700 border-orange-300";
    }

    return (
      <Badge variant="outline" className={`${color} px-3 py-1`}>
        <BookMarked className="w-4 h-4 mr-1" />
        Progress: {goalsAchieved}/{goalsTotal}
      </Badge>
    );
  };

  return (
    <header className="sticky top-0 z-50 h-16 bg-white/95 backdrop-blur border-b border-gray-200 shadow-sm px-2 sm:px-4 md:px-8">
      <div className="h-full flex items-center justify-between gap-1 sm:gap-2">
        {/* Left Section */}
        <div className="flex items-center gap-1 sm:gap-3 min-w-0 flex-shrink">
          {/* Mobile Menu */}
          {sidebarContent && (
            <Sheet open={mobileMenuOpen} onOpenChange={onMobileMenuOpenChange}>
              <SheetTrigger asChild className="md:hidden flex-shrink-0">
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-full max-w-sm p-0 pt-12">
                {sidebarContent}
              </SheetContent>
            </Sheet>
          )}

          {/* Logo and Title */}
          <Link href="/" className="flex items-center gap-2 sm:gap-3 hover:opacity-80 transition-opacity min-w-0">
            <Cross className="h-6 w-6 sm:h-8 sm:w-8 text-orthodox-600 flex-shrink-0" />
            <span className="text-sm sm:text-lg md:text-xl font-display font-semibold text-orthodox-600 truncate">
              Orthodox Chatbot
            </span>
          </Link>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          {/* Chat Mode Toggle - Hidden on mobile, will be floating */}
          {onToggleChatMode && (
            <Button
              variant="outline"
              size="sm"
              onClick={onToggleChatMode}
              className={`hidden sm:flex items-center gap-2 ${
                chatMode === "voice" 
                  ? "bg-byzantine-50 border-byzantine-300 text-byzantine-700 hover:bg-byzantine-100" 
                  : ""
              }`}
            >
              {chatMode === "text" ? (
                <>
                  <Mic className="w-4 h-4" />
                  <span className="hidden sm:inline">Voice</span>
                </>
              ) : (
                <>
                  <MessageSquare className="w-4 h-4" />
                  <span className="hidden sm:inline">Text</span>
                </>
              )}
            </Button>
          )}

          {/* Conversion Progress Badges - Hidden on small screens */}
          <div className="hidden md:flex items-center gap-2">
            {getConversionProgressBadge()}
            {getConversionBadge()}
          </div>

          {/* Download Button - Hidden on mobile */}
          <div className="hidden sm:block">
            <DownloadConversationButton 
              messages={messages}
              conversation={conversation}
              disabled={messages.length === 0}
            />
          </div>

          {/* User Menu - Smaller on mobile */}
          {user && <UserMenu user={user} />}

          {/* Options Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={onNewConversation}>
                <MessageSquarePlus className="mr-2 h-4 w-4" />
                New Conversation
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/conversations">
                  <History className="mr-2 h-4 w-4" />
                  All Conversations
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/training">
                  <Database className="mr-2 h-4 w-4" />
                  Add training data
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onChangeBackground}>
                <Settings className="mr-2 h-4 w-4" />
                Change Background
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Eye className="mr-2 h-4 w-4" />
                Display Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/churches">
                  <MapPin className="mr-2 h-4 w-4" />
                  Find a Church
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <BookOpen className="mr-2 h-4 w-4" />
                Reading Resources
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Info className="mr-2 h-4 w-4" />
                About
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Shield className="mr-2 h-4 w-4" />
                Privacy Policy
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

