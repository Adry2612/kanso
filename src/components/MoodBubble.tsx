import { MoodBubbleProps } from "@/types/mood";

const MoodBubble = ({ mood }: MoodBubbleProps) => {
  return (
    <span className="mood-bubble inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold transition">
      <span className="text-sm leading-none" aria-hidden="true">
        {mood.symbol || "•"}
      </span>
      <span>{mood.label}</span>
    </span>
  );
};

export default MoodBubble;
