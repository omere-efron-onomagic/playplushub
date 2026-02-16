import { createSlice } from '@reduxjs/toolkit';

const ADMIN_KEY = 'playplushub_admin_secret';

function loadStored(): string {
  try {
    return sessionStorage.getItem(ADMIN_KEY) ?? '';
  } catch {
    return '';
  }
}

const adminSlice = createSlice({
  name: 'admin',
  initialState: { secret: loadStored() },
  reducers: {
    setAdminSecret: (state, action: { payload: string }) => {
      state.secret = action.payload;
      try {
        if (action.payload) {
          sessionStorage.setItem(ADMIN_KEY, action.payload);
        } else {
          sessionStorage.removeItem(ADMIN_KEY);
        }
      } catch {
        // ignore
      }
    },
    clearAdminSecret: (state) => {
      state.secret = '';
      try {
        sessionStorage.removeItem(ADMIN_KEY);
      } catch {
        // ignore
      }
    },
  },
});

export const { setAdminSecret, clearAdminSecret } = adminSlice.actions;
export default adminSlice.reducer;
