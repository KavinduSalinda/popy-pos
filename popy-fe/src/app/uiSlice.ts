import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { storage } from '@/services/storage';
import type { AppThemeMode } from '@/theme';

const THEME_KEY = 'pos.themeMode';

interface UiState {
  sidebarOpen: boolean;
  mobileSidebarOpen: boolean;
  themeMode: AppThemeMode;
}

const initialState: UiState = {
  sidebarOpen: true,
  mobileSidebarOpen: false,
  themeMode: storage.get<AppThemeMode>(THEME_KEY) ?? 'light',
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
    toggleMobileSidebar: (state) => {
      state.mobileSidebarOpen = !state.mobileSidebarOpen;
    },
    setMobileSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.mobileSidebarOpen = action.payload;
    },
    toggleThemeMode: (state) => {
      state.themeMode = state.themeMode === 'light' ? 'dark' : 'light';
      storage.set(THEME_KEY, state.themeMode);
    },
  },
});

export const {
  toggleSidebar,
  setSidebarOpen,
  toggleMobileSidebar,
  setMobileSidebarOpen,
  toggleThemeMode,
} = uiSlice.actions;
export const uiReducer = uiSlice.reducer;
