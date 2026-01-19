import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      avatar?: string;
      selectedReligion?: string;
      preferences?: {
        theme?: string;
        language?: string;
        notifications?: boolean;
        [key: string]: any;
      };
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    selectedReligion?: string;
    preferences?: {
      theme?: string;
      language?: string;
      notifications?: boolean;
      [key: string]: any;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    avatar?: string;
    selectedReligion?: string;
    preferences?: {
      theme?: string;
      language?: string;
      notifications?: boolean;
      [key: string]: any;
    };
  }
}

