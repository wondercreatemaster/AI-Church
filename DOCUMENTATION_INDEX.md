# AI-Church Documentation Index

Welcome to the AI-Church project documentation. This index will help you find the information you need quickly.

---

## 📚 Getting Started

Start here if you're new to the project:

1. **[README.md](README.md)** - Project overview and quick start guide
   - Features overview
   - Installation instructions
   - Basic setup
   - Running the development server

2. **[.env.example](.env.example)** - Environment variables template
   - Copy to `.env.local` and configure
   - All required and optional variables explained
   - Setup instructions

---

## 🚀 For Project Delivery & Handoff

Essential documentation for project delivery and team handoff:

### 1. **[DELIVERY_DOCUMENTATION.md](DELIVERY_DOCUMENTATION.md)** ⭐ START HERE
The most comprehensive guide covering:
- Complete project overview
- All services and accounts (MongoDB, Pinecone, OpenAI, etc.)
- Environment configuration
- **How to add data to Pinecone** (chunking and upserting)
- **How to adjust prompts**
- Deployment guide
- Maintenance procedures

### 2. **[ACCOUNTS_AND_SERVICES.md](ACCOUNTS_AND_SERVICES.md)**
Detailed breakdown of every service:
- MongoDB setup and management
- Pinecone vector database
- OpenAI API configuration
- Google Maps API (optional)
- Cost estimates
- Security checklist
- Troubleshooting

### 3. **[PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)**
Technical architecture and system design:
- Tech stack details
- System flow diagrams
- Database schemas
- Directory structure
- Key components explained
- Data flow examples

### 4. **[QUICK_REFERENCE.md](QUICK_REFERENCE.md)**
Quick command reference:
- Common commands
- MongoDB queries
- Pinecone data management
- Prompt modification
- Deployment commands
- Troubleshooting steps

### 5. **[HANDOFF_CHECKLIST.md](HANDOFF_CHECKLIST.md)**
Complete handoff checklist:
- Documentation review checklist
- Account access verification
- Technical verification
- Deployment status
- Knowledge transfer
- Emergency procedures
- Sign-off forms

---

## 📊 Data Management

### **[data/README.md](data/README.md)**
Guide for preparing and uploading theological content:
- Data file format
- Required and optional fields
- Best practices
- Content guidelines
- Example content

### **[scripts/example-data.json](scripts/example-data.json)**
Sample theological content with proper formatting:
- Church Fathers writings
- Proper metadata structure
- Ready-to-upload examples

---

## 🔧 Scripts & Utilities

### Available Scripts

1. **[scripts/upsert-to-pinecone.js](scripts/upsert-to-pinecone.js)**
   - Upload theological content to Pinecone
   - Automatic text chunking
   - Batch processing
   - Usage: `node scripts/upsert-to-pinecone.js ./data/your-file.json`

2. **[scripts/verify-pinecone.js](scripts/verify-pinecone.js)**
   - Check Pinecone index status
   - View statistics
   - Test RAG queries
   - Usage: `node scripts/verify-pinecone.js "optional custom query"`

---

## 🎯 Quick Navigation by Task

### I need to...

#### Set up the project for the first time
1. Read [README.md](README.md) - Quick Start section
2. Copy `.env.example` to `.env.local`
3. Fill in environment variables (see [ACCOUNTS_AND_SERVICES.md](ACCOUNTS_AND_SERVICES.md))
4. Run `npm install` and `npm run dev`

#### Understand what accounts/services are used
→ **[ACCOUNTS_AND_SERVICES.md](ACCOUNTS_AND_SERVICES.md)**
- Complete list of all services
- Setup instructions for each
- Cost estimates
- Security recommendations

#### Add new theological content to Pinecone
→ **[DELIVERY_DOCUMENTATION.md](DELIVERY_DOCUMENTATION.md)** - Section: "Pinecone Vector Database"
→ **[data/README.md](data/README.md)**

Steps:
1. Prepare JSON file in `data/` directory
2. Run: `node scripts/upsert-to-pinecone.js ./data/your-file.json`
3. Verify: `node scripts/verify-pinecone.js`

#### Modify AI prompts and behavior
→ **[DELIVERY_DOCUMENTATION.md](DELIVERY_DOCUMENTATION.md)** - Section: "Prompt Configuration"

Files to edit:
- `lib/prompts/orthodox-prompts.ts` - Main prompt system
  - `BASE_SYSTEM_PROMPT` - Overall AI behavior
  - `STAGE_PROMPTS` - Stage-specific instructions
  - `BELIEF_CONTEXT` - User belief-specific tactics

#### Deploy to production
→ **[DELIVERY_DOCUMENTATION.md](DELIVERY_DOCUMENTATION.md)** - Section: "Deployment Guide"
→ **[QUICK_REFERENCE.md](QUICK_REFERENCE.md)** - Deployment section

Steps:
1. Update environment variables
2. Deploy to Vercel: `vercel --prod`
3. Complete [HANDOFF_CHECKLIST.md](HANDOFF_CHECKLIST.md)

#### Understand the architecture
→ **[PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)**
- Tech stack
- System flow
- Database schemas
- Component breakdown

#### Find a specific command
→ **[QUICK_REFERENCE.md](QUICK_REFERENCE.md)**
- Development commands
- MongoDB queries
- Pinecone management
- Common tasks

#### Troubleshoot an issue
→ **[QUICK_REFERENCE.md](QUICK_REFERENCE.md)** - Troubleshooting section
→ **[ACCOUNTS_AND_SERVICES.md](ACCOUNTS_AND_SERVICES.md)** - Troubleshooting section

Common issues:
- MongoDB connection errors
- Pinecone not working
- OpenAI API errors
- Build errors

#### Manage MongoDB data
→ **[DELIVERY_DOCUMENTATION.md](DELIVERY_DOCUMENTATION.md)** - Section: "Data Management"
→ **[QUICK_REFERENCE.md](QUICK_REFERENCE.md)** - MongoDB Commands

#### Hand off the project
→ **[HANDOFF_CHECKLIST.md](HANDOFF_CHECKLIST.md)** - Complete checklist

Before handoff, ensure:
1. All documentation reviewed
2. All accounts accessible
3. Deployment successful
4. Knowledge transfer complete

---

## 🔍 Documentation by Role

### For New Developers

**Start here**:
1. [README.md](README.md) - Project overview
2. [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md) - Architecture
3. [.env.example](.env.example) - Setup environment
4. [QUICK_REFERENCE.md](QUICK_REFERENCE.md) - Common commands

**Then explore**:
- Code in `app/`, `lib/`, `components/`
- [DELIVERY_DOCUMENTATION.md](DELIVERY_DOCUMENTATION.md) for deep dives

### For Project Managers

**Start here**:
1. [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md) - Overview
2. [ACCOUNTS_AND_SERVICES.md](ACCOUNTS_AND_SERVICES.md) - Cost & services
3. [HANDOFF_CHECKLIST.md](HANDOFF_CHECKLIST.md) - Handoff process

**Then review**:
- Cost estimates in [ACCOUNTS_AND_SERVICES.md](ACCOUNTS_AND_SERVICES.md)
- Maintenance tasks in [DELIVERY_DOCUMENTATION.md](DELIVERY_DOCUMENTATION.md)

### For Content Managers

**Start here**:
1. [data/README.md](data/README.md) - Data preparation
2. [scripts/example-data.json](scripts/example-data.json) - Example format
3. [DELIVERY_DOCUMENTATION.md](DELIVERY_DOCUMENTATION.md) - Pinecone section

**Then learn**:
- How to format theological content
- How to upload to Pinecone
- How to verify uploads

### For DevOps/Deployment

**Start here**:
1. [DELIVERY_DOCUMENTATION.md](DELIVERY_DOCUMENTATION.md) - Deployment section
2. [ACCOUNTS_AND_SERVICES.md](ACCOUNTS_AND_SERVICES.md) - All services
3. [QUICK_REFERENCE.md](QUICK_REFERENCE.md) - Commands

**Then configure**:
- Environment variables
- Monitoring and alerts
- Backup procedures

---

## 📖 Documentation Best Practices

When working with this project:

1. **Always check** `.env.example` for required environment variables
2. **Never commit** `.env.local` to version control
3. **Read** [DELIVERY_DOCUMENTATION.md](DELIVERY_DOCUMENTATION.md) for comprehensive guides
4. **Use** [QUICK_REFERENCE.md](QUICK_REFERENCE.md) for quick lookups
5. **Update** documentation when making changes
6. **Complete** [HANDOFF_CHECKLIST.md](HANDOFF_CHECKLIST.md) during handoff

---

## 🔗 External Resources

- **Next.js**: https://nextjs.org/docs
- **MongoDB**: https://docs.mongodb.com
- **Pinecone**: https://docs.pinecone.io
- **OpenAI**: https://platform.openai.com/docs
- **LangChain**: https://js.langchain.com/docs
- **NextAuth**: https://next-auth.js.org

---

## 📝 Documentation Maintenance

### When to update documentation:

- **Adding new features**: Update [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md) and [README.md](README.md)
- **Changing services**: Update [ACCOUNTS_AND_SERVICES.md](ACCOUNTS_AND_SERVICES.md)
- **Modifying prompts**: Document changes in code comments
- **New environment variables**: Update [.env.example](.env.example)
- **Deployment changes**: Update [DELIVERY_DOCUMENTATION.md](DELIVERY_DOCUMENTATION.md)

### Documentation update checklist:
- [ ] Code changes reflected in relevant docs
- [ ] New environment variables added to `.env.example`
- [ ] Commands tested and verified in guides
- [ ] Examples updated if necessary
- [ ] External links checked and valid

---

## 🆘 Still Need Help?

If you can't find what you need:

1. **Search** across all markdown files for keywords
2. **Check** the specific section in [DELIVERY_DOCUMENTATION.md](DELIVERY_DOCUMENTATION.md)
3. **Review** code comments in relevant files
4. **Contact** the development team

---

## 📂 File Structure

```
Documentation/
├── README.md                      # Project overview (start here)
├── DOCUMENTATION_INDEX.md         # This file (navigation guide)
├── DELIVERY_DOCUMENTATION.md      # ⭐ Main comprehensive guide
├── ACCOUNTS_AND_SERVICES.md       # All services and accounts
├── PROJECT_SUMMARY.md             # Technical architecture
├── QUICK_REFERENCE.md             # Command reference
├── HANDOFF_CHECKLIST.md           # Project handoff
├── .env.example                   # Environment template
│
├── data/
│   └── README.md                  # Data preparation guide
│
└── scripts/
    ├── upsert-to-pinecone.js      # Upload to Pinecone
    ├── verify-pinecone.js         # Verify Pinecone
    └── example-data.json          # Sample data
```

---

**Last Updated**: November 25, 2025  
**Maintained by**: Development Team  
**Questions**: Contact project maintainer

