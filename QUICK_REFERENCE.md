# AI-Church Quick Reference Guide

Essential commands and workflows for maintaining the AI-Church project.

---

## 🚀 Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

---

## 📦 Environment Setup

### Create `.env.local`

```env
# Required
MONGODB_URI=mongodb://localhost:27017/ai-rag
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<generate-new>
OPENAI_API_KEY=sk-proj-...
PINECONE_API_KEY=pcsk_...

# Optional
PINECONE_INDEX_NAME=church
OPENAI_MODEL=gpt-4o-mini
GOOGLE_MAPS_API_KEY=AIza...
```

### Generate NextAuth Secret

```bash
openssl rand -base64 32
```

---

## 🗄️ MongoDB Commands

```bash
# Connect to database
mongosh "mongodb://localhost:27017/ai-rag"

# View collections
show collections

# Count users
db.users.countDocuments()

# Find user by email
db.users.findOne({ email: "user@example.com" })

# View recent conversations
db.conversations.find().sort({ updatedAt: -1 }).limit(5).pretty()

# Backup database
mongodump --uri="mongodb://localhost:27017/ai-rag" --out=./backup

# Restore database
mongorestore --uri="mongodb://localhost:27017/ai-rag" ./backup/ai-rag

# Cleanup anonymous data (30+ days old)
curl -X POST http://localhost:3000/api/cleanup/anonymous
```

---

## 🔍 Pinecone Data Management

### Upload New Data

```bash
# 1. Create data file in data/ directory
# Format: data/your-content.json

# 2. Run upload script
node scripts/upsert-to-pinecone.js ./data/your-content.json

# 3. Verify upload
node scripts/verify-pinecone.js

# 4. Test with custom query
node scripts/verify-pinecone.js "What do Church Fathers say about icons?"
```

### Check Index Stats

```bash
# View detailed statistics
node scripts/verify-pinecone.js
```

### Data File Format

```json
[
  {
    "text": "Full document text content here...",
    "title": "Document Title",
    "author": "Author Name",
    "source": "Source Name",
    "page": 123
  }
]
```

---

## ✏️ Modifying Prompts

### File Locations

- **Base Prompt**: `lib/prompts/orthodox-prompts.ts` → `BASE_SYSTEM_PROMPT`
- **Stage Prompts**: `lib/prompts/orthodox-prompts.ts` → `STAGE_PROMPTS`
- **Belief Context**: `lib/prompts/orthodox-prompts.ts` → `BELIEF_CONTEXT`
- **Welcome Messages**: `lib/prompts/orthodox-prompts.ts` → `getWelcomeMessage()`

### Quick Edits

```typescript
// Example: Make AI less aggressive (lib/prompts/orthodox-prompts.ts)

const BASE_SYSTEM_PROMPT = `You are a knowledgeable Orthodox Christian educator...`
// Change from: "aggressive Orthodox Christian apologist"
// To: "knowledgeable Orthodox Christian educator"

// Update objectives from aggressive to educational
```

### After Editing Prompts

```bash
# Restart dev server
npm run dev

# Test in browser
# Visit: http://localhost:3000/chat
```

---

## 🚢 Deployment

### Deploy to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel

# Deploy to production
vercel --prod
```

### Environment Variables (Vercel Dashboard)

1. Go to project settings
2. Navigate to "Environment Variables"
3. Add all variables from `.env.local`
4. Redeploy

### Deploy to Custom Server

```bash
# Build application
npm run build

# Start with PM2
npm install -g pm2
pm2 start npm --name "ai-church" -- start
pm2 save
pm2 startup
```

---

## 🔧 Common Tasks

### Add New User (Manual)

```javascript
// In mongosh
use ai-rag;

db.users.insertOne({
  email: "user@example.com",
  name: "User Name",
  password: "$2a$12$hashedpassword", // Use bcryptjs to hash
  religion: "orthodox",
  createdAt: new Date(),
  updatedAt: new Date()
});
```

### Delete User and Data

```javascript
// In mongosh
const userId = ObjectId("user-id-here");

db.users.deleteOne({ _id: userId });
db.conversations.deleteMany({ userId: userId });
db.messages.deleteMany({ userId: userId });
```

### Clear All Anonymous Data

```javascript
// In mongosh
db.anonymous_conversations.deleteMany({});
db.anonymous_messages.deleteMany({});
```

### Update Conversation Stage

```javascript
// In mongosh
db.conversations.updateOne(
  { _id: ObjectId("conversation-id") },
  { $set: { stage: "D" } }
);
```

---

## 📊 Monitoring

### Check API Usage

```bash
# OpenAI Dashboard
# https://platform.openai.com/usage

# Pinecone Dashboard
# https://app.pinecone.io

# MongoDB Atlas Dashboard
# https://cloud.mongodb.com
```

### View Application Logs

```bash
# Development (console output)
npm run dev

# Production (PM2)
pm2 logs ai-church

# Vercel (dashboard)
# https://vercel.com/your-project/logs
```

### Check Database Size

```bash
# In mongosh
db.stats()

# Check specific collection
db.messages.stats()
```

---

## 🐛 Troubleshooting

### Server Won't Start

```bash
# Check Node version (requires 18+)
node --version

# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Check environment variables
cat .env.local
```

### MongoDB Connection Error

```bash
# Test connection
mongosh "mongodb://localhost:27017/ai-rag"

# Start local MongoDB
brew services start mongodb-community  # macOS
sudo systemctl start mongodb            # Linux

# Check Atlas IP whitelist (if using Atlas)
```

### Pinecone Not Working

```bash
# Verify configuration
node scripts/verify-pinecone.js

# Check environment variables
echo $PINECONE_API_KEY
echo $PINECONE_INDEX_NAME

# Verify index exists in dashboard
# https://app.pinecone.io
```

### OpenAI API Errors

```bash
# Check API key
echo $OPENAI_API_KEY

# Verify billing status
# https://platform.openai.com/account/billing

# Check rate limits
# https://platform.openai.com/account/limits
```

### Build Errors

```bash
# Clear Next.js cache
rm -rf .next

# Rebuild
npm run build

# Check TypeScript errors
npx tsc --noEmit
```

---

## 📝 Common File Locations

```
Project Structure:
├── app/                      # Next.js app router
│   ├── api/                  # API routes
│   ├── chat/                 # Chat page
│   └── actions/              # Server actions
├── lib/
│   ├── prompts/              # AI prompts
│   │   └── orthodox-prompts.ts
│   ├── pinecone/             # Vector DB
│   │   ├── config.ts
│   │   └── rag-service.ts
│   ├── openai/               # OpenAI config
│   │   └── config.ts
│   └── db/                   # Database
│       └── mongodb.ts
├── scripts/                  # Utility scripts
│   ├── upsert-to-pinecone.js
│   └── verify-pinecone.js
├── data/                     # Data for Pinecone
└── .env.local                # Environment variables
```

---

## 🔐 Security Checklist

- [ ] Never commit `.env.local` to git
- [ ] Generate unique `NEXTAUTH_SECRET` for production
- [ ] Restrict Google Maps API key to your domain
- [ ] Set billing alerts on OpenAI
- [ ] Enable IP whitelist on MongoDB Atlas
- [ ] Use separate API keys for dev/prod
- [ ] Rotate API keys every 6-12 months
- [ ] Monitor API usage dashboards weekly

---

## 📚 Documentation Files

- `README.md` - Project overview and quick start
- `DELIVERY_DOCUMENTATION.md` - Comprehensive delivery guide
- `ACCOUNTS_AND_SERVICES.md` - All accounts and API keys
- `QUICK_REFERENCE.md` - This file
- `data/README.md` - Data preparation guide

---

## 💡 Tips

1. **Development**: Use `gpt-4o-mini` for cost efficiency
2. **Production**: Consider `gpt-4o` for better responses
3. **Backup**: Run `mongodump` weekly
4. **Monitoring**: Set up Sentry or similar for error tracking
5. **Rate Limiting**: Already configured for anonymous users
6. **Testing**: Test prompts with different user beliefs

---

## 🆘 Getting Help

1. Check this reference guide
2. Review `DELIVERY_DOCUMENTATION.md`
3. Check service documentation:
   - MongoDB: https://docs.mongodb.com
   - Pinecone: https://docs.pinecone.io
   - OpenAI: https://platform.openai.com/docs
   - Next.js: https://nextjs.org/docs
4. Check error logs
5. Contact development team

---

**Last Updated**: November 25, 2025

