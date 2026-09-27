// Visual options for a class. Full class strings so Tailwind keeps them.
export const TONES = {
  primary: { tile: 'bg-primary-100 text-primary-700', ring: 'primary-600', track: 'primary-100', swatch: 'bg-primary-600' },
  accent: { tile: 'bg-accent-100 text-accent-700', ring: 'accent-500', track: 'accent-100', swatch: 'bg-accent-400' },
  highlight: { tile: 'bg-highlight-100 text-highlight-700', ring: 'highlight-500', track: 'highlight-100', swatch: 'bg-highlight-500' },
  success: { tile: 'bg-success-100 text-success-700', ring: 'success-600', track: 'success-100', swatch: 'bg-success-600' },
};

export const LETTERS = ['ก', 'ข', 'ค', 'ง', 'จ', 'ช', 'ด', 'ต', 'น', 'บ', 'ป', 'ม', 'ร', 'ล', 'ส', 'ห'];

export const LEVELS = ['beginner', 'intermediate', 'advanced'];

export const ITEM_TYPES = [
  { id: 'lesson', icon: 'book' },
  { id: 'video', icon: 'video' },
  { id: 'audio', icon: 'speaker' },
  { id: 'file', icon: 'document' },
  { id: 'link', icon: 'link' },
];

export const ASSIGNMENT_TYPES = [
  { id: 'pronunciation', icon: 'microphone' },
  { id: 'writing', icon: 'pencil' },
  { id: 'quiz', icon: 'question' },
];

export function classProgress(cls) {
  if (!cls.students.length) return 0;
  return Math.round(cls.students.reduce((s, st) => s + st.progress, 0) / cls.students.length);
}
