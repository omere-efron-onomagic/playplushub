import { configureStore } from '@reduxjs/toolkit';
import counterReducer from '@/store/slices/counter.slice';
import userReducer from '@/store/slices/user.slice';
import { pokemonApi } from './apis/pokemon.api';
import { setupListeners } from '@reduxjs/toolkit/query/react';
import { authApi } from './apis/auth.api';
import { walletApi } from './apis/wallet.api';
import { cinemojiApi } from './apis/cinemoji.api';

export const store = configureStore({
  reducer: {
    counter: counterReducer,
    user: userReducer,
    [pokemonApi.reducerPath]: pokemonApi.reducer,
    [authApi.reducerPath]: authApi.reducer,
    [walletApi.reducerPath]: walletApi.reducer,
    [cinemojiApi.reducerPath]: cinemojiApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      pokemonApi.middleware,
      authApi.middleware,
      walletApi.middleware,
      cinemojiApi.middleware,
    ),
});

setupListeners(store.dispatch);
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
