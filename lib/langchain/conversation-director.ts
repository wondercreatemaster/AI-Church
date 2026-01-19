/**
 * Conversation Director
 * Analyzes conversation state and recommends tactical approaches
 * Decides when to Attack, Probe, Present, Pressure, or Soften based on user's resistance and openness
 */

import { ConversationTactic } from "../db/models/conversation";
import { ConversionMemory, ConversionMemoryState } from "./memory-manager";

export interface TacticalRecommendation {
  tactic: ConversationTactic;
  reasoning: string;
  intensity: number; // 1-10, how hard to push
  suggestedApproach: string;
  topicsToAddress: string[];
  questionsToAsk: string[];
}

/**
 * Analyze user's message and determine tactical approach
 */
export function analyzeTacticalApproach(
  userMessage: string,
  memoryState: ConversionMemoryState,
  userBelief?: string
): TacticalRecommendation {
  const { opennessScore, resistanceLevel, contradictionsIdentified, topicsSensitive } = memoryState;

  // Analyze message sentiment and content
  const messageAnalysis = analyzeMessage(userMessage);

  // Determine base tactic from openness/resistance scores
  let tactic: ConversationTactic;
  let intensity: number;
  let reasoning: string;

  if (opennessScore >= 8) {
    // VERY OPEN - Push for commitment
    tactic = "pressure";
    intensity = 9;
    reasoning = "User is very open and receptive. This is the moment to push hard for concrete commitment.";
  } else if (opennessScore >= 6) {
    // RECEPTIVE - Present Orthodox alternatives
    tactic = "present";
    intensity = 7;
    reasoning = "User is receptive to Orthodox teaching. Present the fullness of the faith as compelling alternative.";
  } else if (messageAnalysis.isQuestioning && resistanceLevel < 7) {
    // Asking genuine questions - Use probing
    tactic = "probe";
    intensity = 6;
    reasoning = "User is asking questions and showing some openness. Use Socratic method to guide them to truth.";
  } else if (resistanceLevel >= 8 || messageAnalysis.isDefensive) {
    // VERY RESISTANT or DEFENSIVE - Temporarily soften
    tactic = "soften";
    intensity = 3;
    reasoning = "User is very defensive. Ease pressure temporarily to maintain dialogue, then re-engage.";
  } else if (resistanceLevel >= 6) {
    // RESISTANT - Attack directly
    tactic = "attack";
    intensity = 8;
    reasoning = "User is resistant but still engaging. Challenge directly with strong apologetic arguments.";
  } else {
    // NEUTRAL - Probe for weaknesses
    tactic = "probe";
    intensity = 5;
    reasoning = "User is neutral. Ask questions that expose contradictions in their belief system.";
  }

  // Adjust tactic based on message content
  if (messageAnalysis.showsDoubt) {
    // If they're expressing doubt, press harder
    if (tactic === "soften") tactic = "probe";
    if (tactic === "probe") tactic = "present";
    if (tactic === "present") tactic = "pressure";
    intensity = Math.min(10, intensity + 2);
    reasoning += " User is showing doubt - capitalize on this moment.";
  }

  if (messageAnalysis.showsInterest) {
    // If they're showing interest in Orthodoxy, present and invite
    if (tactic === "attack") tactic = "probe";
    if (tactic === "probe") tactic = "present";
    tactic = "present";
    intensity = Math.min(10, intensity + 1);
    reasoning += " User is interested in Orthodoxy - present the beauty and fullness of the faith.";
  }

  // Get suggested approach based on tactic
  const suggestedApproach = getSuggestedApproach(tactic, userBelief, memoryState);

  // Get topics to address
  const topicsToAddress = getTopicsToAddress(userBelief, contradictionsIdentified, messageAnalysis.topics);

  // Get questions to ask
  const questionsToAsk = getQuestionsToAsk(tactic, userBelief, messageAnalysis.topics);

  return {
    tactic,
    reasoning,
    intensity,
    suggestedApproach,
    topicsToAddress,
    questionsToAsk,
  };
}

/**
 * Analyze user message for sentiment and content
 */
function analyzeMessage(message: string): {
  isQuestioning: boolean;
  isDefensive: boolean;
  showsDoubt: boolean;
  showsInterest: boolean;
  topics: string[];
} {
  const lowerMessage = message.toLowerCase();

  // Check for question markers
  const isQuestioning = /\?|what|how|why|when|where|who|can you|could you|tell me|explain/i.test(message);

  // Check for defensive markers
  const isDefensive = /offensive|rude|judgmental|attacking|unfair|disagree|wrong|don't (think|believe)|that's not true/i.test(lowerMessage);

  // Check for doubt markers
  const showsDoubt = /i never thought|interesting|never considered|makes sense|good point|you're right|i'm not sure|maybe|perhaps|wondering/i.test(lowerMessage);

  // Check for interest markers
  const showsInterest = /tell me more|learn more|interested|curious|where can i|how do i|what's next|attend|visit|experience/i.test(lowerMessage);

  // Extract topics mentioned
  const topics: string[] = [];
  const topicPatterns: Record<string, RegExp> = {
    "papal authority": /pope|papal|papacy|infallibility|vatican/i,
    "filioque": /filioque|proceed|holy spirit|trinity/i,
    "sola scriptura": /scripture alone|bible alone|sola scriptura|tradition/i,
    "faith alone": /faith alone|sola fide|works|justification/i,
    "baptism": /baptism|baptize|infant/i,
    "church authority": /church authority|councils|bishop/i,
    "sacraments": /sacrament|eucharist|communion|real presence/i,
    "salvation": /salvation|saved|soteriology|theosis/i,
  };

  for (const [topic, pattern] of Object.entries(topicPatterns)) {
    if (pattern.test(lowerMessage)) {
      topics.push(topic);
    }
  }

  return {
    isQuestioning,
    isDefensive,
    showsDoubt,
    showsInterest,
    topics,
  };
}

/**
 * Get suggested approach text based on tactic
 */
function getSuggestedApproach(
  tactic: ConversationTactic,
  userBelief?: string,
  memoryState?: ConversionMemoryState
): string {
  const approaches: Record<ConversationTactic, string> = {
    attack: `Launch a direct challenge to their core beliefs. Use apologetic arguments from the database to expose contradictions and historical problems in ${userBelief || "their tradition"}. Be intellectually aggressive but not insulting. Force them to confront hard truths about their tradition's departure from apostolic Christianity.`,
    
    probe: `Ask Socratic questions that expose contradictions in their beliefs. Don't tell them their tradition is wrong - LEAD them to discover it themselves through pointed questions. Make them defend positions that are historically or logically indefensible. Use questions from the apologetics database.`,
    
    present: `Present Orthodox Christianity as the compelling, beautiful alternative to their flawed tradition. Show what they're MISSING, not just what's wrong with what they have. Paint a picture of continuity, ancient worship, mystical theology, and living tradition. Make them WANT what Orthodoxy offers.`,
    
    pressure: `This is the moment to push for CONCRETE COMMITMENT. They're open - don't let the moment pass. Ask directly: "Will you visit an Orthodox church this Sunday?" Create urgency: "Truth demands response, not just contemplation." Get them to commit to a specific action: attend liturgy, speak with priest, read specific Church Father.`,
    
    soften: `They're defensive. Ease the pressure temporarily. Acknowledge their seeking, affirm common ground (love of Christ, desire for truth). Then, gently pivot back to engaging their questions. Don't abandon the mission, just change approach temporarily. Use this to build trust, then re-engage more directly.`,
  };

  return approaches[tactic];
}

/**
 * Get topics to address based on belief system and conversation history
 */
function getTopicsToAddress(
  userBelief?: string,
  contradictionsIdentified?: string[],
  currentTopics?: string[]
): string[] {
  if (!userBelief) return [];

  // Priority topics by belief system
  const priorityTopics: Record<string, string[]> = {
    catholic: ["papal authority", "filioque", "Vatican II", "purgatory", "scholasticism"],
    protestant: ["sola scriptura", "canon", "division", "apostolic succession", "faith alone"],
    baptist: ["believer baptism", "household baptisms", "church autonomy", "late innovation"],
    pentecostal: ["tongues evidence", "biblical tongues", "experience vs doctrine", "mysticism"],
    mormon: ["God was once man", "polytheism", "Joseph Smith", "no apostolic connection"],
    anglican: ["founded for divorce", "via media incoherence", "comprehensiveness", "instability"],
  };

  const topics = priorityTopics[userBelief.toLowerCase()] || [];

  // If they mentioned specific topics, prioritize those
  if (currentTopics && currentTopics.length > 0) {
    return [...currentTopics, ...topics.filter(t => !currentTopics.includes(t))].slice(0, 3);
  }

  // Otherwise return top 3 priority topics
  return topics.slice(0, 3);
}

/**
 * Get aggressive questions to ask based on tactic and belief
 */
function getQuestionsToAsk(
  tactic: ConversationTactic,
  userBelief?: string,
  topics?: string[]
): string[] {
  if (!userBelief) return [];

  const beliefQuestions: Record<string, Record<ConversationTactic, string[]>> = {
    catholic: {
      attack: [
        "If papal infallibility was always true, why did it take the Church 1,840 years to define it officially?",
        "How can you reconcile papal infallibility with Pope Honorius being condemned as a heretic by an Ecumenical Council?",
        "Rome added the Filioque to the Creed without an Ecumenical Council. Isn't that precisely what the Council of Ephesus (431) forbade?",
      ],
      probe: [
        "What would it mean for your faith if papal infallibility turned out to be a medieval innovation rather than apostolic teaching?",
        "Can you show me where any Church Father before 1054 taught papal infallibility?",
        "If the Church can change its liturgy so dramatically (Vatican II), what else might have changed over the centuries?",
      ],
      present: [
        "What if there's a Church that still worships exactly as Christians did 1,000 years ago - unchanged liturgy, unchanged faith?",
        "Have you ever experienced Divine Liturgy - worship that's been offered continuously since the apostolic age?",
        "What if the fullness you're seeking isn't in Rome, but in the East - in Orthodox Christianity?",
      ],
      pressure: [
        "If what I'm showing you is historically accurate, doesn't that demand a response from you?",
        "Will you commit to attending an Orthodox Divine Liturgy to experience this for yourself?",
        "What's holding you back from exploring the Church that didn't change?",
      ],
      soften: [
        "I can see you're struggling with this. What aspects of your Catholic faith do you value most?",
        "What drew you to explore Orthodox Christianity in the first place?",
      ],
    },
    protestant: {
      attack: [
        "Show me the verse that says 'Scripture alone.' I'll wait.",
        "If the Holy Spirit guides each believer to truth, why do the 30,000+ Protestant denominations contradict each other?",
        "Can your pastor trace his ordination back to the Apostles? If not, where does his authority come from?",
      ],
      probe: [
        "How did Christians know what to believe for 300 years before the New Testament canon was finalized?",
        "Who gave you the table of contents of the Bible? Wasn't that the Church's tradition?",
        "If everyone can interpret Scripture for themselves, how do you know your interpretation is correct?",
      ],
      present: [
        "What if there's a Church that has the same faith, worship, and structure as the apostolic age - unbroken continuity?",
        "Imagine worshiping with the same liturgy that St. John Chrysostom celebrated in 400 AD. That's Orthodoxy.",
        "What if the 'early Church' you read about in Acts isn't lost history - it's alive in Orthodox Christianity?",
      ],
      pressure: [
        "If sola scriptura refutes itself - since it's not in Scripture - doesn't your whole foundation crumble?",
        "Will you commit to visiting an Orthodox church to see apostolic Christianity in action?",
        "If what I'm saying is true, can you remain where you are in good conscience?",
      ],
      soften: [
        "I know this challenges everything. What questions do you have?",
        "Your love for Scripture is clear. What if Scripture itself points to the Church and Tradition?",
      ],
    },
    baptist: {
      attack: [
        "Acts 16:33 - the jailer's entire household was baptized immediately. Did they check everyone's ages first, or does household mean household?",
        "If Baptist theology is 'New Testament Christianity,' where were Baptists in 200 AD? 500 AD? 1000 AD?",
        "Can you name ONE Church Father who taught believer-only baptism?",
      ],
      probe: [
        "Why would the early Church universally baptize infants if it contradicted apostolic teaching?",
        "How do you reconcile church autonomy with Acts 15, where Jerusalem's decision was binding on all churches?",
        "Baptism replaced circumcision (Col 2:11-12). If circumcision was for infants, why not baptism?",
      ],
      present: [
        "What if Christian baptism, like circumcision, is God's covenant sign given to children?",
        "Orthodoxy has maintained the apostolic practice of baptizing entire households for 2,000 years.",
        "What if the 'New Testament Church' you're seeking isn't a 1600s innovation but a living reality?",
      ],
      pressure: [
        "If infant baptism was the universal practice of the early Church, aren't you withholding grace from your own children?",
        "Will you investigate what the actual apostolic Church practiced, not what modern Baptists claim?",
        "Can you remain in a 400-year-old tradition while the 2,000-year-old Church still exists?",
      ],
      soften: [
        "I understand this is challenging your entire framework. What concerns you most?",
        "Your desire to follow Scripture is commendable. Let's look at what Scripture actually shows about households.",
      ],
    },
    pentecostal: {
      attack: [
        "1 Corinthians 12:30: 'Do all speak in tongues?' Paul's answer is NO. How then can tongues be evidence for all?",
        "Acts 2 - tongues were known languages people recognized. Why are modern 'tongues' unintelligible?",
        "Where were Pentecostals before 1906? Was the Holy Spirit inactive for 1,900 years?",
      ],
      probe: [
        "How do you know your spiritual experience is from God and not emotional manipulation or even demonic deception?",
        "If tongues is the evidence of Spirit baptism, why does Scripture never say that?",
        "Which is more reliable: how you feel in worship, or 2,000 years of patristic wisdom on spiritual discernment?",
      ],
      present: [
        "What if there's a deeper mysticism than emotional worship - the Jesus Prayer, hesychasm, theosis?",
        "Orthodox Christianity has mystical theology that makes Pentecostalism look shallow. Want to explore it?",
        "Imagine experiencing God not through manufactured emotion, but through ancient ascetic practices.",
      ],
      pressure: [
        "If tongues-as-evidence isn't biblical, isn't your entire experience built on sand?",
        "Will you explore Orthodox spirituality - real mysticism rooted in 2,000 years of wisdom?",
        "Can you stay in a 100-year-old movement when the ancient Church is still here?",
      ],
      soften: [
        "Your hunger for authentic encounter with God is beautiful. What if Orthodoxy offers that?",
        "I'm not dismissing your experience. I'm inviting you to something deeper.",
      ],
    },
    mormon: {
      attack: [
        "Isaiah 43:10: 'Before me no god was formed, nor after me.' How does that fit with 'God was once a man'?",
        "Can you name ONE Christian before Joseph Smith who taught that God was once a man?",
        "If the Book of Mormon describes horses, steel, and wheat in ancient Americas, where's the archaeological evidence?",
      ],
      probe: [
        "What would it mean for your faith if LDS theology contradicts what Christians have always believed about God?",
        "How is LDS connected to the Church Jesus founded? What's the historical link to the Apostles?",
        "If God is eternally God (not an exalted man), does that change everything?",
      ],
      present: [
        "What if there's a Church with actual connection to the Apostles - unbroken succession from day one?",
        "Christian theosis (deification) is becoming like God by grace, not becoming gods ourselves.",
        "Orthodoxy offers what you're seeking - but rooted in 2,000 years of Christian history, not 19th-century America.",
      ],
      pressure: [
        "If LDS theology is polytheistic, not Christian, doesn't that demand you investigate historic Christianity?",
        "Will you explore the Church that actually traces back to Jesus and the Apostles?",
        "Can you remain in a 19th-century tradition when the apostolic Church still exists?",
      ],
      soften: [
        "I know this is massive for you. What aspects of your LDS faith are most important to you?",
        "Your seeking is genuine. What if the truth you're seeking is in the ancient Church?",
      ],
    },
    anglican: {
      attack: [
        "Your church was founded because Henry VIII wanted a divorce. How is that apostolic?",
        "How can Anglican bishops in the same communion deny core doctrines like the bodily Resurrection?",
        "If Anglicanism 'comprehends' contradictory beliefs, what does Anglican even mean?",
      ],
      probe: [
        "What's actually required belief in Anglicanism? If everything is acceptable, is anything true?",
        "Via media - middle way between what? Rome and Protestantism? Why not just embrace the original?",
        "Doesn't recent Anglican history prove it changes with culture rather than preserving apostolic faith?",
      ],
      present: [
        "What if the liturgical beauty you love in Anglicanism is just an echo of Orthodoxy?",
        "Orthodoxy offers what Anglo-Catholics seek - the real thing, not a compromise.",
        "Imagine a Church with Anglican liturgical beauty but unchanging apostolic faith.",
      ],
      pressure: [
        "If Anglicanism is unstable via media, why not embrace the stable apostolic Church?",
        "Will you attend Orthodox Liturgy and see what you've been missing?",
        "Can you remain in a 16th-century compromise when the ancient Church is here?",
      ],
      soften: [
        "Your appreciation for liturgy and tradition is clear. What drew you to explore Orthodoxy?",
        "I understand the via media appeals to you. Let's explore whether it's historically coherent.",
      ],
    },
  };

  const questions = beliefQuestions[userBelief.toLowerCase()]?.[tactic] || [];
  return questions.slice(0, 3);
}

/**
 * Get initial conversion goal based on user belief and openness
 */
export function getInitialConversionGoal(
  userBelief: string,
  opennessScore: number
): { type: string; description: string } {
  if (opennessScore >= 7) {
    return {
      type: "commit_visit_church",
      description: "Get user to commit to visiting an Orthodox church",
    };
  } else if (opennessScore >= 5) {
    return {
      type: "express_doubt",
      description: "Lead user to express doubt about their current tradition",
    };
  } else {
    return {
      type: "acknowledge_orthodox",
      description: "Get user to acknowledge Orthodox position has merit",
    };
  }
}

/**
 * Determine if conversion goal has been achieved based on user message
 */
export function checkGoalAchievement(
  goalType: string,
  userMessage: string
): boolean {
  const achievementPatterns: Record<string, RegExp> = {
    acknowledge_orthodox: /makes sense|good point|never thought|you're right|interesting|i see/i,
    express_doubt: /not sure|questioning|doubt|maybe.*wrong|reconsidering/i,
    commit_visit_church: /i will|yes.*visit|commit|when can i|where.*church|this sunday/i,
    attend_liturgy: /attended|went to|experienced.*liturgy/i,
    speak_with_priest: /spoke with|talked to.*priest|met with priest/i,
  };

  const pattern = achievementPatterns[goalType];
  return pattern ? pattern.test(userMessage) : false;
}

