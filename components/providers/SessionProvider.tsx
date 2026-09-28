"use client";

import { createContext, useContext } from "react";
import type { User } from "@supabase/supabase-js";

interface SessionContextType {
  user: User | null;
  loading: boolean;
}

const SessionContext = createContext<SessionContextType>({
  user: null,
  loading: true,
});

const MOCK_USER = {
  id: "dev-user",
  email: "dev@solarview.local",
  aud: "authenticated",
  role: "authenticated",
  app_metadata: {},
  user_metadata: {},
  created_at: new Date().toISOString(),
} as unknown as User;

export function SessionProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionContext.Provider value={{ user: MOCK_USER, loading: false }}>
      {children}
    </SessionContext.Provider>
  );
}

export const useSession = () => {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
};