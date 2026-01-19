import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { QuestionScript } from "./question-scripts";

const evaluationModel = new ChatOpenAI({
  modelName: "gpt-4o-mini", // Use faster, cheaper model for evaluation
  temperature: 0.3, // Lower temperature for more consistent evaluation
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Evaluate user's understanding based on their response to a question
 * Returns a score from 1-10 indicating level of understanding/engagement
 */
export async function evaluateUnderstanding(
  question: QuestionScript,
  userResponse: string,
  aiResponse: string
): Promise<number> {
  const systemPrompt = `You are an expert evaluator assessing whether a user understood and engaged with a conversation question.

Your task is to rate the user's response on a scale of 1-10:

1-3: Did not engage with the question, gave minimal/evasive answer, or completely misunderstood
4-6: Partially engaged, showed some understanding but incomplete or deflected
7-8: Good engagement, demonstrated understanding of key concepts
9-10: Excellent engagement, showed deep understanding and asked thoughtful follow-ups

Consider:
- Did they directly address the question?
- Did they show understanding of the concepts involved?
- Did they share relevant personal beliefs or experiences?
- Did they ask thoughtful follow-up questions?
- Did they demonstrate readiness to move forward in the conversation?

IMPORTANT: Return ONLY a single number from 1-10. No explanation, just the number.`;

  const userPrompt = `Question Asked: "${question.question}"
Context: ${question.context}
Evaluation Criteria: ${question.evaluationCriteria}

User's Response: "${userResponse}"

AI's Response to User: "${aiResponse}"

Rate the user's understanding and engagement from 1-10:`;

  try {
    const response = await evaluationModel.invoke([
      new SystemMessage(systemPrompt),
      new HumanMessage(userPrompt),
    ]);

    const content =
      typeof response.content === "string"
        ? response.content
        : JSON.stringify(response.content);

    // Extract number from response
    const match = content.match(/(\d+)/);
    if (match) {
      const score = parseInt(match[1], 10);
      // Ensure score is between 1-10
      return Math.max(1, Math.min(10, score));
    }

    // Default to medium understanding if parsing fails
    return 5;
  } catch (error) {
    console.error("Error evaluating understanding:", error);
    // Default to medium understanding on error
    return 5;
  }
}

/**
 * Determine if user is ready to move to next question based on understanding level
 */
export function isReadyForNextQuestion(
  understandingLevel: number,
  questionsAskedCount: number
): boolean {
  // Early questions: require higher understanding (8+)
  if (questionsAskedCount < 3) {
    return understandingLevel >= 8;
  }

  // Later questions: be more lenient (7+)
  return understandingLevel >= 7;
}

/**
 * Generate a follow-up prompt based on understanding level
 */
export function generateFollowUpGuidance(
  understandingLevel: number,
  question: QuestionScript
): string {
  if (understandingLevel >= 8) {
    return `The user showed excellent understanding. You can move to the next question or explore deeper if they're curious about: ${question.followUpTopics.join(", ")}`;
  }

  if (understandingLevel >= 6) {
    return `The user showed partial understanding. Consider clarifying ${question.followUpTopics[0]} before moving on, or ask a simpler follow-up related to: ${question.question}`;
  }

  return `The user didn't fully engage with the question. Try rephrasing it more simply or approach the topic from a different angle. Key concept to emphasize: ${question.context}`;
}

/**
 * Assess if the user's message shows they're ready to progress to next stage
 */
export function assessStageReadiness(
  currentStage: string,
  questionsAskedInStage: string[],
  avgUnderstanding: number,
  conversionGoalsAchieved: number
): boolean {
  const stageRequirements: Record<
    string,
    { minQuestions: number; minUnderstanding: number; minGoals: number }
  > = {
    A: { minQuestions: 2, minUnderstanding: 6, minGoals: 0 },
    B: { minQuestions: 3, minUnderstanding: 6, minGoals: 1 },
    C: { minQuestions: 2, minUnderstanding: 7, minGoals: 2 },
    D: { minQuestions: 2, minUnderstanding: 7, minGoals: 3 },
  };

  const requirements = stageRequirements[currentStage];
  if (!requirements) return false;

  return (
    questionsAskedInStage.length >= requirements.minQuestions &&
    avgUnderstanding >= requirements.minUnderstanding &&
    conversionGoalsAchieved >= requirements.minGoals
  );
}

