import { z } from 'zod';

export const loginSchema = z.object({
  name: z.string().min(5).max(64),
  // password: z
  //   .string()
  //   .min(12)
  //   .max(100)
  //   .regex(
  //     /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/,
  //     {
  //       message:
  //         'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
  //     },
  //   ),
  password: z.string().min(5).max(64),
  remember: z.boolean().optional().default(false),
});

export type LoginSchema = z.infer<typeof loginSchema>;
