import { getMood } from "@/constants/moods";
import { useTranslations } from "@/context/I18nContext";

/**
 * Burbuja de una emoción. Recibe la **clave** y resuelve su etiqueta traducida,
 * de modo que nunca se muestra la clave en crudo.
 */
const MoodBubble = ({ moodKey }: { moodKey: string }) => {
  const tMoods = useTranslations("moods");
  const mood = getMood(moodKey);

  return (
    <span className="mood-bubble inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold transition">
      <span className="text-sm leading-none" aria-hidden="true">
        {mood?.symbol || "•"}
      </span>
      <span>{mood ? tMoods(mood.key) : moodKey}</span>
    </span>
  );
};

export default MoodBubble;
