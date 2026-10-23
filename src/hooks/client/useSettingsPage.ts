import { useAuth } from "@/context/AuthContext";
import { useProfile } from "@/context/ProfileContext";
import { useAvatarUpload } from "@/hooks/client/useAvatarUpload";
import { useSignOut } from "@/hooks/client/useSignOut";

type SettingsMessages = {
  updated: string;
  removed: string;
  invalidType: string;
  tooLarge: string;
  error: string;
  fallbackName: string;
};

export function useSettingsPage(
  onSignedOut: () => void,
  messages: SettingsMessages,
) {
  const { user } = useAuth();
  const { profile, refreshProfile } = useProfile();
  const signOut = useSignOut(onSignedOut);
  const avatar = useAvatarUpload(refreshProfile, messages);

  const profileName =
    profile?.displayName ||
    user?.displayName ||
    user?.email?.split("@")[0] ||
    messages.fallbackName;
  const avatarURL = profile?.photoURL ?? user?.photoURL ?? null;
  const hasCustomAvatar = Boolean(
    profile?.photoURL?.startsWith("/api/avatar/"),
  );

  return {
    user,
    profile,
    profileName,
    avatarURL,
    hasCustomAvatar,
    ...signOut,
    ...avatar,
  };
}
