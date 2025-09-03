export type Response<T> = {
  message?: string;
  data: T;
};

export type Music = {
  name: string;
  artist: string;
  album: string;
  track: number;
  disk: number;
  year: number;
  date: string;
  genre: string[];
  cover: string;
  file: string;
};
