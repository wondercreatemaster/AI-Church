import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import LoginPageClient from "./login-client";

export default async function LoginPage() {
  const session = await auth();
  
  // If already logged in, redirect to chat
  if (session?.user) {
    redirect("/chat");
  }
  
  return <LoginPageClient />;
}
