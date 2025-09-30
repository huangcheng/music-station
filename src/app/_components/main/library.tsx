import { useContext, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { useShallow } from 'zustand/react/shallow';
import { useTranslations } from 'next-intl';
import { useImmer } from 'use-immer';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import dayjs from 'dayjs';
import {
  MoreVertical,
  Pencil,
  Trash2,
  Plus,
  Play,
  MoveLeft,
} from 'lucide-react';

import { useMediaStore } from '@/stores';
import {
  useCreatePlaylistMutation,
  useDeletePlaylistMutation,
  useUpdatePlaylistMutation,
} from '@/hooks';
import { createPlayListScheme, updatePlayListScheme } from '@/schemas';
import {
  Card,
  CardContent,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Input,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  MultiSelect,
} from '@/components';

import type { CreatePlaylist, UpdatePlaylist } from '@/schemas';

import MainContext from './context';
import Placeholder from './placeholder';
import TrackList from './track-list';

type State = {
  // Selected playlist ID for action
  playlistId: number | null;
  selectedPlaylistId: number | null;
  action: 'create' | 'update' | 'delete' | null;
};

export default function Library() {
  const t = useTranslations();

  const [state, setState] = useImmer<State>({
    playlistId: null,
    action: null,
    selectedPlaylistId: null,
  });

  const { playlistId, action, selectedPlaylistId } = state;

  const { onPlayPlaylist, onPlay, onFavoriteToggle } = useContext(MainContext);

  const { playlists, tracks, fetchPlaylists } = useMediaStore(
    useShallow(({ playlists, tracks, fetchPlaylists }) => ({
      playlists,
      tracks,
      fetchPlaylists,
    })),
  );

  const trackOptions = useMemo(
    () => tracks.map(({ name, id }) => ({ label: name, value: id })),
    [tracks],
  );

  const { mutate: createPlaylist, isSuccess: isCreatePlaylistSuccess } =
    useCreatePlaylistMutation();

  const { mutate: updatePlaylist, isSuccess: isUpdatePlaylistSuccess } =
    useUpdatePlaylistMutation();

  const { mutate: deletePlaylist, isSuccess: isDeletePlaylistSuccess } =
    useDeletePlaylistMutation();

  const createPlaylistForm = useForm<CreatePlaylist>({
    resolver: zodResolver(createPlayListScheme),
    defaultValues: {
      name: '',
    },
  });

  const updatePlaylistFrom = useForm<UpdatePlaylist>({
    resolver: zodResolver(updatePlayListScheme),
  });

  const playlist = useMemo(
    () => playlists.find(({ id }) => id === playlistId),
    [playlists, playlistId],
  );

  const selectedPlaylist = useMemo(
    () => playlists.find(({ id }) => id === selectedPlaylistId) ?? null,
    [playlists, selectedPlaylistId],
  );

  const _tracks = useMemo(() => playlist?.tracks, [playlist]);

  const selectedTracks = useMemo(
    () => selectedPlaylist?.tracks ?? [],
    [selectedPlaylist],
  );

  useEffect(() => {
    updatePlaylistFrom.setValue('tracks', _tracks?.map(({ id }) => id) ?? []);
  }, [_tracks, updatePlaylistFrom]);

  useEffect(() => {
    updatePlaylistFrom.setValue('name', playlist?.name ?? '');
  }, [playlist, updatePlaylistFrom]);

  useEffect(() => {
    if (
      isCreatePlaylistSuccess ||
      isUpdatePlaylistSuccess ||
      isDeletePlaylistSuccess
    ) {
      void fetchPlaylists();

      setState((draft) => {
        draft.playlistId = null;
        draft.action = null;
      });
    }
  }, [
    isCreatePlaylistSuccess,
    isUpdatePlaylistSuccess,
    isDeletePlaylistSuccess,
    fetchPlaylists,
    setState,
  ]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{t('Your Playlists')}</h2>
        <Button
          onClick={() =>
            setState((draft) => {
              if (draft.selectedPlaylistId === null) {
                draft.action = 'create';
              } else {
                draft.selectedPlaylistId = null;
              }
            })
          }
        >
          {selectedPlaylist === null ? (
            <Plus className="mr-2 h-4 w-4" />
          ) : (
            <MoveLeft className="mr-2 h-4 w-4" />
          )}
          {t(selectedPlaylist === null ? 'New Playlist' : 'Back to Playlists')}
        </Button>
      </div>
      {playlists.length > 0 && selectedPlaylistId === null && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {playlists
            .sort((a, b) => {
              if (a.internal && !b.internal) {
                return -1;
              }
              if (!a.internal && b.internal) {
                return 1;
              }
              return dayjs(b.createdAt).diff(dayjs(a.createdAt));
            })
            .map(({ id, internal, name, tracks }) => {
              const card = (
                <Card
                  key={id}
                  className="group hover:bg-card/80 transition-colors"
                  onClick={() => {
                    if (tracks.length === 0) {
                      return;
                    }

                    setState((draft) => {
                      draft.selectedPlaylistId = id;
                    });
                  }}
                >
                  <CardContent className="p-4 relative">
                    {!internal && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 z-50"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem
                            onClick={() =>
                              setState((draft) => {
                                draft.playlistId = id;
                                draft.action = 'update';
                              })
                            }
                          >
                            <Pencil className="mr-2 h-4 w-4" />
                            <span>{t('Modify')}</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              setState((draft) => {
                                draft.playlistId = id;
                                draft.action = 'delete';
                              })
                            }
                            className="text-red-500"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            <span>{t('Delete')}</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                    <div className="aspect-square w-full bg-muted rounded mb-4 flex items-center justify-center cursor-pointer relative overflow-hidden">
                      <Image
                        src={
                          tracks.find(({ cover }) => cover)?.cover ??
                          '/images/abstract-geometric-shapes.png'
                        }
                        alt={name}
                        width={200}
                        height={200}
                        className="object-fill w-full aspect-square rounded"
                      />
                      {/* Play button overlay */}
                      <Button
                        size="icon"
                        className="absolute inset-0 m-auto h-12 w-12 rounded-full bg-primary text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                        onClick={(e) => {
                          e.stopPropagation();

                          onPlayPlaylist?.(id);
                        }}
                        aria-label={t('Play Playlist')}
                        tabIndex={0}
                      >
                        <Play className="h-6 w-6" />
                      </Button>
                    </div>
                    <h3 className="font-semibold truncate cursor-pointer">
                      {name}
                    </h3>
                    <p className="text-sm text-muted-foreground cursor-pointer">
                      {name} • {tracks.length} {t('songs')}
                    </p>
                  </CardContent>
                </Card>
              );

              if (internal) {
                return card;
              }

              return (
                <ContextMenu key={id}>
                  <ContextMenuTrigger>{card}</ContextMenuTrigger>
                  <ContextMenuContent>
                    <ContextMenuItem
                      onClick={() =>
                        setState((draft) => {
                          draft.playlistId = id;
                        })
                      }
                    >
                      <Pencil className="mr-2 h-4 w-4" />
                      <span>{t('Modify')}</span>
                    </ContextMenuItem>
                    <ContextMenuItem
                      onClick={() =>
                        setState((draft) => {
                          draft.playlistId = id;
                          draft.action = 'delete';
                        })
                      }
                      className="text-red-500"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      <span>{t('Delete')}</span>
                    </ContextMenuItem>
                  </ContextMenuContent>
                </ContextMenu>
              );
            })}
        </div>
      )}

      {selectedPlaylistId !== null && selectedTracks.length > 0 && (
        <TrackList
          tracks={selectedTracks}
          onPlay={onPlay}
          onFavoriteToggle={onFavoriteToggle}
        />
      )}

      {((playlists.length === 0 && selectedPlaylistId === null) ||
        (selectedPlaylist !== null && selectedTracks.length === 0)) && (
        <Placeholder />
      )}

      <Dialog
        open={action === 'create'}
        onOpenChange={() => {
          setState((draft) => {
            draft.playlistId = null;
            draft.action = null;
          });
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('Create Playlist')}</DialogTitle>
          </DialogHeader>
          <Form {...createPlaylistForm}>
            <form
              onSubmit={createPlaylistForm.handleSubmit(({ name }) => {
                createPlaylist(name);
              })}
              className="space-y-4"
            >
              <FormField
                control={createPlaylistForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('Playlist Name')}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t('My Awesome Playlist')}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit">{t('Save')}</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={action === 'update'}
        onOpenChange={() =>
          setState((draft) => {
            draft.playlistId = null;
            draft.action = null;
          })
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('Modify Playlist')}</DialogTitle>
          </DialogHeader>
          <Form {...updatePlaylistFrom}>
            <form
              onSubmit={updatePlaylistFrom.handleSubmit((data) => {
                if (!playlist) {
                  return;
                }

                updatePlaylist({
                  id: playlist.id,
                  params: data,
                });
              })}
              className="space-y-4"
            >
              <FormField
                control={updatePlaylistFrom.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('Playlist Name')}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t('My Awesome Playlist')}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={updatePlaylistFrom.control}
                name="tracks"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('Tracks')}</FormLabel>
                    <FormControl>
                      <MultiSelect options={trackOptions} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit">{t('Save')}</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={action === 'delete'}
        onOpenChange={() => {
          setState((draft) => {
            draft.playlistId = null;
            draft.action = null;
          });
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('Are you sure?')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t(
                'This action cannot be undone, this will permanently delete the playlist',
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('Cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={() => deletePlaylist(playlistId!)}>
              {t('Continue')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
