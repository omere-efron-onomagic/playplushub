import { VITE_API_URL } from '@/consts/consts';
import type { RootState } from '@/store';
import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const apiBaseQuery = fetchBaseQuery({
  baseUrl: VITE_API_URL,
  prepareHeaders: (headers, { getState }) => {
    const state = getState() as RootState;
    const { token, guestToken } = state.user;
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    if (guestToken) {
      headers.set('x-guest-token', guestToken);
    }
    return headers;
  },
});
