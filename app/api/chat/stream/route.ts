/**
 * Streaming Chat API Route
 * Handles real-time streaming responses from the aggressive conversion agent
 * Supports both authenticated and anonymous users
 */

import { auth } from "@/lib/auth";
import { getDatabase } from "@/lib/db/mongodb";
import { ObjectId } from "mongodb";
import {
  CONVERSATIONS_COLLECTION,
  Conversation,
  ConversationStage,
  generateConversationTitle,
} from "@/lib/db/models/conversation";
import {
  MESSAGES_COLLECTION,
  Message,
  CreateMessageInput,
} from "@/lib/db/models/message";
import {
  ANONYMOUS_CONVERSATIONS_COLLECTION,
  AnonymousConversation,
  generateAnonymousConversationTitle,
} from "@/lib/db/models/anonymous-conversation";
import {
  ANONYMOUS_MESSAGES_COLLECTION,
  AnonymousMessage,
  CreateAnonymousMessageInput,
} from "@/lib/db/models/anonymous-message";
import { createConversionAgent, executeAgentStream, updateMemoryAfterTurn } from "@/lib/langchain/agent-config";
import { getContextForQuestion } from "@/lib/pinecone/rag-service";
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import { getOrCreateAnonymousSession } from "@/lib/auth/anonymous-session";
import { checkRateLimit } from "@/lib/utils/rate-limiter";
import { selectNextQuestion, formatQuestionContext, assessUserEngagement } from "@/lib/prompts/question-selector";
import { evaluateUnderstanding } from "@/lib/prompts/understanding-evaluator";
import { evaluateNeedsMore } from "@/lib/prompts/content-evaluator";
import type { QuestionResponse } from "@/lib/db/models/conversation";

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const session = await auth();
    const { conversationId, content, userBelief } = await request.json();

    if (!content) {
      return new Response("Content is required", { status: 400 });
    }

    const db = await getDatabase();
    const isAuthenticated = !!session?.user?.id;
    
    // Determine user type and apply rate limiting for anonymous users
    let userId: ObjectId | undefined;
    let sessionId: string | undefined;
    let isAnonymous = false;

    if (isAuthenticated) {
      userId = new ObjectId(session.user.id);
    } else {
      // Anonymous user
      isAnonymous = true;
      sessionId = await getOrCreateAnonymousSession();
      
      // Apply rate limiting for anonymous users
      const rateLimit = checkRateLimit(sessionId);
      if (!rateLimit.allowed) {
        return new Response(
          JSON.stringify({ 
            error: `Please wait ${rateLimit.retryAfter} seconds before sending another message.` 
          }),
          { status: 429, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    let convId: string | ObjectId;
    let currentStage: ConversationStage = "A";

    // Handle conversation creation/retrieval based on user type
    if (isAnonymous) {
      // Anonymous user flow
      if (!conversationId) {
        const title = generateAnonymousConversationTitle(content);
        const newConversation: Omit<AnonymousConversation, "_id"> = {
          sessionId: sessionId!,
          title,
          stage: "A",
          userBelief,
          createdAt: new Date(),
          updatedAt: new Date(),
          lastMessageAt: new Date(),
        };

        const result = await db.collection(ANONYMOUS_CONVERSATIONS_COLLECTION).insertOne(newConversation);
        convId = result.insertedId.toString();
      } else {
        convId = conversationId;
        // Convert string ID to ObjectId for MongoDB query
        const objectId = new ObjectId(conversationId);
        const conversation = await db.collection<AnonymousConversation>(ANONYMOUS_CONVERSATIONS_COLLECTION)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .findOne({ _id: objectId as any, sessionId: sessionId! });
        if (conversation) {
          currentStage = conversation.stage;
        }
      }

      // Save anonymous user message
      const userMessage: CreateAnonymousMessageInput = {
        conversationId: convId as string,
        sessionId: sessionId!,
        role: "user",
        content,
        timestamp: new Date(),
      };

      await db.collection(ANONYMOUS_MESSAGES_COLLECTION).insertOne(userMessage);
    } else {
      // Authenticated user flow
      if (!conversationId) {
        const title = generateConversationTitle(content);
        const newConversation: Omit<Conversation, "_id"> = {
          userId: userId!,
          title,
          stage: "A",
          userBelief,
          createdAt: new Date(),
          updatedAt: new Date(),
          lastMessageAt: new Date(),
        };

        const result = await db.collection<Conversation>(CONVERSATIONS_COLLECTION).insertOne(newConversation as Conversation);
        convId = result.insertedId;
      } else {
        convId = new ObjectId(conversationId);
        const conversation = await db.collection<Conversation>(CONVERSATIONS_COLLECTION).findOne({ _id: convId });
        if (conversation) {
          currentStage = conversation.stage;
        }
      }

      // Save authenticated user message
      const userMessage: CreateMessageInput = {
        conversationId: convId as ObjectId,
        userId: userId!,
        role: "user",
        content,
        timestamp: new Date(),
      };

      await db.collection<Message>(MESSAGES_COLLECTION).insertOne(userMessage as Message);
    }

    // Get conversation history based on user type
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let messages: any[];
    let conversation: Conversation | AnonymousConversation | null;

    if (isAnonymous) {
      messages = await db
        .collection<AnonymousMessage>(ANONYMOUS_MESSAGES_COLLECTION)
        .find({ conversationId: convId as string })
        .sort({ timestamp: 1 })
        .toArray();
      
      // Convert string ID to ObjectId for conversation query
      const objectId = new ObjectId(convId as string);
      conversation = await db.collection<AnonymousConversation>(ANONYMOUS_CONVERSATIONS_COLLECTION)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .findOne({ _id: objectId as any });
    } else {
      messages = await db
        .collection<Message>(MESSAGES_COLLECTION)
        .find({ conversationId: convId as ObjectId })
        .sort({ timestamp: 1 })
        .toArray();
      
      conversation = await db.collection<Conversation>(CONVERSATIONS_COLLECTION)
        .findOne({ _id: convId as ObjectId });
    }

    // Get conversation state for memory
    const memoryState = conversation ? {
      theologicalPositions: conversation.theologicalPositions || {},
      resistanceLevel: conversation.resistanceLevel || 5,
      opennessScore: conversation.opennessScore || 5,
      conversionGoals: conversation.conversionGoals || [],
      lastTactic: conversation.lastTactic,
      contradictionsIdentified: conversation.contradictionsIdentified || [],
      objectionsRaised: conversation.objectionsRaised || [],
      topicsSensitive: conversation.topicsSensitive || [],
      messageHistory: messages.map(msg => 
        msg.role === "user" 
          ? new HumanMessage(msg.content)
          : new AIMessage(msg.content)
      ),
    } : undefined;

    // Retrieve RAG context
    let ragContext = "";
    let ragSources: string[] = [];
    
    try {
      const context = await getContextForQuestion(content, userBelief);
      if (context) {
        ragContext = context.formattedContext;
        ragSources = context.sources || [];
        console.log("[Stream] RAG sources retrieved:", ragSources);
      } else {
        console.log("[Stream] No RAG context returned");
      }
    } catch (error) {
      console.warn("Failed to retrieve RAG context:", error);
    }

    // Question-led conversation: Select next question to ask
    const questionsAsked = conversation?.questionsAsked || [];
    const currentQuestionId = conversation?.currentQuestionId;
    const questionResponses = conversation?.questionResponses || {};
    
    // Get last understanding level if available
    const lastQuestionResponse = currentQuestionId ? questionResponses[currentQuestionId] : undefined;
    const lastUnderstandingLevel = lastQuestionResponse && typeof lastQuestionResponse === 'object' 
      ? lastQuestionResponse.understandingLevel 
      : undefined;
    
    // Assess user engagement
    const userEngagement = assessUserEngagement(content, messages);
    
    // Select next question
    const nextQuestion = selectNextQuestion({
      stage: currentStage,
      userBelief: userBelief || "other",
      questionsAsked,
      currentQuestionId,
      lastUnderstandingLevel,
      messageCount: messages.length,
      userMessage: content,
    });
    
    // Format question context for injection into prompt
    const questionContext = formatQuestionContext(
      nextQuestion, 
      questionsAsked,
      currentStage,
      userBelief || "other"
    );

    // Create conversion agent
    const agent = await createConversionAgent(currentStage, userBelief, memoryState);

    // Create streaming response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          let fullResponse = "";
          
          // Stream the response
          for await (const chunk of executeAgentStream(
            agent,
            content,
            currentStage,
            userBelief,
            ragContext,
            questionContext
          )) {
            fullResponse += chunk;
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ chunk })}\n\n`));
          }

          // Check for church search marker and process if found
          const churchSearchMatch = fullResponse.match(/\[SEARCH_CHURCHES:\s*([^\]]+)\]/);
          let churchResults = null;
          
          if (churchSearchMatch) {
            const location = churchSearchMatch[1].trim();
            try {
              // Call church search API
              const searchUrl = new URL(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/churches/search`);
              searchUrl.searchParams.append('location', location);
              searchUrl.searchParams.append('radius', '25');
              
              const searchResponse = await fetch(searchUrl.toString());
              
              if (searchResponse.ok) {
                const searchData = await searchResponse.json();
                if (searchData.success && searchData.churches.length > 0) {
                  churchResults = {
                    location: searchData.location,
                    churches: searchData.churches.slice(0, 5), // Top 5 churches
                    total: searchData.total,
                  };
                  
                  // Send church results to client
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
                    churchResults,
                    type: 'church_search' 
                  })}\n\n`));
                  
                  // Remove the marker from the response
                  fullResponse = fullResponse.replace(churchSearchMatch[0], '').trim();
                }
              }
            } catch (error) {
              console.error('Error searching for churches:', error);
            }
          }

          // Update memory
          updateMemoryAfterTurn(agent.memory, content, fullResponse, userBelief);

          // Evaluate understanding if a question was asked
          let understandingLevel = 5; // Default medium
          if (nextQuestion) {
            try {
              understandingLevel = await evaluateUnderstanding(
                nextQuestion,
                content,
                fullResponse
              );
              console.log(`Understanding evaluation for question ${nextQuestion.id}: ${understandingLevel}/10`);
            } catch (error) {
              console.error("Error evaluating understanding:", error);
            }
          }

          // Save assistant message based on user type
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          let result: any;
          if (isAnonymous) {
            const assistantMessage: CreateAnonymousMessageInput = {
              conversationId: convId as string,
              sessionId: sessionId!,
              role: "assistant",
              content: fullResponse,
              sources: ragSources.length > 0 ? ragSources : undefined,
              timestamp: new Date(),
            };

            result = await db.collection(ANONYMOUS_MESSAGES_COLLECTION).insertOne(assistantMessage);
          } else {
            const assistantMessage: CreateMessageInput = {
              conversationId: convId as ObjectId,
              userId: userId!,
              role: "assistant",
              content: fullResponse,
              sources: ragSources.length > 0 ? ragSources : undefined,
              timestamp: new Date(),
            };

            result = await db.collection<Message>(MESSAGES_COLLECTION).insertOne(assistantMessage as Message);
          }

          // Update conversation with memory state and question tracking
          const updatedMemoryState = agent.memory.getState();
          
          // Update question tracking
          const updatedQuestionsAsked = nextQuestion && understandingLevel >= 7
            ? [...questionsAsked, nextQuestion.id]
            : questionsAsked;
          
          const updatedQuestionResponses: Record<string, QuestionResponse> = {
            ...questionResponses,
          };
          
          if (nextQuestion) {
            updatedQuestionResponses[nextQuestion.id] = {
              questionId: nextQuestion.id,
              userResponse: content,
              understandingLevel,
              timestamp: new Date(),
            };
          }
          
          const updateData = {
            lastMessageAt: new Date(),
            updatedAt: new Date(),
            theologicalPositions: updatedMemoryState.theologicalPositions,
            resistanceLevel: updatedMemoryState.resistanceLevel,
            opennessScore: updatedMemoryState.opennessScore,
            conversionGoals: updatedMemoryState.conversionGoals,
            lastTactic: updatedMemoryState.lastTactic,
            contradictionsIdentified: updatedMemoryState.contradictionsIdentified,
            objectionsRaised: updatedMemoryState.objectionsRaised,
            topicsSensitive: updatedMemoryState.topicsSensitive,
            questionsAsked: updatedQuestionsAsked,
            currentQuestionId: nextQuestion?.id || currentQuestionId,
            lastQuestionAskedAt: nextQuestion ? new Date() : conversation?.lastQuestionAskedAt,
            questionResponses: updatedQuestionResponses,
          };

          if (isAnonymous) {
            // Convert string ID to ObjectId for update query
            const objectId = new ObjectId(convId as string);
            await db.collection(ANONYMOUS_CONVERSATIONS_COLLECTION).updateOne(
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              { _id: objectId as any, sessionId: sessionId! },
              { $set: updateData }
            );
          } else {
            await db.collection<Conversation>(CONVERSATIONS_COLLECTION).updateOne(
              { _id: convId as ObjectId },
              { $set: updateData }
            );
          }

          // Evaluate if "Tell me more" should be shown using separate AI agent
          let hasMore = false;
          try {
            hasMore = await evaluateNeedsMore(content, fullResponse);
            console.log(`Content evaluation - hasMore: ${hasMore}`);
          } catch (error) {
            console.error("Error in content evaluation:", error);
          }

          // Send completion event
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
            done: true, 
            conversationId: typeof convId === 'string' ? convId : convId.toString(),
            messageId: result.insertedId.toString(),
            hasMore,
            sources: ragSources.length > 0 ? ragSources : undefined,
            memoryState: {
              opennessScore: updatedMemoryState.opennessScore,
              resistanceLevel: updatedMemoryState.resistanceLevel,
              conversionGoals: updatedMemoryState.conversionGoals,
            }
          })}\n\n`));
          
          controller.close();
        } catch (error) {
          console.error("Streaming error:", error);
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: "Streaming failed" })}\n\n`));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error("Stream chat error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to stream response" }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

