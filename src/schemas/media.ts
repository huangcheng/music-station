import zod from 'zod';

export const createPlayListScheme = zod.object({
  name: zod
    .string()
    .min(4, 'Playlist name cannot be empty')
    .max(20, 'Playlist name cannot exceed 20 characters'),
});

export const updatePlayListScheme = zod
  .object({
    name: zod.string().min(4).max(20).optional(),
    tracks: zod.array(zod.number()).optional(),
  })
  .refine((data) => data.name !== undefined || data.tracks !== undefined, {
    message: 'Either name or tracks must be provided',
  });

export type CreatePlaylist = zod.infer<typeof createPlayListScheme>;

export type UpdatePlaylist = zod.infer<typeof updatePlayListScheme>;
