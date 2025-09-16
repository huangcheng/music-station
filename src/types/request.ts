export type CreatePlayListRequest = {
  name: string;

  music: number[];
};

export type UpdateMusicRequest = {
  name?: string;
  year?: number | null;
  artistId?: number | null;
  albumId?: number | null;
  track?: number | null;
  disk?: number | null;
  cover?: string | null;
  date?: string | null;
  codec?: string | null;
  bitrate?: number | null;
  bitsPerSample?: number | null;
  sampleRate?: number | null;
  duration?: number | null;
  lossless?: boolean | null;
  numberOfChannels?: number | null;
  size?: number | null;
  favorite?: boolean;
  playCount?: number;
  genre?: number[];
};
