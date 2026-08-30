import type { BaseQueryFn } from '@reduxjs/toolkit/query';
import type { AxiosRequestConfig } from 'axios';
import axios, { type AxiosError } from 'axios';
import { getApiBaseUrl } from '@/services/serverConfig';
import { tokenService } from '@/services/tokenService';
import type { ApiErrorPayload } from '@/types';
import type { RefreshResponse } from '@/features/auth/types';
import { axiosClient } from './axiosClient';

export interface AxiosBaseQueryArgs {
  url: string;
  method?: AxiosRequestConfig['method'];
  data?: AxiosRequestConfig['data'];
  params?: AxiosRequestConfig['params'];
  headers?: AxiosRequestConfig['headers'];
}

export interface AxiosBaseQueryError {
  status?: number;
  data?: ApiErrorPayload;
}

/**
 * Single-flight refresh: when several requests fail with 401 concurrently we
 * only hit /auth/refresh once and let everyone await the same promise.
 */
let refreshPromise: Promise<boolean> | null = null;

const performRefresh = async (): Promise<boolean> => {
  const refreshToken = tokenService.getRefreshToken();
  if (!refreshToken) return false;

  try {
    const { data } = await axios.post<RefreshResponse>(
      `${getApiBaseUrl()}/auth/refresh`,
      { refreshToken },
      { headers: { 'Content-Type': 'application/json' } },
    );
    tokenService.setTokens(data.accessToken, data.refreshToken);
    if (data.user) tokenService.setUser(data.user);
    return true;
  } catch {
    return false;
  }
};

const refreshTokens = (): Promise<boolean> => {
  if (!refreshPromise) {
    refreshPromise = performRefresh().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
};

const toError = (error: AxiosError<ApiErrorPayload>): AxiosBaseQueryError => ({
  status: error.response?.status,
  data: error.response?.data ?? { message: error.message },
});

export const axiosBaseQuery =
  (): BaseQueryFn<AxiosBaseQueryArgs, unknown, AxiosBaseQueryError> =>
  async ({ url, method = 'GET', data, params, headers }) => {
    try {
      const result = await axiosClient({ url, method, data, params, headers });
      return { data: result.data };
    } catch (err) {
      const error = err as AxiosError<ApiErrorPayload>;
      const isAuthEndpoint = url.includes('/auth/');

      if (error.response?.status === 401 && !isAuthEndpoint) {
        const refreshed = await refreshTokens();
        if (refreshed) {
          try {
            const retry = await axiosClient({
              url,
              method,
              data,
              params,
              headers,
            });
            return { data: retry.data };
          } catch (retryErr) {
            return { error: toError(retryErr as AxiosError<ApiErrorPayload>) };
          }
        }
        tokenService.clear();
      }

      return { error: toError(error) };
    }
  };
