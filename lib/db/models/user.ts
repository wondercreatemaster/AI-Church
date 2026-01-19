import { ObjectId } from "mongodb";

export interface User {
  _id?: ObjectId;
  name: string;
  email: string;
  password: string;
  avatar?: string;
  selectedReligion?: string;
  preferences?: {
    theme?: string;
    language?: string;
    notifications?: boolean;
    [key: string]: any;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface UserWithoutPassword extends Omit<User, "password"> {
  id: string;
}

export type CreateUserInput = Omit<User, "_id" | "createdAt" | "updatedAt">;

export type UpdateUserInput = Partial<Omit<User, "_id" | "email" | "password" | "createdAt" | "updatedAt">>;

// Collection name
export const USERS_COLLECTION = "users";

// Helper function to transform MongoDB user to safe user object
export function transformUser(user: User): UserWithoutPassword {
  const { password, _id, ...rest } = user;
  return {
    ...rest,
    id: _id?.toString() || "",
  };
}

