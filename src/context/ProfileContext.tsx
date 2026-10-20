"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "@/context/AuthContext";
import { getMyProfile } from "@/lib/api/profile";
import type { FriendProfile } from "@/types/friends";

type ProfileContextValue = {
  profile: FriendProfile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
};

const ProfileContext = createContext<ProfileContextValue | null>(null);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<FriendProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const requestId = useRef(0);

  const load = useCallback(
    async (silent = false) => {
      if (authLoading) return;

      if (!user || user.isAnonymous) {
        requestId.current += 1;
        setProfile(null);
        setLoading(false);
        return;
      }

      const currentRequest = requestId.current + 1;
      requestId.current = currentRequest;
      if (!silent) setLoading(true);

      try {
        const nextProfile = await getMyProfile();
        if (requestId.current === currentRequest) {
          setProfile(nextProfile);
        }
      } catch {
        if (requestId.current === currentRequest && !silent) {
          setProfile(null);
        }
      } finally {
        if (requestId.current === currentRequest && !silent) {
          setLoading(false);
        }
      }
    },
    [authLoading, user],
  );

  useEffect(() => {
    void load();
  }, [load]);

  const refreshProfile = useCallback(() => load(true), [load]);

  return (
    <ProfileContext.Provider value={{ profile, loading, refreshProfile }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error("useProfile debe usarse dentro de ProfileProvider");
  }
  return context;
}
