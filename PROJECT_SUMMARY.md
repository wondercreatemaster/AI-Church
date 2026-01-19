# AI-Church Project Summary

## 📋 Project Overview

**AI-Church** is an Orthodox Christian educational chatbot platform designed to engage users in theological conversations, provide information about Orthodox Christianity, and guide them toward local Orthodox churches. The platform uses AI-powered conversations with Retrieval-Augmented Generation (RAG) to provide accurate, source-backed theological responses.

### Key Features
- ✨ AI-powered theological conversations with multi-stage engagement
- 📚 RAG (Retrieval-Augmented Generation) using Pinecone vector database
- 🔐 User authentication (NextAuth) with both authenticated and anonymous sessions
- 🗺️ Church finder with geolocation
- 💬 Conversation memory and user profiling
- 📱 Responsive, modern UI built with Tailwind CSS and Radix UI

---

## 🏗️ Architecture

### Tech Stack
```
Frontend:    React 19, Next.js 16 (App Router), TypeScript
Backend:     Next.js API Routes, Server Actions
Database:    MongoDB (user data, conversations)
Vector DB:   Pinecone (theological content embeddings)
AI:          OpenAI GPT-4o-mini (chat), text-embedding-3-large (embeddings)
Auth:        NextAuth v5 with MongoDB adapter
AI Framework: LangChain + LangGraph (agent management)
Styling:     Tailwind CSS 4, Radix UI components
```

### System Flow

```
User Input → Chat Interface
    ↓
Next.js API Route (/api/chat/stream)
    ↓
┌─────────────────────────────────────┐
│ 1. Authenticate User                │
│    - Authenticated or Anonymous     │
│ 2. Rate Limiting (anonymous only)   │
│ 3. Conversation Management          │
│    - Create or fetch conversation   │
│ 4. RAG Context Retrieval            │
│    - Query Pinecone                 │
│    - Get relevant Church Fathers    │
│ 5. Question Selection               │
│    - Select next scripted question  │
│ 6. AI Agent Processing              │
│    - LangChain agent with memory    │
│    - Stage-based system prompts     │
│ 7. Stream Response                  │
│    - Server-Sent Events (SSE)       │
│ 8. Save to Database                 │
│    - MongoDB persistence            │
│ 9. Update Conversation State        │
│    - Memory, stage, user profile    │
└─────────────────────────────────────┘
    ↓
Streamed Response → User Interface
```

### Database Schema

#### MongoDB Collections

**users**
```javascript
{
  _id: ObjectId,
  email: String (unique),
  password: String (bcrypt hashed),
  name: String,
  religion: String, // 'catholic', 'protestant', etc.
  avatar: String (optional),
  createdAt: Date,
  updatedAt: Date
}
```

**conversations**
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: users),
  title: String,
  stage: String, // 'A', 'B', 'C', 'D'
  userBelief: String,
  createdAt: Date,
  updatedAt: Date,
  lastMessageAt: Date,
  
  // Memory/tracking fields
  theologicalPositions: Object,
  resistanceLevel: Number (1-10),
  opennessScore: Number (1-10),
  conversionGoals: Array<String>,
  lastTactic: String,
  contradictionsIdentified: Array<String>,
  objectionsRaised: Array<String>,
  topicsSensitive: Array<String>,
  
  // Question tracking
  questionsAsked: Array<String>,
  currentQuestionId: String,
  lastQuestionAskedAt: Date,
  questionResponses: Object
}
```

**messages**
```javascript
{
  _id: ObjectId,
  conversationId: ObjectId (ref: conversations),
  userId: ObjectId (ref: users),
  role: String, // 'user' | 'assistant'
  content: String,
  timestamp: Date
}
```

**anonymous_conversations** & **anonymous_messages**
- Similar structure to authenticated versions
- Use `sessionId` instead of `userId`
- Cleaned up after 30 days

#### Pinecone Index

**Index: "church"**
```javascript
{
  id: String, // "author-work-chunk-N"
  values: Array<Number>, // 3072-dimensional embedding
  metadata: {
    text: String, // Actual content
    content: String, // Alternate field
    title: String,
    author: String,
    source: String,
    page: Number,
    chunkIndex: Number,
    totalChunks: Number,
    documentId: String
  }
}
```

---

## 📁 Directory Structure

```
ai-church/
├── app/                            # Next.js app router
│   ├── actions/                    # Server actions
│   │   ├── auth.ts                 # Authentication actions
│   │   ├── chat.ts                 # Chat actions
│   │   ├── conversation.ts         # Conversation management
│   │   └── profile.ts              # User profile actions
│   ├── api/                        # API routes
│   │   ├── auth/[...nextauth]/     # NextAuth API route
│   │   ├── chat/stream/            # Chat streaming endpoint
│   │   ├── churches/search/        # Church search API
│   │   └── cleanup/anonymous/      # Anonymous data cleanup
│   ├── chat/                       # Chat page
│   ├── churches/                   # Church finder page
│   ├── login/                      # Login page
│   ├── signup/                     # Signup page
│   ├── profile/                    # Profile page
│   ├── conversations/              # Conversations list page
│   └── layout.tsx                  # Root layout
│
├── components/                     # React components
│   ├── chat/                       # Chat-related components
│   │   ├── chat-header.tsx
│   │   ├── chat-input.tsx
│   │   ├── chat-sidebar.tsx
│   │   ├── message-bubble.tsx
│   │   ├── church-results.tsx
│   │   └── ...
│   ├── churches/                   # Church finder components
│   └── ui/                         # Reusable UI components (shadcn)
│
├── lib/                            # Library code
│   ├── auth/                       # Authentication
│   │   ├── index.ts                # NextAuth configuration
│   │   ├── auth.config.ts
│   │   └── anonymous-session.ts
│   ├── db/                         # Database
│   │   ├── mongodb.ts              # MongoDB connection
│   │   └── models/                 # Database models
│   │       ├── user.ts
│   │       ├── conversation.ts
│   │       ├── message.ts
│   │       └── anonymous-*.ts
│   ├── langchain/                  # LangChain AI agents
│   │   ├── agent-config.ts         # Agent setup
│   │   ├── agent-tools.ts          # Agent tools
│   │   ├── chat-service.ts
│   │   ├── memory-manager.ts
│   │   └── conversation-director.ts
│   ├── openai/                     # OpenAI configuration
│   │   ├── config.ts               # OpenAI client
│   │   └── chat-service.ts
│   ├── pinecone/                   # Pinecone vector DB
│   │   ├── config.ts               # Pinecone client
│   │   └── rag-service.ts          # RAG functions
│   ├── prompts/                    # AI system prompts
│   │   ├── orthodox-prompts.ts     # Main prompt system
│   │   ├── question-scripts.ts     # Scripted questions
│   │   ├── question-selector.ts    # Question selection logic
│   │   └── understanding-evaluator.ts
│   └── utils/                      # Utility functions
│       ├── rate-limiter.ts
│       ├── validation.ts
│       └── export-conversation.ts
│
├── scripts/                        # Utility scripts
│   ├── upsert-to-pinecone.js       # Upload data to Pinecone
│   ├── verify-pinecone.js          # Verify Pinecone index
│   └── example-data.json           # Sample data
│
├── data/                           # Data for Pinecone
│   └── README.md                   # Data preparation guide
│
├── public/                         # Static assets
│   └── audio/                      # Audio files
│
├── types/                          # TypeScript type definitions
│
├── Documentation/                  # Project documentation
│   ├── DELIVERY_DOCUMENTATION.md   # Comprehensive guide
│   ├── ACCOUNTS_AND_SERVICES.md    # Services overview
│   ├── QUICK_REFERENCE.md          # Quick command reference
│   └── PROJECT_SUMMARY.md          # This file
│
├── .env.local                      # Environment variables (not in git)
├── .env.example                    # Environment template
├── .gitignore                      # Git ignore rules
├── next.config.ts                  # Next.js configuration
├── tsconfig.json                   # TypeScript configuration
├── tailwind.config.ts              # Tailwind CSS configuration
├── package.json                    # Node.js dependencies
└── README.md                       # Project README
```

---

## 🔑 Key Components

### 1. Conversation Stages

The AI guides users through 4 stages:

- **Stage A**: Initial Challenge & Engagement (2-3 messages)
  - Introduce key historical differences
  - Challenge user's assumptions
  - Create cognitive dissonance
  
- **Stage B**: Understanding Differences (5-10 messages)
  - Explain theological differences
  - Address objections
  - Use Church Fathers and historical evidence
  
- **Stage C**: Exploring Together (ongoing)
  - Deep theological discussions
  - Advanced concepts (theosis, hesychasm, etc.)
  - Spiritual practices
  
- **Stage D**: Next Steps & Invitation
  - Church finder functionality
  - Practical conversion guidance
  - Resource recommendations

### 2. RAG (Retrieval-Augmented Generation)

**Purpose**: Provide accurate, source-backed theological responses

**Flow**:
1. User asks question
2. Generate embedding of question (OpenAI)
3. Query Pinecone for similar vectors
4. Retrieve top 5 matching Church Fathers texts
5. Format context with metadata
6. Inject context into AI system prompt
7. AI generates response citing sources

**Configuration**:
- Embedding model: `text-embedding-3-large` (3072 dimensions)
- Similarity metric: Cosine
- Top K results: 5 (configurable)
- Chunk size: ~800 words with 100-word overlap

### 3. User Memory & Profiling

The system tracks:
- **Theological positions**: User's stated beliefs
- **Resistance level**: 1-10 scale (how defensive)
- **Openness score**: 1-10 scale (how receptive)
- **Conversion goals**: Specific objectives (e.g., "attend liturgy")
- **Contradictions identified**: Logical inconsistencies in user's beliefs
- **Objections raised**: User's concerns/questions
- **Sensitive topics**: Topics that cause strong reactions

### 4. Authentication System

**Modes**:
- **Authenticated**: Full features, persistent data
- **Anonymous**: Rate-limited, 30-day data retention

**Features**:
- Email/password authentication
- Session management with JWT
- Rate limiting for anonymous users (5 messages/minute)
- Automatic session cleanup

---

## 🔧 Configuration

### Environment Variables

See `.env.example` for complete template.

**Critical Variables**:
- `MONGODB_URI`: Database connection
- `NEXTAUTH_SECRET`: JWT signing (generate with `openssl rand -base64 32`)
- `OPENAI_API_KEY`: AI chat and embeddings
- `PINECONE_API_KEY`: Vector database

### Prompt Configuration

**Location**: `lib/prompts/orthodox-prompts.ts`

**Customizable Elements**:
- Base system prompt (tone, objectives, tactics)
- Stage-specific prompts (A, B, C, D)
- Belief-specific context (Catholic, Protestant, etc.)
- Welcome messages
- RAG context formatting

**Example Modification**:
```typescript
// Change AI tone from aggressive to pastoral
const BASE_SYSTEM_PROMPT = `You are a pastoral Orthodox Christian guide...`;
```

### Model Configuration

**Location**: `lib/openai/config.ts`

```typescript
export const OPENAI_CONFIG = {
  model: "gpt-4o-mini", // or "gpt-4o", "gpt-4-turbo"
  temperature: 0.7,     // 0-1 (lower = more focused)
  maxTokens: 2000,      // Response length limit
};
```

---

## 📊 Data Flow Examples

### Example 1: User Sends Message

```
1. User types: "Why do Orthodox venerate icons?"
   ↓
2. POST /api/chat/stream
   - Body: { content, conversationId, userBelief }
   ↓
3. Authenticate user (or create anonymous session)
   ↓
4. Check rate limit (if anonymous)
   ↓
5. Save user message to MongoDB
   ↓
6. Query Pinecone: "Church Fathers on icons"
   - Generate embedding
   - Query vector DB
   - Retrieve 5 relevant texts
   ↓
7. Format RAG context with Church Fathers quotes
   ↓
8. Build system prompt:
   - Base prompt + Stage prompt + Belief context + RAG context
   ↓
9. Call LangChain agent with OpenAI
   - Stream response token by token
   ↓
10. Check for [SEARCH_CHURCHES:location] marker
    - If found, call church search API
    ↓
11. Save assistant message to MongoDB
    ↓
12. Update conversation metadata
    - Resistance level, openness score, etc.
    ↓
13. Return streamed response to client
```

### Example 2: Uploading New Theological Content

```
1. Prepare data in JSON format
   [{text: "...", title: "...", author: "..."}]
   ↓
2. Run: node scripts/upsert-to-pinecone.js ./data/content.json
   ↓
3. Script chunks text into ~800-word segments
   ↓
4. For each chunk:
   - Generate embedding via OpenAI
   - Create vector with metadata
   - Batch vectors (100 at a time)
   ↓
5. Upsert batches to Pinecone
   ↓
6. Verify upload:
   node scripts/verify-pinecone.js
   ↓
7. Test retrieval with sample query
```

---

## 🚀 Deployment Checklist

### Pre-Deployment

- [ ] Update environment variables for production
- [ ] Generate new `NEXTAUTH_SECRET` for production
- [ ] Use separate API keys (OpenAI, Pinecone)
- [ ] Set up MongoDB Atlas (not local MongoDB)
- [ ] Upload all theological content to Pinecone
- [ ] Test RAG retrieval functionality
- [ ] Configure Google Maps API key (optional)
- [ ] Set billing alerts on OpenAI

### Production Environment

```env
MONGODB_URI=mongodb+srv://...atlas.mongodb.net/ai-church-prod
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=<new-production-secret>
OPENAI_API_KEY=<production-key>
PINECONE_API_KEY=<production-key>
NODE_ENV=production
```

### Deployment Steps (Vercel)

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Login
vercel login

# 3. Deploy
vercel

# 4. Add environment variables in dashboard

# 5. Deploy to production
vercel --prod
```

### Post-Deployment

- [ ] Test authentication (signup, login, logout)
- [ ] Test chat functionality
- [ ] Test RAG retrieval (check responses cite sources)
- [ ] Test church finder
- [ ] Verify MongoDB connection
- [ ] Monitor error logs
- [ ] Set up uptime monitoring
- [ ] Configure custom domain (if needed)

---

## 📈 Monitoring & Maintenance

### Daily
- Monitor error logs (Vercel dashboard or PM2)
- Check API usage (OpenAI, Pinecone)
- Review user feedback/complaints

### Weekly
- Review conversation quality
- Check MongoDB disk usage
- Analyze user engagement metrics
- Update Pinecone data if needed

### Monthly
- Backup MongoDB database
- Review and update prompts
- Update dependencies
- Analyze cost trends
- Rotate API keys (optional)

### Backup Commands

```bash
# MongoDB backup
mongodump --uri="$MONGODB_URI" --out=./backup/$(date +%Y%m%d)

# Schedule with cron (daily at 2am)
0 2 * * * /usr/bin/mongodump --uri="$MONGODB_URI" --out=/backups/$(date +\%Y\%m\%d)
```

---

## 💰 Cost Estimates

### Development/Testing
- MongoDB: Free (Atlas M0)
- Pinecone: Free (100K vectors)
- OpenAI: $5-20/month
- Total: **$5-20/month**

### Production (Low-Medium Traffic)
- MongoDB: $0-57/month (M0-M10)
- Pinecone: $0-70/month
- OpenAI: $50-200/month
- Vercel: $0-20/month
- Total: **$50-350/month**

### Production (High Traffic)
- MongoDB: $57-270/month (M10-M30)
- Pinecone: $70-200/month
- OpenAI: $200-1000+/month
- Vercel: $20/month
- Total: **$350-1500+/month**

---

## 🐛 Common Issues & Solutions

### Issue: MongoDB Connection Failed
**Solution**:
```bash
# Check connection string
echo $MONGODB_URI

# Test connection
mongosh "$MONGODB_URI"

# For Atlas: Check IP whitelist
```

### Issue: Pinecone Not Returning Results
**Solution**:
```bash
# Verify index
node scripts/verify-pinecone.js

# Check index name and dimensions
# Ensure data has been uploaded
```

### Issue: OpenAI API Rate Limited
**Solution**:
- Check usage dashboard: https://platform.openai.com/usage
- Verify billing status
- Increase rate limits or upgrade tier

### Issue: Build Errors
**Solution**:
```bash
# Clear cache
rm -rf .next node_modules package-lock.json

# Reinstall
npm install

# Rebuild
npm run build
```

---

## 📚 Documentation Index

1. **README.md** - Quick start guide
2. **DELIVERY_DOCUMENTATION.md** - Comprehensive delivery guide
3. **ACCOUNTS_AND_SERVICES.md** - All accounts and services
4. **QUICK_REFERENCE.md** - Command reference
5. **PROJECT_SUMMARY.md** - This file (architecture overview)
6. **data/README.md** - Data preparation guide

---

## 🤝 Development Workflow

### Adding New Features

1. Create feature branch
2. Implement changes
3. Test locally (`npm run dev`)
4. Update documentation
5. Commit and push
6. Deploy to staging (optional)
7. Deploy to production

### Modifying Prompts

1. Edit `lib/prompts/orthodox-prompts.ts`
2. Test with different user beliefs
3. Monitor conversation quality
4. Iterate based on feedback
5. Document changes

### Updating Theological Content

1. Prepare data in `data/*.json`
2. Run `node scripts/upsert-to-pinecone.js`
3. Verify upload
4. Test RAG retrieval
5. Deploy

---

## 📞 Support & Resources

### Internal Documentation
- All `.md` files in project root
- Code comments in `lib/` directory
- Scripts with usage examples

### External Resources
- **Next.js**: https://nextjs.org/docs
- **MongoDB**: https://docs.mongodb.com
- **Pinecone**: https://docs.pinecone.io
- **OpenAI**: https://platform.openai.com/docs
- **LangChain**: https://js.langchain.com/docs
- **NextAuth**: https://next-auth.js.org

---

**Project**: AI-Church Orthodox Chatbot  
**Version**: 1.0  
**Last Updated**: November 25, 2025  
**Status**: Production Ready

