"use client";

import { useEffect, useState } from "react";
import { useFormState } from "react-dom";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signUpAction, FormState } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Cross, AlertCircle, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

const initialState: FormState = {
  success: false,
};

const religionOptions = [
  { id: "orthodox", name: "Eastern Orthodox", emoji: "☦️" },
  { id: "catholic", name: "Roman Catholic", emoji: "✝️" },
  { id: "protestant", name: "Protestant", emoji: "📖" },
  { id: "anglican", name: "Anglican/Episcopal", emoji: "⛪" },
  { id: "baptist", name: "Baptist", emoji: "💧" },
  { id: "methodist", name: "Methodist", emoji: "🔥" },
  { id: "pentecostal", name: "Pentecostal", emoji: "🕊️" },
  { id: "mormon", name: "LDS/Mormon", emoji: "📜" },
  { id: "other", name: "Other/Exploring", emoji: "🔍" },
];

export default function SignUpPageClient() {
  const router = useRouter();
  const [state, formAction] = useFormState(signUpAction, initialState);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedReligion, setSelectedReligion] = useState("");

  useEffect(() => {
    if (state.success) {
      toast.success(state.message || "Account created successfully!");
      router.push("/chat");
      router.refresh();
    } else {
      setIsLoading(false);
      // Show error toast if there's a message
      if (state.message && !state.success) {
        toast.error(state.message);
      }
    }
  }, [state, router]);

  const handleSubmit = async (formData: FormData) => {
    // Add selected religion to form data
    if (selectedReligion) {
      formData.set("selectedReligion", selectedReligion);
    }
    setIsLoading(true);
    formAction(formData);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-[#FAF8F3] via-white to-byzantine-50/30 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <Cross className="w-8 h-8 text-orthodox-600" />
            <span className="text-2xl font-display font-semibold text-orthodox-600">
              Who is Jesus
            </span>
          </Link>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-orthodox-600 mb-2">
            Begin Your Journey
          </h1>
          <p className="text-gray-600">Create an account to explore Orthodox Christianity</p>
        </div>

        {/* Signup Card */}
        <Card className="p-8 bg-white/95 backdrop-blur-sm shadow-2xl border-2 border-byzantine-300 rounded-3xl">
          {/* Error Alert */}
          {state.message && !state.success && (
            <Alert className="mb-6 border-red-300 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {state.message}
              </AlertDescription>
            </Alert>
          )}

          {/* Success Alert */}
          {state.success && (
            <Alert className="mb-6 border-green-300 bg-green-50">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                {state.message || "Account created successfully!"}
              </AlertDescription>
            </Alert>
          )}

          {/* Signup Form */}
          <form action={handleSubmit}>
            <div className="space-y-4">
              {/* Name Field */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                  Full Name
                </Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="John Doe"
                  required
                  disabled={isLoading}
                  className="h-11"
                />
                {state.errors?.name && (
                  <p className="text-sm text-red-600">{state.errors.name[0]}</p>
                )}
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email Address
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="your.email@example.com"
                  required
                  disabled={isLoading}
                  className="h-11"
                />
                {state.errors?.email && (
                  <p className="text-sm text-red-600">{state.errors.email[0]}</p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Password
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  disabled={isLoading}
                  className="h-11"
                />
                <p className="text-xs text-gray-500">
                  At least 8 characters with uppercase, lowercase, and number
                </p>
                {state.errors?.password && (
                  <p className="text-sm text-red-600">{state.errors.password[0]}</p>
                )}
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                  Confirm Password
                </Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  required
                  disabled={isLoading}
                  className="h-11"
                />
                {state.errors?.confirmPassword && (
                  <p className="text-sm text-red-600">{state.errors.confirmPassword[0]}</p>
                )}
              </div>

              {/* Avatar Field (Optional) */}
              <div className="space-y-2">
                <Label htmlFor="avatar" className="text-sm font-medium text-gray-700">
                  Avatar URL <span className="text-gray-400">(Optional)</span>
                </Label>
                <Input
                  id="avatar"
                  name="avatar"
                  type="url"
                  placeholder="https://example.com/avatar.jpg"
                  disabled={isLoading}
                  className="h-11"
                />
                {state.errors?.avatar && (
                  <p className="text-sm text-red-600">{state.errors.avatar[0]}</p>
                )}
              </div>

              {/* Religion Selection (Optional) */}
              <div className="space-y-2">
                <Label htmlFor="selectedReligion" className="text-sm font-medium text-gray-700">
                  Faith Tradition <span className="text-gray-400">(Optional)</span>
                </Label>
                <Select
                  value={selectedReligion}
                  onValueChange={setSelectedReligion}
                  disabled={isLoading}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select your faith tradition" />
                  </SelectTrigger>
                  <SelectContent>
                    {religionOptions.map((religion) => (
                      <SelectItem key={religion.id} value={religion.id}>
                        <span className="flex items-center gap-2">
                          <span>{religion.emoji}</span>
                          <span>{religion.name}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {state.errors?.selectedReligion && (
                  <p className="text-sm text-red-600">{state.errors.selectedReligion[0]}</p>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 bg-byzantine-500 hover:bg-byzantine-600 text-white font-medium transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>
            </div>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Already have an account?</span>
            </div>
          </div>

          {/* Sign In Link */}
          <div className="text-center">
            <Link href="/login">
              <Button
                variant="outline"
                className="w-full h-11 border-2 border-byzantine-300 text-byzantine-600 hover:bg-byzantine-50 font-medium transition-all"
              >
                Sign In
              </Button>
            </Link>
          </div>
        </Card>

        {/* Footer Links */}
        <div className="mt-6 text-center text-sm text-gray-600">
          <Link href="/" className="hover:text-orthodox-600 transition-colors">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

