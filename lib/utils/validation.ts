import { z } from "zod";

// Sign up validation schema
export const signUpSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters").max(50, "Name must be less than 50 characters"),
    email: z.string().email("Invalid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string(),
    avatar: z.string().url().optional().or(z.literal("")),
    selectedReligion: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

// Sign in validation schema
export const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

// Update user validation schema
export const updateUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50, "Name must be less than 50 characters").optional(),
  avatar: z.string().url().optional().or(z.literal("")),
  selectedReligion: z.string().optional(),
  preferences: z
    .object({
      theme: z.string().optional(),
      language: z.string().optional(),
      notifications: z.boolean().optional(),
    })
    .catchall(z.any())
    .optional(),
});

// Export types
export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;

