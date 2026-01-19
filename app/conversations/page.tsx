import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import ConversationsPageClient from "./conversations-client";

export default async function ConversationsPage() {
  const session = await auth();
  
  // Require authentication
  if (!session?.user) {
    redirect("/login?callbackUrl=/conversations");
  }
  
  return <ConversationsPageClient session={session} />;
}

