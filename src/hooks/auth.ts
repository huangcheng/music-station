import { lastValueFrom } from 'rxjs';
import { useMutation } from '@tanstack/react-query';

import type { UseMutationOptions } from '@tanstack/react-query';

import type { LoginRequest, User } from '@/types';

import { login$ } from './api';

export const useLoginMutation = (
  options?: Omit<UseMutationOptions<User, Error, LoginRequest>, 'mutationFn'>,
) =>
  useMutation({
    mutationFn: async (params: LoginRequest) =>
      await lastValueFrom(login$(params)),
    ...options,
  });
