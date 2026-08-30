import axios from 'axios';
import { getApiBaseUrl } from '@/services/serverConfig';
import { tokenService } from '@/services/tokenService';

export const axiosClient = axios.create({
  baseURL: getApiBaseUrl(),
  headers: { 'Content-Type': 'application/json' },
  timeout: 30_000,
});

axiosClient.interceptors.request.use((config) => {
  config.baseURL = getApiBaseUrl();
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
