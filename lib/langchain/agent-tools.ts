/**
 * LangChain Agent Tools for Orthodox Conversion Agent
 * Tools that enable the agent to retrieve apologetics, track positions, assess readiness, and find contradictions
 */

import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import { 
  getApologeticsForBelief, 
  getArgumentById,
  type ApologeticArgument 
} from "../prompts/apologetics-database";
import { getContextForQuestion, retrieveRelevantContext } from "../pinecone/rag-service";

/**
 * Tool: Retrieve Apologetic Argument
 * Retrieves specific apologetic arguments for challenging user's beliefs
 */
export const retrieveApologeticTool = new DynamicStructuredTool({
  name: "retrieve_apologetic_argument",
  description: "Retrieves specific apologetic arguments to challenge the user's non-Orthodox beliefs. Use this when you need ammunition to debate a specific theological point. Provide the user's belief system and the topic you want to challenge.",
  schema: z.object({
    userBelief: z.string().describe("The user's current belief system (catholic, protestant, baptist, etc.)"),
    topic: z.string().describe("The specific topic or doctrine you want to challenge (e.g., 'papal authority', 'sola scriptura', 'believer baptism')"),
  }),
  func: async ({ userBelief, topic }) => {
    // Get apologetics for the belief system
    const apologetics = getApologeticsForBelief(userBelief);
    
    if (!apologetics) {
      return `No apologetics found for belief system: ${userBelief}`;
    }

    // Try to find relevant argument by searching topic in title or category
    const relevantArgs = apologetics.arguments.filter(arg => 
      arg.title.toLowerCase().includes(topic.toLowerCase()) ||
      arg.category.toLowerCase().includes(topic.toLowerCase()) ||
      arg.shortSummary.toLowerCase().includes(topic.toLowerCase())
    );

    if (relevantArgs.length === 0) {
      // Return strategy and main weaknesses instead
      return `Strategy for ${userBelief}: ${apologetics.conversionStrategy}\n\nMain weaknesses: ${apologetics.mainWeaknesses.join(', ')}`;
    }

    // Return the first relevant argument with full details
    const arg = relevantArgs[0];
    return `
APOLOGETIC ARGUMENT: ${arg.title}
Category: ${arg.category}

Summary: ${arg.shortSummary}

Full Argument: ${arg.fullArgument}

Scripture: ${arg.scriptureReferences.join(', ')}

Patristic Support: ${arg.patristicSupport.join(' | ')}

Pressure Point: ${arg.psychologicalPressurePoint}

Follow-up Questions:
${arg.followUpQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n')}

Counter-arguments to use:
${arg.counterArguments.map((c, i) => `${i + 1}. ${c}`).join('\n')}
    `.trim();
  },
});

/**
 * Tool: Retrieve RAG Context from Pinecone
 * Retrieves patristic sources and Orthodox teachings from Pinecone vector database
 */
export const retrieveRAGContextTool = new DynamicStructuredTool({
  name: "retrieve_rag_context",
  description: "Retrieves Orthodox Christian sources from the vector database (Church Fathers, councils, patristic writings). Use this to support your arguments with authoritative sources.",
  schema: z.object({
    query: z.string().describe("The theological question or topic to search for in Orthodox sources"),
    userBelief: z.string().optional().describe("User's belief system to contextualize the search"),
  }),
  func: async ({ query, userBelief }) => {
    try {
      const context = await getContextForQuestion(query, userBelief);
      
      if (!context || context.documents.length === 0) {
        return "No relevant sources found in the database. Rely on your theological knowledge and the apologetic arguments.";
      }

      return `${context.formattedContext}\n\nSources: ${context.sources.join(', ')}`;
    } catch (error) {
      return `Error retrieving sources: ${error}. Continue without RAG context.`;
    }
  },
});

/**
 * Tool: Track Theological Position
 * Records and tracks the user's theological positions, what's been challenged, and what they've conceded
 */
export const trackTheologicalPositionTool = new DynamicStructuredTool({
  name: "track_theological_position",
  description: "Tracks the user's stated theological positions, what you've challenged, and what they've conceded. Use this to remember what ground you've gained in the debate.",
  schema: z.object({
    topic: z.string().describe("The theological topic (e.g., 'papal authority', 'sola scriptura')"),
    userBelief: z.string().describe("What the user believes about this topic"),
    challenged: z.boolean().describe("Whether you've challenged this belief"),
    conceded: z.boolean().describe("Whether the user has conceded or shown doubt about this belief"),
  }),
  func: async ({ topic, userBelief, challenged, conceded }) => {
    // This will be persisted to the conversation document by the memory manager
    return JSON.stringify({
      action: "track_position",
      data: {
        topic,
        belief: userBelief,
        challenged,
        conceded,
        timestamp: new Date().toISOString()
      }
    });
  },
});

/**
 * Tool: Assess Conversion Readiness
 * Analyzes user's resistance level and recommends tactical approach
 */
export const assessConversionReadinessTool = new DynamicStructuredTool({
  name: "assess_conversion_readiness",
  description: "Analyzes the user's openness to conversion and recommends tactics. Use this to determine if you should attack harder, soften your approach, or push for commitment.",
  schema: z.object({
    userResponse: z.string().describe("The user's most recent message"),
    conversationContext: z.string().describe("Brief summary of the conversation so far"),
  }),
  func: async ({ userResponse, conversationContext }) => {
    // Analyze resistance indicators
    const resistanceIndicators = [
      { pattern: /i don't (think|believe|agree)/i, weight: 2 },
      { pattern: /but what about/i, weight: 1 },
      { pattern: /i'm not sure/i, weight: -1 },
      { pattern: /that's interesting/i, weight: -2 },
      { pattern: /you make a good point/i, weight: -3 },
      { pattern: /i never thought of it that way/i, weight: -3 },
      { pattern: /offensive|rude|judgmental/i, weight: 4 },
      { pattern: /i need to think/i, weight: 0 },
      { pattern: /where can i learn more/i, weight: -4 },
      { pattern: /tell me more about/i, weight: -2 },
    ];

    let resistanceScore = 5; // Start at neutral
    
    for (const indicator of resistanceIndicators) {
      if (indicator.pattern.test(userResponse)) {
        resistanceScore += indicator.weight;
      }
    }

    // Normalize to 1-10 scale
    resistanceScore = Math.max(1, Math.min(10, resistanceScore));
    const opennessScore = 11 - resistanceScore;

    // Determine tactic
    let recommendedTactic: string;
    let reasoning: string;

    if (opennessScore >= 8) {
      recommendedTactic = "PRESSURE";
      reasoning = "User is very open. Push hard for commitment to visit a church or attend liturgy. Create urgency.";
    } else if (opennessScore >= 6) {
      recommendedTactic = "PRESENT";
      reasoning = "User is receptive. Present Orthodox alternatives to their flawed positions. Invite deeper exploration.";
    } else if (opennessScore >= 4) {
      recommendedTactic = "PROBE";
      reasoning = "User is moderately resistant. Ask Socratic questions to expose contradictions without direct attack.";
    } else if (opennessScore >= 2) {
      recommendedTactic = "ATTACK";
      reasoning = "User is resistant but engaging. Challenge directly with strong apologetic arguments. Don't back down.";
    } else {
      recommendedTactic = "SOFTEN";
      reasoning = "User is very defensive. Temporarily ease pressure, affirm their seeking, then re-engage gently.";
    }

    return JSON.stringify({
      action: "assess_readiness",
      data: {
        resistanceLevel: resistanceScore,
        opennessScore: opennessScore,
        recommendedTactic: recommendedTactic,
        reasoning: reasoning,
        timestamp: new Date().toISOString()
      }
    });
  },
});

/**
 * Tool: Find Contradiction
 * Identifies logical contradictions in the user's stated beliefs
 */
export const findContradictionTool = new DynamicStructuredTool({
  name: "find_contradiction",
  description: "Analyzes the user's statements to find logical contradictions or inconsistencies in their beliefs. Use this to create cognitive dissonance and challenge their worldview.",
  schema: z.object({
    userBelief: z.string().describe("The user's belief system"),
    statement: z.string().describe("The specific statement or belief to analyze for contradictions"),
  }),
  func: async ({ userBelief, statement }) => {
    // Common contradictions by belief system
    const contradictions: Record<string, Array<{ trigger: RegExp, contradiction: string }>> = {
      catholic: [
        { 
          trigger: /unchanging|never change/i, 
          contradiction: "Claims to be unchanging, yet Vatican II changed liturgy, ecclesiology, and pastoral approach dramatically. Which popes are infallible - the ones before or after Vatican II?" 
        },
        { 
          trigger: /tradition/i, 
          contradiction: "Claims to preserve apostolic tradition, yet added Filioque to Creed without ecumenical council, violating Ephesus (431) prohibition on changes." 
        },
        {
          trigger: /bible|scripture/i,
          contradiction: "Uses Scripture as authority, but where does Scripture give Rome authority to change the universal Creed? Scripture says nothing about papal infallibility."
        },
      ],
      protestant: [
        { 
          trigger: /bible alone|scripture alone|sola scriptura/i, 
          contradiction: "Says 'Bible alone' but the Bible never teaches Bible alone. This doctrine refutes itself. 2 Thess 2:15 says hold to ORAL and written traditions." 
        },
        { 
          trigger: /holy spirit guides|spirit led/i, 
          contradiction: "Claims Holy Spirit guides believers to truth, yet 30,000+ Protestant denominations contradict each other. Which contradictory interpretation is Spirit-led?" 
        },
        {
          trigger: /faith alone/i,
          contradiction: "Claims 'faith alone' but James 2:24 explicitly says 'NOT by faith alone' - the only place these words appear together is to deny the doctrine."
        },
        {
          trigger: /tradition of men/i,
          contradiction: "Rejects 'tradition of men' but accepts the Church's tradition on which books belong in the Bible. The canon is a tradition, not Scripture itself."
        },
      ],
      baptist: [
        { 
          trigger: /new testament|apostolic|early church/i, 
          contradiction: "Claims to follow New Testament pattern, but Baptist distinctives originated in 1600s. Where were Baptists in the first 1,600 years of Christianity?" 
        },
        { 
          trigger: /believer.*baptism|adult baptism/i, 
          contradiction: "Says only believers should be baptized, but Acts records entire households baptized (16:15, 16:33). In ancient culture, households included infants." 
        },
      ],
      pentecostal: [
        { 
          trigger: /spirit|tongues|baptism.*spirit/i, 
          contradiction: "Claims speaking in tongues is evidence of Spirit baptism, but 1 Cor 12:30 asks 'Do all speak in tongues?' Answer: NO. Not all had tongues in early Church." 
        },
        {
          trigger: /biblical|scripture/i,
          contradiction: "Claims to be biblical, but tongues-as-evidence doctrine isn't in Scripture. Acts shows people receiving Spirit with and without tongues."
        },
      ],
    };

    const userContradictions = contradictions[userBelief.toLowerCase()] || [];
    
    for (const c of userContradictions) {
      if (c.trigger.test(statement)) {
        return `CONTRADICTION IDENTIFIED: ${c.contradiction}`;
      }
    }

    return "No specific contradiction found in database. Analyze the statement yourself for logical inconsistencies with their broader belief system.";
  },
});

/**
 * Tool: Set Conversion Goal
 * Sets a specific conversion goal to work toward
 */
export const setConversionGoalTool = new DynamicStructuredTool({
  name: "set_conversion_goal",
  description: "Sets a conversion goal to work toward (e.g., get them to acknowledge Orthodox position, express doubt, commit to visiting church). Use this to track your evangelistic progress.",
  schema: z.object({
    goalType: z.enum([
      "acknowledge_orthodox", 
      "express_doubt", 
      "commit_visit_church", 
      "attend_liturgy", 
      "speak_with_priest", 
      "begin_catechism"
    ]).describe("The type of conversion goal"),
    description: z.string().describe("Description of the specific goal for this conversation"),
  }),
  func: async ({ goalType, description }) => {
    return JSON.stringify({
      action: "set_goal",
      data: {
        type: goalType,
        description: description,
        timestamp: new Date().toISOString()
      }
    });
  },
});

/**
 * Export all tools as an array
 */
export const agentTools = [
  retrieveApologeticTool,
  retrieveRAGContextTool,
  trackTheologicalPositionTool,
  assessConversionReadinessTool,
  findContradictionTool,
  setConversionGoalTool,
];

