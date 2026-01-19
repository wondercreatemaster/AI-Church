"use server";

import { signIn, signOut } from "@/lib/auth";
import { getDatabase } from "@/lib/db/mongodb";
import { USERS_COLLECTION, User } from "@/lib/db/models/user";
import { signUpSchema, signInSchema } from "@/lib/utils/validation";
import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { getAnonymousSession, deleteAnonymousSession } from "@/lib/auth/anonymous-session";
import { migrateAnonymousConversations } from "./migration";

export type FormState = {
  success: boolean;
  message?: string;
  errors?: {
    [key: string]: string[];
  };
};

/**
 * Sign up a new user
 */
export async function signUpAction(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  try {
    // Extract form data
    const rawFormData = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      confirmPassword: formData.get("confirmPassword") as string,
      avatar: formData.get("avatar") as string,
      selectedReligion: formData.get("selectedReligion") as string,
    };

    // Validate form data
    const validatedFields = signUpSchema.safeParse(rawFormData);

    if (!validatedFields.success) {
      const errors = validatedFields.error.flatten().fieldErrors;
      const firstError = Object.values(errors)[0]?.[0];
      
      return {
        success: false,
        message: firstError || "Please check your input and try again",
        errors,
      };
    }

    const { name, email, password, avatar, selectedReligion } =
      validatedFields.data;

    // Connect to database
    let db;
    try {
      db = await getDatabase();
    } catch (dbError) {
      console.error("Database connection error:", dbError);
      return {
        success: false,
        message: "Unable to connect to the database. Please try again later.",
      };
    }

    const usersCollection = db.collection<User>(USERS_COLLECTION);

    // Check if user already exists
    let existingUser;
    try {
      existingUser = await usersCollection.findOne({
        email: email.toLowerCase(),
      });
    } catch (queryError) {
      console.error("Database query error:", queryError);
      return {
        success: false,
        message: "An error occurred while checking your email. Please try again.",
      };
    }

    if (existingUser) {
      return {
        success: false,
        message: "An account with this email already exists. Please sign in instead.",
        errors: {
          email: ["This email is already registered"],
        },
      };
    }

    // Hash password
    let hashedPassword;
    try {
      hashedPassword = await bcrypt.hash(password, 12);
    } catch (hashError) {
      console.error("Password hashing error:", hashError);
      return {
        success: false,
        message: "An error occurred while securing your password. Please try again.",
      };
    }

    // Create user
    const newUser: Omit<User, "_id"> = {
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      avatar: avatar || undefined,
      selectedReligion: selectedReligion || undefined,
      preferences: {},
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    let result;
    try {
      result = await usersCollection.insertOne(newUser as User);
    } catch (insertError) {
      console.error("User creation error:", insertError);
      return {
        success: false,
        message: "Failed to create your account. Please try again.",
      };
    }

    if (!result.insertedId) {
      return {
        success: false,
        message: "Failed to create your account. Please try again.",
      };
    }

    // Check for anonymous session to migrate
    const anonymousSessionId = await getAnonymousSession();
    
    // Auto sign in after successful signup
    try {
      await signIn("credentials", {
        email: email.toLowerCase(),
        password,
        redirect: false,
      });
    } catch (signInError) {
      console.error("Auto sign-in error:", signInError);
      // Account was created successfully, but auto sign-in failed
      return {
        success: true,
        message: "Account created successfully! Please sign in to continue.",
      };
    }

    // Migrate anonymous conversations if they exist
    if (anonymousSessionId) {
      try {
        const migrationResult = await migrateAnonymousConversations(
          anonymousSessionId,
          result.insertedId.toString()
        );
        
        if (migrationResult.success && migrationResult.migratedCount! > 0) {
          console.log(`Migrated ${migrationResult.migratedCount} conversation(s) for new user`);
        }
        
        // Clear anonymous session cookie after migration
        await deleteAnonymousSession();
      } catch (migrationError) {
        console.error("Migration error during signup:", migrationError);
        // Don't fail signup if migration fails
      }
    }

    return {
      success: true,
      message: "Account created successfully! Redirecting to chat...",
    };
  } catch (error) {
    console.error("Sign up error:", error);
    
    // Network error
    if (error instanceof TypeError && error.message.includes("fetch")) {
      return {
        success: false,
        message: "Network error. Please check your connection and try again.",
      };
    }

    return {
      success: false,
      message: "An unexpected error occurred. Please try again later.",
    };
  }
}

/**
 * Sign in a user
 */
export async function signInAction(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  try {
    // Extract form data
    const rawFormData = {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    };

    // Validate form data
    const validatedFields = signInSchema.safeParse(rawFormData);

    if (!validatedFields.success) {
      const errors = validatedFields.error.flatten().fieldErrors;
      const firstError = Object.values(errors)[0]?.[0];
      
      return {
        success: false,
        message: firstError || "Please check your input and try again",
        errors,
      };
    }

    const { email, password } = validatedFields.data;

    // Check if credentials are empty
    if (!email || !password) {
      const errors: { [key: string]: string[] } = {};
      if (!email) errors.email = ["Email is required"];
      if (!password) errors.password = ["Password is required"];
      
      return {
        success: false,
        message: "Please enter both email and password",
        errors,
      };
    }

    // Check for anonymous session to migrate before sign in
    const anonymousSessionId = await getAnonymousSession();
    
    // Attempt sign in
    try {
      const result = await signIn("credentials", {
        email: email.toLowerCase(),
        password,
        redirect: false,
      });

      // Check if sign in was successful
      if (result?.error) {
        return {
          success: false,
          message: "Invalid email or password. Please try again.",
          errors: {
            email: ["Invalid credentials"],
            password: ["Invalid credentials"],
          },
        };
      }

      // Migrate anonymous conversations if they exist
      if (anonymousSessionId) {
        try {
          // Get the user ID to migrate conversations
          const db = await getDatabase();
          const user = await db.collection<User>(USERS_COLLECTION).findOne({
            email: email.toLowerCase(),
          });

          if (user?._id) {
            const migrationResult = await migrateAnonymousConversations(
              anonymousSessionId,
              user._id.toString()
            );

            if (migrationResult.success && migrationResult.migratedCount! > 0) {
              console.log(`Migrated ${migrationResult.migratedCount} conversation(s) for user`);
            }

            // Clear anonymous session cookie after migration
            await deleteAnonymousSession();
          }
        } catch (migrationError) {
          console.error("Migration error during sign in:", migrationError);
          // Don't fail sign in if migration fails
        }
      }
    } catch (signInError) {
      console.error("Sign in attempt error:", signInError);
      
      if (signInError instanceof AuthError) {
        switch (signInError.type) {
          case "CredentialsSignin":
            return {
              success: false,
              message: "Invalid email or password. Please check your credentials and try again.",
              errors: {
                email: ["Invalid credentials"],
                password: ["Invalid credentials"],
              },
            };
          case "AccessDenied":
            return {
              success: false,
              message: "Access denied. Your account may be disabled.",
            };
          default:
            return {
              success: false,
              message: "Unable to sign in. Please try again.",
            };
        }
      }

      throw signInError; // Re-throw to be caught by outer catch
    }

    return {
      success: true,
      message: "Signed in successfully! Redirecting...",
    };
  } catch (error) {
    console.error("Sign in error:", error);

    // Network error
    if (error instanceof TypeError && error.message.includes("fetch")) {
      return {
        success: false,
        message: "Network error. Please check your connection and try again.",
      };
    }

    // Database connection error
    if (error instanceof Error && error.message.includes("database")) {
      return {
        success: false,
        message: "Unable to connect to authentication service. Please try again later.",
      };
    }

    return {
      success: false,
      message: "An unexpected error occurred. Please try again later.",
    };
  }
}

/**
 * Sign out a user
 */
export async function signOutAction() {
  await signOut({ redirectTo: "/" });
}

/**
 * Update user profile
 */
export async function updateUserProfileAction(
  userId: string,
  data: {
    name?: string;
    avatar?: string;
    selectedReligion?: string;
    preferences?: any;
  }
): Promise<FormState> {
  try {
    const db = await getDatabase();
    const usersCollection = db.collection<User>(USERS_COLLECTION);

    const result = await usersCollection.updateOne(
      { _id: new (require("mongodb").ObjectId)(userId) },
      {
        $set: {
          ...data,
          updatedAt: new Date(),
        },
      }
    );

    if (result.modifiedCount === 0) {
      return {
        success: false,
        message: "Failed to update profile",
      };
    }

    return {
      success: true,
      message: "Profile updated successfully",
    };
  } catch (error) {
    console.error("Update profile error:", error);
    return {
      success: false,
      message: "An unexpected error occurred",
    };
  }
}

