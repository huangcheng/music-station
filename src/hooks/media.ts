import { lastValueFrom } from 'rxjs';
import { useMutation, useQuery } from '@tanstack/react-query';

import type { CreatePlayListRequest } from '@/types';

import {
  addToDefaultPlaylist$,
  fetchArtists$,
  fetchMusic$,
  fetchPlaylists$,
  updatePlaylist$,
} from './api';

export const useMusicQuery = () =>
  useQuery({
    queryKey: ['music'],
    queryFn: async () => await lastValueFrom(fetchMusic$()),
  });

export const useArtistsQuery = () =>
  useQuery({
    queryKey: ['artists'],
    queryFn: async () => await lastValueFrom(fetchArtists$()),
  });

export const usePlaylistsQuery = () =>
  useQuery({
    queryKey: ['playlists'],
    queryFn: async () => await lastValueFrom(fetchPlaylists$()),
  });

export const useAddToDefaultPlaylistMutation = () =>
  useMutation({
    mutationFn: async (params: CreatePlayListRequest) =>
      await lastValueFrom(addToDefaultPlaylist$(params)),
  });

export const useUpdatePlaylistMutation = () =>
  useMutation({
    mutationFn: async ({
      id,
      params,
    }: {
      id: number;
      params: CreatePlayListRequest;
    }) => await lastValueFrom(updatePlaylist$(id, params)),
  });
