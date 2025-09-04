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

interface LibraryItem {
  id: number;
  label: string;
  count?: number;
  expandable?: boolean;
  isLeaf: boolean;
  children?: LibraryItem[];
}

interface Node {
  name: string;
  id: number;
  expandable?: boolean;
  music?: Node[];
  children?: Node[];
}

export const getLeafCount = (nodes: Node[]): number =>
  nodes.reduce((acc, { music, children }) => {
    const ch = (music ?? children) as Node[] | undefined;
    if (!ch || ch.length === 0) return acc + 1;
    return acc + getLeafCount(ch);
  }, 0);

export const toLibraryTree = (nodes: Node[]): LibraryItem[] =>
  nodes.map(({ name, id, music, children, ...rest }) => ({
    id,
    label: name,
    isLeaf: (music ?? children ?? []).length === 0,
    expandable: (music ?? children ?? []).length > 0,
    count:
      (music ?? children ?? []).length > 0
        ? getLeafCount((music ?? children ?? []) as Node[])
        : undefined,
    children:
      (music ?? children)
        ? toLibraryTree((music ?? children ?? []) as Node[])
        : undefined,
    ...rest,
  }));
