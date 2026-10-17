"use client";
import { GridSelector } from "../components/GridSelector";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { moodOptions } from "@/constants/moods";
import { useTranslations } from "@/context/I18nContext";

export const MoodSelectorPage = ({
  onChangeStep,
}: {
  onChangeStep: () => void;
}) => {
  const tMoods = useTranslations("moods");
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const router = useRouter();

  const emotions = moodOptions.map((mood) => ({
    id: mood.key,
    label: tMoods(mood.key),
    icon: mood.emoji,
  }));

  const handleNext = () => {
    if (selectedItems.length > 0) {
      // Construir URL con moods seleccionados como parámetros
      const moodParams = selectedItems
        .map((mood) => `moods=${encodeURIComponent(mood)}`)
        .join("&");
      router.push(`/recommendation?${moodParams}&type=mood`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <div className="flex items-center flex-col">
        <h1 className="text-5xl font-bold text-white text-center">
          ¿Como te sientes <br />
          <span className="text-green-400"> ahora mismo? </span>
        </h1>
        <h2 className="text-gray-500">
          Selecciona tu estado de animo para encontrar la banda sonora perfecta.
        </h2>
      </div>
      <div className="w-full h-1/3 mt-8">
        <GridSelector
          items={emotions}
          pageSize={6}
          selectedItems={selectedItems}
          setSelectedItems={setSelectedItems}
          onSelectionChange={(newSelections: string[]) =>
            setSelectedItems(newSelections)
          }
        />

        <div className="flex justify-center mt-8 px-18">
          <button
            className="bg-green-400 px-4 py-2 rounded-full cursor-pointer"
            onClick={handleNext}
            disabled={selectedItems.length === 0}
          >
            Generar recomendación
          </button>
        </div>
      </div>
    </div>
  );
};
