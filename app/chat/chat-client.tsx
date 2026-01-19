"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ChatHeader } from "@/components/chat/chat-header";
import { ChatSidebar } from "@/components/chat/chat-sidebar";
import { MessageBubble } from "@/components/chat/message-bubble";
import { TypingIndicator } from "@/components/chat/typing-indicator";
import { ChatInput } from "@/components/chat/chat-input";
import { VoiceChatPanel } from "@/components/chat/voice-chat-panel";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowLeft, Square, ArrowDown, Mic, MessageSquare } from "lucide-react";
import Link from "next/link";
import { getUserConversationsAction, loadConversationMessagesAction } from "@/app/actions/chat";
import { getAnonymousConversationsAction, loadAnonymousConversationAction } from "@/app/actions/anonymous-chat";
import { ConversationStage } from "@/lib/db/models/conversation";
import { toast } from "sonner";
import { SaveConversationBanner } from "@/components/chat/save-conversation-banner";

interface ChatPageClientProps {
  session: {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      avatar?: string | null;
      selectedReligion?: string | null;
    };
  } | null;
}

interface DisplayMessage {
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
    churches: Array<{
      id: string;
      name: string;
      jurisdiction?: string;
      address: string;
      phone?: string;
      website?: string;
      distance?: string;
      coordinates: { lat: number; lng: number };
      placeId: string;
      rating?: number;
      userRatingsTotal?: number;
    }>;
    total: number;
  };
}

/**
 * Parse follow-up questions from AI response
 * Looks for "### Follow-up Questions" marker followed by numbered list
 */
function parseFollowUpQuestions(content: string): { mainContent: string; questions: string[] } {
  const marker = "### Follow-up Questions";
  const markerIndex = content.indexOf(marker);
  
  if (markerIndex === -1) {
    return { mainContent: content, questions: [] };
  }
  
  // Split content at the marker
  const mainContent = content.substring(0, markerIndex).trim();
  const questionsSection = content.substring(markerIndex + marker.length).trim();
  
  // Extract numbered questions (1., 2., 3., etc.)
  const questionRegex = /^\d+\.\s+(.+)$/gm;
  const questions: string[] = [];
  let match;
  
  while ((match = questionRegex.exec(questionsSection)) !== null) {
    questions.push(match[1].trim());
  }
  
  return { mainContent, questions };
}

export default function ChatPageClient({ session }: ChatPageClientProps) {
  const router = useRouter();
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [stage, setStage] = useState<ConversationStage>("A");
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Array<{
    id: string;
    title: string;
    stage: ConversationStage;
    createdAt: Date;
    updatedAt: Date;
    lastMessageAt: Date;
  }>>([]);
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const messageCounterRef = useRef(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const shouldScrollRef = useRef(false);
  const timelineMessageSentRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Conversion tracking state
  const [opennessScore, setOpennessScore] = useState<number>(5);
  const [resistanceLevel, setResistanceLevel] = useState<number>(5);
  const [conversionGoals, setConversionGoals] = useState<Array<{ type: string; achieved: boolean }>>([]);

  // Voice chat mode state
  const [chatMode, setChatMode] = useState<"text" | "voice">("text");

  // Mobile menu state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Anonymous user tracking
  const [userMessageCount, setUserMessageCount] = useState(0);
  const [showSignupBanner, setShowSignupBanner] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const isAnonymous = !session?.user;

  // User geolocation for church finder
  const [userGeolocation, setUserGeolocation] = useState<{ lat: number; lng: number } | null>(null);

  // Check if user has permanently dismissed the banner
  useEffect(() => {
    if (typeof window !== "undefined") {
      const dismissed = localStorage.getItem("signupBannerDismissed");
      if (dismissed === "true") {
        setBannerDismissed(true);
      }
    }
  }, []);

  // Get user's geolocation on mount for church finder
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserGeolocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          console.log("Geolocation captured:", position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          // Silently fail - user can provide location manually
          console.log("Geolocation not available:", error);
        },
        { enableHighAccuracy: false, timeout: 5000, maximumAge: 300000 }
      );
    }
  }, []);

  // Store timeline event in state for later use
  const [pendingTimelineMessage, setPendingTimelineMessage] = useState<string | null>(null);

  // Check for timeline event on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const selectedEvent = localStorage.getItem("selectedEvent");
      if (selectedEvent) {
        try {
          const event = JSON.parse(selectedEvent);
          // Clear it immediately
          localStorage.removeItem("selectedEvent");
          
          // Create context message
          const contextMessage = `I'm interested in learning about "${event.title}" (${event.year}${typeof event.year === 'number' ? ' AD' : ''}). ${event.description} Can you tell me more about this event and its significance in church history?`;
          
          setPendingTimelineMessage(contextMessage);
        } catch (error) {
          console.error("Error parsing timeline event:", error);
          localStorage.removeItem("selectedEvent");
        }
      }
    }
  }, []);

  const userBelief = session?.user?.selectedReligion || 
    (typeof window !== "undefined" ? localStorage.getItem("userBelief") || "" : "");
  
  const userBeliefName = typeof window !== "undefined" ? localStorage.getItem("userBeliefName") || "" : "";
  
  const [initialQuestionTriggered, setInitialQuestionTriggered] = useState(false);

  const loadConversations = useCallback(async () => {
    setIsLoadingConversations(true);
    
    if (session?.user) {
      // Load authenticated user's conversations
      const result = await getUserConversationsAction();
      if (result.success) {
        setConversations(result.conversations);
      }
    } else {
      // Load anonymous user's conversations
      const result = await getAnonymousConversationsAction();
      if (result.success) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setConversations(result.conversations as any);
      }
    }
    
    setIsLoadingConversations(false);
  }, [session?.user]);

  // Load conversations on mount (for both authenticated and anonymous users)
  useEffect(() => {
    const fetchConversations = async () => {
      setIsLoadingConversations(true);
      
      if (session?.user) {
        // Load authenticated user's conversations
        const result = await getUserConversationsAction();
        if (result.success) {
          setConversations(result.conversations);
        }
      } else {
        // Load anonymous user's conversations
        const result = await getAnonymousConversationsAction();
        if (result.success) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          setConversations(result.conversations as any);
        }
      }
      
      setIsLoadingConversations(false);
    };
    fetchConversations();
  }, [session]);

  // Auto-scroll only when user sends a message
  useEffect(() => {
    if (shouldScrollRef.current) {
      requestAnimationFrame(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
      });
      shouldScrollRef.current = false;
    }
  }, [messages]);

  // Update user message count when messages change (for anonymous users)
  useEffect(() => {
    if (isAnonymous && messages.length > 0 && !bannerDismissed) {
      const userMsgCount = messages.filter(msg => msg.role === "user").length;
      setUserMessageCount(userMsgCount);
      
      // Show signup banner if user has sent 5+ messages
      if (userMsgCount >= 5 && !showSignupBanner) {
        setShowSignupBanner(true);
      }
    }
  }, [messages, isAnonymous, showSignupBanner, bannerDismissed]);

  // Auto-start conversation with first question when user has selected belief
  useEffect(() => {
    const triggerInitialQuestion = async () => {
      // Only trigger if:
      // 1. User has selected a belief
      // 2. No messages yet
      // 3. Not currently typing
      // 4. Haven't already triggered
      // 5. No pending timeline message
      if (
        userBelief &&
        messages.length === 0 &&
        !isTyping &&
        !initialQuestionTriggered &&
        !pendingTimelineMessage &&
        !timelineMessageSentRef.current
      ) {
        setInitialQuestionTriggered(true);
        setIsTyping(true);

        try {
          // Send intro message with denomination context to trigger agent's first question
          const introMessage = userBeliefName 
            ? `Hello, I'm ${userBeliefName} and I'm interested in learning about Orthodox Christianity and how it differs from my tradition.`
            : "Hello, I'm interested in learning about Orthodox Christianity.";
          
          // Use the streaming API directly
          const response = await fetch('/api/chat/stream', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              conversationId: currentConversationId,
              content: introMessage,
              userBelief,
              userLocation: userGeolocation, // Include geolocation
            }),
          });

          if (!response.ok) {
            throw new Error('Streaming failed');
          }

          // Add user message
          const tempId = `temp-${Date.now()}`;
          const userMsg: DisplayMessage = {
            id: tempId,
            role: "user",
            content: introMessage,
            timestamp: new Date(),
          };
          setMessages([userMsg]);

          // Create assistant message placeholder
          const tempAssistantId = `temp-assistant-${Date.now()}`;
          const assistantMessage: DisplayMessage = {
            id: tempAssistantId,
            role: "assistant",
            content: "",
            timestamp: new Date(),
          };

          setMessages(prev => [...prev, assistantMessage]);
          setIsTyping(false);

          // Read streaming response
          const reader = response.body?.getReader();
          const decoder = new TextDecoder();
          let fullResponse = "";
          let churchResultsData: DisplayMessage['churchResults'] | null = null;

          if (reader) {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              const chunk = decoder.decode(value);
              const lines = chunk.split('\n');

              for (const line of lines) {
                if (line.startsWith('data: ')) {
                  try {
                    const data = JSON.parse(line.slice(6));

                    if (data.chunk) {
                      fullResponse += data.chunk;
                      const { mainContent } = parseFollowUpQuestions(fullResponse);
                      setMessages(prev => prev.map(msg =>
                        msg.id === tempAssistantId
                          ? { ...msg, content: mainContent }
                          : msg
                      ));
                    }

                    // Handle church search results
                    if (data.type === 'church_search' && data.churchResults) {
                      churchResultsData = data.churchResults;
                      setMessages(prev => prev.map(msg => 
                        msg.id === tempAssistantId 
                          ? { ...msg, churchResults: churchResultsData ?? undefined }
                          : msg
                      ));
                    }

                    if (data.done) {
                      const { mainContent, questions } = parseFollowUpQuestions(fullResponse);
                      setMessages(prev => prev.map(msg =>
                        msg.id === tempAssistantId
                          ? {
                              ...msg,
                              id: data.messageId,
                              content: mainContent,
                              followUpQuestions: questions.length > 0 ? questions : undefined,
                              hasMore: data.hasMore || false,
                              sources: data.sources || undefined,
                              churchResults: churchResultsData || msg.churchResults
                            }
                          : msg
                      ));

                      if (data.conversationId && !currentConversationId) {
                        setCurrentConversationId(data.conversationId);
                        await loadConversations();
                      }

                      if (data.memoryState) {
                        setOpennessScore(data.memoryState.opennessScore);
                        setResistanceLevel(data.memoryState.resistanceLevel);
                        setConversionGoals(data.memoryState.conversionGoals);
                      }
                    }
                  } catch {
                    // Ignore parsing errors
                  }
                }
              }
            }
          }
        } catch (error) {
          console.error("Initial question error:", error);
          setIsTyping(false);
          // Don't show error to user for auto-triggered message
        }
      }
    };

    // Small delay to ensure component is fully ready
    const timer = setTimeout(() => {
      triggerInitialQuestion();
    }, 500);

    return () => clearTimeout(timer);
  }, [userBelief, messages.length, isTyping, initialQuestionTriggered, pendingTimelineMessage, currentConversationId, loadConversations]);

  const handleDismissPermanently = () => {
    setBannerDismissed(true);
    if (typeof window !== "undefined") {
      localStorage.setItem("signupBannerDismissed", "true");
    }
  };

  const handleStopGenerating = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsTyping(false);
      setIsStreaming(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    setShowScrollButton(false);
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    const isNearBottom = target.scrollHeight - target.scrollTop - target.clientHeight < 100;
    setShowScrollButton(!isNearBottom && messages.length > 0);
  };

  const loadConversation = async (conversationId: string) => {
    let result;
    
    if (session?.user) {
      // Load authenticated conversation
      result = await loadConversationMessagesAction(conversationId);
    } else {
      // Load anonymous conversation
      result = await loadAnonymousConversationAction(conversationId);
    }
    
    if (result.success && result.messages && result.conversation) {
      setMessages(result.messages.map(msg => {
        // Parse follow-up questions for assistant messages
        if (msg.role === "assistant") {
          const { mainContent, questions } = parseFollowUpQuestions(msg.content);
          return {
            id: msg.id,
            role: msg.role as "user" | "assistant",
            content: mainContent,
            timestamp: new Date(msg.timestamp),
            followUpQuestions: questions.length > 0 ? questions : undefined,
            hasMore: false, // Historical messages don't have hasMore evaluation
          };
        }
        return {
          id: msg.id,
          role: msg.role as "user" | "assistant",
          content: msg.content,
          timestamp: new Date(msg.timestamp),
        };
      }));
      setCurrentConversationId(conversationId);
      setStage(result.conversation.stage);
    } else {
      toast.error(result.message || "Failed to load conversation");
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

    messageCounterRef.current += 1;
    const tempId = `temp-${messageCounterRef.current}`;
    const tempAssistantId = `temp-assistant-${messageCounterRef.current}`;
    
    const userMessage: DisplayMessage = {
      id: tempId,
      role: "user",
      content,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    shouldScrollRef.current = true; // Trigger scroll when user sends message
    setIsTyping(true);

    // Check if user is asking for churches and we have geolocation
    const churchKeywords = /church(es)?\s+(near|around|in|by)\s+(me|my\s+area|here)|find\s+church|locate\s+church|church(es)?\s+near/i;
    if (churchKeywords.test(content) && userGeolocation) {
      // Automatically trigger church search with geolocation
      console.log("Auto-searching churches with geolocation:", userGeolocation);
      
      // Add a note to the content so the AI knows we're handling it
      content = `${content}\n\n[User location: ${userGeolocation.lat}, ${userGeolocation.lng}]`;
    }

    // Track user messages for anonymous users to show signup prompt
    if (isAnonymous) {
      const newCount = userMessageCount + 1;
      setUserMessageCount(newCount);
      // Show signup banner after 5 messages
      if (newCount >= 5 && !showSignupBanner) {
        setShowSignupBanner(true);
      }
    }

    try {
      // Create abort controller for this request
      abortControllerRef.current = new AbortController();
      setIsStreaming(true);

      // Use streaming API
      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversationId: currentConversationId,
          content,
          userBelief,
          userLocation: userGeolocation, // Pass geolocation to backend
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error('Streaming failed');
      }

      // Create assistant message placeholder
      const assistantMessage: DisplayMessage = {
        id: tempAssistantId,
        role: "assistant",
        content: "",
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);

      // Read streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullResponse = "";
      let churchResultsData: DisplayMessage['churchResults'] | null = null;

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                
                if (data.chunk) {
                  fullResponse += data.chunk;
                  // Parse to hide follow-up questions during streaming
                  const { mainContent } = parseFollowUpQuestions(fullResponse);
                  // Update assistant message with streaming content (without follow-up questions section)
                  setMessages(prev => prev.map(msg => 
                    msg.id === tempAssistantId 
                      ? { ...msg, content: mainContent }
                      : msg
                  ));
                }

                // Handle church search results
                if (data.type === 'church_search' && data.churchResults) {
                  churchResultsData = data.churchResults;
                  // Update message with church results immediately
                  setMessages(prev => prev.map(msg => 
                    msg.id === tempAssistantId 
                      ? { ...msg, churchResults: churchResultsData ?? undefined }
                      : msg
                  ));
                }

                if (data.done) {
                  // Parse follow-up questions from the full response
                  const { mainContent, questions } = parseFollowUpQuestions(fullResponse);
                  
                  // Update with final data including parsed content and questions
                  setMessages(prev => prev.map(msg => 
                    msg.id === tempAssistantId 
                      ? { 
                          ...msg, 
                          id: data.messageId,
                          content: mainContent,
                          followUpQuestions: questions.length > 0 ? questions : undefined,
                          hasMore: data.hasMore || false,
                          sources: data.sources || undefined,
                          churchResults: churchResultsData || msg.churchResults
                        }
                      : msg
                  ));

                  // Update conversation ID if new
                  if (data.conversationId && !currentConversationId) {
                    setCurrentConversationId(data.conversationId);
                    await loadConversations();
                  }

                  // Update conversion metrics
                  if (data.memoryState) {
                    setOpennessScore(data.memoryState.opennessScore);
                    setResistanceLevel(data.memoryState.resistanceLevel);
                    setConversionGoals(data.memoryState.conversionGoals);
                  }
                  
                  // Streaming is complete
                  setIsStreaming(false);
                }

                if (data.error) {
                  toast.error("Error during streaming");
                }
              } catch {
                // Ignore parsing errors for incomplete chunks
              }
            }
          }
        }
      }
    } catch (error) {
      console.error("Send message error:", error);
      setIsTyping(false);
      setIsStreaming(false);
      
      // Check if this was an abort
      if (error instanceof Error && error.name === 'AbortError') {
        toast.info("Generation stopped");
        // Remove the incomplete assistant message
        setMessages(prev => prev.filter(msg => msg.id !== tempAssistantId));
      } else {
        toast.error("Failed to send message");
      }
      
      setMessages(prev => prev.filter(msg => msg.id !== tempId));
    } finally {
      abortControllerRef.current = null;
    }
  };

  const handleNewConversation = async () => {
    if (messages.length > 0) {
      const confirmed = confirm("Start a new conversation? Your current chat is saved.");
      if (!confirmed) return;
    }
    
    setMessages([]);
    setCurrentConversationId(null);
    setStage("A");
    await loadConversations();
    // Close mobile menu after creating new conversation
    setMobileMenuOpen(false);
  };

  // Handle voice transcript messages
  const handleVoiceTranscript = (message: { role: "user" | "assistant"; content: string }) => {
    const newMessage: DisplayMessage = {
      id: `voice-${Date.now()}-${Math.random()}`,
      role: message.role,
      content: message.content,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, newMessage]);
  };

  // Toggle between text and voice modes
  const toggleChatMode = () => {
    setChatMode(prev => prev === "text" ? "voice" : "text");
    toast.info(chatMode === "text" ? "Switched to Voice Mode" : "Switched to Text Mode");
  };

  // Handle "Tell Me More" button click
  const handleTellMeMore = (messageContent: string) => {
    // Create a context-aware follow-up request
    const followUpRequest = `Please expand on this topic and give me more details. Here's what you just said:\n\n"${messageContent.slice(0, 200)}${messageContent.length > 200 ? '...' : ''}"\n\nI'd like to learn more about this.`;
    handleSendMessage(followUpRequest);
  };

  // Handle adding a user reference
  const handleAddReference = async (messageId: string, reference: string) => {
    try {
      // Optimistic update
      setMessages(prev => prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, userReferences: [...(msg.userReferences || []), reference] }
          : msg
      ));

      // Persist to API
      const response = await fetch('/api/chat/references', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageId, conversationId: currentConversationId, reference }),
      });

      if (!response.ok) {
        throw new Error('Failed to add reference');
      }
    } catch (error) {
      console.error('Error adding reference:', error);
      toast.error('Failed to add reference');
      // Rollback optimistic update
      setMessages(prev => prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, userReferences: (msg.userReferences || []).slice(0, -1) }
          : msg
      ));
    }
  };

  // Handle editing a user reference
  const handleEditReference = async (messageId: string, index: number, newReference: string) => {
    try {
      // Store old value for potential rollback
      const oldValue = messages.find(m => m.id === messageId)?.userReferences?.[index];
      
      // Optimistic update
      setMessages(prev => prev.map(msg => {
        if (msg.id === messageId && msg.userReferences) {
          const updated = [...msg.userReferences];
          updated[index] = newReference;
          return { ...msg, userReferences: updated };
        }
        return msg;
      }));

      // Persist to API
      const response = await fetch('/api/chat/references', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageId, conversationId: currentConversationId, reference: newReference, index }),
      });

      if (!response.ok) {
        throw new Error('Failed to edit reference');
      }
    } catch (error) {
      console.error('Error editing reference:', error);
      toast.error('Failed to edit reference');
      // Rollback would require storing old value - simplified here
    }
  };

  // Handle deleting a user reference
  const handleDeleteReference = async (messageId: string, index: number) => {
    try {
      // Store old value for potential rollback
      const oldReferences = messages.find(m => m.id === messageId)?.userReferences;
      
      // Optimistic update
      setMessages(prev => prev.map(msg => {
        if (msg.id === messageId && msg.userReferences) {
          const updated = [...msg.userReferences];
          updated.splice(index, 1);
          return { ...msg, userReferences: updated };
        }
        return msg;
      }));

      // Persist to API
      const response = await fetch('/api/chat/references', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageId, conversationId: currentConversationId, index }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete reference');
      }
    } catch (error) {
      console.error('Error deleting reference:', error);
      toast.error('Failed to delete reference');
      // Rollback would require storing old value
    }
  };

  const handleSelectConversation = async (conversation: { id: string }) => {
    await loadConversation(conversation.id);
    // Close mobile menu after selecting conversation
    setMobileMenuOpen(false);
  };

  // Send timeline message when component is ready
  useEffect(() => {
    if (pendingTimelineMessage && messages.length === 0 && !timelineMessageSentRef.current) {
      timelineMessageSentRef.current = true;
      // Small delay to ensure component is fully ready
      const timer = setTimeout(() => {
        handleSendMessage(pendingTimelineMessage);
        setPendingTimelineMessage(null);
      }, 800);
      
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingTimelineMessage, messages.length]);


  const sidebarContent = (
    <ChatSidebar
      onNewConversation={handleNewConversation}
      onSelectConversation={handleSelectConversation}
      selectedConversationId={currentConversationId || undefined}
      conversations={conversations}
      isLoading={isLoadingConversations}
    />
  );

  // Calculate conversion progress
  const conversionProgress = conversionGoals.length > 0 ? {
    goalsAchieved: conversionGoals.filter(g => g.achieved).length,
    goalsTotal: conversionGoals.length,
  } : undefined;

  return (
    <div className="h-screen flex flex-col bg-[#FAF8F3]">
      {/* Header */}
      <ChatHeader
        stage={messages.length > 0 ? stage : undefined}
        onNewConversation={handleNewConversation}
        onChangeBackground={() => router.push("/#religion-selector")}
        sidebarContent={sidebarContent}
        user={session?.user || { id: "anonymous", name: "Guest" }}
        opennessScore={messages.length > 0 ? opennessScore : undefined}
        resistanceLevel={messages.length > 0 ? resistanceLevel : undefined}
        conversionProgress={conversionProgress}
        chatMode={chatMode}
        onToggleChatMode={toggleChatMode}
        messages={messages}
        conversation={{
          id: currentConversationId || undefined,
          title: conversations.find(c => c.id === currentConversationId)?.title,
          stage,
          userBelief,
        }}
        mobileMenuOpen={mobileMenuOpen}
        onMobileMenuOpenChange={setMobileMenuOpen}
      />

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar (Desktop Only) */}
        <div className="hidden md:block">
          {sidebarContent}
        </div>

        {/* Messages Area or Voice Chat Panel */}
        {chatMode === "voice" ? (
          <VoiceChatPanel
            conversationId={currentConversationId}
            userBelief={userBelief}
            stage={stage}
            onTranscriptMessage={handleVoiceTranscript}
          />
        ) : (
          <div className="flex-1 flex flex-col overflow-hidden relative">
          <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-linear-to-b from-[#FAF8F3] to-white" onScroll={handleScroll}>
            {messages.length === 0 ? (
              /* Empty State */
              <div className="max-w-4xl mx-auto h-full flex flex-col items-center justify-center">
                {!userBelief ? (
                  /* No belief selected */
                  <Card className="p-8 md:p-12 text-center max-w-2xl bg-white shadow-xl border-2 border-byzantine-300">
                    <div className="mb-6">
                      <div className="w-20 h-20 mx-auto bg-linear-to-br from-byzantine-100 to-byzantine-200 rounded-full flex items-center justify-center mb-4">
                        <Sparkles className="w-10 h-10 text-byzantine-600" />
                      </div>
                    </div>
                    <h2 className="text-3xl font-display font-bold text-orthodox-600 mb-4">
                      Welcome to Your Theological Journey
                    </h2>
                    <p className="text-gray-600 mb-8 text-lg">
                      To begin, please select your faith background on our timeline
                    </p>
                    <Link href="/#religion-selector">
                      <Button size="lg" className="bg-byzantine-500 hover:bg-byzantine-600 text-white">
                        <ArrowLeft className="mr-2 h-5 w-5" />
                        Go to Timeline
                      </Button>
                    </Link>
                  </Card>
                ) : (
                  /* Welcome message */
                  <div className="w-full space-y-8 animate-fade-in">
                    <Card className="p-6 md:p-8 bg-white shadow-lg border-2 border-byzantine-300">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-16 h-16 bg-linear-to-br from-byzantine-100 to-byzantine-200 rounded-2xl flex items-center justify-center shrink-0">
                          <span className="text-3xl">☦️</span>
                        </div>
                        <div>
                          <Badge className="mb-2 bg-byzantine-600">AI-Powered Conversation</Badge>
                          <h2 className="text-2xl md:text-3xl font-display font-bold text-orthodox-600">
                            Welcome, {session?.user?.name || "Seeker"}!
                          </h2>
                        </div>
                      </div>
                      <p className="text-gray-700 text-lg leading-relaxed">
                        I&apos;m here to guide you through Orthodox Christianity, drawing from the wisdom of the Church Fathers, Ecumenical Councils, and 2,000 years of Sacred Tradition. 
                        {isAnonymous ? (
                          <> Start chatting now - no account needed! Sign up later to save your conversations.</>
                        ) : (
                          <> Your conversations are automatically saved to MongoDB. Let&apos;s begin!</>
                        )}
                      </p>
                    </Card>

                    <div className="text-center">
                      <p className="text-gray-500 text-sm">
                        Type your question below to begin your personalized dialogue
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Messages */
              <div className="max-w-4xl mx-auto">
                {messages.map((message) => (
                  <MessageBubble 
                    key={message.id} 
                    message={message}
                    onQuestionClick={handleSendMessage}
                    onTellMeMore={handleTellMeMore}
                    onAddReference={handleAddReference}
                    onEditReference={handleEditReference}
                    onDeleteReference={handleDeleteReference}
                  />
                ))}
                {isTyping && <TypingIndicator />}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Stop Generating Button */}
          {isStreaming && (
            <Button
              onClick={handleStopGenerating}
              variant="ghost"
              size="sm"
              className="absolute bottom-32 sm:left-1/2 left-[10%] transform -translate-x-1/2 shadow-lg border border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700 z-10"
            >
              <Square className="w-4 h-4 mr-2" />
              Stop generating
            </Button>
          )}

          {/* Scroll to Bottom Button */}
          {showScrollButton && (
            <Button
              onClick={scrollToBottom}
              variant="ghost"
              size="sm"
              className="absolute bottom-32 sm:right-[15%] right-[10%] shadow-lg border border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900 z-10"
            >
              <ArrowDown className="w-4 h-4 mr-2" />
              Scroll to bottom
            </Button>
          )}

          {/* Input Area */}
          <ChatInput
            onSend={handleSendMessage}
            disabled={isTyping}
          />
          </div>
        )}
      </div>

      {/* Floating Voice Chat Button - Mobile Only (Outside conditional to avoid type errors) */}
      <Button
        onClick={toggleChatMode}
        size="lg"
        className={`sm:hidden fixed bottom-32 right-4 h-14 w-14 rounded-full shadow-xl z-20 ${
          chatMode === "voice" 
            ? "bg-red-500 hover:bg-red-600" 
            : "bg-byzantine-500 hover:bg-byzantine-600"
        }`}
      >
        {chatMode === "text" ? (
          <Mic className="h-6 w-6 text-white" />
        ) : (
          <MessageSquare className="h-6 w-6 text-white" />
        )}
      </Button>

      {/* Save Conversation Modal for anonymous users */}
      {isAnonymous && !bannerDismissed && (
        <SaveConversationBanner 
          open={showSignupBanner} 
          onOpenChange={setShowSignupBanner}
          onDismissPermanently={handleDismissPermanently}
        />
      )}
    </div>
  );
}
