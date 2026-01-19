"use server";

import { auth } from "@/lib/auth";
import { getDatabase } from "@/lib/db/mongodb";
import { ObjectId } from "mongodb";
import { USERS_COLLECTION, User } from "@/lib/db/models/user";
import { CONVERSATIONS_COLLECTION } from "@/lib/db/models/conversation";
import { MESSAGES_COLLECTION } from "@/lib/db/models/message";
import bcrypt from "bcryptjs";
import { z } from "zod";

const updateProfileSchema = z.object({
  name: z.string().min(2).max(50).optional(),
  avatar: z.string().url().optional().or(z.literal("")),
  selectedReligion: z.string().optional(),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z
    .string()
    .min(8)
    .regex(/[A-Z]/, "Must contain uppercase")
    .regex(/[a-z]/, "Must contain lowercase")
    .regex(/[0-9]/, "Must contain number"),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export type FormState = {
  success: boolean;
  message?: string;
  errors?: {
    [key: string]: string[];
  };
};

/**
 * Update user profile
 */
export async function updateProfileAction(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, message: "Unauthorized" };
    }

    const rawData = {
      name: formData.get("name") as string,
      avatar: formData.get("avatar") as string,
      selectedReligion: formData.get("selectedReligion") as string,
    };

    const validated = updateProfileSchema.safeParse(rawData);
    if (!validated.success) {
      return {
        success: false,
        message: "Validation failed",
        errors: validated.error.flatten().fieldErrors,
      };
    }

    const db = await getDatabase();
    const userId = new ObjectId(session.user.id);

    const updateData: any = {
      updatedAt: new Date(),
    };

    if (validated.data.name) updateData.name = validated.data.name;
    if (validated.data.avatar !== undefined) updateData.avatar = validated.data.avatar || undefined;
    if (validated.data.selectedReligion) updateData.selectedReligion = validated.data.selectedReligion;

    const result = await db.collection<User>(USERS_COLLECTION).updateOne(
      { _id: userId },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return { success: false, message: "User not found" };
    }

    return { success: true, message: "Profile updated successfully" };
  } catch (error) {
    console.error("Update profile error:", error);
    return { success: false, message: "Failed to update profile" };
  }
}

/**
 * Change user password
 */
export async function changePasswordAction(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, message: "Unauthorized" };
    }

    const rawData = {
      currentPassword: formData.get("currentPassword") as string,
      newPassword: formData.get("newPassword") as string,
      confirmPassword: formData.get("confirmPassword") as string,
    };

    const validated = changePasswordSchema.safeParse(rawData);
    if (!validated.success) {
      return {
        success: false,
        message: "Validation failed",
        errors: validated.error.flatten().fieldErrors,
      };
    }

    const db = await getDatabase();
    const userId = new ObjectId(session.user.id);

    // Get current user
    const user = await db.collection<User>(USERS_COLLECTION).findOne({ _id: userId });
    if (!user) {
      return { success: false, message: "User not found" };
    }

    // Verify current password
    const isValid = await bcrypt.compare(validated.data.currentPassword, user.password);
    if (!isValid) {
      return {
        success: false,
        message: "Current password is incorrect",
        errors: { currentPassword: ["Incorrect password"] },
      };
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(validated.data.newPassword, 12);

    // Update password
    await db.collection<User>(USERS_COLLECTION).updateOne(
      { _id: userId },
      {
        $set: {
          password: hashedPassword,
          updatedAt: new Date(),
        },
      }
    );

    return { success: true, message: "Password changed successfully" };
  } catch (error) {
    console.error("Change password error:", error);
    return { success: false, message: "Failed to change password" };
  }
}

/**
 * Delete user account
 */
export async function deleteAccountAction(password: string): Promise<FormState> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, message: "Unauthorized" };
    }

    const db = await getDatabase();
    const userId = new ObjectId(session.user.id);

    // Get current user
    const user = await db.collection<User>(USERS_COLLECTION).findOne({ _id: userId });
    if (!user) {
      return { success: false, message: "User not found" };
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return { success: false, message: "Incorrect password" };
    }

    // Delete user's conversations and messages
    const conversations = await db
      .collection(CONVERSATIONS_COLLECTION)
      .find({ userId })
      .toArray();

    const conversationIds = conversations.map(c => c._id);

    await db.collection(MESSAGES_COLLECTION).deleteMany({
      conversationId: { $in: conversationIds },
    });

    await db.collection(CONVERSATIONS_COLLECTION).deleteMany({ userId });

    // Delete user
    await db.collection<User>(USERS_COLLECTION).deleteOne({ _id: userId });

    return { success: true, message: "Account deleted successfully" };
  } catch (error) {
    console.error("Delete account error:", error);
    return { success: false, message: "Failed to delete account" };
  }
}

