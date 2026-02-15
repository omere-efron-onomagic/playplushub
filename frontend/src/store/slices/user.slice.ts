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
const GUEST_STORAGE_KEY = 'playplushub.guest-token';

function createGuestState(): UserState {
  return {
    id: '',
    name: 'Guest',
    email: null,
    coins: 0,
    token: null,
    guestToken: null,
    isGuest: true,
  };
}

function loadPersistedUser(): UserState {
  // Try auth user first
  const raw = localStorage.getItem(AUTH_STORAGE_KEY);
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as Partial<PersistedUser>;
      if (
        typeof parsed.id === 'string' &&
        typeof parsed.name === 'string' &&
        typeof parsed.email === 'string' &&
        typeof parsed.coins === 'number' &&
        typeof parsed.token === 'string'
      ) {
        return {
          id: parsed.id,
          name: parsed.name,
          email: parsed.email,
          coins: parsed.coins,
          token: parsed.token,
          guestToken: null,
          isGuest: false,
        };
      }
    } catch {
      // fall through to guest
    }
  }

  // Try persisted guest token
  const guestToken = localStorage.getItem(GUEST_STORAGE_KEY);
  if (guestToken) {
    return {
      id: '',
      name: 'Guest',
      email: null,
      coins: 0,
      token: null,
      guestToken,
      isGuest: true,
    };
  }

  return createGuestState();
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
      state.guestToken = null;
      state.isGuest = false;
      persistAuthenticatedUser(state);
      localStorage.removeItem(GUEST_STORAGE_KEY);
    },
    setCoins: (state, action: PayloadAction<number>) => {
      state.coins = action.payload;
      if (!state.isGuest) {
        persistAuthenticatedUser(state);
      }
    },
    /** Set guest identity after backend creates the guest record. */
    setGuestIdentity: (
      state,
      action: PayloadAction<{ guestToken: string; id: string; coins: number }>,
    ) => {
      state.id = action.payload.id;
      state.coins = action.payload.coins;
      state.guestToken = action.payload.guestToken;
      state.isGuest = true;
      localStorage.setItem(GUEST_STORAGE_KEY, action.payload.guestToken);
    },
    /** Sync guest progression from server hydration. */
    setGuestProgression: (state, action: PayloadAction<{ id: string; coins: number }>) => {
      if (!state.isGuest) return;
      state.id = action.payload.id;
      state.coins = action.payload.coins;
    },
    /** Clear guest token after migration completes. */
    clearGuestToken: (state) => {
      state.guestToken = null;
      localStorage.removeItem(GUEST_STORAGE_KEY);
    },
    logout: (state) => {
      const guest = createGuestState();
      state.id = guest.id;
      state.name = guest.name;
      state.email = guest.email;
      state.coins = guest.coins;
      state.token = guest.token;
      state.guestToken = guest.guestToken;
      state.isGuest = guest.isGuest;
      localStorage.removeItem(AUTH_STORAGE_KEY);
    },
  },
});

export const {
  setAuthenticatedUser,
  setCoins,
  setGuestIdentity,
  setGuestProgression,
  clearGuestToken,
  logout,
} = userSlice.actions;

export default userSlice.reducer;
