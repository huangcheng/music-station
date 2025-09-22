import zod from 'zod';

export const settingsSchema = zod.object({
  locale: zod
    .union([zod.literal('en-US'), zod.literal('zh-CN')])
    .default('en-US'),
});

export type Settings = zod.infer<typeof settingsSchema>;

export default settingsSchema;
