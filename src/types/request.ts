export type CreatePlaylistRequest = {
  name: string;

  tracks?: number[];
};

export type UpdatePlaylistRequest = Partial<CreatePlaylistRequest>;

export type UpdateTrackRequest = {
  name?: string;
  year?: number | null;
  artistId?: number | null;
  albumId?: number | null;
  trackNo?: number | null;
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
  recentlyPlayed?: number | null;
  genres?: number[];
};

export type LoginRequest = {
  name: string;
  password: string;
  remember?: boolean;
};
