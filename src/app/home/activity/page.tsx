"use client";
import { useState } from "react";
import { useTransitionRouter } from "next-view-transitions";
import { GridSelector } from "../components/GridSelector";
import { activityOptions } from "@/constants/activities";
import { Reveal, motion } from "@/components/motion";

const activities = activityOptions.map(({ id, icon }) => ({
  id,
  label: id,
  icon: <span aria-hidden="true">{icon}</span>,
}));

export default function ActivityPage() {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const router = useTransitionRouter();

  const handleNext = () => {
    if (selectedItems.length > 0) {
      const activity = selectedItems[0];
      router.push(
        `/recommendation?activity=${encodeURIComponent(activity)}&type=activity`,
      );
    }
  };

  return (
    <main className="collectify-main min-h-screen">
      <Reveal>
        <section className="mt-14 max-w-3xl md:mt-24">
          <p className="public-accent text-[11px] font-bold uppercase tracking-[.2em]">
            Por actividad
          </p>
          <h1 className="collectify-page-title !mt-3 !text-5xl md:!text-6xl">
            ¿Qué estás haciendo <em>en este momento</em>?
          </h1>
          <h2 className="mt-5 max-w-xl text-sm leading-relaxed text-[#8f9f93] md:text-base">
            Selecciona tu actividad para encontrar la banda sonora perfecta.
          </h2>
        </section>
      </Reveal>
      <div className="mt-10 w-full max-w-5xl">
        <GridSelector
          items={activities}
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
