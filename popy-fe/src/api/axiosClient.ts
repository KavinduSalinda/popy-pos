import axios from 'axios';
import { APP_CONFIG } from '@/constants';
import { tokenService } from '@/services/tokenService';

export const axiosClient = axios.create({
  baseURL: APP_CONFIG.apiBaseUrl,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30_000,
});

axiosClient.interceptors.request.use((config) => {
  const token = tokenService.getAccessToken();
  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`);
  }
  const shopId = tokenService.getCurrentShopId();
  if (shopId) {
    config.headers.set('X-Shop-Id', shopId);
  }
  return config;
});
