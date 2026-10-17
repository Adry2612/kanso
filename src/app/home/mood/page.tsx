"use client";
import { useState } from "react";
import { useTransitionRouter } from "next-view-transitions";
import { GridSelector } from "../components/GridSelector";
import { musicalFeelings } from "@/constants/feelings";
import { Reveal, motion } from "@/components/motion";

const emotions = musicalFeelings.map((feeling) => ({
  id: feeling.nombre,
  label: feeling.nombre,
  icon: feeling.symbol,
}));

export default function MoodSelectorPage() {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const router = useTransitionRouter();

  const handleNext = () => {
    if (selectedItems.length > 0) {
      router.push("/recommendation");
    }
  };

  return (
    <main className="collectify-main min-h-screen">
      <Reveal>
        <section className="mt-14 max-w-3xl md:mt-24">
          <p className="public-accent text-[11px] font-bold uppercase tracking-[.2em]">
            Por emoción
          </p>
          <h1 className="collectify-page-title !mt-3 !text-5xl md:!text-6xl">
            ¿Cómo te sientes <em>ahora mismo</em>?
          </h1>
          <h2 className="mt-5 max-w-xl text-sm leading-relaxed text-[#8f9f93] md:text-base">
            Selecciona tu estado de ánimo para encontrar la banda sonora
            perfecta.
          </h2>
        </section>
      </Reveal>
      <div className="mt-10 w-full max-w-5xl">
        <GridSelector
          items={emotions}
          pageSize={6}
          selectedItems={selectedItems}
          setSelectedItems={setSelectedItems}
          onSelectionChange={(newSelections: string[]) =>
            setSelectedItems(newSelections)
          }
        />

        <div className="mt-8 flex justify-center">
          <motion.button
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="rounded-xl bg-[#9be7a5] px-5 py-3 text-sm font-semibold text-[#102117] transition hover:bg-[#d6f28d] disabled:cursor-not-allowed disabled:opacity-50"
            onClick={handleNext}
            disabled={selectedItems.length === 0}
          >
            Generar recomendación
          </motion.button>
        </div>
      </div>
    </main>
  );
}
