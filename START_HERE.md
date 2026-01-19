# 🎯 START HERE - AI-Church Project

Welcome! This is your starting point for understanding and working with the AI-Church project.

---

## 📖 What is AI-Church?

AI-Church is an **Orthodox Christian educational chatbot platform** that:
- Engages users in theological conversations
- Uses AI (OpenAI GPT-4o-mini) with RAG (Retrieval-Augmented Generation)
- Cites Church Fathers and Orthodox teachings from a vector database (Pinecone)
- Helps users find local Orthodox churches
- Tracks conversation progress through 4 stages (A → D)

**Built with**: Next.js 16, React 19, TypeScript, MongoDB, Pinecone, OpenAI, LangChain

---

## 🚀 Quick Start (5 Minutes)

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Environment
```bash
# Copy template
cp .env.example .env.local

# Edit .env.local and fill in:
# - MONGODB_URI (MongoDB connection string)
# - NEXTAUTH_SECRET (generate with: openssl rand -base64 32)
# - OPENAI_API_KEY (from https://platform.openai.com)
# - PINECONE_API_KEY (from https://app.pinecone.io)
```

### 3. Start Development Server
```bash
npm run dev
```

### 4. Open Browser
Visit: http://localhost:3000

---

## 📚 Documentation Guide

### 🔥 For Project Delivery & Understanding

**Start with these 3 documents** (in order):

1. **[DELIVERY_DOCUMENTATION.md](DELIVERY_DOCUMENTATION.md)** ⭐ **MOST IMPORTANT**
   - Complete guide to everything
   - All services and accounts explained
   - **How to chunk and upsert data to Pinecone** ← Your specific question!
   - **How to adjust prompts** ← Your specific question!
   - Deployment instructions
   - Read this first!

2. **[ACCOUNTS_AND_SERVICES.md](ACCOUNTS_AND_SERVICES.md)**
   - Every service used (MongoDB, Pinecone, OpenAI, etc.)
   - How to set up each account
   - Cost estimates
   - Security recommendations

3. **[PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)**
   - Technical architecture
   - How everything works together
   - Database schemas
   - System flow

### 📋 For Quick Reference

4. **[QUICK_REFERENCE.md](QUICK_REFERENCE.md)**
   - Common commands
   - MongoDB queries
   - Pinecone management
   - Troubleshooting

5. **[HANDOFF_CHECKLIST.md](HANDOFF_CHECKLIST.md)**
   - Complete handoff checklist
   - What to verify
   - Sign-off forms

### 📖 For Navigation

6. **[DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md)**
   - Complete documentation index
   - Find anything quickly
   - Organized by task and role

---

## 🎯 Your Specific Questions Answered

### Q: "How to chunk and upsert new data into Pinecone?"

**Short Answer**:
```bash
# 1. Create JSON file with your content
# Format: [{ "text": "...", "title": "...", "author": "..." }]
# See: data/README.md

# 2. Run upload script
node scripts/upsert-to-pinecone.js ./data/your-file.json

# 3. Verify upload
node scripts/verify-pinecone.js
```

**Detailed Guide**: See [DELIVERY_DOCUMENTATION.md](DELIVERY_DOCUMENTATION.md) → Section: "Pinecone Vector Database"

**Files**:
- Script: `scripts/upsert-to-pinecone.js`
- Example data: `scripts/example-data.json`
- Guide: `data/README.md`

**How chunking works**:
- Automatically splits text into ~800-word chunks with 100-word overlap
- Generates embeddings for each chunk
- Uploads to Pinecone in batches of 100
- Preserves metadata (author, source, title, etc.)

### Q: "How to adjust prompts?"

**Short Answer**:
Edit: `lib/prompts/orthodox-prompts.ts`

**What to modify**:
- `BASE_SYSTEM_PROMPT` - Overall AI tone and objectives
- `STAGE_PROMPTS` - Stage-specific behavior (A, B, C, D)
- `BELIEF_CONTEXT` - Tactics for each user belief (Catholic, Protestant, etc.)
- `getWelcomeMessage()` - Initial greeting messages

**Example**:
```typescript
// Make AI less aggressive, more educational:
const BASE_SYSTEM_PROMPT = `You are a knowledgeable Orthodox Christian educator...`;
// Instead of: "You are an aggressive Orthodox Christian apologist..."
```

**Detailed Guide**: See [DELIVERY_DOCUMENTATION.md](DELIVERY_DOCUMENTATION.md) → Section: "Prompt Configuration"

---

## 🗂️ Current Accounts & Services

You need accounts for:

1. **MongoDB** - Database
   - Free tier available
   - Setup: https://cloud.mongodb.com

2. **Pinecone** - Vector database
   - Free tier: 100K vectors
   - Setup: https://app.pinecone.io

3. **OpenAI** - AI & embeddings
   - Pay-as-you-go
   - Setup: https://platform.openai.com

4. **Google Maps** (optional) - Church finder
   - $200 free credit/month
   - Setup: https://console.cloud.google.com

**Full details**: See [ACCOUNTS_AND_SERVICES.md](ACCOUNTS_AND_SERVICES.md)

---

## 📁 Project Structure

```
ai-church/
├── app/                    # Next.js app (pages, API routes)
├── components/             # React components
├── lib/
│   ├── prompts/            # ⭐ AI prompts (adjust here)
│   ├── pinecone/           # Pinecone/RAG functionality
│   ├── openai/             # OpenAI configuration
│   ├── db/                 # MongoDB models
│   └── langchain/          # AI agent setup
├── scripts/                # ⭐ Utility scripts
│   ├── upsert-to-pinecone.js   # Upload data
│   ├── verify-pinecone.js      # Verify data
│   └── example-data.json       # Sample data
├── data/                   # ⭐ Your theological content
│   └── README.md           # Data format guide
├── .env.local              # Environment variables (create this)
└── Documentation/          # All .md files
```

---

## 🔑 Key Files to Know

### Configuration
- `.env.local` - Environment variables (create from `.env.example`)
- `lib/openai/config.ts` - OpenAI settings
- `lib/pinecone/config.ts` - Pinecone settings

### Prompts
- `lib/prompts/orthodox-prompts.ts` - **Main prompts file** (edit here!)

### Data Management
- `scripts/upsert-to-pinecone.js` - Upload to Pinecone
- `scripts/verify-pinecone.js` - Verify Pinecone
- `data/` - Put your JSON data files here

### RAG (Retrieval)
- `lib/pinecone/rag-service.ts` - RAG functionality

---

## ⚡ Common Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm start                # Start production server

# Data Management
node scripts/upsert-to-pinecone.js ./data/file.json  # Upload
node scripts/verify-pinecone.js                      # Verify

# MongoDB
mongosh "mongodb://localhost:27017/ai-rag"           # Connect
mongodump --uri="<MONGODB_URI>" --out=./backup       # Backup

# Deployment
vercel                   # Deploy to Vercel
vercel --prod            # Deploy to production
```

---

## 🎓 Learning Path

### Day 1: Setup & Basics
1. ✅ Read this file (START_HERE.md)
2. ✅ Set up environment (`.env.local`)
3. ✅ Run `npm run dev`
4. ✅ Browse [README.md](README.md)
5. ✅ Skim [DELIVERY_DOCUMENTATION.md](DELIVERY_DOCUMENTATION.md)

### Day 2: Deep Dive
1. Read [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md) - Understand architecture
2. Read [ACCOUNTS_AND_SERVICES.md](ACCOUNTS_AND_SERVICES.md) - Understand services
3. Explore code in `lib/` directory
4. Test uploading data to Pinecone

### Day 3: Customization
1. Read prompt configuration section in [DELIVERY_DOCUMENTATION.md](DELIVERY_DOCUMENTATION.md)
2. Experiment with modifying `lib/prompts/orthodox-prompts.ts`
3. Test different prompt variations
4. Upload custom theological content

### Day 4: Deployment
1. Read deployment section in [DELIVERY_DOCUMENTATION.md](DELIVERY_DOCUMENTATION.md)
2. Set up production environment variables
3. Deploy to Vercel or custom server
4. Complete [HANDOFF_CHECKLIST.md](HANDOFF_CHECKLIST.md)

---

## 🆘 Need Help?

### Find Information By Task

| Task | Document |
|------|----------|
| Understand project | [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md) |
| Set up accounts | [ACCOUNTS_AND_SERVICES.md](ACCOUNTS_AND_SERVICES.md) |
| Add data to Pinecone | [DELIVERY_DOCUMENTATION.md](DELIVERY_DOCUMENTATION.md) |
| Modify prompts | [DELIVERY_DOCUMENTATION.md](DELIVERY_DOCUMENTATION.md) |
| Deploy | [DELIVERY_DOCUMENTATION.md](DELIVERY_DOCUMENTATION.md) |
| Quick commands | [QUICK_REFERENCE.md](QUICK_REFERENCE.md) |
| Troubleshoot | [QUICK_REFERENCE.md](QUICK_REFERENCE.md) |

### Search Documentation

```bash
# Search all markdown files (macOS/Linux)
grep -r "search term" *.md

# Windows PowerShell
Select-String -Path *.md -Pattern "search term"
```

### Contact

- Check documentation first
- Review code comments
- Contact development team

---

## ✅ Pre-Deployment Checklist

Before going live:

- [ ] All environment variables set (see `.env.example`)
- [ ] MongoDB database accessible
- [ ] Pinecone index created and populated
- [ ] OpenAI API key valid and funded
- [ ] Tested authentication (signup, login, logout)
- [ ] Tested chat functionality
- [ ] Verified RAG is working (AI cites sources)
- [ ] Tested church finder (if using Google Maps)
- [ ] Read [DELIVERY_DOCUMENTATION.md](DELIVERY_DOCUMENTATION.md)
- [ ] Completed [HANDOFF_CHECKLIST.md](HANDOFF_CHECKLIST.md)

---

## 📊 Documentation at a Glance

| Document | Purpose | When to Read |
|----------|---------|--------------|
| **START_HERE.md** | Quick orientation | **Read first** |
| **DELIVERY_DOCUMENTATION.md** | Comprehensive guide | **Read second** |
| **ACCOUNTS_AND_SERVICES.md** | Services setup | Setting up accounts |
| **PROJECT_SUMMARY.md** | Architecture | Understanding system |
| **QUICK_REFERENCE.md** | Commands | Daily reference |
| **HANDOFF_CHECKLIST.md** | Handoff process | During handoff |
| **DOCUMENTATION_INDEX.md** | Find anything | As needed |
| **README.md** | Project overview | Quick intro |

---

## 🎉 You're Ready!

You now have:
- ✅ Overview of the project
- ✅ Answers to your specific questions
- ✅ Links to detailed documentation
- ✅ Common commands
- ✅ Learning path

**Next steps**:
1. Set up your `.env.local` file
2. Run `npm run dev`
3. Read [DELIVERY_DOCUMENTATION.md](DELIVERY_DOCUMENTATION.md)
4. Experiment with the chat interface

---

**Questions? Start with [DELIVERY_DOCUMENTATION.md](DELIVERY_DOCUMENTATION.md) - it has everything!**

**Last Updated**: November 25, 2025

