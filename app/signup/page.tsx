import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import SignUpPageClient from "./signup-client";

export default async function SignUpPage() {
  const session = await auth();
  
  // If already logged in, redirect to chat
  if (session?.user) {
    redirect("/chat");
  }
  
  return <SignUpPageClient />;
}
