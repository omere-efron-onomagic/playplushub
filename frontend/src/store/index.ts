import { configureStore } from '@reduxjs/toolkit';
import counterReducer from '@/store/slices/counter.slice';
import userReducer from '@/store/slices/user.slice';
import adminReducer from '@/store/slices/admin.slice';
import { pokemonApi } from './apis/pokemon.api';
import { setupListeners } from '@reduxjs/toolkit/query/react';
import { authApi } from './apis/auth.api';
import { walletApi } from './apis/wallet.api';
import { gamesApi } from './apis/games.api';
import { adminApi } from './apis/admin.api';

export const store = configureStore({
  reducer: {
    counter: counterReducer,
    user: userReducer,
    admin: adminReducer,
    [pokemonApi.reducerPath]: pokemonApi.reducer,
    [authApi.reducerPath]: authApi.reducer,
    [walletApi.reducerPath]: walletApi.reducer,
    [gamesApi.reducerPath]: gamesApi.reducer,
    [adminApi.reducerPath]: adminApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      pokemonApi.middleware,
      authApi.middleware,
      walletApi.middleware,
      gamesApi.middleware,
      adminApi.middleware,
    ),
});

setupListeners(store.dispatch);
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
