import { openai } from "../openai/config";
import { getPineconeIndex, PINECONE_CONFIG, isPineconeConfigured } from "./config";

export interface RetrievedDocument {
  id: string;
  score: number;
  content: string;
  metadata?: {
    source?: string;
    title?: string;
    page?: number;
    author?: string;
    [key: string]: any;
  };
}

export interface RAGContext {
  documents: RetrievedDocument[];
  formattedContext: string;
  sources: string[];
}

/**
 * Generate embedding for a text query using OpenAI's text-embedding-3-large
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const response = await openai.embeddings.create({
      model: PINECONE_CONFIG.embeddingModel,
      input: text,
      dimensions: PINECONE_CONFIG.embeddingDimensions,
    });

    return response.data[0].embedding;
  } catch (error) {
    console.error("Error generating embedding:", error);
    throw new Error("Failed to generate embedding");
  }
}

/**
 * Retrieve relevant context from Pinecone vector database
 */
export async function retrieveRelevantContext(
  query: string,
  topK: number = PINECONE_CONFIG.topK,
  filter?: Record<string, any>
): Promise<RAGContext | null> {
  try {
    // Check if Pinecone is configured
    if (!isPineconeConfigured()) {
      console.warn("Pinecone is not configured. Skipping RAG retrieval.");
      return null;
    }

    // Generate embedding for the query
    const queryEmbedding = await generateEmbedding(query);

    // Query Pinecone index
    const index = getPineconeIndex();
    const queryResponse = await index.query({
      vector: queryEmbedding,
      topK,
      includeMetadata: true,
      filter,
    });

    // Extract matches
    const matches = queryResponse.matches || [];

    if (matches.length === 0) {
      console.log("No relevant documents found for query:", query);
      return null;
    }

    // Transform matches into RetrievedDocument format
    const documents: RetrievedDocument[] = matches.map((match) => ({
      id: match.id,
      score: match.score || 0,
      content: (match.metadata?.text || match.metadata?.content || "") as string,
      metadata: match.metadata as RetrievedDocument["metadata"],
    }));

    // Format context for prompt
    const formattedContext = formatContextForPrompt(documents);

    // Extract unique sources
    const sources = extractSources(documents);

    return {
      documents,
      formattedContext,
      sources,
    };
  } catch (error) {
    console.error("Error retrieving context from Pinecone:", error);
    // Return null instead of throwing to allow graceful fallback
    return null;
  }
}

/**
 * Format retrieved documents into a readable context string for the AI
 */
export function formatContextForPrompt(documents: RetrievedDocument[]): string {
  if (documents.length === 0) {
    return `[SOURCE COUNT: 0 distinct sources available]

ANTI-HALLUCINATION PROTOCOL:
No Orthodox sources were found for this query. You MUST:
- Acknowledge that this topic requires further research
- Say: "This is a topic I cannot definitively address without proper Orthodox sources. I recommend consulting Church Fathers writings, Orthodox catechisms, or speaking with an Orthodox priest."
- Do NOT make claims about Orthodox teaching without source backing`;
  }

  // Extract unique sources for count
  const uniqueSources = new Set<string>();
  documents.forEach(doc => {
    const sourceName = doc.metadata?.source_title || doc.metadata?.title || doc.metadata?.source || doc.metadata?.category;
    if (sourceName) uniqueSources.add(sourceName);
  });
  const sourceCount = uniqueSources.size;

  const contextParts = documents.map((doc, index) => {
    const sourceInfo = formatSourceInfo(doc.metadata);
    const relevanceScore = (doc.score * 100).toFixed(1);
    
    return `[Source ${index + 1}] (Relevance: ${relevanceScore}%)
${sourceInfo}

${doc.content}`;
  });

  return `[SOURCE COUNT: ${sourceCount} distinct sources available]

Relevant Orthodox Christian Sources:

${contextParts.join("\n\n---\n\n")}

ANTI-HALLUCINATION VERIFICATION INSTRUCTIONS:
- You have ${sourceCount} distinct Orthodox source(s) available above
- RULE: Only present theological claims as DEFINITIVE when 2+ sources agree on the teaching
- If fewer than 2 sources support a specific claim, say: "This practice/teaching may vary in Orthodox tradition. I recommend verifying with 2 Orthodox sources (Church Fathers, official Orthodox texts, or your priest)."
- NEVER fabricate patristic quotes, council decisions, or source citations
- When uncertain, acknowledge uncertainty rather than guessing
- Cite sources naturally (e.g., "According to [source]..." or "As the Church Fathers teach...")

If the sources don't directly address the question:
- Rely on well-established Orthodox teaching only
- Acknowledge when a topic requires further research
- Recommend consulting an Orthodox priest for unclear matters`;
}

/**
 * Format source metadata into a readable citation
 */
function formatSourceInfo(metadata?: RetrievedDocument["metadata"]): string {
  if (!metadata) {
    return "Source: Unknown";
  }

  const parts: string[] = [];

  if (metadata.title) {
    parts.push(`Title: ${metadata.title}`);
  }

  if (metadata.author) {
    parts.push(`Author: ${metadata.author}`);
  }

  if (metadata.source) {
    parts.push(`Source: ${metadata.source}`);
  }

  if (metadata.page) {
    parts.push(`Page: ${metadata.page}`);
  }

  return parts.length > 0 ? parts.join(" | ") : "Source: Document";
}

/**
 * Extract unique source names from documents
 */
function extractSources(documents: RetrievedDocument[]): string[] {
  const sourceSet = new Set<string>();
  
  console.log("[RAG] Extracting sources from", documents.length, "documents");

  documents.forEach((doc, index) => {
    // Try multiple metadata field patterns for source name
    // Pinecone metadata uses source_title, source_file, category, source_url
    const sourceName = 
      doc.metadata?.source_title ||
      doc.metadata?.title ||
      doc.metadata?.source ||
      doc.metadata?.source_file ||
      doc.metadata?.category ||
      doc.metadata?.filename ||
      doc.metadata?.document ||
      doc.metadata?.name ||
      doc.metadata?.file;
    
    if (sourceName && typeof sourceName === 'string') {
      // Clean up the source name if it's a file path
      const cleanName = sourceName.includes('/') 
        ? sourceName.split('/').pop() || sourceName 
        : sourceName;
      sourceSet.add(cleanName);
    } else {
      console.log(`[RAG] Document ${index} has no source metadata:`, doc.metadata);
    }
  });
  
  const sources = Array.from(sourceSet);
  console.log("[RAG] Extracted sources:", sources);

  return sources;
}

/**
 * Search for documents related to a specific topic
 * Useful for focused queries like "icons", "filioque", "papal authority"
 */
export async function searchOrthodoxTopics(
  topic: string,
  userBelief?: string,
  topK: number = 5
): Promise<RAGContext | null> {
  // Enhance query with context
  const enhancedQuery = userBelief
    ? `Orthodox Christianity perspective on ${topic} compared to ${userBelief} tradition`
    : `Orthodox Christianity perspective on ${topic}`;

  return retrieveRelevantContext(enhancedQuery, topK);
}

/**
 * Get context for answering questions based on user's faith background
 */
export async function getContextForQuestion(
  question: string,
  userBelief?: string,
  topK: number = 5
): Promise<RAGContext | null> {
  // Enhance the query with user's belief context if available
  let enhancedQuery = question;
  
  if (userBelief && userBelief !== "other" && userBelief !== "orthodox") {
    enhancedQuery = `${question} (comparing Orthodox and ${userBelief} perspectives)`;
  }

  return retrieveRelevantContext(enhancedQuery, topK);
}

/**
 * Retrieve apologetic arguments against specific tradition
 * Returns patristic sources that refute non-Orthodox positions
 */
export async function getAntiCatholicArguments(topic: string, topK: number = 5): Promise<RAGContext | null> {
  const apologeticTopics: Record<string, string> = {
    "papal authority": "patristic evidence against papal supremacy, councils correcting popes, conciliar authority in early Church",
    "filioque": "Church Fathers on procession of Holy Spirit from Father alone, Council of Constantinople 381, Council of Ephesus prohibition on creed changes",
    "purgatory": "Church Fathers on intermediate state, prayer for the dead without purgatorial satisfaction, Mark of Ephesus refutation",
    "vatican ii": "changes in Roman Catholic liturgy and doctrine, comparison of pre and post Vatican II theology",
    "scholasticism": "patristic mystical theology versus Aristotelian scholasticism, apophatic theology, theoria over ratio",
  };

  const query = apologeticTopics[topic.toLowerCase()] || `Orthodox refutation of Catholic ${topic}`;
  return retrieveRelevantContext(query, topK);
}

/**
 * Retrieve arguments against Protestant positions
 */
export async function getAntiProtestantArguments(topic: string, topK: number = 5): Promise<RAGContext | null> {
  const apologeticTopics: Record<string, string> = {
    "sola scriptura": "Church Fathers on oral tradition, 2 Thessalonians 2:15, Church as pillar of truth, canon formation by Church tradition",
    "faith alone": "James 2:24 not by faith alone, Church Fathers on faith and works, synergy and cooperation with grace",
    "invisible church": "Church Fathers on visible Church structure, bishops and apostolic succession, discipline and boundaries",
    "canon": "Church councils determining biblical canon, authority of tradition in establishing Scripture",
    "apostolic succession": "unbroken succession from apostles, laying on of hands, Irenaeus on apostolic churches",
  };

  const query = apologeticTopics[topic.toLowerCase()] || `Orthodox refutation of Protestant ${topic}, Church Fathers on ${topic}`;
  return retrieveRelevantContext(query, topK);
}

/**
 * Retrieve arguments against Baptist positions
 */
export async function getAntiBaptistArguments(topic: string, topK: number = 5): Promise<RAGContext | null> {
  const apologeticTopics: Record<string, string> = {
    "believer baptism": "household baptisms in Acts, infant baptism in early Church, Origen and Irenaeus on infant baptism, baptism replacing circumcision",
    "church autonomy": "Acts 15 Jerusalem Council, conciliar authority, bishops in communion, Ignatius of Antioch on unity",
    "symbolic communion": "Church Fathers on Real Presence, Justin Martyr First Apology, Ignatius on Eucharist as flesh of Christ",
  };

  const query = apologeticTopics[topic.toLowerCase()] || `Church Fathers refuting Baptist ${topic}`;
  return retrieveRelevantContext(query, topK);
}

/**
 * Retrieve arguments against Pentecostal positions
 */
export async function getAntiPentecostalArguments(topic: string, topK: number = 5): Promise<RAGContext | null> {
  const apologeticTopics: Record<string, string> = {
    "tongues": "biblical gift of tongues as known languages Acts 2, 1 Corinthians 12:30 not all speak in tongues, cessation of tongues in early Church",
    "experience": "spiritual delusion prelest, discernment of spirits, sobriety nepsis, Philokalia on testing spirits",
    "mysticism": "hesychasm, Jesus Prayer, theosis, patristic mystical theology, Orthodox spiritual practices",
  };

  const query = apologeticTopics[topic.toLowerCase()] || `Orthodox teaching on spiritual discernment and ${topic}`;
  return retrieveRelevantContext(query, topK);
}

/**
 * Generic apologetic context retrieval
 * Retrieves Orthodox sources that refute specific non-Orthodox doctrine
 */
export async function getApologeticContext(
  userBelief: string,
  topic: string,
  topK: number = 5
): Promise<RAGContext | null> {
  // Route to specific apologetic function based on belief
  const beliefLower = userBelief.toLowerCase();
  
  if (beliefLower === "catholic") {
    return getAntiCatholicArguments(topic, topK);
  } else if (beliefLower === "protestant") {
    return getAntiProtestantArguments(topic, topK);
  } else if (beliefLower === "baptist") {
    return getAntiBaptistArguments(topic, topK);
  } else if (beliefLower === "pentecostal") {
    return getAntiPentecostalArguments(topic, topK);
  }
  
  // Generic fallback
  const query = `Orthodox Church Fathers refuting ${userBelief} position on ${topic}, patristic evidence against ${topic} in ${userBelief} tradition`;
  return retrieveRelevantContext(query, topK);
}

/**
 * Retrieve patristic quotes supporting Orthodox position on topic
 * Formatted for aggressive use in debates
 */
export async function getPatristicSupportForOrthodoxy(
  topic: string,
  topK: number = 3
): Promise<RAGContext | null> {
  const query = `Church Fathers quotes on ${topic}, patristic teaching on ${topic}, early Church practice of ${topic}`;
  return retrieveRelevantContext(query, topK);
}

