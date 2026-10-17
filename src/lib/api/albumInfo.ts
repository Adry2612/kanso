export const getAlbumTracklist = async (albumId: string) => {
  const res = await fetch(`/api/getAlbumTracklist?id=${albumId}`, {
    method: "GET",
  });

  const data = await res.json();

  if (!res.ok)
    throw new Error(data.error || "Error al obtener el tracklist del disco.");

  return data;
};
