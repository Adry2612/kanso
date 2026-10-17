export interface Mood {
  label: string;
  emoji: string;
  symbol?: string;
}

export interface MoodBubbleProps {
  mood: Mood;
}
