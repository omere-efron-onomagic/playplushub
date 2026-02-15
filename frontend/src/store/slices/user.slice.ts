import type { User } from '@/types/user.type';
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

type UserState = User;

type PersistedUser = {
  id: string;
  name: string;
  email: string;
  coins: number;
  token: string;
};

const AUTH_STORAGE_KEY = 'playplushub.auth-user';

function createGuestState(): UserState {
  return {
    id: crypto.randomUUID(),
    name: 'Guest',
    email: null,
    coins: 0,
    token: null,
    isGuest: true,
  };
}

function loadPersistedUser(): UserState {
  const raw = localStorage.getItem(AUTH_STORAGE_KEY);
  if (!raw) {
    return createGuestState();
  }

  try {
    const parsed = JSON.parse(raw) as Partial<PersistedUser>;
    if (
      typeof parsed.id !== 'string' ||
      typeof parsed.name !== 'string' ||
      typeof parsed.email !== 'string' ||
      typeof parsed.coins !== 'number' ||
      typeof parsed.token !== 'string'
    ) {
      return createGuestState();
    }

    return {
      id: parsed.id,
      name: parsed.name,
      email: parsed.email,
      coins: parsed.coins,
      token: parsed.token,
      isGuest: false,
    };
  } catch {
    return createGuestState();
  }
}

function persistAuthenticatedUser(state: UserState): void {
  if (state.isGuest || !state.email || !state.token) {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    return;
  }

  const payload: PersistedUser = {
    id: state.id,
    name: state.name,
    email: state.email,
    coins: state.coins,
    token: state.token,
  };
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(payload));
}

const initialState: UserState = {
  ...loadPersistedUser(),
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setAuthenticatedUser: (
      state,
      action: PayloadAction<{ id: string; name: string; email: string; coins: number; token: string }>,
    ) => {
      state.id = action.payload.id;
      state.name = action.payload.name;
      state.email = action.payload.email;
      state.coins = action.payload.coins;
      state.token = action.payload.token;
      state.isGuest = false;
      persistAuthenticatedUser(state);
    },
    setCoins: (state, action: PayloadAction<number>) => {
      state.coins = action.payload;
      persistAuthenticatedUser(state);
    },
    addGuestCoins: (state, action: PayloadAction<number>) => {
      if (!state.isGuest) {
        return;
      }
      state.coins += action.payload;
    },
    resetGuestCoins: (state) => {
      if (!state.isGuest) {
        return;
      }
      state.coins = 0;
    },
    logout: (state) => {
      const guest = createGuestState();
      state.id = guest.id;
      state.name = guest.name;
      state.email = guest.email;
      state.coins = guest.coins;
      state.token = guest.token;
      state.isGuest = guest.isGuest;
      localStorage.removeItem(AUTH_STORAGE_KEY);
    },
  },
});

export const { setAuthenticatedUser, setCoins, addGuestCoins, resetGuestCoins, logout } =
  userSlice.actions;

export default userSlice.reducer;
