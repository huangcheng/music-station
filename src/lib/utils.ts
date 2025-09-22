import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

import type { ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) {
    return '0 Bytes';
  }

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return (
    Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  );
};

// Provide a fixed set of gradient class combinations as string literals so Tailwind can detect them.
export const GRADIENT_CLASS_PRESETS: readonly string[] = [
  // Warm
  'from-orange-400 to-red-600',
  'from-amber-400 to-orange-700',
  'from-yellow-400 to-amber-600',
  'from-red-500 to-pink-600',
  // Cool
  'from-teal-400 to-blue-600',
  'from-blue-500 to-indigo-700',
  'from-indigo-500 to-purple-700',
  'from-purple-500 to-pink-600',
  // Neutral
  'from-gray-400 to-gray-700',
  'from-slate-400 to-slate-700',
];

export const getRandomGradientColor = (): string => {
  const i = Math.floor(Math.random() * GRADIENT_CLASS_PRESETS.length);
  return GRADIENT_CLASS_PRESETS[i];
};
