/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState } from "react";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";

interface Item {
  id: string;
  label: string;
  icon?: React.ReactNode;
  [key: string]: any; // para permitir cualquier propiedad adicional
}

interface GridSelectorProps {
  items: Item[];
  pageSize?: number;
  selectedItems: string[];
  setSelectedItems: React.Dispatch<React.SetStateAction<string[]>>;
  onSelectionChange?: (selected: string[]) => void;
  isRecommendationPage?: boolean;
  onItemClick?: (id: string) => void;
  singleSelect?: boolean;
}

export const GridSelector: React.FC<GridSelectorProps> = ({
  items,
  pageSize = 6,
  onSelectionChange,
  selectedItems,
  setSelectedItems,
  isRecommendationPage = false,
  onItemClick,
  singleSelect = false,
}) => {
  const [page, setPage] = useState(0);

  const index = page * pageSize;
  const currentItems = items.slice(index, index + pageSize);

  const handleSelectItem = (id: string) => {
    if (isRecommendationPage && onItemClick) {
      onItemClick(id);
      return;
    }
    setSelectedItems((prev: string[]) => {
      let updated;
      if (singleSelect) {
        // En modo selección única, siempre es solo este elemento
        updated = [id];
      } else {
        // Modo multiple (permite toggle)
        updated = prev.includes(id)
          ? prev.filter((i) => i !== id)
          : [...prev, id];
      }
      onSelectionChange?.(updated);
      return updated;
    });
  };

  const rows = Math.ceil(currentItems.length / 3);
  const gridHeight = rows * 8;

  return (
    <div className="w-full text-white p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-row gap-4 items-center justify-center">
          <div
            className={`grid place-items-center max-w-3xl ${isRecommendationPage ? "gap-[15rem] grid-cols-2" : "gap-4 grid-cols-3"}`}
          >
            {currentItems.map((item) => {
              const isSelected = selectedItems.includes(item.id);
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectItem(item.id)}
                  className={`flex flex-col items-center justify-center bg-neutral-700 transition rounded-xl shadow-md border-[0.5px] border-gray-400 hover:border-green-400 hover:scale-105 cursor-pointer ${
                    isRecommendationPage ? "w-86 h-56" : "w-52 h-36"
                  } ${isSelected ? "ring-2 ring-green-400 bg-neutral-800" : ""}`}
                >
                  <div
                    className={`bg-neutral-600 rounded-full w-[3rem] h-[3rem] flex items-center justify-center ${isSelected || isRecommendationPage ? "text-green-400" : "text-white"}`}
                  >
                    {item.icon && item.icon}
                  </div>
                  <span className="mt-2 text-white font-medium text-lg">
                    {item.label}
                  </span>
                  {item.sublabel && (
                    <span className="text-gray-400">{item.sublabel}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
