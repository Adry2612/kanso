export const openSpotify = (spotifyUrl?: string | null) => {
  if (!spotifyUrl) return;

  const albumId = spotifyUrl.split("/album/")[1]?.split("?")[0];

  if (!albumId) {
    window.open(spotifyUrl, "_blank");
    return;
  }

  const spotifyAppUri = `spotify:album:${albumId}`;

  window.location.href = spotifyAppUri;

  const timeout = setTimeout(() => {
    window.open(spotifyUrl, "_blank");
  }, 2000);

  const handleBlur = () => {
    clearTimeout(timeout);
    window.removeEventListener("blur", handleBlur);
  };

  window.addEventListener("blur", handleBlur);
};
