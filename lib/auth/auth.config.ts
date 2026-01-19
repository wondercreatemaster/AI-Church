import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { signInSchema } from "@/lib/utils/validation";
import { getDatabase } from "@/lib/db/mongodb";
import { USERS_COLLECTION, User } from "@/lib/db/models/user";

export const authConfig: NextAuthConfig = {
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          // Validate credentials
          const validatedFields = signInSchema.safeParse(credentials);

          if (!validatedFields.success) {
            return null;
          }

          const { email, password } = validatedFields.data;

          // Get user from database
          const db = await getDatabase();
          const user = await db
            .collection<User>(USERS_COLLECTION)
            .findOne({ email: email.toLowerCase() });

          if (!user) {
            return null;
          }

          // Verify password
          const passwordsMatch = await bcrypt.compare(password, user.password);

          if (!passwordsMatch) {
            return null;
          }

          // Return user without password
          return {
            id: user._id!.toString(),
            name: user.name,
            email: user.email,
            avatar: user.avatar,
            selectedReligion: user.selectedReligion,
            preferences: user.preferences,
          };
        } catch (error) {
          console.error("Authorization error:", error);
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // Initial sign in
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.avatar = user.avatar;
        token.selectedReligion = user.selectedReligion;
        token.preferences = user.preferences;
      }

      // Handle session updates
      if (trigger === "update" && session) {
        token = { ...token, ...session };
      }

      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.name = token.name as string;
        session.user.email = token.email as string;
        session.user.avatar = token.avatar as string | undefined;
        session.user.selectedReligion = token.selectedReligion as string | undefined;
        session.user.preferences = token.preferences as any;
      }
      return session;
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const pathname = nextUrl.pathname;

      // Allow anonymous access to /chat (no longer protected)
      // Anonymous users can chat freely

      // Protect /profile and /conversations routes
      if (pathname.startsWith("/profile") || pathname.startsWith("/conversations")) {
        if (!isLoggedIn) {
          const loginUrl = new URL("/login", nextUrl.origin);
          loginUrl.searchParams.set("callbackUrl", pathname);
          return Response.redirect(loginUrl);
        }
        return true;
      }

      // Redirect authenticated users away from auth pages
      if (isLoggedIn && (pathname === "/login" || pathname === "/signup")) {
        return Response.redirect(new URL("/chat", nextUrl.origin));
      }

      return true;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
};

