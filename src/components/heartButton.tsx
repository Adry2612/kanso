"use client";

import { useState } from "react";
import { HeartButtonProps } from "@/types/components";

export const HeartButton: React.FC<HeartButtonProps> = ({ onClick }) => {
  const [clicked, setClicked] = useState(false);

  return (
    <svg
      onClick={() => {
        setClicked(!clicked);
        if (onClick) {
          onClick();
        }
      }}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill={clicked ? "green" : "none"}
      stroke="green"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ cursor: "pointer", width: "24px", height: "24px" }}
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.72-7.72 1.06-1.06a5.5 5.5 0 0 0 0-7.84z" />
    </svg>
  );
};
