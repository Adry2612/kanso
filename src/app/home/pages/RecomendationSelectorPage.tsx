"use client";
import { Zap, Coffee, Laugh, Gauge } from "lucide-react";
import { GridSelector } from "../components/GridSelector";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface RecommendationOption {
  id: string;
  label: string;
  sublabel: string;
  icon: React.ReactNode;
  nextStep: string;
}

const emotions: RecommendationOption[] = [
  {
    id: "relaxing",
    label: "Basada en cómo te sientes",
    sublabel:
      "Analizamos tus emociones para encontrar melodías que resuenen con tu estado actual.",
    icon: <Laugh size={28} />,
    nextStep: "/home/mood",
  },
  {
    id: "energetic",
    label: "Basada en tu actividad",
    sublabel:
      "Música perfecta para acompañar lo que estáshaciendo en este preciso momento.",
    icon: <Gauge size={28} />,
    nextStep: "/home/activity",
  },
];

export const RecomendationSelectorPage = ({
  onChangeStep,
}: {
  onChangeStep: () => void;
}) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (selectedId) {
      const selectedOption = emotions.find((e) => e.id === selectedId);
      if (selectedOption) {
        router.push(selectedOption.nextStep);
      }
    }
  }, [selectedId, router]);

  return (
    <div className="min-h-screen flex flex-col items-center">
      <div className="flex items-center flex-col">
        <h1 className="text-5xl font-bold text-white text-center">
          ¿Como quieres tu <br />
          <span className="text-green-400"> recomendación de hoy? </span>
        </h1>
        <h2 className="text-gray-500">
          Selecciona el camino para descubrir tu próxima banda sonora favorita.
        </h2>
      </div>
      <div className="w-full mt-8">
        <div className="flex justify-center gap-[15rem] px-4">
          {emotions.map((emotion) => (
            <button
              key={emotion.id}
              onClick={() => setSelectedId(emotion.id)}
              className={`flex flex-col items-center justify-center bg-red-700 transition rounded-xl shadow-md border-[0.5px] border-gray-400 hover:border-green-400 w-86 h-56 hover:scale-105 cursor-pointer ${
                selectedId === emotion.id
                  ? "ring-2 ring-green-400 bg-neutral-800"
                  : ""
              }`}
            >
              <div
                className={`bg-neutral-600 rounded-full w-[3rem] h-[3rem] flex items-center justify-center ${
                  selectedId === emotion.id ? "text-green-400" : "text-white"
                }`}
              >
                {emotion.icon}
              </div>
              <span className="mt-2 font-medium text-lg">{emotion.label}</span>
              <span className="text-gray-400">{emotion.sublabel}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
