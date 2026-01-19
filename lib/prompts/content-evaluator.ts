/**
 * Content Evaluator Agent
 * A separate AI agent that analyzes responses and determines if "Tell me more" should be shown
 */

import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const EVALUATOR_PROMPT = `You are an evaluator that determines if an AI response has more valuable content that could be expanded.

Analyze the given AI response and user question, then decide if a "Tell me more" button should appear.

RETURN "true" if:
- The response is brief/abbreviated and there's clearly more depth available on this topic
- The topic is complex (theology, history, doctrine) and only the surface was covered
- The response mentions something interesting that wasn't fully explained
- The user asked about a deep topic that has much more to explore

RETURN "false" if:
- The response is a simple greeting or acknowledgment
- The question was simple and fully answered
- The response is already detailed/comprehensive
- The response is asking a question to the user (they should answer, not ask for more)
- The topic doesn't have significant additional depth to explore

Respond with ONLY "true" or "false" - nothing else.`;

export async function evaluateNeedsMore(
  userQuestion: string,
  aiResponse: string
): Promise<boolean> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: EVALUATOR_PROMPT },
        { 
          role: "user", 
          content: `User question: "${userQuestion}"\n\nAI response: "${aiResponse}"\n\nShould "Tell me more" appear?` 
        }
      ],
      max_tokens: 10,
      temperature: 0,
    });

    const result = response.choices[0]?.message?.content?.toLowerCase().trim();
    return result === "true";
  } catch (error) {
    console.error("Error evaluating content for 'tell me more':", error);
    // Default to false if evaluation fails
    return false;
  }
}
