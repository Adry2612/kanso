"use client";
import {
  Briefcase,
  BookOpen,
  Zap,
  UtensilsCrossed,
  ListTodo,
  Dumbbell,
  Gamepad2,
  Coffee,
  Music,
} from "lucide-react";
import { GridSelector } from "../components/GridSelector";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { musicalFeelings } from "@/constants/feelings";
import { useTranslations } from "@/context/I18nContext";
import { moodLabelToKey } from "@/lib/activityRecommendations";
import { activityOptions } from "@/constants/activities";

export const ActivitySelectorPage = ({
  onChangeStep,
}: {
  onChangeStep: () => void;
}) => {
  const tActivities = useTranslations("activities");
  const tMoods = useTranslations("moods");
  const [selectedActivity, setSelectedActivity] = useState<string[]>([]);
  const [selectedEmotion, setSelectedEmotion] = useState<string[]>([]);
  const [step, setStep] = useState<"activity" | "emotion">("activity");
  const router = useRouter();

  const activityIcons = {
    working: <Briefcase size={28} />,
    studying: <BookOpen size={28} />,
    exercising: <Dumbbell size={28} />,
    cooking: <UtensilsCrossed size={28} />,
    relaxing: <Coffee size={28} />,
    gaming: <Gamepad2 size={28} />,
    commuting: <Zap size={28} />,
    chores: <ListTodo size={28} />,
    party: <Music size={28} />,
  };
  const activities = activityOptions.map(({ id }) => ({
    id,
    label: tActivities(id),
    icon: activityIcons[id],
  }));

  const emotionsForGrid = musicalFeelings.map((feeling) => ({
    id: feeling.nombre,
    label: moodLabelToKey[feeling.nombre]
      ? tMoods(moodLabelToKey[feeling.nombre])
      : feeling.nombre,
    icon: feeling.symbol,
  }));

  const handleActivityNext = () => {
    if (selectedActivity.length > 0) {
      setStep("emotion");
    }
  };

  const handleEmotionNext = () => {
    if (selectedEmotion.length > 0) {
      // Guardar en query params o sessionStorage y redirigir
      const activity = selectedActivity[0];

      // Pasar parámetros en URL a la ruta unificada de recomendaciones
      router.push(
        `/recommendation?activity=${encodeURIComponent(activity)}&type=activity`,
      );
    }
  };

  const handleBack = () => {
    setStep("activity");
  };

  if (step === "activity") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="flex items-center flex-col">
          <h1 className="text-5xl font-bold text-white text-center">
            ¿Qué estás haciendo <br />
            <span className="text-green-400"> en este momento? </span>
          </h1>
          <h2 className="text-gray-500">
            Selecciona tu actividad para encontrar la banda sonora perfecta.
          </h2>
        </div>
        <div className="w-full h-1/3 mt-8">
          <GridSelector
            items={activities}
            pageSize={6}
            selectedItems={selectedActivity}
            setSelectedItems={setSelectedActivity}
            onSelectionChange={(newSelections: string[]) =>
              setSelectedActivity(newSelections)
            }
            singleSelect={true}
          />

          <div className="flex justify-center mt-8 px-18">
            <button
              className="bg-green-400 px-4 py-2 rounded-full cursor-pointer"
              onClick={handleActivityNext}
              disabled={selectedActivity.length === 0}
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <div className="flex items-center flex-col">
        <h1 className="text-5xl font-bold text-white text-center">
          ¿Cómo te sientes <br />
          <span className="text-green-400"> en este momento? </span>
        </h1>
        <h2 className="text-gray-500">
          Selecciona tu emoción para encontrar la banda sonora perfecta.
        </h2>
      </div>
      <div className="w-full h-1/3 mt-8">
        <GridSelector
          items={emotionsForGrid}
          pageSize={6}
          selectedItems={selectedEmotion}
          setSelectedItems={setSelectedEmotion}
          onSelectionChange={(newSelections: string[]) =>
            setSelectedEmotion(newSelections)
          }
          singleSelect={true}
        />

        <div className="flex justify-center gap-4 mt-8 px-18">
          <button
            className="bg-gray-500 px-4 py-2 rounded-full cursor-pointer"
            onClick={handleBack}
          >
            Atrás
          </button>
          <button
            className="bg-green-400 px-4 py-2 rounded-full cursor-pointer"
            onClick={handleEmotionNext}
            disabled={selectedEmotion.length === 0}
          >
            Generar recomendación
          </button>
        </div>
      </div>
    </div>
  );
};
