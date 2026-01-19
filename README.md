This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

# Orthodox Chatbot - AI-Powered Religious Education

An educational platform for exploring Orthodox Christianity through AI-guided conversations, featuring authentication, chat functionality, and church finder tools.

## ✨ Features 

- 🔐 **Secure Authentication** - NextAuth v5 with MongoDB
- 💬 **AI Chat Interface** - Personalized theological dialogues
- 🕊️ **Faith Timeline** - Interactive 2,000-year Christianity timeline
- 🗺️ **Church Finder** - Locate Orthodox churches near you
- 👤 **User Profiles** - Save preferences and conversation history
- 📱 **Responsive Design** - Beautiful UI on all devices

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- MongoDB installed and running
- npm or yarn package manager

### Installation
 
1. **Clone the repository**
   ```bash
   cd /Users/lalman/Desktop/andrew/ai-rag
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   MONGODB_URI=mongodb://localhost:27017/ai-rag
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=vCNjmJM88xWPixe1isJUdR6Iixkm0ZWpJppLMrell9U=
   ```

4. **Start MongoDB**
   ```bash
   # macOS
   brew services start mongodb-community
   
   # Linux
   sudo systemctl start mongodb
   ```

5. **Run the development server**

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

6. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔐 Authentication

This project includes a complete authentication system:

- **Sign Up**: Create an account at `/signup`
- **Sign In**: Login at `/login`
- **Protected Routes**: `/chat` requires authentication
- **User Sessions**: JWT-based secure sessions
- **User Profiles**: Extended profile with avatar, religion, preferences

### Quick Test

1. Visit http://localhost:3000/signup
2. Create a test account
3. You'll be auto-signed in and redirected to `/chat`
4. Click your avatar to see user menu
5. Test sign out functionality

📖 **Detailed Documentation**: See `AUTH_SETUP.md` and `QUICK_START.md`

## 📁 Project Structure

```
ai-rag/
├── app/
│   ├── actions/          # Server actions
│   ├── api/              # API routes
│   ├── chat/             # Chat interface
│   ├── churches/         # Church finder
│   ├── login/            # Login page
│   └── signup/           # Signup page
├── components/
│   ├── chat/             # Chat components
│   ├── churches/         # Church finder components
│   └── ui/               # UI components (shadcn)
├── lib/
│   ├── auth/             # Authentication config
│   ├── db/               # Database models & connection
│   └── utils/            # Utility functions
├── middleware.ts         # Route protection
└── Documentation files   # AUTH_SETUP.md, QUICK_START.md, etc.
```

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Authentication**: NextAuth v5
- **Database**: MongoDB
- **Styling**: Tailwind CSS 4
- **UI Components**: Radix UI / shadcn
- **Validation**: Zod
- **Type Safety**: TypeScript
- **Password Hashing**: bcryptjs

## 📖 Documentation

### For Project Delivery & Handoff
- **`DELIVERY_DOCUMENTATION.md`** - Comprehensive delivery guide (services, data management, deployment)
- **`ACCOUNTS_AND_SERVICES.md`** - All accounts, API keys, and service configuration
- **`PROJECT_SUMMARY.md`** - Architecture overview and technical details
- **`QUICK_REFERENCE.md`** - Quick command reference for common tasks
- **`HANDOFF_CHECKLIST.md`** - Complete handoff checklist

### For Development
- `README.md` - This file (project overview and quick start)
- `data/README.md` - Data preparation and Pinecone upload guide
- `.env.example` - Environment variables template

### Legacy Documentation
- `QUICK_START.md` - Get started in 3 steps
- `AUTH_SETUP.md` - Complete authentication setup guide
- `AUTH_FLOW.md` - Authentication architecture diagrams
- `IMPLEMENTATION_SUMMARY.md` - Detailed implementation info
- `CHECKLIST.md` - Testing and deployment checklist
- `COMPLETED.md` - Implementation summary

## 🧪 Testing

### Manual Testing

```bash
# Start MongoDB
brew services start mongodb-community

# Start dev server
npm run dev

# Test authentication
# 1. Create account at /signup
# 2. Sign in at /login
# 3. Access protected /chat route
# 4. Test user menu and sign out
```

### Database Verification

```bash
# Connect to MongoDB
mongosh ai-rag

# View users
db.users.find().pretty()

# Count users
db.users.countDocuments()
```

## 🌐 Routes

| Route | Access | Description |
|-------|--------|-------------|
| `/` | Public | Home page with timeline |
| `/signup` | Public | Create new account |
| `/login` | Public | Sign in to account |
| `/chat` | Protected | AI chat interface |
| `/churches` | Public | Church finder |

## 🔒 Security Features

- Password hashing with bcryptjs (12 rounds)
- JWT sessions with HTTP-only cookies
- CSRF protection via NextAuth
- Input validation with Zod
- Protected routes via middleware
- Unique email constraints
- MongoDB connection pooling

## 🚀 Deployment

### Production Checklist

Before deploying to production:

1. ✅ Use production MongoDB (MongoDB Atlas recommended)
2. ✅ Generate strong `NEXTAUTH_SECRET`: `openssl rand -base64 32`
3. ✅ Update `NEXTAUTH_URL` to production domain
4. ✅ Update `MONGODB_URI` to production database
5. ✅ Enable HTTPS
6. ✅ Add environment variables to hosting platform
7. ✅ Test all authentication flows

### Deploy on Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Add environment variables in Vercel dashboard
# - MONGODB_URI
# - NEXTAUTH_URL
# - NEXTAUTH_SECRET
```

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
