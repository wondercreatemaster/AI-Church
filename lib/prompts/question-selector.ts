import { ConversationStage } from "../db/models/conversation";
import {
  QuestionScript,
  getQuestionsForStageAndBackground,
  getQuestionById,
} from "./question-scripts";

export interface QuestionSelectionContext {
  stage: ConversationStage;
  userBelief: string;
  questionsAsked: string[];
  currentQuestionId?: string;
  lastUnderstandingLevel?: number;
  messageCount: number;
  userMessage?: string;
}

/**
 * Select the next question to ask based on conversation context
 * Returns null if conversation should be free-flowing (no scripted question)
 */
export function selectNextQuestion(
  context: QuestionSelectionContext
): QuestionScript | null {
  const {
    stage,
    userBelief,
    questionsAsked,
    currentQuestionId,
    lastUnderstandingLevel,
    messageCount,
  } = context;

  // Get all available questions for this stage and background
  const availableQuestions = getQuestionsForStageAndBackground(
    stage,
    userBelief
  );

  // Filter out already-asked questions
  const unaskedQuestions = availableQuestions.filter(
    (q) => !questionsAsked.includes(q.id)
  );

  // If no questions left for this stage, return null (free conversation)
  if (unaskedQuestions.length === 0) {
    return null;
  }

  // If we have a current question and understanding level is low, stick with it
  if (
    currentQuestionId &&
    lastUnderstandingLevel !== undefined &&
    lastUnderstandingLevel < 7
  ) {
    const currentQuestion = getQuestionById(currentQuestionId);
    if (currentQuestion && !questionsAsked.includes(currentQuestionId)) {
      return currentQuestion;
    }
  }

  // Stage A: Start immediately with first question
  if (stage === "A" && messageCount === 0) {
    return unaskedQuestions[0];
  }

  // For early conversation (Stage A), be more directive
  if (stage === "A" && messageCount < 3) {
    return unaskedQuestions[0];
  }

  // For later stages, ensure minimum interaction before new question
  const minMessagesBeforeNext: Record<ConversationStage, number> = {
    A: 1,
    B: 2,
    C: 2,
    D: 3,
  };

  // Check if enough messages since last question
  const messagesSinceLastQuestion = messageCount - questionsAsked.length * 2; // Rough estimate
  if (messagesSinceLastQuestion < minMessagesBeforeNext[stage]) {
    // Let conversation flow naturally
    return null;
  }

  // Return next question in sequence
  return unaskedQuestions[0];
}

/**
 * Determine if we should ask the next question now or let conversation flow
 */
export function shouldAskQuestionNow(
  context: QuestionSelectionContext,
  userEngagement: "high" | "medium" | "low"
): boolean {
  const { stage, questionsAsked, messageCount } = context;

  // Always start with question in Stage A
  if (stage === "A" && questionsAsked.length === 0) {
    return true;
  }

  // If user is highly engaged, let conversation flow more naturally
  if (userEngagement === "high" && messageCount > 3) {
    // Ask question every 3-4 exchanges
    return messageCount % 4 === 0;
  }

  // If user has medium engagement, be more directive
  if (userEngagement === "medium") {
    // Ask question every 2-3 exchanges
    return messageCount % 3 === 0;
  }

  // If user has low engagement, be very directive
  if (userEngagement === "low") {
    // Ask question frequently to guide
    return messageCount % 2 === 0;
  }

  return true;
}

/**
 * Assess user engagement level from their messages
 */
export function assessUserEngagement(
  userMessage: string,
  previousMessages: Array<{ role: string; content: string }>
): "high" | "medium" | "low" {
  const messageLength = userMessage.trim().length;
  const wordCount = userMessage.trim().split(/\s+/).length;

  // Recent messages from user
  const recentUserMessages = previousMessages
    .filter((m) => m.role === "user")
    .slice(-3);

  const avgWordCount =
    recentUserMessages.reduce(
      (sum, m) => sum + m.content.split(/\s+/).length,
      0
    ) / Math.max(recentUserMessages.length, 1);

  // High engagement: Long messages, questions, personal sharing
  if (
    wordCount > 50 ||
    avgWordCount > 40 ||
    userMessage.includes("?") ||
    /\b(i think|i believe|i feel|my experience|in my church)\b/i.test(
      userMessage
    )
  ) {
    return "high";
  }

  // Low engagement: Very short messages, one-word answers
  if (
    wordCount < 5 ||
    avgWordCount < 8 ||
    /^(yes|no|ok|sure|idk|maybe|i don't know)$/i.test(userMessage.trim())
  ) {
    return "low";
  }

  // Medium engagement: Everything else
  return "medium";
}

/**
 * Format question context for injection into system prompt
 */
export function formatQuestionContext(
  nextQuestion: QuestionScript | null,
  questionsAsked: string[],
  currentStage: ConversationStage,
  userBelief: string
): string {
  if (!nextQuestion) {
    return `You are currently in free-flowing conversation mode. The scripted question sequence is complete. Generate follow-up questions based on the user's interests, concerns, and conversion goals.`;
  }

  // Get all questions for this stage and background
  const stageQuestions = getQuestionsForStageAndBackground(currentStage, userBelief);
  
  // Get upcoming questions (not yet asked)
  const upcomingQuestions = stageQuestions
    .filter(q => 
      !questionsAsked.includes(q.id) && 
      q.id !== nextQuestion.id &&
      q.order > nextQuestion.order
    )
    .slice(0, 4); // Get next 4 questions for follow-ups

  let followUpSection = '';
  
  // PRIORITY 1: If current question has answer options, use those
  if (nextQuestion.answerOptions && nextQuestion.answerOptions.length > 0) {
    const options = nextQuestion.answerOptions.slice(0, 5); // Max 5 options
    followUpSection = `

ANSWER OPTIONS FOR CURRENT QUESTION:
The user can respond naturally OR select from these predefined options:
${options.map((opt, i) => `${i + 1}. "${opt}"`).join('\n')}

CRITICAL INSTRUCTION FOR FOLLOW-UP QUESTIONS:
Generate your "### Follow-up Questions" section using these EXACT answer options.
Present them as natural, clickable choices that make it easy for the user to respond.

Example:
### Follow-up Questions
${options.map((opt, i) => `${i + 1}. ${opt}`).join('\n')}
`;
  }
  // PRIORITY 2: If no answer options but upcoming questions exist, use those
  else if (upcomingQuestions.length > 0) {
    followUpSection = `

UPCOMING SCRIPTED QUESTIONS (Use these as your follow-up questions):
${upcomingQuestions.map((q, i) => `${i + 1}. "${q.question}"`).join('\n')}

CRITICAL INSTRUCTION FOR FOLLOW-UP QUESTIONS:
When you generate your "### Follow-up Questions" section, use the scripted questions listed above.
Present them naturally to guide the conversation forward.
`;
  }
  // PRIORITY 3: Script complete, generate contextual questions
  else {
    followUpSection = `

SCRIPTED QUESTIONS STATUS: Complete for this stage
Generate 5 follow-up questions based on:
- The user's responses and interests
- Remaining conversion goals
- Natural next steps in their journey
- Topics they've shown curiosity about
`;
  }

  return `
CURRENT QUESTION TO ASK:
Question ID: ${nextQuestion.id}
Question: "${nextQuestion.question}"
Context: ${nextQuestion.context}
Stage: ${nextQuestion.stage}

GUIDANCE:
- Weave this question naturally into your response
- Don't ask it robotically - make it conversational
- If the user just asked something related, answer their question first, then transition to yours
- Example: "[Answer their question]. That actually connects to something I'm curious about: ${nextQuestion.question}"

QUESTIONS ALREADY ASKED:
${questionsAsked.length > 0 ? questionsAsked.join(", ") : "None yet - this is the start of the conversation"}

EVALUATION CRITERIA:
${nextQuestion.evaluationCriteria}
${followUpSection}
`;
}

