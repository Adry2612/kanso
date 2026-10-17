"use client";
import { Laugh, Gauge } from "lucide-react";
import { GridSelector } from "@/app/home/components/GridSelector";
import { useState } from "react";
import { useTransitionRouter } from "next-view-transitions";
import { Reveal } from "@/components/motion";

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
      "Música perfecta para acompañar lo que estás haciendo en este preciso momento.",
    icon: <Gauge size={28} />,
    nextStep: "/home/activity",
  },
];

export default function RecommendationPage() {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const router = useTransitionRouter();

  const handleSelectionChange = (newSelections: string[]) => {
    if (newSelections.length > 0) {
      const selectedId = newSelections[0];
      const selectedOption = emotions.find((e) => e.id === selectedId);
      if (selectedOption) {
        router.push(selectedOption.nextStep);
      }
    }
  };

  return (
    <main className="collectify-main min-h-screen">
      <Reveal>
        <section className="mt-14 max-w-3xl md:mt-24">
          <p className="text-[11px] font-bold uppercase tracking-[.2em] text-[#9be7a5]">
            Tu próxima escucha
          </p>
          <h1 className="collectify-page-title !mt-3 !text-5xl md:!text-6xl">
            ¿Cómo quieres tu <em>recomendación</em> de hoy?
          </h1>
          <h2 className="mt-5 max-w-xl text-sm leading-relaxed text-[#8f9f93] md:text-base">
            Selecciona el camino para descubrir tu próxima banda sonora
            favorita.
          </h2>
        </section>
      </Reveal>
      <div className="mt-10 w-full max-w-5xl">
        <GridSelector
          items={emotions}
          pageSize={2}
          selectedItems={selectedItems}
          isRecommendationPage={true}
          singleSelect={true}
          setSelectedItems={setSelectedItems}
          onSelectionChange={handleSelectionChange}
        />
      </div>
    </main>
  );
}
