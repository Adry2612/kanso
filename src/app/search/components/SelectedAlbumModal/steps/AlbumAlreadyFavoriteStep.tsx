/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
import { Album } from "../../../../../../models/album";
import { useAuth } from "@/context/AuthContext";
import { useFetch } from "@/hooks/useFetch";
import { undoFavorite } from "@/lib/api/favorites";
import { IoTrash } from "react-icons/io5";
import ArtistBackdrop from "./ArtistBackdrop";
import MoodBubble from "@/components/MoodBubble";
import { useTranslations } from "@/context/I18nContext";

interface AlbumAlreadyFavoriteStepProps {
  isOpen: boolean;
  onClose: () => void;
  album: Album;
  feelings: Array<any>;
  activities: string[];
  onEdit: () => void;
}

export const AlbumAlreadyFavoriteStep = ({
  onClose,
  album,
  feelings,
  activities,
  onEdit,
}: AlbumAlreadyFavoriteStepProps) => {
  const { user } = useAuth();
  const tActivities = useTranslations("activities");
  const { execute: removeFavorite, loading } = useFetch(undoFavorite);
  if (!album) return null;

  return (
    <section
      className="album-action-modal album-art-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="existing-album-title"
    >
      <header className="album-art-modal-hero">
        <ArtistBackdrop
          artistId={album.artists[0]?.id}
          artistName={album.artists[0]?.name}
        />
        <div className="album-art-modal-hero-content">
          <div className="flex justify-between">
            <span className="relative z-10 rounded-full border border-white/25 bg-black/20 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.16em] text-white/85">
              Tu colección
            </span>
            <button
              onClick={onClose}
              aria-label="Cerrar"
              className="relative z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/25 text-xl text-white/80"
            >
              ×
            </button>
          </div>
        </div>
      </header>
      <div className="album-art-modal-body">
        <div className="album-modal-album-row">
          <img
            src={album.images[0]?.url}
            alt={album.name}
            className="album-art-modal-floating-cover"
          />
          <div className="album-modal-album-meta">
            <p className="album-action-modal-eyebrow">Álbum guardado</p>
            <h2 className="mt-1 truncate text-2xl font-semibold tracking-[-.05em]">
              {album.name}
            </h2>
            <p className="album-action-modal-muted mt-1 truncate text-sm">
              {album.artists.map((artist: any) => artist.name).join(", ")}
            </p>
          </div>
        </div>
        <div className="mt-5">
          <h3
            id="existing-album-title"
            className="mt-5 text-xl font-semibold tracking-[-.05em]"
          >
            Ya forma parte de tu colección
          </h3>
          <p className="album-action-modal-muted mt-3 text-sm leading-6">
            Estas son las sensaciones y actividades que tienes asociadas a este
            álbum.
          </p>
        </div>
        <div className="mt-6 grid gap-5 border-t border-emerald-100/10 pt-5">
          <div>
            <p className="album-action-modal-eyebrow">Emociones</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {feelings.length > 0 ? (
                feelings.map((feeling) => (
                  <MoodBubble mood={feeling} key={feeling.label} />
                ))
              ) : (
                <span className="album-action-modal-muted text-sm">
                  Sin emociones asignadas
                </span>
              )}
            </div>
          </div>
          <div>
            <p className="album-action-modal-eyebrow">Actividades</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {activities.length > 0 ? (
                activities.map((activity) => (
                  <span
                    key={activity}
                    className="rounded-full border border-emerald-100/15 px-3 py-1.5 text-xs text-[#b4c2b6]"
                  >
                    {tActivities(activity)}
                  </span>
                ))
              ) : (
                <span className="album-action-modal-muted text-sm">
                  Sin actividades asignadas
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="album-art-modal-actions">
        <button
          onClick={onEdit}
          className="album-action-modal-primary px-4 py-3"
        >
          Editar información
        </button>
        <button
          disabled={loading}
          onClick={() =>
            removeFavorite(album, user?.uid || "").then(() => onClose())
          }
          className="album-action-modal-danger flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm disabled:opacity-50"
        >
          <IoTrash />
          {loading ? "Eliminando..." : "Eliminar álbum"}
        </button>
      </div>
    </section>
  );
};
