import { auth } from "@/lib/auth";
import ChatPageClient from "./chat-client";

export default async function ChatPage() {
  const session = await auth();
  
  // Allow both authenticated and anonymous users
  return <ChatPageClient session={session} />;
}
