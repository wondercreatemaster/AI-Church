import { ConversationStage } from "../db/models/conversation";

export interface QuestionScript {
  id: string;
  stage: ConversationStage;
  background: string[]; // ['catholic', 'protestant', 'non-christian', 'all']
  question: string;
  context: string; // Why this question matters
  followUpTopics: string[]; // Topics to explore after answer
  evaluationCriteria: string; // What indicates understanding
  order: number; // Sequence order within stage
  answerOptions?: string[]; // Optional: predefined answer choices for easy clicking
}

/**
 * Complete question script database organized by stage and religious background
 */
export const QUESTION_SCRIPTS: QuestionScript[] = [
  // Stage A: Identify the User's Faith Background
  {
    id: "q1-background",
    stage: "A",
    background: ["all"],
    question: "What religion or denomination do you currently belong to?",
    context: "Understanding their background helps connect their faith to the earliest Christian roots.",
    followUpTopics: ["faith-history", "denomination-specifics", "practice-level"],
    evaluationCriteria: "User clearly identifies their religious background or lack thereof",
    order: 1,
    answerOptions: [
      "I am Catholic",
      "I am Protestant (Baptist, Methodist, Lutheran, etc.)",
      "I am Pentecostal/Charismatic",
      "I am Anglican/Episcopal",
      "I am Mormon (LDS)",
      "I am Jewish",
      "I am Muslim",
      "I am Sikh",
      "I am Hindu",
      "I am Buddhist",
      "I am Orthodox Christian",
      "I am atheist/agnostic",
      "Other religion",
      "Prefer not to say"
    ],
  },
  {
    id: "q2-practice-level",
    stage: "A",
    background: ["all"],
    question: "Would you describe yourself as an active member of that faith, or more of a seeker?",
    context: "The Orthodox Church welcomes all seekers to explore the original form of Christianity as practiced from the time of the Apostles.",
    followUpTopics: ["spiritual-journey", "openness-level", "questions-they-have"],
    evaluationCriteria: "User describes their current level of faith engagement",
    order: 2,
    answerOptions: [
      "Very active member",
      "Somewhat active",
      "Nominal member (cultural connection only)",
      "Seeker/Exploring",
      "Questioning my faith",
      "Just curious about Orthodoxy"
    ],
  },
  
  // Stage A/B: Gauge Knowledge of Orthodoxy
  {
    id: "q3-orthodox-exposure",
    stage: "A",
    background: ["all"],
    question: "Have you ever attended an Orthodox Liturgy or read about Orthodox Christianity?",
    context: "Orthodoxy is the ancient Church that began at Pentecost in the 1st century. It has preserved the same beliefs, worship, and sacraments since then.",
    followUpTopics: ["liturgy-experience", "orthodox-knowledge", "first-impressions"],
    evaluationCriteria: "User shares their level of exposure to Orthodoxy",
    order: 3,
  },
  {
    id: "q4-orthodox-distinction",
    stage: "B",
    background: ["all"],
    question: "Do you know what distinguishes the Orthodox Church from Catholicism or Protestantism?",
    context: "The Orthodox Church never changed its core doctrines or worship after the first seven Ecumenical Councils. Unlike Western branches, it emphasizes spiritual transformation (theosis) over legal guilt.",
    followUpTopics: ["historical-continuity", "theological-differences", "unchanged-tradition"],
    evaluationCriteria: "User demonstrates understanding or curiosity about Orthodox distinctives",
    order: 4,
  },

  // Stage B: Catholic-Specific Questions
  {
    id: "q5-papacy",
    stage: "B",
    background: ["catholic"],
    question: "How do you view the papacy?",
    context: "In Orthodoxy, all bishops are equal successors of the Apostles. Christ is the true Head of the Church, not any single bishop. This was the ancient understanding before Rome's later claims of supremacy.",
    followUpTopics: ["papal-authority", "episcopal-equality", "church-structure"],
    evaluationCriteria: "User engages with the question about papal authority and expresses their view",
    order: 5,
    answerOptions: [
      "I believe the Pope is essential to the Church",
      "I respect the Pope but question papal infallibility",
      "I'm uncertain about the Pope's role",
      "I think papal supremacy developed later historically",
      "I'd like to learn more about early Church structure"
    ],
  },
  {
    id: "q6-filioque",
    stage: "B",
    background: ["catholic"],
    question: "Do you know about the Filioque clause in the Creed?",
    context: "The original Creed, written in Greek in the 4th century, said the Holy Spirit proceeds from the Father. The Latin addition 'and the Son' was never part of the ancient text and changed the theology of the Trinity.",
    followUpTopics: ["creed-history", "trinity-theology", "unauthorized-changes"],
    evaluationCriteria: "User shows understanding of the Filioque controversy or asks for clarification",
    order: 6,
    answerOptions: [
      "Yes, I'm familiar with it",
      "I've heard of it but don't understand the controversy",
      "No, please tell me more"
    ],
  },

  // Stage B: Protestant-Specific Questions
  {
    id: "q7-bible-canon",
    stage: "B",
    background: ["protestant"],
    question: "Who gave us the Bible, and how was it compiled?",
    context: "The Bible was canonized by the Orthodox Church in councils of the 4th century. The Church existed before the Bible — the Scriptures came from within the Church, not the other way around.",
    followUpTopics: ["church-authority", "canon-formation", "sola-scriptura"],
    evaluationCriteria: "User engages with the historical relationship between Church and Scripture",
    order: 5,
  },
  {
    id: "q8-sacraments",
    stage: "B",
    background: ["protestant"],
    question: "Does your church believe in sacraments like baptism, confession, and the Eucharist?",
    context: "Orthodoxy has kept the same seven sacraments practiced by the Apostles. Early Christian writings show that baptism, confession, and the Eucharist were always part of the faith from the very beginning.",
    followUpTopics: ["sacramental-theology", "early-church-practice", "apostolic-continuity"],
    evaluationCriteria: "User describes their view of sacraments and shows openness to historical perspective",
    order: 6,
  },

  // Stage B: Non-Christian Questions
  {
    id: "q9-who-is-jesus",
    stage: "B",
    background: ["non-christian", "atheist", "muslim", "other"],
    question: "What do you believe about who Jesus is?",
    context: "Orthodoxy teaches that Jesus Christ is both fully God and fully man — the eternal Son who became human to restore us to communion with God.",
    followUpTopics: ["christology", "incarnation", "divinity-of-christ"],
    evaluationCriteria: "User shares their beliefs about Jesus and shows willingness to discuss",
    order: 5,
  },
  {
    id: "q10-historical-continuity",
    stage: "B",
    background: ["non-christian", "atheist", "muslim", "other"],
    question: "Have you explored historical evidence for the early Church and its continuity?",
    context: "The Orthodox Church can trace an unbroken line of bishops and worship back to the Apostles. Its liturgy and prayers today are the same as those found in 2nd and 3rd century manuscripts.",
    followUpTopics: ["historical-evidence", "apostolic-succession", "liturgical-continuity"],
    evaluationCriteria: "User shows interest in historical evidence or asks questions about continuity",
    order: 6,
  },

  // Stage C: Invitation to Experience Orthodoxy
  {
    id: "q11-visit-invitation",
    stage: "C",
    background: ["all"],
    question: "Would you be open to visiting an Orthodox Church near you to experience the Liturgy firsthand?",
    context: "Attending even once can be a powerful spiritual experience — the worship is filled with Scripture, reverence, and ancient hymns that have not changed for nearly 2,000 years.",
    followUpTopics: ["liturgy-experience", "parish-visit", "practical-next-steps"],
    evaluationCriteria: "User expresses openness or hesitation about visiting",
    order: 7,
    answerOptions: [
      "Yes, I'd love to visit",
      "Yes, but I have some concerns",
      "Maybe, I need to think about it",
      "I'm not ready yet",
      "No, I'm just exploring intellectually"
    ],
  },
  {
    id: "q12-find-parish",
    stage: "C",
    background: ["all"],
    question: "Would you like me to help you find an Orthodox parish near your location?",
    context: "I can locate the nearest parish and provide times for Divine Liturgy or Vespers. Visitors are always welcome — no one will pressure you.",
    followUpTopics: ["local-parishes", "service-times", "what-to-expect"],
    evaluationCriteria: "User responds with interest or provides location, or declines politely",
    order: 8,
    answerOptions: [
      "Yes, please help me find a parish",
      "Maybe later",
      "Not right now"
    ],
  },

  // Stage C: Addressing Common Objections
  {
    id: "q13-icons",
    stage: "C",
    background: ["protestant", "non-christian", "atheist", "muslim"],
    question: "Why do Orthodox Christians venerate icons?",
    context: "Icons are not idols. They are windows to heaven, just as photographs remind us of loved ones. The honor passes to the person represented, not the wood or paint.",
    followUpTopics: ["iconography", "veneration-vs-worship", "theological-basis"],
    evaluationCriteria: "User shows understanding of the distinction between veneration and worship",
    order: 9,
  },
  {
    id: "q14-saints",
    stage: "C",
    background: ["protestant", "non-christian"],
    question: "Why do Orthodox Christians pray to saints?",
    context: "We ask saints to pray with us, not instead of us. Just like you'd ask a friend to pray for you, we ask those already united with God to intercede on our behalf.",
    followUpTopics: ["communion-of-saints", "intercession", "church-triumphant"],
    evaluationCriteria: "User grasps the concept of intercessory prayer through saints",
    order: 10,
  },
  {
    id: "q15-salvation",
    stage: "C",
    background: ["protestant", "catholic"],
    question: "Is salvation by faith or by works?",
    context: "Orthodoxy teaches that salvation is a relationship — we are saved by grace through faith working in love. It's about healing the soul, not merely legal pardon.",
    followUpTopics: ["theosis", "synergy", "salvation-as-healing"],
    evaluationCriteria: "User engages with the Orthodox view of salvation as transformation",
    order: 11,
  },

  // Stage D: Gentle Persuasion and Next Steps
  {
    id: "q16-early-christians",
    stage: "D",
    background: ["all"],
    question: "Would you like to learn what the early Christians believed about your question?",
    context: "The writings of the first Church Fathers — Ignatius of Antioch, Irenaeus, and others — show they practiced what Orthodoxy still practices today: liturgy, bishops, fasting, and the Eucharist as the Body and Blood of Christ.",
    followUpTopics: ["church-fathers", "patristic-writings", "historical-sources"],
    evaluationCriteria: "User expresses interest in learning more about early Christian practice",
    order: 12,
  },
  {
    id: "q17-what-stops-you",
    stage: "D",
    background: ["all"],
    question: "What would stop you from visiting an Orthodox church and seeing it for yourself?",
    context: "Faith often begins not with argument but with encounter. Seeing the Divine Liturgy and hearing the ancient prayers can speak more deeply than words.",
    followUpTopics: ["obstacles", "concerns", "practical-barriers", "next-commitment"],
    evaluationCriteria: "User identifies barriers or commits to next steps",
    order: 13,
    answerOptions: [
      "Nothing stops me, I'm ready to visit",
      "I'm not sure what to expect",
      "I'm concerned about feeling out of place",
      "Distance/logistics are a barrier",
      "I need more time to think and learn"
    ],
  },
];

/**
 * Get questions for a specific stage and background
 */
export function getQuestionsForStageAndBackground(
  stage: ConversationStage,
  background: string
): QuestionScript[] {
  const normalizedBackground = background.toLowerCase();
  
  return QUESTION_SCRIPTS
    .filter(q => 
      q.stage === stage && 
      (q.background.includes("all") || 
       q.background.includes(normalizedBackground) ||
       q.background.some(bg => normalizedBackground.includes(bg)))
    )
    .sort((a, b) => a.order - b.order);
}

/**
 * Get a specific question by ID
 */
export function getQuestionById(questionId: string): QuestionScript | undefined {
  return QUESTION_SCRIPTS.find(q => q.id === questionId);
}

/**
 * Get all questions for a background across all stages
 */
export function getQuestionsForBackground(background: string): QuestionScript[] {
  const normalizedBackground = background.toLowerCase();
  
  return QUESTION_SCRIPTS
    .filter(q => 
      q.background.includes("all") || 
      q.background.includes(normalizedBackground) ||
      q.background.some(bg => normalizedBackground.includes(bg))
    )
    .sort((a, b) => {
      // Sort by stage first, then by order
      const stageOrder = { A: 1, B: 2, C: 3, D: 4 };
      if (stageOrder[a.stage] !== stageOrder[b.stage]) {
        return stageOrder[a.stage] - stageOrder[b.stage];
      }
      return a.order - b.order;
    });
}

