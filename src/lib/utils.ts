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

export const getRandomGradientColor = (): string => {
  // const colors = ['orange', 'red', 'pink', 'amber', 'yellow', 'gray'];
  const colors = [
    'orange',
    'red',
    'pink',
    'amber',
    'yellow',
    'green',
    'teal',
    'blue',
    'indigo',
    'purple',
    'gray',
  ];
  const shades = ['400', '500', '600', '700', '900'];

  const fromColor = colors[Math.floor(Math.random() * colors.length)];
  const toColor = colors[Math.floor(Math.random() * colors.length)];
  const fromShade = shades[Math.floor(Math.random() * shades.length)];
  const toShade = shades[Math.floor(Math.random() * shades.length)];

  return `from-${fromColor}-${fromShade} to-${toColor}-${toShade}`;
};
