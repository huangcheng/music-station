import { lastValueFrom } from 'rxjs';
import { useMutation, useQuery } from '@tanstack/react-query';

import type { UseMutationOptions } from '@tanstack/react-query';

import type {
  CreatePlaylistRequest,
  Playlist,
  UpdatePlaylistRequest,
} from '@/types';

import {
  addToDefaultPlaylist$,
  fetchArtists$,
  fetchTracks$,
  fetchPlaylists$,
  updatePlaylist$,
} from './api';

export const useTracksQuery = () =>
  useQuery({
    queryKey: ['tracks'],
    queryFn: async () => await lastValueFrom(fetchTracks$()),
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

export const useAddToDefaultPlaylistMutation = (
  options?: Omit<
    UseMutationOptions<Playlist, Error, CreatePlaylistRequest>,
    'mutationFn'
  >,
) =>
  useMutation({
    mutationFn: async (params: CreatePlaylistRequest) =>
      await lastValueFrom(addToDefaultPlaylist$(params)),
    ...options,
  });

export const useUpdatePlaylistMutation = (
  options?: Omit<
    UseMutationOptions<
      Playlist,
      Error,
      { id: number; params: UpdatePlaylistRequest }
    >,
    'mutationFn'
  >,
) =>
  useMutation({
    mutationFn: async ({
      id,
      params,
    }: {
      id: number;
      params: UpdatePlaylistRequest;
    }) => await lastValueFrom(updatePlaylist$(id, params)),
    ...options,
  });
