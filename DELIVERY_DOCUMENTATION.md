# AI-Church Project Delivery Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Services & Accounts](#services--accounts)
3. [Environment Configuration](#environment-configuration)
4. [Data Management](#data-management)
5. [Pinecone Vector Database](#pinecone-vector-database)
6. [Prompt Configuration](#prompt-configuration)
7. [Deployment Guide](#deployment-guide)
8. [Maintenance & Updates](#maintenance--updates)

---

## Project Overview

**AI-Church** is an Orthodox Christian educational chatbot platform built with Next.js 16, featuring:
- AI-powered theological conversations with aggressive conversion tactics
- RAG (Retrieval-Augmented Generation) using Pinecone vector database
- User authentication with NextAuth v5
- Church finder functionality with Google Maps integration
- Conversation tracking and memory management
- Anonymous and authenticated user support

**Tech Stack:**
- **Frontend/Backend**: Next.js 16 (App Router), React 19, TypeScript
- **Database**: MongoDB (user data, conversations, messages)
- **Vector DB**: Pinecone (theological content, Church Fathers writings)
- **AI**: OpenAI GPT-4o-mini (chat), text-embedding-3-large (embeddings)
- **Auth**: NextAuth v5 with MongoDB adapter
- **AI Framework**: LangChain with LangGraph for agent management
- **Styling**: Tailwind CSS 4 with Radix UI components

---

## Services & Accounts

### 1. MongoDB
**Purpose**: Primary database for user accounts, conversations, and messages

**Current Setup:**
- Database name: `ai-rag` (or as configured in `MONGODB_URI`)
- Collections:
  - `users` - User accounts and profiles
  - `conversations` - Authenticated user conversations
  - `messages` - Authenticated user messages
  - `anonymous_conversations` - Anonymous user conversations
  - `anonymous_messages` - Anonymous user messages
  - `accounts` - NextAuth OAuth accounts
  - `sessions` - NextAuth sessions

**Access & Management:**
- **Local Development**: `mongodb://localhost:27017/ai-rag`
- **Production**: MongoDB Atlas recommended
- **Connection**: Configure via `MONGODB_URI` environment variable

**How to Update:**
1. Access MongoDB via connection string
2. Use MongoDB Compass or `mongosh` CLI
3. Collections are auto-created by the application
4. Backup before making structural changes:
   ```bash
   mongodump --uri="<MONGODB_URI>" --out=./backup
   ```

**Important Notes:**
- User passwords are hashed with bcryptjs (12 rounds)
- Anonymous sessions expire after 30 days (configurable in cleanup script)
- Indexes are created automatically by Mongoose/MongoDB driver

---

### 2. Pinecone Vector Database
**Purpose**: Store and retrieve theological content for RAG (Church Fathers, Orthodox teachings)

**Current Setup:**
- **Index Name**: `church` (configurable via `PINECONE_INDEX_NAME`)
- **Dimensions**: 3072 (for text-embedding-3-large model)
- **Metric**: Cosine similarity
- **Environment**: us-east-1 (or as configured)

**Access & Management:**
- **Dashboard**: https://app.pinecone.io
- **API Key**: Configure via `PINECONE_API_KEY`
- **Index Management**: Via Pinecone console or API

**Current Data Structure:**
Each vector in Pinecone contains:
```javascript
{
  id: "unique-id",
  values: [3072-dimensional embedding],
  metadata: {
    text: "actual content",
    content: "actual content", // alternate field
    title: "Source title",
    author: "Church Father name",
    source: "Book/document name",
    page: 123,
    // ... custom metadata fields
  }
}
```

---

### 3. OpenAI API
**Purpose**: 
- Text generation (chat completions)
- Embeddings generation for RAG

**Current Setup:**
- **Chat Model**: `gpt-4o-mini` (configurable via `OPENAI_MODEL`)
- **Embedding Model**: `text-embedding-3-large` (3072 dimensions)
- **Temperature**: 0.7 (configurable)
- **Max Tokens**: 2000 per response (configurable)

**Access & Management:**
- **Dashboard**: https://platform.openai.com
- **API Key**: Configure via `OPENAI_API_KEY`
- **Usage Monitoring**: Check usage in OpenAI dashboard

**Configuration Options** (via environment variables):
```env
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini
OPENAI_TEMPERATURE=0.7
OPENAI_MAX_TOKENS=2000
```

**Rate Limits** (configured in code):
- 20 requests per minute
- 100,000 tokens per day

---

### 4. NextAuth Authentication
**Purpose**: User authentication and session management

**Current Setup:**
- **Provider**: Credentials (email/password)
- **Adapter**: MongoDB adapter
- **Session Strategy**: JWT with database persistence
- **Secret**: Configure via `NEXTAUTH_SECRET`

**Access & Management:**
- Sessions stored in MongoDB `sessions` collection
- JWT tokens signed with `NEXTAUTH_SECRET`
- User data in MongoDB `users` collection

**Generate New Secret:**
```bash
openssl rand -base64 32
```

---

### 5. Google Maps API (Church Finder)
**Purpose**: Geocoding and church location search

**Current Setup:**
- Used in `/api/churches/search` endpoint
- Requires `GOOGLE_MAPS_API_KEY` (if configured)
- Falls back to basic location search if not configured

**Access & Management:**
- **Console**: https://console.cloud.google.com
- Enable Maps JavaScript API and Geocoding API
- Restrict API key to your domain for security

---

## Environment Configuration

### Required Environment Variables

Create a `.env.local` file in the project root:

```env
# MongoDB - REQUIRED
MONGODB_URI=mongodb://localhost:27017/ai-rag
# Production: mongodb+srv://username:password@cluster.mongodb.net/ai-rag

# NextAuth - REQUIRED
NEXTAUTH_URL=http://localhost:3000
# Production: https://your-domain.com
NEXTAUTH_SECRET=your-generated-secret-here

# OpenAI - REQUIRED
OPENAI_API_KEY=sk-proj-...
OPENAI_MODEL=gpt-4o-mini
OPENAI_TEMPERATURE=0.7
OPENAI_MAX_TOKENS=2000

# Pinecone - REQUIRED for RAG functionality
PINECONE_API_KEY=your-pinecone-api-key
PINECONE_INDEX_NAME=church
PINECONE_ENVIRONMENT=us-east-1

# Google Maps - OPTIONAL (for church finder)
GOOGLE_MAPS_API_KEY=your-google-maps-api-key

# Node Environment
NODE_ENV=development
# Production: production
```

### Environment Variable Breakdown

| Variable | Required | Default | Purpose |
|----------|----------|---------|---------|
| `MONGODB_URI` | Yes | - | MongoDB connection string |
| `NEXTAUTH_URL` | Yes | - | Application URL for NextAuth |
| `NEXTAUTH_SECRET` | Yes | - | JWT signing secret |
| `OPENAI_API_KEY` | Yes | - | OpenAI API authentication |
| `OPENAI_MODEL` | No | `gpt-4o-mini` | Chat completion model |
| `OPENAI_TEMPERATURE` | No | `0.7` | Response creativity (0-1) |
| `OPENAI_MAX_TOKENS` | No | `2000` | Max tokens per response |
| `PINECONE_API_KEY` | Yes* | - | Pinecone authentication |
| `PINECONE_INDEX_NAME` | No | `church` | Pinecone index name |
| `PINECONE_ENVIRONMENT` | No | `us-east-1` | Pinecone region |
| `GOOGLE_MAPS_API_KEY` | No | - | Google Maps features |

*Pinecone is required for full RAG functionality but the app will run without it (degraded experience)

---

## Data Management

### MongoDB Data Management

#### Viewing User Data
```bash
# Connect to MongoDB
mongosh "mongodb://localhost:27017/ai-rag"

# View all users
db.users.find().pretty()

# Count conversations
db.conversations.countDocuments()

# Find specific user
db.users.findOne({ email: "user@example.com" })

# View recent conversations
db.conversations.find().sort({ updatedAt: -1 }).limit(5)
```

#### Backup and Restore
```bash
# Backup entire database
mongodump --uri="mongodb://localhost:27017/ai-rag" --out=./backup

# Restore from backup
mongorestore --uri="mongodb://localhost:27017/ai-rag" ./backup/ai-rag

# Backup specific collection
mongodump --uri="mongodb://localhost:27017/ai-rag" --collection=users --out=./backup
```

#### Cleanup Anonymous Data
The project includes an automatic cleanup for anonymous conversations:

```bash
# Run cleanup manually (removes data older than 30 days)
curl -X POST http://localhost:3000/api/cleanup/anonymous
```

Location: `/app/api/cleanup/anonymous/route.ts`

---

## Pinecone Vector Database

### Understanding the Vector Database

The Pinecone vector database stores theological content that the AI uses to provide accurate, source-backed responses. Content is converted to embeddings (numerical representations) and retrieved based on semantic similarity to user questions.

### Current Data in Pinecone

The `church` index should contain:
- Church Fathers writings (Ignatius, Irenaeus, Athanasius, etc.)
- Orthodox theological texts
- Apologetic resources
- Patristic quotes and teachings
- Historical documents

### How to Add New Data to Pinecone

#### Step 1: Prepare Your Data

Organize your theological content in a structured format (JSON, CSV, or plain text files):

```json
[
  {
    "text": "Full text content here...",
    "title": "Document Title",
    "author": "Church Father Name",
    "source": "Book Name",
    "page": 123
  }
]
```

#### Step 2: Chunk the Data

Large texts must be split into chunks (typically 500-1000 tokens each) to fit embedding model limits:

```javascript
// Example chunking function
function chunkText(text, chunkSize = 1000) {
  const words = text.split(/\s+/);
  const chunks = [];
  
  for (let i = 0; i < words.length; i += chunkSize) {
    const chunk = words.slice(i, i + chunkSize).join(' ');
    chunks.push(chunk);
  }
  
  return chunks;
}
```

**Best Practices for Chunking:**
- **Chunk Size**: 500-1000 tokens (roughly 400-800 words)
- **Overlap**: Include 50-100 words overlap between chunks for context
- **Semantic Boundaries**: Try to split at paragraph or sentence boundaries
- **Preserve Context**: Include source info in each chunk's metadata

#### Step 3: Generate Embeddings and Upsert to Pinecone

Create a script to process and upload data:

**File: `scripts/upsert-to-pinecone.js`** (create this file)

```javascript
import { openai } from '../lib/openai/config.js';
import { pinecone, PINECONE_CONFIG } from '../lib/pinecone/config.js';
import fs from 'fs';

// Function to generate embedding
async function generateEmbedding(text) {
  const response = await openai.embeddings.create({
    model: PINECONE_CONFIG.embeddingModel,
    input: text,
    dimensions: PINECONE_CONFIG.embeddingDimensions,
  });
  
  return response.data[0].embedding;
}

// Function to chunk text
function chunkText(text, maxTokens = 800, overlap = 100) {
  const words = text.split(/\s+/);
  const chunks = [];
  const chunkSize = Math.floor(maxTokens * 0.75); // Rough token estimation
  
  for (let i = 0; i < words.length; i += (chunkSize - overlap)) {
    const chunk = words.slice(i, i + chunkSize).join(' ');
    if (chunk.length > 50) { // Minimum chunk size
      chunks.push(chunk);
    }
  }
  
  return chunks;
}

// Main upsert function
async function upsertDocuments(documents) {
  const index = pinecone.index(PINECONE_CONFIG.indexName);
  const vectors = [];
  
  for (const doc of documents) {
    // Chunk the document text
    const chunks = chunkText(doc.text);
    
    console.log(`Processing: ${doc.title} (${chunks.length} chunks)`);
    
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      
      // Generate embedding
      const embedding = await generateEmbedding(chunk);
      
      // Create vector with metadata
      vectors.push({
        id: `${doc.id || doc.title}-chunk-${i}`,
        values: embedding,
        metadata: {
          text: chunk,
          title: doc.title,
          author: doc.author || 'Unknown',
          source: doc.source || doc.title,
          page: doc.page || null,
          chunkIndex: i,
          totalChunks: chunks.length,
        }
      });
      
      // Batch upsert every 100 vectors
      if (vectors.length >= 100) {
        await index.upsert(vectors);
        console.log(`Upserted ${vectors.length} vectors`);
        vectors.length = 0; // Clear array
      }
      
      // Rate limiting - wait 100ms between embeddings
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  
  // Upsert remaining vectors
  if (vectors.length > 0) {
    await index.upsert(vectors);
    console.log(`Upserted final ${vectors.length} vectors`);
  }
  
  console.log('✅ All documents uploaded successfully!');
}

// Example usage
async function main() {
  // Load your data (modify path as needed)
  const data = JSON.parse(fs.readFileSync('./data/theological-content.json', 'utf-8'));
  
  await upsertDocuments(data);
}

main().catch(console.error);
```

**Run the script:**

```bash
# Install dependencies if needed
npm install

# Run the upsert script
node scripts/upsert-to-pinecone.js
```

#### Step 4: Verify Upload

```javascript
// scripts/verify-pinecone.js
import { pinecone, PINECONE_CONFIG } from '../lib/pinecone/config.js';

async function verifyIndex() {
  const index = pinecone.index(PINECONE_CONFIG.indexName);
  const stats = await index.describeIndexStats();
  
  console.log('Index Statistics:');
  console.log(`- Total vectors: ${stats.totalRecordCount}`);
  console.log(`- Dimensions: ${stats.dimension}`);
  console.log(`- Index fullness: ${stats.indexFullness}`);
}

verifyIndex().catch(console.error);
```

### Alternative: Manual Upload via Pinecone Dashboard

1. Go to https://app.pinecone.io
2. Select your `church` index
3. Use the "Upload Data" feature (for small datasets)
4. Or use Pinecone's Python SDK for larger datasets

### Querying Pinecone Data

The application automatically queries Pinecone via `lib/pinecone/rag-service.ts`:

```javascript
import { retrieveRelevantContext } from '@/lib/pinecone/rag-service';

// Example query
const context = await retrieveRelevantContext(
  "What do Church Fathers say about icons?",
  5 // topK - number of results
);

console.log(context.formattedContext);
console.log(context.sources);
```

### Updating Existing Vectors

To update existing data, upsert with the same ID:

```javascript
await index.upsert([
  {
    id: "existing-vector-id", // Same ID = update
    values: newEmbedding,
    metadata: {
      text: "Updated content",
      // ... metadata
    }
  }
]);
```

### Deleting Vectors

```javascript
// Delete specific vectors
await index.deleteOne("vector-id");

// Delete by metadata filter
await index.deleteMany({
  filter: { source: { $eq: "outdated-source" } }
});

// Delete all vectors (use with caution!)
await index.deleteAll();
```

---

## Prompt Configuration

### Understanding the Prompt System

The AI's behavior is controlled by prompts in `lib/prompts/orthodox-prompts.ts`. The system uses a multi-stage conversation strategy:

**Conversation Stages:**
- **Stage A**: Initial Challenge & Engagement (2-3 paragraphs, direct challenge)
- **Stage B**: Understanding Differences (theological comparisons)
- **Stage C**: Exploring Together (deep discussions)
- **Stage D**: Next Steps & Invitation (church finder, conversion push)

### How to Adjust Prompts

#### 1. Modify Base System Prompt

Location: `lib/prompts/orthodox-prompts.ts` → `BASE_SYSTEM_PROMPT`

```typescript
const BASE_SYSTEM_PROMPT = `You are an aggressive Orthodox Christian apologist...`;
```

**What to modify:**
- Tone (aggressive, gentle, neutral)
- Objectives (conversion focus, educational, pastoral)
- Tactics (Socratic method, direct teaching, etc.)
- Use of sources (how to cite Church Fathers)

**Example modification** (making it less aggressive):

```typescript
const BASE_SYSTEM_PROMPT = `You are a knowledgeable Orthodox Christian educator and pastoral guide. Your mission is to help people understand Orthodox Christianity through patient teaching and genuine dialogue.

YOUR PRIMARY OBJECTIVES:
1. Answer questions accurately and comprehensively
2. Share Orthodox teachings with clarity and compassion
3. Provide historical and theological context
4. Respect the person's current beliefs while offering Orthodox perspective
5. Encourage exploration and spiritual growth
6. Invite (don't pressure) toward experiencing Orthodox worship

// ... rest of prompt
`;
```

#### 2. Modify Stage-Specific Prompts

Location: `lib/prompts/orthodox-prompts.ts` → `STAGE_PROMPTS`

```typescript
const STAGE_PROMPTS: Record<ConversationStage, string> = {
  A: `Stage A: Initial Challenge & Engagement...`,
  B: `Stage B: Understanding Differences...`,
  C: `Stage C: Exploring Together...`,
  D: `Stage D: Next Steps & Invitation...`,
};
```

**Example modification** (changing Stage A):

```typescript
A: `Stage A: Warm Welcome & Introduction

RESPONSE LENGTH: 2-3 paragraphs maximum

At this stage, focus on:
- Welcoming the user warmly and establishing rapport
- Understanding their background and what brought them here
- Gently introducing Orthodox Christianity without pressure
- Asking open-ended questions to understand their spiritual journey
- Setting a tone of respect and genuine curiosity

Approach:
- Be warm, welcoming, and non-judgmental
- Ask about their faith background and experiences
- Listen more than you preach
- Offer brief, accessible explanations
- Invite questions without overwhelming them`,
```

#### 3. Modify Belief-Specific Tactics

Location: `lib/prompts/orthodox-prompts.ts` → `BELIEF_CONTEXT`

```typescript
const BELIEF_CONTEXT: Record<string, string> = {
  catholic: `CATHOLIC USER - CONVERSION STRATEGY: ...`,
  protestant: `PROTESTANT USER - CONVERSION STRATEGY: ...`,
  // etc.
};
```

**Example modification** (less confrontational for Catholics):

```typescript
catholic: `CATHOLIC USER - PASTORAL APPROACH:

COMMON GROUND:
1. Shared apostolic heritage and sacramental life
2. Veneration of Mary and the saints
3. Rich liturgical tradition
4. Respect for Church Fathers

AREAS TO EXPLORE GENTLY:
1. Papal authority vs. conciliar authority
2. The Filioque and its historical context
3. Purgatory vs. Orthodox understanding of afterlife
4. Vatican II changes and tradition

RESPECTFUL QUESTIONS TO ASK:
- "How do you understand the role of Ecumenical Councils?"
- "What do you make of the Church Fathers' view on Church governance?"
- "Have you explored the theological reasons for the East-West schism?"

APPROACH:
- Emphasize shared heritage
- Present Orthodox view as preserving first-millennium practice
- Avoid attacking or insulting Roman Catholic faith
- Focus on historical development and patristic consensus`,
```

#### 4. Modify RAG Context Formatting

Location: `lib/pinecone/rag-service.ts` → `formatContextForPrompt()`

This controls how retrieved documents are presented to the AI:

```typescript
export function formatContextForPrompt(documents: RetrievedDocument[]): string {
  // Modify this function to change how sources are formatted
  const contextParts = documents.map((doc, index) => {
    return `[Source ${index + 1}]
${doc.content}`;
  });

  return `Retrieved Sources:\n\n${contextParts.join("\n\n---\n\n")}`;
}
```

#### 5. Modify Welcome Messages

Location: `lib/prompts/orthodox-prompts.ts` → `getWelcomeMessage()`

```typescript
export function getWelcomeMessage(userName?: string, userBelief?: string): string {
  const greeting = userName ? `Hello ${userName}` : "Hello";
  
  // Modify the beliefSpecific object to change initial greetings
  const beliefSpecific: Record<string, string> = {
    catholic: `Welcome! I'm here to explore Orthodoxy with you...`,
    // etc.
  };
}
```

### Testing Prompt Changes

After modifying prompts:

1. **Restart the development server:**
   ```bash
   npm run dev
   ```

2. **Test in the chat interface:**
   - Visit http://localhost:3000/chat
   - Start a new conversation
   - Test different user beliefs (Catholic, Protestant, etc.)
   - Verify the tone and content match your changes

3. **Check console logs:**
   - Monitor `console.log` output for prompt debugging
   - Verify RAG context is being retrieved correctly

### Advanced: Dynamic Prompts

For dynamic prompt generation based on user behavior, modify:

Location: `lib/prompts/orthodox-prompts.ts` → `generateSystemPrompt()`

```typescript
export function generateSystemPrompt(
  stage: ConversationStage,
  userBelief?: string,
  retrievedContext?: string,
  questionContext?: string
): string {
  // Add custom logic here
  const stagePrompt = STAGE_PROMPTS[stage];
  const beliefContext = userBelief && BELIEF_CONTEXT[userBelief] 
    ? `\n\nUser Background:\n${BELIEF_CONTEXT[userBelief]}`
    : '';
  
  // Example: Add conditional tone based on user engagement
  const toneAdjustment = stage === 'A' 
    ? '\nUse a warm, welcoming tone.'
    : '\nUse a more in-depth, educational tone.';
  
  return `${BASE_SYSTEM_PROMPT}\n\n${stagePrompt}${beliefContext}${toneAdjustment}`;
}
```

### Prompt Configuration Checklist

- [ ] Review `BASE_SYSTEM_PROMPT` for overall tone and objectives
- [ ] Adjust `STAGE_PROMPTS` for each conversation stage
- [ ] Modify `BELIEF_CONTEXT` for each user background
- [ ] Update `getWelcomeMessage()` for initial greetings
- [ ] Test changes with different user beliefs
- [ ] Monitor AI responses for tone and accuracy
- [ ] Adjust RAG context formatting if needed
- [ ] Document your changes for future reference

---

## Deployment Guide

### Prerequisites
- Node.js 18+ installed
- MongoDB database (local or Atlas)
- Pinecone account and index created
- OpenAI API key
- Vercel account (recommended) or other hosting platform

### Option 1: Deploy to Vercel (Recommended)

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Deploy:**
   ```bash
   vercel
   ```

4. **Add Environment Variables in Vercel Dashboard:**
   - Go to your project settings
   - Navigate to Environment Variables
   - Add all required variables from `.env.local`

5. **Redeploy:**
   ```bash
   vercel --prod
   ```

### Option 2: Deploy to Custom Server

1. **Build the application:**
   ```bash
   npm run build
   ```

2. **Set environment variables on server**

3. **Start the application:**
   ```bash
   npm start
   ```

4. **Use PM2 for process management:**
   ```bash
   npm install -g pm2
   pm2 start npm --name "ai-church" -- start
   pm2 save
   pm2 startup
   ```

### Post-Deployment Checklist

- [ ] Verify all environment variables are set
- [ ] Test authentication (signup, login, logout)
- [ ] Test chat functionality
- [ ] Test church finder
- [ ] Verify MongoDB connection
- [ ] Verify Pinecone RAG is working
- [ ] Check OpenAI API calls are successful
- [ ] Test on mobile devices
- [ ] Set up monitoring and error tracking
- [ ] Configure backup schedule for MongoDB

### Production Environment Variables

```env
# MongoDB Atlas (Production)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ai-church-prod

# NextAuth (Production)
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=<generate-new-secret-for-prod>

# OpenAI (Production)
OPENAI_API_KEY=<production-key>
OPENAI_MODEL=gpt-4o-mini
OPENAI_TEMPERATURE=0.7
OPENAI_MAX_TOKENS=2000

# Pinecone (Production)
PINECONE_API_KEY=<production-key>
PINECONE_INDEX_NAME=church-prod
PINECONE_ENVIRONMENT=us-east-1

# Google Maps (Production)
GOOGLE_MAPS_API_KEY=<production-key-with-domain-restriction>

# Node Environment
NODE_ENV=production
```

### Security Recommendations

1. **Generate strong NEXTAUTH_SECRET:**
   ```bash
   openssl rand -base64 32
   ```

2. **Restrict API keys:**
   - OpenAI: Set usage limits
   - Google Maps: Restrict to your domain
   - Pinecone: Use separate production index

3. **Enable HTTPS** (automatic with Vercel)

4. **Set up rate limiting** (already configured for anonymous users)

5. **Monitor API usage** regularly

---

## Maintenance & Updates

### Regular Maintenance Tasks

#### Daily
- Monitor API usage (OpenAI, Pinecone)
- Check error logs for issues
- Monitor user feedback

#### Weekly
- Review new conversations for quality
- Check MongoDB disk space
- Update Pinecone data if needed
- Review prompt effectiveness

#### Monthly
- Backup MongoDB database
- Review and update theological content
- Analyze user engagement metrics
- Update dependencies:
  ```bash
  npm outdated
  npm update
  ```

### Updating Dependencies

```bash
# Check for outdated packages
npm outdated

# Update all dependencies (carefully)
npm update

# Update specific package
npm update package-name

# Rebuild after updates
npm run build
```

### Monitoring

**MongoDB Monitoring:**
```bash
# Check database size
mongosh "mongodb://..." --eval "db.stats()"

# Monitor slow queries
db.setProfilingLevel(1, { slowms: 100 })
db.system.profile.find().sort({ts: -1}).limit(5)
```

**Pinecone Monitoring:**
```javascript
// Check index stats
const stats = await index.describeIndexStats();
console.log('Total vectors:', stats.totalRecordCount);
```

**OpenAI Monitoring:**
- Dashboard: https://platform.openai.com/usage
- Set up billing alerts
- Monitor rate limits

### Backup Strategy

**MongoDB Backup:**
```bash
# Full backup
mongodump --uri="<MONGODB_URI>" --out=./backups/$(date +%Y%m%d)

# Automated daily backup (cron)
0 2 * * * /usr/bin/mongodump --uri="<MONGODB_URI>" --out=/backups/$(date +\%Y\%m\%d)
```

**Pinecone Backup:**
- Export vectors periodically
- Keep source documents in version control
- Document data processing pipeline

### Troubleshooting Common Issues

#### Issue: MongoDB Connection Failed
```bash
# Check connection string
echo $MONGODB_URI

# Test connection
mongosh "<MONGODB_URI>"

# Check firewall/IP whitelist (Atlas)
```

#### Issue: Pinecone Not Returning Results
```javascript
// Verify index exists
const index = pinecone.index('church');
const stats = await index.describeIndexStats();

// Check query
const context = await retrieveRelevantContext("test query", 5);
console.log(context);
```

#### Issue: OpenAI API Errors
- Check API key is valid
- Verify rate limits not exceeded
- Check billing status
- Monitor usage dashboard

#### Issue: Authentication Not Working
- Verify `NEXTAUTH_SECRET` is set
- Check `NEXTAUTH_URL` matches your domain
- Clear browser cookies and test again
- Check MongoDB `users` collection exists

### Getting Help

**Project Resources:**
- README.md - Quick start guide
- This document - Comprehensive delivery docs
- Code comments - Inline documentation

**External Resources:**
- Next.js: https://nextjs.org/docs
- MongoDB: https://docs.mongodb.com
- Pinecone: https://docs.pinecone.io
- OpenAI: https://platform.openai.com/docs
- NextAuth: https://next-auth.js.org

---

## Quick Reference Commands

```bash
# Development
npm run dev                    # Start dev server
npm run build                  # Build for production
npm run start                  # Start production server
npm run lint                   # Run linter

# Database
mongosh "<MONGODB_URI>"        # Connect to MongoDB
mongodump --uri="<URI>"        # Backup MongoDB
mongorestore --uri="<URI>"     # Restore MongoDB

# Deployment
vercel                         # Deploy to Vercel
vercel --prod                  # Deploy to production

# Process Management
pm2 start npm -- start         # Start with PM2
pm2 logs                       # View logs
pm2 restart ai-church          # Restart app
pm2 stop ai-church             # Stop app
```

---

## Contact & Support

For questions or issues with this project:
1. Check this documentation first
2. Review code comments in relevant files
3. Check Next.js, MongoDB, or Pinecone docs for service-specific issues
4. Contact the development team

---

**Last Updated:** November 25, 2025  
**Version:** 1.0  
**Project:** AI-Church Orthodox Chatbot Platform

