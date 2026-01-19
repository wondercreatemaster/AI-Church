import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import ProfilePageClient from "./profile-client";

export default async function ProfilePage() {
  const session = await auth();
  
  // Require authentication
  if (!session?.user) {
    redirect("/login?callbackUrl=/profile");
  }
  
  return <ProfilePageClient session={session} />;
}

