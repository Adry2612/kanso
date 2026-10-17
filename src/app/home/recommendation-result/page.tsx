"use client";
import { useTransitionRouter } from "next-view-transitions";
import { Reveal, motion } from "@/components/motion";

export default function RecommendationResultPage() {
  const router = useTransitionRouter();

  const handleBackHome = () => {
    router.push("/home");
  };

  return (
    <main className="collectify-main flex min-h-screen items-center justify-center">
      <Reveal>
        <div className="flex flex-col items-center gap-4 text-center">
          <h1 className="display text-4xl text-white">
            ¡Aquí va tu recomendación personalizada!
          </h1>
          <p className="max-w-md text-sm text-[#8f9f93]">
            Basada en tu selección anterior
          </p>
          <motion.button
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="mt-8 rounded-xl bg-[#9be7a5] px-6 py-3 text-sm font-semibold text-[#102117] transition hover:bg-[#d6f28d]"
            onClick={handleBackHome}
          >
            Volver al inicio
          </motion.button>
        </div>
      </Reveal>
    </main>
  );
}
