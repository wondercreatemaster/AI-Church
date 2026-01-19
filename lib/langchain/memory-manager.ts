/**
 * Memory Manager for Conversion Agent
 * Tracks theological positions, resistance levels, and conversion progress across conversation
 */

import { BaseMessage, HumanMessage, AIMessage } from "@langchain/core/messages";
import { 
  TheologicalPosition, 
  ConversionGoal, 
  ConversationTactic 
} from "../db/models/conversation";

export interface ConversionMemoryState {
  theologicalPositions: Record<string, TheologicalPosition>;
  resistanceLevel: number;
  opennessScore: number;
  conversionGoals: ConversionGoal[];
  lastTactic?: ConversationTactic;
  contradictionsIdentified: string[];
  objectionsRaised: string[];
  topicsSensitive: string[];
  messageHistory: BaseMessage[];
}

export class ConversionMemory {
  private state: ConversionMemoryState;

  constructor(initialState?: Partial<ConversionMemoryState>) {
    this.state = {
      theologicalPositions: {},
      resistanceLevel: 5, // Start neutral
      opennessScore: 5, // Start neutral
      conversionGoals: [],
      contradictionsIdentified: [],
      objectionsRaised: [],
      topicsSensitive: [],
      messageHistory: [],
      ...initialState,
    };
  }

  /**
   * Load existing state from database
   */
  public loadState(state: Partial<ConversionMemoryState>) {
    this.state = {
      ...this.state,
      ...state,
    };
  }

  /**
   * Get current memory state
   */
  public getState(): ConversionMemoryState {
    return { ...this.state };
  }

  /**
   * Track a theological position
   */
  public trackPosition(position: TheologicalPosition) {
    this.state.theologicalPositions[position.topic] = {
      ...position,
      lastChallengedAt: position.challenged ? new Date() : position.lastChallengedAt,
    };
  }

  /**
   * Update resistance and openness scores
   */
  public updateScores(resistance: number, openness: number) {
    this.state.resistanceLevel = Math.max(1, Math.min(10, resistance));
    this.state.opennessScore = Math.max(1, Math.min(10, openness));
  }

  /**
   * Add conversion goal
   */
  public addGoal(goal: ConversionGoal) {
    // Check if goal already exists
    const existing = this.state.conversionGoals.find(g => g.type === goal.type);
    if (existing) {
      existing.attemptedAt = new Date();
      if (goal.achieved) {
        existing.achieved = true;
        existing.achievedAt = new Date();
      }
    } else {
      this.state.conversionGoals.push(goal);
    }
  }

  /**
   * Mark goal as achieved
   */
  public achieveGoal(goalType: string) {
    const goal = this.state.conversionGoals.find(g => g.type === goalType);
    if (goal) {
      goal.achieved = true;
      goal.achievedAt = new Date();
    }
  }

  /**
   * Set last tactic used
   */
  public setTactic(tactic: ConversationTactic) {
    this.state.lastTactic = tactic;
  }

  /**
   * Add identified contradiction
   */
  public addContradiction(contradiction: string) {
    if (!this.state.contradictionsIdentified.includes(contradiction)) {
      this.state.contradictionsIdentified.push(contradiction);
    }
  }

  /**
   * Add objection raised by user
   */
  public addObjection(objection: string) {
    if (!this.state.objectionsRaised.includes(objection)) {
      this.state.objectionsRaised.push(objection);
    }
  }

  /**
   * Add sensitive topic
   */
  public addSensitiveTopic(topic: string) {
    if (!this.state.topicsSensitive.includes(topic)) {
      this.state.topicsSensitive.push(topic);
    }
  }

  /**
   * Get summary of conversion progress
   */
  public getProgressSummary(): string {
    const positions = Object.values(this.state.theologicalPositions);
    const challenged = positions.filter(p => p.challenged).length;
    const conceded = positions.filter(p => p.conceded).length;
    const goalsAchieved = this.state.conversionGoals.filter(g => g.achieved).length;
    const goalsTotal = this.state.conversionGoals.length;

    return `
CONVERSION PROGRESS:
- Resistance Level: ${this.state.resistanceLevel}/10 (1=open, 10=resistant)
- Openness Score: ${this.state.opennessScore}/10 (1=closed, 10=open)
- Theological Positions Tracked: ${positions.length}
- Positions Challenged: ${challenged}
- Positions Conceded: ${conceded}
- Conversion Goals: ${goalsAchieved}/${goalsTotal} achieved
- Contradictions Identified: ${this.state.contradictionsIdentified.length}
- Last Tactic: ${this.state.lastTactic || "none"}

ACTIVE GOALS:
${this.state.conversionGoals
  .filter(g => !g.achieved)
  .map(g => `- ${g.type}: ${g.description}`)
  .join('\n') || "No active goals"}

THEOLOGICAL POSITIONS CONCEDED:
${positions
  .filter(p => p.conceded)
  .map(p => `- ${p.topic}: ${p.belief}`)
  .join('\n') || "None yet"}

SENSITIVE TOPICS (avoid pushing too hard):
${this.state.topicsSensitive.join(', ') || "None identified"}
    `.trim();
  }

  /**
   * Get tactical recommendations
   */
  public getTacticalRecommendations(): string {
    const { opennessScore, resistanceLevel, lastTactic } = this.state;
    
    let recommendations: string[] = [];

    // Based on openness/resistance
    if (opennessScore >= 8) {
      recommendations.push("User is VERY OPEN - Push hard for commitment to visit church or attend liturgy. Create urgency.");
    } else if (opennessScore >= 6) {
      recommendations.push("User is RECEPTIVE - Present Orthodox alternatives. Invite deeper exploration.");
    } else if (opennessScore >= 4) {
      recommendations.push("User is NEUTRAL - Use Socratic questions to expose contradictions.");
    } else if (resistanceLevel >= 7) {
      recommendations.push("User is RESISTANT - Challenge directly but watch for excessive defensiveness.");
    } else {
      recommendations.push("User is DEFENSIVE - Temporarily ease pressure, then re-engage.");
    }

    // Based on positions conceded
    const conceded = Object.values(this.state.theologicalPositions).filter(p => p.conceded);
    if (conceded.length > 0) {
      recommendations.push(`Build on conceded positions: ${conceded.map(p => p.topic).join(', ')}`);
    }

    // Based on sensitive topics
    if (this.state.topicsSensitive.length > 0) {
      recommendations.push(`Avoid or approach carefully: ${this.state.topicsSensitive.join(', ')}`);
    }

    // Based on goals
    const nextGoal = this.state.conversionGoals.find(g => !g.achieved);
    if (nextGoal) {
      recommendations.push(`Current goal: ${nextGoal.description}`);
    }

    return recommendations.join('\n');
  }

  /**
   * Process tool output and update state
   */
  public async processToolOutput(toolName: string, toolOutput: string) {
    try {
      // Parse JSON outputs from tracking tools
      if (toolOutput.startsWith('{')) {
        const parsed = JSON.parse(toolOutput);
        
        switch (parsed.action) {
          case "track_position":
            this.trackPosition({
              topic: parsed.data.topic,
              belief: parsed.data.belief,
              challenged: parsed.data.challenged,
              conceded: parsed.data.conceded,
            });
            break;
          
          case "assess_readiness":
            this.updateScores(
              parsed.data.resistanceLevel,
              parsed.data.opennessScore
            );
            if (parsed.data.recommendedTactic) {
              this.setTactic(parsed.data.recommendedTactic.toLowerCase() as ConversationTactic);
            }
            break;
          
          case "set_goal":
            this.addGoal({
              type: parsed.data.type,
              description: parsed.data.description,
              achieved: false,
              attemptedAt: new Date(),
            });
            break;
        }
      }
      
      // Track contradictions
      if (toolName === "find_contradiction" && toolOutput.includes("CONTRADICTION IDENTIFIED")) {
        this.addContradiction(toolOutput);
      }
    } catch (error) {
      console.warn("Failed to process tool output:", error);
    }
  }

  /**
   * Add message to history
   */
  public async addMessage(message: BaseMessage) {
    this.state.messageHistory.push(message);
  }

  /**
   * Get recent conversation context (last N messages)
   */
  public getRecentContext(count: number = 6): string {
    const recent = this.state.messageHistory.slice(-count);
    return recent
      .map(msg => {
        const role = msg instanceof HumanMessage ? "User" : "Assistant";
        return `${role}: ${msg.content}`;
      })
      .join('\n\n');
  }

  /**
   * Detect objections in user message
   */
  public detectObjections(userMessage: string) {
    const objectionPatterns = [
      /but what about/i,
      /how do you explain/i,
      /that doesn't make sense/i,
      /i disagree/i,
      /that's not true/i,
      /the bible says/i,
      /our church teaches/i,
    ];

    for (const pattern of objectionPatterns) {
      if (pattern.test(userMessage)) {
        this.addObjection(userMessage);
        break;
      }
    }
  }

  /**
   * Detect if topic is sensitive (user gets defensive)
   */
  public detectSensitivity(userMessage: string, previousTopic?: string) {
    const sensitivityIndicators = [
      /offensive/i,
      /rude/i,
      /judgmental/i,
      /attacking/i,
      /unfair/i,
      /not listening/i,
    ];

    const isSensitive = sensitivityIndicators.some(pattern => pattern.test(userMessage));
    
    if (isSensitive && previousTopic) {
      this.addSensitiveTopic(previousTopic);
    }
  }
}

/**
 * Create memory instance with initial state
 */
export function createConversionMemory(initialState?: Partial<ConversionMemoryState>): ConversionMemory {
  const memory = new ConversionMemory();
  
  if (initialState) {
    memory.loadState(initialState);
  }
  
  return memory;
}

