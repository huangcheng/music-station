export type Response<T> = {
  message?: string;
  data: T;
};

export type Track = {
  id: number;
  name: string;
  artist: string;
  album?: string;
  track?: number;
  disk?: number;
  year?: number;
  date?: string;
  genre: string[];
  cover: string;
  file: string;
  codec?: string;
  bitrate?: number;
  bitsPerSample?: number;
  sampleRate?: number;
  duration?: number;
  lossless?: boolean;
  favorite: boolean;
  playCount: number;
  numberOfChannels?: number;
  size: number;
  recentlyPlayed: number;
};

export type Artist = {
  id: number;
  name: string;
  tracks: Track[];
  albums: Album[];
};

export type Album = {
  id: number;
  name: string;
  artist?: string;
  year?: number;
  tracks?: Track[];
};

export type Playlist = {
  id: number;
  name: string;

  tracks: number[];
};

export type Genre = {
  id: number;
  name: string;

  tracks: number[];
};
