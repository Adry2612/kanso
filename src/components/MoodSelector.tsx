import React, { useState, useEffect, useRef } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { moodOptions, normalizeMood } from "@/constants/moods";
import { useTranslations } from "@/context/I18nContext";

type MoodOption = {
  label: string;
  displayLabel: string;
  emoji: string;
  symbol: string;
};

type MoodSelectorProps = {
  onChange?: (moods: MoodOption[]) => void;
  compact?: boolean;
  initialSelectedMoods?: MoodOption[];
};

const MoodSelectorPaginated = ({
  onChange,
  compact = false,
  initialSelectedMoods = [],
}: MoodSelectorProps) => {
  const tMoods = useTranslations("moods");
  const allMoods: MoodOption[] = moodOptions.map((mood) => ({
    label: mood.key,
    displayLabel: tMoods(mood.key),
    emoji: mood.emoji,
    symbol: mood.symbol,
  }));
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedMoods, setSelectedMoods] = useState<MoodOption[]>(() =>
    initialSelectedMoods
      .map((mood) => {
        const key = normalizeMood(mood.label);
        return key ? allMoods.find((item) => item.label === key) : undefined;
      })
      .filter((mood): mood is MoodOption => Boolean(mood)),
  );
  const wheelLock = useRef(false);

  useEffect(() => {
    if (onChange) onChange(selectedMoods);
  }, [selectedMoods, onChange]);

  const goToNext = () => {
    setActiveIndex((current) => (current + 1) % allMoods.length);
  };

  const goToPrev = () => {
    setActiveIndex(
      (current) => (current - 1 + allMoods.length) % allMoods.length,
    );
  };

  const handleWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    const delta =
      Math.abs(event.deltaX) > Math.abs(event.deltaY)
        ? event.deltaX
        : event.deltaY;

    if (Math.abs(delta) < 8) return;

    event.preventDefault();
    if (wheelLock.current) return;
    wheelLock.current = true;
    if (delta > 0) goToNext();
    else goToPrev();
    window.setTimeout(() => {
      wheelLock.current = false;
    }, 280);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      goToNext();
    }
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      goToPrev();
    }
  };

  const visibleMoods = [-1, 0, 1].map((offset) => ({
    mood: allMoods[(activeIndex + offset + allMoods.length) % allMoods.length],
    position: offset,
  }));

  const toggleMood = (mood: MoodOption) => {
    setSelectedMoods((prev) => {
      const exists = prev.find((m) => m.label === mood.label);
      if (exists) {
        return prev.filter((m) => m.label !== mood.label);
      } else {
        return [...prev, mood];
      }
    });
  };

  return (
    <div
      className={`relative mx-auto max-w-4xl rounded-2xl border border-emerald-100/10 bg-[#17261c]/50 ${compact ? "p-2" : "p-3 sm:p-4"}`}
    >
      {compact && (
        <div className="grid grid-cols-2 gap-2 p-1 sm:grid-cols-3">
          {allMoods.map((mood) => {
            const isSelected = selectedMoods.some(
              (item) => item.label === mood.label,
            );
            return (
              <button
                key={mood.label}
                type="button"
                aria-pressed={isSelected}
                onClick={() => toggleMood(mood)}
                className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 text-left text-xs font-semibold transition ${isSelected ? "border-[#9be7a5] bg-[#9be7a5] text-[#102117]" : "border-emerald-100/15 bg-[#101b14]/50 text-[#d6e5d8] hover:border-[#9be7a5]/60 hover:bg-[#203a29]"}`}
              >
                <span className="text-base" aria-hidden="true">
                  {mood.symbol}
                </span>
                <span>{mood.displayLabel}</span>
              </button>
            );
          })}
        </div>
      )}
      <div className={compact ? "hidden" : "block"}>
        <button
          type="button"
          onClick={goToPrev}
          aria-label="Emociones anteriores"
          className={`absolute z-10 flex h-8 w-8 items-center justify-center rounded-full border border-emerald-100/10 bg-[#17261c] text-sm text-[#9be7a5] transition hover:border-[#9be7a5]/60 hover:bg-[#9be7a5]/10 ${compact ? "top-3" : "mt-14"}`}
        >
          <FaChevronLeft />
        </button>

        <div
          className="cursor-grab overflow-hidden px-5 outline-none active:cursor-grabbing sm:px-8"
          onWheel={handleWheel}
          onKeyDown={handleKeyDown}
          tabIndex={0}
          role="region"
          aria-label="Selector de emociones"
          aria-roledescription="carrusel"
        >
          <div className="grid grid-cols-3 items-center gap-2 sm:gap-3">
            {visibleMoods.map(({ mood, position }) => {
              const isSelected = selectedMoods.some(
                (item) => item.label === mood.label,
              );
              const isCenter = position === 0;
              return (
                <button
                  key={mood.label}
                  type="button"
                  onClick={() => toggleMood(mood)}
                  className={`flex items-center justify-center gap-2 border text-center transition duration-300 ${compact ? "min-h-0 rounded-full px-3 py-2" : "min-h-[112px] flex-col rounded-2xl px-2 py-3"} ${isCenter ? "scale-100 border-[#9be7a5]/70 bg-[#203a29] text-white shadow-[0_10px_30px_rgba(0,0,0,.2)]" : "scale-90 border-emerald-100/10 bg-[#101b14]/45 text-[#8f9f93] opacity-75 hover:scale-95 hover:opacity-100"} ${isSelected ? "ring-2 ring-[#9be7a5] ring-offset-2 ring-offset-[#17261c]" : ""}`}
                >
                  <span
                    className={
                      compact ? "text-base" : isCenter ? "text-3xl" : "text-2xl"
                    }
                  >
                    {mood.symbol}
                  </span>
                  <span className="text-xs font-semibold leading-tight">
                    {mood.displayLabel}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <button
          type="button"
          onClick={goToNext}
          aria-label="Siguientes emociones"
          className={`absolute right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-emerald-100/10 bg-[#17261c] text-sm text-[#9be7a5] transition hover:border-[#9be7a5]/60 hover:bg-[#9be7a5]/10 ${compact ? "top-3" : "mt-14"}`}
        >
          <FaChevronRight />
        </button>
        <div
          className={`${compact ? "mt-2" : "mt-3"} flex justify-center gap-1.5`}
          aria-label="Posición del carrusel"
        >
          {allMoods.map((mood, index) => (
            <button
              key={mood.label}
              type="button"
              aria-label={`Ir a ${mood.displayLabel}`}
              onClick={() => setActiveIndex(index)}
              className={`h-1.5 rounded-full transition-all ${index === activeIndex ? "w-6 bg-[#9be7a5]" : "w-1.5 bg-emerald-100/20"}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default MoodSelectorPaginated;
