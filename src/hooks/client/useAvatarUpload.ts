import { useState, type ChangeEvent } from "react";
import { removeAvatar, uploadAvatar } from "@/lib/api/profile";
import { resizeImageToAvatarDataUrl } from "@/lib/avatarImage";

type AvatarMessages = {
  updated: string;
  removed: string;
  invalidType: string;
  tooLarge: string;
  error: string;
};

export function useAvatarUpload(
  refreshProfile: () => Promise<void>,
  messages: AvatarMessages,
) {
  const [avatarBusy, setAvatarBusy] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [avatarSuccess, setAvatarSuccess] = useState<string | null>(null);

  const handleAvatarSelected = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setAvatarError(null);
    setAvatarSuccess(null);
    setAvatarBusy(true);

    try {
      const dataUrl = await resizeImageToAvatarDataUrl(file);
      await uploadAvatar(dataUrl);
      await refreshProfile();
      setAvatarSuccess(messages.updated);
    } catch (error) {
      const code = error instanceof Error ? error.message : "";
      setAvatarError(
        code === "unsupported-type"
          ? messages.invalidType
          : code === "file-too-large"
            ? messages.tooLarge
            : error instanceof Error
              ? error.message
              : messages.error,
      );
    } finally {
      setAvatarBusy(false);
    }
  };

  const handleRemoveAvatar = async () => {
    setAvatarError(null);
    setAvatarSuccess(null);
    setAvatarBusy(true);

    try {
      await removeAvatar();
      await refreshProfile();
      setAvatarSuccess(messages.removed);
    } catch (error) {
      setAvatarError(error instanceof Error ? error.message : messages.error);
    } finally {
      setAvatarBusy(false);
    }
  };

  return {
    avatarBusy,
    avatarError,
    avatarSuccess,
    handleAvatarSelected,
    handleRemoveAvatar,
  };
}
