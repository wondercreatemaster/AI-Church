# AI-Church: Accounts & Services Summary

This document provides a comprehensive overview of all accounts, services, and API keys required for the AI-Church project.

## Quick Overview

| Service | Purpose | Required | Account Link |
|---------|---------|----------|--------------|
| **MongoDB** | User data, conversations, messages | ✅ Yes | https://www.mongodb.com |
| **Pinecone** | Vector database for RAG | ✅ Yes | https://www.pinecone.io |
| **OpenAI** | Chat completions & embeddings | ✅ Yes | https://platform.openai.com |
| **Google Maps** | Church finder geolocation | ⚪ Optional | https://console.cloud.google.com |
| **Vercel** | Hosting (recommended) | ⚪ Optional | https://vercel.com |

---

## 1. MongoDB

### Account Information
- **Service**: MongoDB (Database)
- **Website**: https://www.mongodb.com
- **Dashboard**: https://cloud.mongodb.com (for MongoDB Atlas)
- **Pricing**: Free tier available (512MB)

### What It's Used For
- User accounts and authentication
- Conversation history (authenticated and anonymous)
- Message storage
- Session management for NextAuth

### Setup Steps

#### Option A: Local MongoDB
```bash
# macOS
brew install mongodb-community
brew services start mongodb-community

# Ubuntu/Debian
sudo apt install mongodb
sudo systemctl start mongodb

# Connection string
MONGODB_URI=mongodb://localhost:27017/ai-rag
```

#### Option B: MongoDB Atlas (Cloud)
1. Go to https://cloud.mongodb.com
2. Create account or log in
3. Create new cluster (choose Free M0 tier)
4. Click "Connect" → "Connect your application"
5. Copy connection string
6. Replace `<password>` with your database user password

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ai-church
```

### Database Structure
- **Database**: `ai-rag` (or custom name)
- **Collections**:
  - `users` - User accounts
  - `conversations` - Authenticated user conversations
  - `messages` - Authenticated user messages
  - `anonymous_conversations` - Anonymous sessions
  - `anonymous_messages` - Anonymous session messages
  - `accounts` - NextAuth OAuth (future use)
  - `sessions` - NextAuth sessions

### Backup & Maintenance
```bash
# Backup
mongodump --uri="<MONGODB_URI>" --out=./backup

# Restore
mongorestore --uri="<MONGODB_URI>" ./backup/ai-rag

# Cleanup old anonymous data (automated via /api/cleanup/anonymous)
```

### Monitoring
- **Atlas**: View metrics in MongoDB Atlas dashboard
- **Local**: Use MongoDB Compass (GUI)
- **CLI**: `mongosh "<MONGODB_URI>"`

### Cost Estimate
- **Free Tier**: 512MB storage, shared cluster
- **Paid (M10)**: ~$57/month for 10GB
- **Estimate**: Free tier sufficient for development/testing

---

## 2. Pinecone Vector Database

### Account Information
- **Service**: Pinecone (Vector Database)
- **Website**: https://www.pinecone.io
- **Dashboard**: https://app.pinecone.io
- **Pricing**: Free tier available (1 index, 100K vectors)

### What It's Used For
- Storing embeddings of theological content
- Semantic search for RAG (Retrieval-Augmented Generation)
- Finding relevant Church Fathers quotes and teachings
- Contextual information for AI responses

### Setup Steps
1. Go to https://www.pinecone.io
2. Create account (free tier available)
3. Create new index:
   - **Name**: `church` (or custom)
   - **Dimensions**: 3072
   - **Metric**: Cosine
   - **Region**: us-east-1 (or closest to your users)
4. Get API key from dashboard

```env
PINECONE_API_KEY=your-api-key-here
PINECONE_INDEX_NAME=church
PINECONE_ENVIRONMENT=us-east-1
```

### Index Configuration
- **Index Name**: `church`
- **Dimensions**: 3072 (matches OpenAI text-embedding-3-large)
- **Metric**: Cosine similarity
- **Vectors**: Depends on your theological content
- **Metadata**: text, title, author, source, page, etc.

### Data Upload Process
```bash
# 1. Prepare data in JSON format (see data/README.md)
# 2. Run upload script
node scripts/upsert-to-pinecone.js ./data/theological-content.json

# 3. Verify upload
node scripts/verify-pinecone.js

# 4. Test query
node scripts/verify-pinecone.js "What do Church Fathers say about icons?"
```

### Monitoring
- **Dashboard**: View index statistics at https://app.pinecone.io
- **API**: Use `index.describeIndexStats()` for programmatic access
- **Script**: Run `node scripts/verify-pinecone.js` for detailed stats

### Cost Estimate
- **Free Tier**: 1 index, 100K vectors (~50-100 documents worth)
- **Paid (Starter)**: $70/month for 10M vectors
- **Estimate**: Free tier sufficient for moderate content, upgrade for extensive libraries

### Backup Strategy
- Keep source documents (JSON files) in `data/` directory
- Version control JSON files with git
- Re-upload if index is lost: `node scripts/upsert-to-pinecone.js`

---

## 3. OpenAI API

### Account Information
- **Service**: OpenAI (AI/ML)
- **Website**: https://openai.com
- **Dashboard**: https://platform.openai.com
- **API Docs**: https://platform.openai.com/docs
- **Pricing**: Pay-as-you-go

### What It's Used For
- Chat completions (AI conversation)
- Text embeddings (for Pinecone vector search)
- Conversation understanding and evaluation

### Setup Steps
1. Go to https://platform.openai.com
2. Create account or log in
3. Add payment method (required for API access)
4. Generate API key: https://platform.openai.com/api-keys
5. Copy key to environment variables

```env
OPENAI_API_KEY=sk-proj-...
OPENAI_MODEL=gpt-4o-mini
OPENAI_TEMPERATURE=0.7
OPENAI_MAX_TOKENS=2000
```

### Models Used

#### Chat Completion
- **Model**: `gpt-4o-mini` (default, configurable)
- **Alternative**: `gpt-4o`, `gpt-4-turbo`
- **Purpose**: Generate AI responses
- **Cost**: ~$0.15 per 1M input tokens, ~$0.60 per 1M output tokens

#### Embeddings
- **Model**: `text-embedding-3-large`
- **Dimensions**: 3072
- **Purpose**: Convert text to vectors for Pinecone
- **Cost**: ~$0.13 per 1M tokens

### Cost Calculation

**Example usage for 1,000 conversations:**
- Average conversation: 10 messages
- Average message: 100 tokens input, 500 tokens output
- Total: 1,000 conversations × 10 messages = 10,000 messages
- Input: 10,000 × 100 = 1M tokens
- Output: 10,000 × 500 = 5M tokens

**Chat Cost:**
- Input: 1M × $0.15 = $0.15
- Output: 5M × $0.60 = $3.00
- **Total: ~$3.15 for 1,000 conversations**

**Embedding Cost** (for initial data upload):
- 100 documents × 5,000 tokens each = 500K tokens
- Cost: 500K × $0.13 / 1M = **~$0.07 one-time**

### Rate Limits
- **Configured in code**:
  - Anonymous users: Limited via rate limiter
  - Authenticated users: No client-side limit
- **OpenAI limits**: Varies by account tier (check dashboard)

### Monitoring
- **Dashboard**: https://platform.openai.com/usage
- **Set up billing alerts**: Dashboard → Billing → Usage limits
- **Recommended**: Set monthly budget limit (e.g., $50)

### Cost Estimate
- **Development**: $5-20/month
- **Production (low traffic)**: $50-100/month
- **Production (high traffic)**: $200+/month

---

## 4. Google Maps API (Optional)

### Account Information
- **Service**: Google Cloud Platform
- **Website**: https://cloud.google.com
- **Console**: https://console.cloud.google.com
- **Pricing**: $200 free credit per month

### What It's Used For
- Church finder geolocation
- Converting addresses to coordinates
- Map display in church search results

### Setup Steps
1. Go to https://console.cloud.google.com
2. Create new project or select existing
3. Enable APIs:
   - Maps JavaScript API
   - Geocoding API
   - Places API (optional)
4. Create API key: APIs & Services → Credentials
5. Restrict API key:
   - HTTP referrers: `your-domain.com/*`
   - API restrictions: Select enabled APIs only

```env
GOOGLE_MAPS_API_KEY=AIza...
```

### Security
⚠️ **Important**: Restrict your API key!
- Set HTTP referrer restrictions
- Enable only necessary APIs
- Monitor usage regularly

### Cost Estimate
- **Free tier**: $200 credit/month
- **Usage**: ~$0.005 per geocoding request
- **Estimate**: Free tier covers most small-medium applications

### Optional
The app will function without Google Maps API (degraded church finder functionality).

---

## 5. NextAuth Configuration

### What It Is
NextAuth is the authentication library (not a paid service), but requires configuration.

### Required Environment Variables
```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-here
```

### Generate Secret
```bash
# On macOS/Linux
openssl rand -base64 32

# Or use online generator
# https://generate-secret.vercel.app/32
```

### Production
```env
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=<new-secret-for-production>
```

---

## 6. Vercel Hosting (Optional, Recommended)

### Account Information
- **Service**: Vercel (Hosting)
- **Website**: https://vercel.com
- **Dashboard**: https://vercel.com/dashboard
- **Pricing**: Free tier available

### What It's Used For
- Hosting the Next.js application
- Automatic deployments from Git
- Environment variable management
- Edge network CDN

### Setup Steps
1. Go to https://vercel.com
2. Create account (sign up with GitHub)
3. Import project from GitHub
4. Add environment variables in project settings
5. Deploy

### Cost Estimate
- **Hobby (Free)**: Personal projects, reasonable limits
- **Pro**: $20/month per user
- **Team/Enterprise**: Custom pricing

### Alternatives
- **Railway**: https://railway.app
- **Render**: https://render.com
- **Fly.io**: https://fly.io
- **AWS/Azure/GCP**: Custom setup

---

## Environment Variables Summary

### Required for All Deployments

```env
# MongoDB - Database
MONGODB_URI=mongodb://localhost:27017/ai-rag

# NextAuth - Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<generate-with-openssl-rand-base64-32>

# OpenAI - AI & Embeddings
OPENAI_API_KEY=sk-proj-...

# Pinecone - Vector Database
PINECONE_API_KEY=pcsk_...
```

### Optional

```env
# Pinecone (optional overrides)
PINECONE_INDEX_NAME=church
PINECONE_ENVIRONMENT=us-east-1

# OpenAI (optional overrides)
OPENAI_MODEL=gpt-4o-mini
OPENAI_TEMPERATURE=0.7
OPENAI_MAX_TOKENS=2000

# Google Maps (optional)
GOOGLE_MAPS_API_KEY=AIza...

# Node Environment
NODE_ENV=production
```

---

## Security Checklist

- [ ] Generate strong `NEXTAUTH_SECRET` (never reuse across environments)
- [ ] Never commit `.env` files to version control
- [ ] Use separate API keys for development and production
- [ ] Restrict Google Maps API key to your domain
- [ ] Set up billing alerts on OpenAI
- [ ] Set usage limits on Pinecone (if needed)
- [ ] Enable IP whitelisting on MongoDB Atlas
- [ ] Use environment variables in hosting platform (Vercel)
- [ ] Rotate API keys periodically
- [ ] Monitor API usage dashboards regularly

---

## Cost Summary (Monthly Estimates)

### Development/Testing
| Service | Cost |
|---------|------|
| MongoDB | Free (Atlas M0) |
| Pinecone | Free (100K vectors) |
| OpenAI | $5-20 (low usage) |
| Google Maps | Free ($200 credit) |
| Vercel | Free (Hobby tier) |
| **TOTAL** | **$5-20/month** |

### Production (Low-Medium Traffic)
| Service | Cost |
|---------|------|
| MongoDB | Free-$57 (M0-M10) |
| Pinecone | Free-$70 (Starter) |
| OpenAI | $50-200 |
| Google Maps | Free ($200 credit) |
| Vercel | $0-20 (Hobby-Pro) |
| **TOTAL** | **$50-350/month** |

---

## Account Management Best Practices

1. **Documentation**: Keep this file updated with any changes
2. **Access**: Store credentials in password manager (1Password, LastPass)
3. **Backup**: Keep backup of environment variables in secure location
4. **Rotation**: Rotate API keys every 6-12 months
5. **Monitoring**: Set up alerts for unusual usage
6. **Billing**: Add backup payment method to prevent service interruption
7. **Team Access**: Use team/organization features for multi-user access

---

## Troubleshooting

### MongoDB Connection Failed
- Verify URI format is correct
- Check IP whitelist in Atlas
- Test connection with `mongosh`

### Pinecone Not Working
- Verify API key is correct
- Check index name matches dashboard
- Ensure dimensions are 3072
- Run `node scripts/verify-pinecone.js`

### OpenAI API Errors
- Check API key is valid
- Verify payment method is active
- Check rate limits in dashboard
- Review usage for quota issues

### Google Maps Not Loading
- Verify API key is set
- Check API restrictions
- Enable required APIs in console
- Review billing status

---

## Support & Resources

- **MongoDB**: https://docs.mongodb.com | https://www.mongodb.com/community/forums
- **Pinecone**: https://docs.pinecone.io | support@pinecone.io
- **OpenAI**: https://platform.openai.com/docs | help.openai.com
- **Google Maps**: https://developers.google.com/maps
- **Vercel**: https://vercel.com/docs | https://vercel.com/support
- **Next.js**: https://nextjs.org/docs

---

**Last Updated**: November 25, 2025

