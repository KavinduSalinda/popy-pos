import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { tokenService } from '@/services/tokenService';
import type { AuthResponse, AuthState, User } from './types';
import type { ID } from '@/types';

const resolveInitialShopId = (): ID | null => {
  const stored = tokenService.getCurrentShopId();
  if (stored) return stored;
  const user = tokenService.getUser();
  return user?.defaultShopId ?? user?.shopId ?? user?.shops?.[0]?.id ?? null;
};

const initialState: AuthState = {
  user: tokenService.getUser(),
  accessToken: tokenService.getAccessToken(),
  refreshToken: tokenService.getRefreshToken(),
  currentShopId: resolveInitialShopId(),
  isInitialized: true,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<AuthResponse>) => {
      const { user, accessToken, refreshToken } = action.payload;
      state.user = user;
      state.accessToken = accessToken;
      state.refreshToken = refreshToken;
      const shopId =
        user.defaultShopId ?? user.shopId ?? user.shops?.[0]?.id ?? null;
      state.currentShopId = shopId;
      tokenService.setTokens(accessToken, refreshToken);
      tokenService.setUser(user);
      if (shopId) tokenService.setCurrentShopId(shopId);
    },
    updateUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      tokenService.setUser(action.payload);
    },
    setCurrentShopId: (state, action: PayloadAction<ID>) => {
      state.currentShopId = action.payload;
      tokenService.setCurrentShopId(action.payload);
    },
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.currentShopId = null;
      tokenService.clear();
    },
  },
});

export const { setCredentials, updateUser, setCurrentShopId, logout } =
  authSlice.actions;
export const authReducer = authSlice.reducer;
