import { lastValueFrom } from 'rxjs';
import { useMutation, useQuery } from '@tanstack/react-query';

import type { UseMutationOptions } from '@tanstack/react-query';

import type {
  Playlist,
  Track,
  UpdatePlaylistRequest,
  UpdateTrackRequest,
} from '@/types';

import {
  createPlaylist$,
  fetchArtists$,
  fetchTracks$,
  fetchPlaylists$,
  updatePlaylist$,
  updateTrack$,
  deletePlaylist$,
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

export const useUpdateTrackMutation = (
  options?: Omit<
    UseMutationOptions<
      Track,
      Error,
      { id: number; params: UpdateTrackRequest }
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
      params: UpdateTrackRequest;
    }) => await lastValueFrom(updateTrack$(id, params)),
    ...options,
  });

export const useCreatePlaylistMutation = (
  options?: Omit<UseMutationOptions<Playlist, Error, string>, 'mutationFn'>,
) =>
  useMutation({
    mutationFn: async (name) => await lastValueFrom(createPlaylist$({ name })),
    ...options,
  });

export const useDeletePlaylistMutation = (
  options?: Omit<UseMutationOptions<void, Error, number>, 'mutationFn'>,
) =>
  useMutation({
    mutationFn: async (id: number) => await lastValueFrom(deletePlaylist$(id)),
    ...options,
  });
