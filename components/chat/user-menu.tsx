"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, User, Settings, UserPlus, LogIn } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOutAction } from "@/app/actions/auth";

interface UserMenuProps {
  user: {
    id?: string;
    name?: string | null;
    email?: string | null;
    avatar?: string | null;
    selectedReligion?: string | null;
  };
}

export function UserMenu({ user }: UserMenuProps) {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const isAnonymous = user.id === "anonymous";

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOutAction();
    } catch (error) {
      console.error("Sign out error:", error);
      setIsSigningOut(false);
    }
  };

  const getInitials = (name?: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // For anonymous users, show signup button directly
  if (isAnonymous) {
    return (
      <div className="flex items-center gap-2">
        <Button
          onClick={() => router.push("/signup")}
          className="bg-byzantine-500 hover:bg-byzantine-600 text-white font-semibold"
          size="sm"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Sign Up
        </Button>
        <Button
          onClick={() => router.push("/login")}
          variant="outline"
          size="sm"
          className="border-byzantine-300 text-byzantine-700 hover:bg-byzantine-50"
        >
          <LogIn className="w-4 h-4 mr-2" />
          Log In
        </Button>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10 border-2 border-byzantine-300">
            <AvatarImage src={user.avatar || undefined} alt={user.name || "User"} />
            <AvatarFallback className="bg-byzantine-100 text-byzantine-700 font-semibold">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.name || "User"}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email || ""}
            </p>
            {user.selectedReligion && (
              <p className="text-xs text-byzantine-600 mt-1">
                Background: {user.selectedReligion}
              </p>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push("/profile")}>
          <User className="mr-2 h-4 w-4" />
          <span>Profile & Settings</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleSignOut}
          disabled={isSigningOut}
          className="text-red-600 focus:text-red-600"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>{isSigningOut ? "Signing out..." : "Sign out"}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

