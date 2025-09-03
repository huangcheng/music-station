import { MUSIC_EXTENSIONS } from '@/constants';

export const isMusicFile = (filename: string): boolean => {
  const extension = filename.split('.').pop()?.toLowerCase();

  return extension ? Object.keys(MUSIC_EXTENSIONS).includes(extension) : false;
};

export const musicExtend = (music: string) => {
  const extension = music.split('.').pop()?.toLowerCase() || '';

  const mimeType =
    MUSIC_EXTENSIONS[extension as keyof typeof MUSIC_EXTENSIONS] ||
    'application/octet-stream';

  return {
    extension,
    mimeType,
  };
};
