import type { RootState } from '@/app/store';

export const selectCurrentUser = (state: RootState) => state.auth.user;
export const selectIsAuthenticated = (state: RootState) =>
  Boolean(state.auth.accessToken && state.auth.user);
export const selectAuthInitialized = (state: RootState) =>
  state.auth.isInitialized;
