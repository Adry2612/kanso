/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
import { Album } from "../../../../../../models/album";
import { useFetch } from "@/hooks/useFetch";
import { undoFavorite } from "@/lib/api/favorites";
import { IoTrash } from "react-icons/io5";
import ArtistBackdrop from "./ArtistBackdrop";
import MoodBubble from "@/components/MoodBubble";
import ModalShell from "@/components/ModalShell";
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
  isOpen,
  onClose,
  album,
  feelings,
  activities,
  onEdit,
}: AlbumAlreadyFavoriteStepProps) => {
  const tActivities = useTranslations("activities");
  const { execute: removeFavorite, loading } = useFetch(undoFavorite);
  if (!album) return null;

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      labelledBy="existing-album-title"
      hero={
        <ArtistBackdrop
          artistId={album.artists[0]?.id}
          artistName={album.artists[0]?.name}
        />
      }
      heroBadge="Tu colección"
    >
      <div className="album-art-modal-body">
        <div className="album-modal-album-row">
          <img
            loading="lazy"
            decoding="async"
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
        <div className="mt-6 grid gap-5 border-t border-[var(--collectify-line)] pt-5">
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
                    className="rounded-full border border-[var(--collectify-line-strong)] px-3 py-1.5 text-xs text-[var(--collectify-muted)]"
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
      <div className="modal-shell-actions">
        <button onClick={onEdit} className="modal-action-primary">
          Editar información
        </button>
        <button
          disabled={loading}
          onClick={() => removeFavorite(album).then(() => onClose())}
          className="modal-action-danger"
        >
          <IoTrash />
          {loading ? "Eliminando..." : "Eliminar álbum"}
        </button>
      </div>
    </ModalShell>
  );
};
