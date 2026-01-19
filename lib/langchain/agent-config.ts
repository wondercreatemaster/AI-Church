/**
 * LangChain Agent Configuration
 * Sets up the aggressive conversion agent with tools and memory
 */

import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage, AIMessage } from "@langchain/core/messages";
import { ConversionMemory, createConversionMemory, ConversionMemoryState } from "./memory-manager";
import { generateSystemPrompt } from "../prompts/orthodox-prompts";
import { ConversationStage } from "../db/models/conversation";
import { analyzeTacticalApproach } from "./conversation-director";
import { getApologeticsForBelief } from "../prompts/apologetics-database";

export interface AgentConfig {
  model: ChatOpenAI;
  memory: ConversionMemory;
}

/**
 * Create and configure the conversion agent
 */
export async function createConversionAgent(
  stage: ConversationStage,
  userBelief?: string,
  initialMemoryState?: Partial<ConversionMemoryState>
): Promise<AgentConfig> {
  // Initialize OpenAI model
  const model = new ChatOpenAI({
    modelName: "gpt-4-turbo-preview",
    temperature: 0.8, // Slightly higher for more assertive responses
    maxTokens: 2000,
    openAIApiKey: process.env.OPENAI_API_KEY,
  });

  // Create memory manager
  const memory = createConversionMemory(initialMemoryState);

  return {
    model,
    memory,
  };
}

/**
 * Get dynamic variables for prompt injection
 */
export function getPromptVariables(
  memory: ConversionMemory,
  userMessage: string,
  userBelief?: string
): Record<string, string> {
  const memoryState = memory.getState();
  const progressSummary = memory.getProgressSummary();
  const tacticalRec = analyzeTacticalApproach(userMessage, memoryState, userBelief);

  const tacticalRecommendation = `
TACTIC: ${tacticalRec.tactic.toUpperCase()}
INTENSITY: ${tacticalRec.intensity}/10
REASONING: ${tacticalRec.reasoning}

SUGGESTED APPROACH:
${tacticalRec.suggestedApproach}

TOPICS TO ADDRESS: ${tacticalRec.topicsToAddress.join(", ")}

AGGRESSIVE QUESTIONS TO ASK:
${tacticalRec.questionsToAsk.map((q, i) => `${i + 1}. ${q}`).join("\n")}
  `.trim();

  return {
    conversion_progress: progressSummary,
    tactical_recommendation: tacticalRecommendation,
  };
}

/**
 * Execute agent with user message (non-streaming)
 */
export async function executeAgent(
  config: AgentConfig,
  userMessage: string,
  stage: ConversationStage,
  userBelief?: string,
  ragContext?: string,
  questionContext?: string
): Promise<string> {
  const { model, memory } = config;
  
  // Detect objections and sensitivity in user message
  memory.detectObjections(userMessage);
  memory.detectSensitivity(userMessage);

  // Get dynamic prompt variables
  const variables = getPromptVariables(memory, userMessage, userBelief);
  
  // Get system prompt with tactical recommendations and question context
  const systemPrompt = generateSystemPrompt(stage, userBelief, ragContext, questionContext);
  
  // Build messages array
  const messages = [
    new SystemMessage(systemPrompt),
    new SystemMessage(`
CONVERSION TRACKING:
${variables.conversion_progress}

TACTICAL RECOMMENDATION:
${variables.tactical_recommendation}

Remember: You are an EVANGELIST. Your goal is CONVERSION. Be bold, be direct, push for commitment.
    `),
    ...memory.getState().messageHistory,
    new HumanMessage(userMessage),
  ];

  // Get response from model
  const response = await model.invoke(messages);
  
  // Extract content from response
  const content = typeof response.content === 'string' 
    ? response.content 
    : JSON.stringify(response.content);

  return content;
}

/**
 * Execute agent with streaming response
 */
export async function* executeAgentStream(
  config: AgentConfig,
  userMessage: string,
  stage: ConversationStage,
  userBelief?: string,
  ragContext?: string,
  questionContext?: string
): AsyncGenerator<string, void, unknown> {
  const { model, memory } = config;
  
  // Detect objections and sensitivity in user message
  memory.detectObjections(userMessage);
  memory.detectSensitivity(userMessage);

  // Get dynamic prompt variables
  const variables = getPromptVariables(memory, userMessage, userBelief);
  
  // Get system prompt with tactical recommendations and question context
  const systemPrompt = generateSystemPrompt(stage, userBelief, ragContext, questionContext);
  
  // Build messages array
  const messages = [
    new SystemMessage(systemPrompt),
    new SystemMessage(`
CONVERSION TRACKING:
${variables.conversion_progress}

TACTICAL RECOMMENDATION:
${variables.tactical_recommendation}

Remember: You are an EVANGELIST. Your goal is CONVERSION. Be bold, be direct, push for commitment.
    `),
    ...memory.getState().messageHistory,
    new HumanMessage(userMessage),
  ];

  // Stream response from model
  const stream = await model.stream(messages);
  
  for await (const chunk of stream) {
    const content = typeof chunk.content === 'string' 
      ? chunk.content 
      : JSON.stringify(chunk.content);
    
    if (content) {
      yield content;
    }
  }
}

/**
 * Update memory after conversation turn
 */
export function updateMemoryAfterTurn(
  memory: ConversionMemory,
  userMessage: string,
  assistantResponse: string,
  userBelief?: string
) {
  // Analyze user message for tactical adjustment
  const memoryState = memory.getState();
  const tacticalRec = analyzeTacticalApproach(userMessage, memoryState, userBelief);

  // Update scores and tactic
  memory.updateScores(
    Math.round((11 - tacticalRec.intensity) * 1.0), // Convert intensity to resistance (inverse)
    tacticalRec.intensity // Intensity correlates with openness
  );
  memory.setTactic(tacticalRec.tactic);

  // Check if any goals were achieved
  const goals = memoryState.conversionGoals;
  for (const goal of goals) {
    if (!goal.achieved) {
      // Check if user message indicates goal achievement
      const patterns: Record<string, RegExp> = {
        acknowledge_orthodox: /makes sense|good point|never thought|you're right|interesting|i see/i,
        express_doubt: /not sure|questioning|doubt|maybe.*wrong|reconsidering/i,
        commit_visit_church: /i will|yes.*visit|commit|when can i|where.*church|this sunday/i,
      };

      const pattern = patterns[goal.type];
      if (pattern && pattern.test(userMessage)) {
        memory.achieveGoal(goal.type);
      }
    }
  }
}

