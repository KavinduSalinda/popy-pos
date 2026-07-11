import type { ApiErrorPayload } from '@/types';

interface RtkQueryLikeError {
  status?: number | string;
  data?: unknown;
}

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

/**
 * Normalises errors coming from RTK Query / Axios into a readable message.
 */
export const getErrorMessage = (
  error: unknown,
  fallback = 'Something went wrong. Please try again.',
): string => {
  if (typeof error === 'string') return error;

  if (isObject(error)) {
    const maybeRtk = error as RtkQueryLikeError;
    if (isObject(maybeRtk.data)) {
      const payload = maybeRtk.data as Partial<ApiErrorPayload>;
      if (typeof payload.message === 'string') return payload.message;
    }
    if (typeof (error as { message?: unknown }).message === 'string') {
      return (error as { message: string }).message;
    }
  }

  return fallback;
};

export const getFieldErrors = (
  error: unknown,
): Record<string, string[]> | undefined => {
  if (isObject(error)) {
    const data = (error as RtkQueryLikeError).data;
    if (isObject(data)) {
      const errors = (data as { errors?: unknown }).errors;
      if (isObject(errors)) {
        return errors as Record<string, string[]>;
      }
    }
  }
  return undefined;
};
