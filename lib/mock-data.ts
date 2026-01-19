// Mock Data for Orthodox Chatbot Demo

export type ConversationStage = "A" | "B" | "C" | "D";

export interface Conversation {
  id: number;
  title: string;
  preview: string;
  timestamp: string;
  stage: ConversationStage;
}

export interface Message {
  id: number;
  role: "user" | "bot";
  content: string;
  timestamp: string;
  comparisonData?: ComparisonData;
}

export interface ComparisonData {
  topic: string;
  userTradition: string;
  userView: {
    title: string;
    description: string;
    keyPoints: string[];
    source: string;
  };
  orthodoxView: {
    title: string;
    description: string;
    keyPoints: string[];
    source: string;
    quote: {
      text: string;
      author: string;
    };
  };
  keyDifference: string;
  furtherReading: {
    title: string;
    url: string;
  }[];
}

export interface Church {
  id: number;
  name: string;
  jurisdiction: string;
  address: string;
  phone: string;
  website: string;
  distance: string;
  serviceTimes: string[];
  coordinates: {
    lat: number;
    lng: number;
  };
}

export interface BeliefOption {
  value: string;
  label: string;
  emoji: string;
}

// Mock Conversations
export const mockConversations: Conversation[] = [
  {
    id: 1,
    title: "Why do Orthodox venerate icons?",
    preview: "Icons are windows to heaven...",
    timestamp: "2 hours ago",
    stage: "C",
  },
  {
    id: 2,
    title: "Differences from Catholicism",
    preview: "The key theological distinctions...",
    timestamp: "Yesterday",
    stage: "B",
  },
  {
    id: 3,
    title: "Understanding the Trinity",
    preview: "The Orthodox Church teaches...",
    timestamp: "2 days ago",
    stage: "D",
  },
  {
    id: 4,
    title: "What is Theosis?",
    preview: "Theosis is the process of becoming...",
    timestamp: "3 days ago",
    stage: "C",
  },
  {
    id: 5,
    title: "Divine Liturgy explained",
    preview: "The Divine Liturgy is the central worship...",
    timestamp: "1 week ago",
    stage: "D",
  },
];

// Mock Churches
export const mockChurches: Church[] = [
  {
    id: 1,
    name: "St. Nicholas Greek Orthodox Church",
    jurisdiction: "Greek Orthodox",
    address: "123 Main St, City, ST 12345",
    phone: "(555) 123-4567",
    website: "https://stnicholasgoc.org",
    distance: "3.2 mi",
    serviceTimes: [
      "Saturday Vespers: 5:00 PM",
      "Sunday Orthros: 8:30 AM",
      "Sunday Divine Liturgy: 10:00 AM",
    ],
    coordinates: { lat: 40.7128, lng: -74.006 },
  },
  {
    id: 2,
    name: "Holy Trinity Antiochian Orthodox Church",
    jurisdiction: "Antiochian",
    address: "456 Oak Ave, City, ST 12345",
    phone: "(555) 234-5678",
    website: "https://holytrinityaoc.org",
    distance: "5.7 mi",
    serviceTimes: [
      "Saturday Vespers: 6:00 PM",
      "Sunday Orthros: 9:00 AM",
      "Sunday Divine Liturgy: 10:30 AM",
    ],
    coordinates: { lat: 40.758, lng: -73.9855 },
  },
  {
    id: 3,
    name: "St. Mary Coptic Orthodox Church",
    jurisdiction: "Coptic",
    address: "789 Elm Street, City, ST 12345",
    phone: "(555) 345-6789",
    website: "https://stmarycoc.org",
    distance: "8.1 mi",
    serviceTimes: [
      "Friday Vespers: 7:00 PM",
      "Sunday Divine Liturgy: 9:00 AM",
      "Sunday School: 11:30 AM",
    ],
    coordinates: { lat: 40.7489, lng: -73.9680 },
  },
  {
    id: 4,
    name: "Holy Resurrection Orthodox Church",
    jurisdiction: "OCA",
    address: "321 Pine Road, City, ST 12345",
    phone: "(555) 456-7890",
    website: "https://holyresurrection-oca.org",
    distance: "10.3 mi",
    serviceTimes: [
      "Saturday Great Vespers: 5:30 PM",
      "Sunday Matins: 9:00 AM",
      "Sunday Divine Liturgy: 10:00 AM",
    ],
    coordinates: { lat: 40.7306, lng: -73.9352 },
  },
  {
    id: 5,
    name: "St. Seraphim of Sarov Russian Orthodox Church",
    jurisdiction: "ROCOR",
    address: "654 Maple Drive, City, ST 12345",
    phone: "(555) 567-8901",
    website: "https://stseraphimrocor.org",
    distance: "12.8 mi",
    serviceTimes: [
      "Saturday All-Night Vigil: 6:00 PM",
      "Sunday Divine Liturgy: 9:30 AM",
      "Confession: By appointment",
    ],
    coordinates: { lat: 40.7580, lng: -73.9800 },
  },
];

// Belief Options
export const beliefOptions: BeliefOption[] = [
  { value: "orthodox", label: "Eastern Orthodox", emoji: "☦️" },
  { value: "catholic", label: "Roman Catholic", emoji: "✝️" },
  { value: "protestant", label: "Protestant", emoji: "†" },
  { value: "muslim", label: "Muslim", emoji: "☪️" },
  { value: "jewish", label: "Jewish", emoji: "✡️" },
  { value: "eastern", label: "Hindu/Buddhist", emoji: "🕉️" },
  { value: "atheist", label: "Atheist/Agnostic", emoji: "🤔" },
  { value: "spiritual", label: "Spiritual (Non-religious)", emoji: "✨" },
  { value: "other", label: "Other/Unsure", emoji: "❓" },
];

// Sample Comparison Data
export const mockComparisonData: ComparisonData = {
  topic: "The Holy Eucharist",
  userTradition: "Catholic",
  userView: {
    title: "Catholic Understanding",
    description:
      "The Catholic Church teaches that during the Mass, the bread and wine are transubstantiated into the Body and Blood of Christ. This occurs at the moment of consecration through the words of the priest acting in persona Christi.",
    keyPoints: [
      "Transubstantiation occurs at consecration",
      "The accidents (appearance) remain, but the substance changes",
      "Valid only through ordained priests",
      "Reserved in the tabernacle for adoration",
    ],
    source: "Council of Trent (1545-1563), Session XIII",
  },
  orthodoxView: {
    title: "Orthodox Understanding",
    description:
      "The Orthodox Church believes in the real presence of Christ in the Eucharist but avoids precise philosophical explanations of how this occurs. The transformation happens through the epiclesis (invocation of the Holy Spirit) and the entire liturgical action, not just the words of institution.",
    keyPoints: [
      "Mystery beyond human comprehension",
      "Transformation through epiclesis and entire Liturgy",
      "Emphasis on communion, not individual adoration",
      "Reserved only for communion of the sick",
    ],
    source: "St. John of Damascus, Exposition of the Orthodox Faith (8th century)",
    quote: {
      text: "The bread and wine are not merely figures of the body and blood of Christ—God forbid!—but the deified body of the Lord itself... We do not say that it is the body of God, but the body of God made man.",
      author: "St. John of Damascus",
    },
  },
  keyDifference:
    "While both traditions affirm the real presence, Catholicism uses Aristotelian philosophy to explain it (transubstantiation), while Orthodoxy preserves it as a divine mystery beyond human explanation.",
  furtherReading: [
    {
      title: "The Eucharist: Sacrament of the Kingdom - Alexander Schmemann",
      url: "#",
    },
    {
      title: "The Orthodox Church - Timothy Ware (Chapter on Sacraments)",
      url: "#",
    },
    {
      title: "On the Mystical Supper - St. John Chrysostom",
      url: "#",
    },
  ],
};

// Suggested Questions
export const suggestedQuestions = [
  "What makes Orthodoxy different from Catholicism?",
  "Why do Orthodox Christians venerate icons?",
  "How does Orthodoxy view salvation?",
  "Tell me about the Divine Liturgy",
];

// Sample Bot Messages
export const sampleBotMessages = {
  welcome:
    "Welcome! I'm here to help you explore Orthodox Christianity. To provide you with the most relevant information, could you share your current faith background or spiritual journey?",
  stageA:
    "Thank you for sharing that you're Catholic. I understand you're curious about Orthodox Christianity. The Orthodox Church has deep historical roots and maintains many ancient traditions that date back to the early Church. What specific aspects would you like to explore?",
  stageB:
    "Let me explain some key theological differences between Catholicism and Orthodoxy. I'll present a side-by-side comparison to help you understand the distinct perspectives.",
  stageC:
    "That's a great question. The Orthodox understanding of icons is deeply rooted in the theology of the Incarnation. Icons are not merely religious art, but rather 'windows to heaven' that help us connect with the divine reality they represent.",
  stageD:
    "I'm glad our conversation has been helpful. Here are some recommended next steps: exploring Orthodox literature, attending a Divine Liturgy at a local parish, or speaking with an Orthodox priest. Would you like help finding a church near you?",
};

