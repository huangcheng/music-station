export type Response<T> = {
  message?: string;
  data: T;
};

export type Music = {
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
};

export type Artist = {
  id: number;
  name: string;
  music: Music[];
  albums: Album[];
};

export type Album = {
  id: number;
  name: string;
  artist?: string;
  year?: number;
  music?: Music[];
};
