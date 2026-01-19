"use client";

import { useEffect, useState } from "react";
import { useFormState } from "react-dom";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signInAction, FormState } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Cross, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

const initialState: FormState = {
  success: false,
};

export default function LoginPageClient() {
  const router = useRouter();
  const [state, formAction] = useFormState(signInAction, initialState);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (state.success) {
      toast.success(state.message || "Signed in successfully!");
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
              Orthodox Chatbot
            </span>
          </Link>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-orthodox-600 mb-2">
            Welcome Back
          </h1>
          <p className="text-gray-600">Sign in to continue your spiritual journey</p>
        </div>

        {/* Login Card */}
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

          {/* Login Form */}
          <form action={handleSubmit}>
            <div className="space-y-4">
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
                {state.errors?.password && (
                  <p className="text-sm text-red-600">{state.errors.password[0]}</p>
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
                    Signing in...
                  </>
                ) : (
                  "Sign In"
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
              <span className="px-2 bg-white text-gray-500">New to Orthodox Chatbot?</span>
            </div>
          </div>

          {/* Sign Up Link */}
          <div className="text-center">
            <Link href="/signup">
              <Button
                variant="outline"
                className="w-full h-11 border-2 border-byzantine-300 text-byzantine-600 hover:bg-byzantine-50 font-medium transition-all"
              >
                Create an Account
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

