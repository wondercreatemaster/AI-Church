"use client";

import { useEffect, useState } from "react";

export interface UserSession {
  name?: string | null;
  email?: string | null;
  avatar?: string | null;
  selectedReligion?: string | null;
}

export function useSession() {
  const [session, setSession] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch session from API route
    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setSession(data.user);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Failed to fetch session:", error);
        setLoading(false);
      });
  }, []);

  return { session, loading };
}

