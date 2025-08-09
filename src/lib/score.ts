
// Centralized helpers for displaying score semantics consistently across the app
// Thresholds: Excellent >= 80, Good >= 60, else Needs Work

export const getScoreLabel = (score: number): 'Excellent' | 'Good' | 'Needs Work' => {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Good';
  return 'Needs Work';
};

// Text color classes (kept using current Tailwind palette for minimal change)
export const getScoreTextClass = (score: number): string => {
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-yellow-600';
  return 'text-red-600';
};

// Softer text color variant for lighter UI elements
export const getScoreTextSoftClass = (score: number): string => {
  if (score >= 80) return 'text-green-400';
  if (score >= 60) return 'text-yellow-400';
  return 'text-red-400';
};

// Background color classes for badges
export const getScoreBgClass = (score: number): string => {
  if (score >= 80) return 'bg-green-100 dark:bg-green-900/20';
  if (score >= 60) return 'bg-yellow-100 dark:bg-yellow-900/20';
  return 'bg-red-100 dark:bg-red-900/20';
};

// Progress bar color classes
export const getProgressBgClass = (score: number): string => {
  if (score >= 80) return 'bg-green-500';
  if (score >= 60) return 'bg-yellow-500';
  return 'bg-red-500';
};
