import { createApi } from '@reduxjs/toolkit/query/react';
import { apiBaseQuery } from './baseQuery';

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  coins: number;
};

export type PublicGuest = {
  id: string;
  coins: number;
  signupPromptCount: number;
  signupRequired: boolean;
};

type AuthResponse = {
  token: string;
  user: AuthUser;
};

type RegisterPayload = {
  name: string;
  email: string;
  password: string;
};

type LoginPayload = {
  email: string;
  password: string;
};

type CreateGuestResponse = {
  guestToken: string;
  guest: PublicGuest;
};

type GuestResponse = {
  guest: PublicGuest;
};

type GuestUpdatePayload = {
  addCoins: number;
};

export type MigrationResponse = {
  migrationStatus: 'applied' | 'noop' | 'not_found' | 'invalid_token';
  coinsTransferred: number;
};

type MigratePayload = {
  guestToken: string;
};

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: apiBaseQuery,
  endpoints: (builder) => ({
    register: builder.mutation<AuthResponse, RegisterPayload>({
      query: (body) => ({
        url: '/auth/register',
        method: 'POST',
        body,
      }),
    }),
    login: builder.mutation<AuthResponse, LoginPayload>({
      query: (body) => ({
        url: '/auth/login',
        method: 'POST',
        body,
      }),
    }),
    me: builder.query<{ user: AuthUser }, void>({
      query: () => '/auth/me',
    }),

    // Guest lifecycle
    createGuest: builder.mutation<CreateGuestResponse, void>({
      query: () => ({
        url: '/auth/guest',
        method: 'POST',
      }),
    }),
    getGuest: builder.query<GuestResponse, void>({
      query: () => '/auth/guest',
    }),
    updateGuestProgression: builder.mutation<GuestResponse, GuestUpdatePayload>({
      query: (body) => ({
        url: '/auth/guest',
        method: 'PATCH',
        body,
      }),
    }),

    // Migration
    migrateGuest: builder.mutation<MigrationResponse, MigratePayload>({
      query: (body) => ({
        url: '/auth/guest/migrate',
        method: 'POST',
        body,
      }),
    }),
  }),
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useMeQuery,
  useCreateGuestMutation,
  useGetGuestQuery,
  useUpdateGuestProgressionMutation,
  useMigrateGuestMutation,
} = authApi;
