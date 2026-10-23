import { useState } from "react";
import { signOutUser } from "@/services/client/auth";

export function useSignOut(onSignedOut: () => void) {
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [signOutFailed, setSignOutFailed] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    setSignOutFailed(false);
    try {
      await signOutUser();
      onSignedOut();
    } catch {
      setSignOutFailed(true);
    } finally {
      setIsSigningOut(false);
    }
  };

  return { isSigningOut, signOutFailed, handleSignOut };
}
