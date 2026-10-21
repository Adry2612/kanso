type InlineEmojiProps = {
  emoji?: string;
};

/**
 * Emoji dentro de una etiqueta de texto.
 *
 * Centraliza la separación entre el emoji y la palabra para que los chips de
 * emociones y actividades respiren igual en toda la app.
 */
export default function InlineEmoji({ emoji }: InlineEmojiProps) {
  if (!emoji) return null;

  return (
    <span className="emoji-inline" aria-hidden="true">
      {emoji}
    </span>
  );
}
